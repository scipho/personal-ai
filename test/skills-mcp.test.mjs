import test from 'node:test'
import assert from 'node:assert/strict'

import { handleChat } from '../src/chat.js'
import { skillsApiRoute, parseSkillMd, renderSkillMd, forcedSkillName } from '../src/skills.js'
import { mcpApiRoute, namespacedToolName, parseRpcBody, McpClient } from '../src/mcp.js'
import { projectsApiRoute } from '../src/projects.js'
import { jsonReply, jsonRequest, sseEvents, withFetch } from './helpers/d1.mjs'
import { chatRequest, providerEnv } from './helpers/setup.mjs'
import { mcpServer } from './helpers/mcp-mock.mjs'

async function call(route, env, path, method = 'GET', body) {
  const res = await route(jsonRequest(path, method, body), env, new URL('https://x' + path).pathname, method)
  const text = await res.text()
  let data; try { data = JSON.parse(text) } catch { data = text }
  return { status: res.status, data, headers: res.headers }
}
const skills = (env, path, method, body) => call(skillsApiRoute, env, path, method, body)
const mcp = (env, path, method, body) => call(mcpApiRoute, env, path, method, body)
const tool = (name, args, id = name) => ({ id, type: 'function', function: { name, arguments: JSON.stringify(args) } })
const MCP_URL = 'https://mcp.example.com/mcp'

// Routes provider calls to `llm` and MCP calls to the mock server.
function router(llm, server) {
  return async (url, init) => (String(url).startsWith(MCP_URL) ? server.handler(url, init) : llm(url, init))
}

test('SKILL.md parse / render round-trip with reference files', () => {
  const md = '---\nname: weekly-report\ndescription: "寫週報時使用: 依格式"\nallowed-tools: [read_file, write_file]\n---\n# 步驟\n1. 讀筆記\n\n<!-- personal-ai:file name="template.md" -->\n## 本週\n- 項目\n'
  const s = parseSkillMd(md)
  assert.equal(s.name, 'weekly-report')
  assert.equal(s.description, '寫週報時使用: 依格式')
  assert.deepEqual(s.allowed_tools, ['read_file', 'write_file'])
  assert.equal(s.instructions, '# 步驟\n1. 讀筆記')
  assert.deepEqual(s.files, [{ name: 'template.md', content: '## 本週\n- 項目' }])
  const again = parseSkillMd(renderSkillMd(s))
  assert.deepEqual(again, s)
  assert.throws(() => parseSkillMd('no frontmatter'), /frontmatter/)
  assert.equal(forcedSkillName('/weekly-report 這週'), 'weekly-report')
  assert.equal(forcedSkillName('請 /weekly-report'), '')
})

test('skills CRUD, import/export, validation', async () => {
  const env = await providerEnv()
  let r = await skills(env, '/api/skills', 'POST', { name: 'Bad Name', description: 'x' })
  assert.equal(r.status, 400)
  r = await skills(env, '/api/skills/import', 'POST', { markdown: '---\nname: translate\ndescription: 翻譯成英文時使用\n---\n把內容翻成自然的英文。' })
  assert.equal(r.status, 200)
  const id = r.data.skill.id
  r = await skills(env, '/api/skills/import', 'POST', { markdown: '---\nname: translate\ndescription: 更新後\n---\n新版說明' })
  assert.equal(r.data.skill.id, id, 'import with same name updates')
  r = await skills(env, `/api/skills/${id}/export`)
  assert.match(r.data, /^---\nname: translate\ndescription: 更新後\n---\n新版說明/)
  assert.match(r.headers.get('content-disposition'), /translate\.SKILL\.md/)
  r = await skills(env, '/api/skills', 'POST', { name: 'translate', description: 'dup' })
  assert.equal(r.status, 400)
  r = await skills(env, `/api/skills/${id}`, 'PUT', { enabled: false })
  assert.equal(r.data.skill.enabled, false)
  r = await skills(env, `/api/skills/${id}`, 'DELETE')
  assert.equal((await skills(env, '/api/skills')).data.skills.length, 0)
})

test('only the skill index goes into the prompt; load_skill fetches the full text', async () => {
  const env = await providerEnv()
  await skills(env, '/api/skills', 'POST', { name: 'release-notes', description: '寫發行說明時使用', instructions: 'SECRET-STEPS: 先列變更再分類', files: [{ name: 'tpl.md', content: 'TEMPLATE-BODY' }] })
  const calls = []
  await withFetch(async (u, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    if (calls.length === 1) return jsonReply({ content: null, tool_calls: [tool('load_skill', { name: 'release-notes' }, 'a'), tool('load_skill', { name: 'release-notes', file: 'tpl.md' }, 'b')] }, 'tool_calls')
    return jsonReply({ content: 'ok' })
  }, async () => {
    await (await handleChat(chatRequest({ messages: [{ role: 'user', content: '幫我寫發行說明' }] }), env)).text()
  })
  assert.match(calls[0].messages[0].content, /release-notes：寫發行說明時使用/)
  assert.doesNotMatch(calls[0].messages[0].content, /SECRET-STEPS/)
  assert.ok(calls[0].tools.some((t) => t.function.name === 'load_skill'))
  const results = calls[1].messages.filter((m) => m.role === 'tool').map((m) => m.content)
  assert.match(results[0], /SECRET-STEPS/)
  assert.match(results[0], /tpl\.md/)
  assert.match(results[1], /TEMPLATE-BODY/)
})

test('/name forces a skill and its allowed_tools narrow the tool list', async () => {
  const env = await providerEnv()
  await skills(env, '/api/skills', 'POST', { name: 'calc-only', description: '算數', instructions: 'FORCED-INSTR', allowed_tools: ['calculate'] })
  let body
  await withFetch(async (u, init) => { body = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ messages: [{ role: 'user', content: '/calc-only 1+1' }] }), env)).text()
  })
  assert.match(body.messages[0].content, /FORCED-INSTR/)
  assert.deepEqual(body.tools.map((t) => t.function.name).sort(), ['calculate', 'load_skill'])
})

test('per-chat tools_off removes groups, skills and MCP', async () => {
  const env = await providerEnv()
  await skills(env, '/api/skills', 'POST', { name: 'x', description: 'x', instructions: 'x' })
  let body
  await withFetch(async (u, init) => { body = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ messages: [{ role: 'user', content: 'hi' }], tools_off: ['web', 'skills', 'calculate'] }), env)).text()
  })
  const names = body.tools.map((t) => t.function.name)
  assert.ok(!names.includes('web_search') && !names.includes('fetch_url') && !names.includes('load_skill') && !names.includes('calculate'))
  assert.ok(names.includes('current_time'))
  assert.doesNotMatch(body.messages[0].content, /可用技能/)
})

test('MCP: test connection initializes, lists tools (SSE) and caches them; token encrypted', async () => {
  const env = await providerEnv()
  const server = mcpServer({ sse: true })
  let r = await mcp(env, '/api/mcp', 'POST', { name: 'Bad Name', url: MCP_URL })
  assert.equal(r.status, 400)
  r = await mcp(env, '/api/mcp', 'POST', { name: 'local', url: 'https://127.0.0.1/mcp' })
  assert.equal(r.status, 400)
  r = await mcp(env, '/api/mcp', 'POST', { name: 'mock', url: MCP_URL, auth_type: 'bearer', token: 'mcp-secret-123' })
  assert.equal(r.status, 200)
  const id = r.data.id
  assert.deepEqual(r.data.servers[0].token, { set: true, preview: 'mcp…-123' })
  assert.ok(!JSON.stringify(r.data).includes('mcp-secret-123'))
  await withFetch(server.handler, async () => {
    r = await mcp(env, `/api/mcp/${id}/test`, 'POST', {})
  })
  assert.equal(r.status, 200, JSON.stringify(r.data))
  assert.equal(r.data.tools, 2)
  assert.equal(r.data.protocol_version, '2025-06-18')
  assert.deepEqual(server.state.calls.map((c) => c.method), ['initialize', 'notifications/initialized', 'tools/list'])
  assert.equal(server.state.calls[2].session, 's-1-1')
  assert.equal(server.state.calls[2].protocol, '2025-06-18')
  const row = env.DB.sqlite.prepare('SELECT tools, session_id FROM mcp_servers').get()
  assert.equal(JSON.parse(row.tools).length, 2)
  assert.equal(row.session_id, 's-1-1')
  r = await mcp(env, `/api/mcp/${id}/tools`, 'PUT', { disabled_tools: ['add'] })
  assert.deepEqual(r.data.servers[0].tools.map((t) => t.enabled), [true, false])
})

test('MCP tools in chat come from the cache; a stale session re-initializes once', async () => {
  const env = await providerEnv()
  const server = mcpServer()
  const { data } = await mcp(env, '/api/mcp', 'POST', { name: 'mock', url: MCP_URL, auth_type: 'bearer', token: 'mcp-secret-123' })
  await withFetch(server.handler, async () => { await mcp(env, `/api/mcp/${data.id}/test`, 'POST', {}) })
  server.expire()
  server.state.calls.length = 0
  const llmCalls = []
  const llm = async (u, init) => {
    const body = JSON.parse(init.body)
    llmCalls.push(body)
    if (llmCalls.length === 1) return jsonReply({ content: null, tool_calls: [tool('mcp__mock__echo', { text: '你好' })] }, 'tool_calls')
    return jsonReply({ content: 'done' })
  }
  let evs
  await withFetch(router(llm, server), async () => {
    evs = sseEvents(await (await handleChat(chatRequest({ messages: [{ role: 'user', content: 'echo' }] }), env)).text())
  })
  assert.ok(llmCalls[0].tools.some((t) => t.function.name === 'mcp__mock__echo'))
  assert.match(llmCalls[0].tools.find((t) => t.function.name === 'mcp__mock__echo').function.description, /\[MCP mock\]/)
  assert.deepEqual(server.state.calls.map((c) => c.method), ['tools/call', 'initialize', 'notifications/initialized', 'tools/call'], 'no tools/list during chat')
  assert.match(llmCalls[1].messages.find((m) => m.role === 'tool').content, /echo: 你好/)
  const budget = evs.find((e) => e.budget).budget
  assert.equal(budget.subrequests, 6) // 2 LLM + 4 MCP
  assert.equal(env.DB.sqlite.prepare('SELECT session_id FROM mcp_servers').get().session_id, 's-1-2')
})

test('MCP limits: 5 servers, 40 enabled tools total (extra tools stored disabled)', async () => {
  const env = await providerEnv()
  const many = Array.from({ length: 30 }, (_, i) => ({ name: `t${i}`, description: 'x', inputSchema: { type: 'object', properties: {} } }))
  const ids = []
  for (let i = 0; i < 5; i++) {
    const r = await mcp(env, '/api/mcp', 'POST', { name: `s${i}`, url: `${MCP_URL}${i}`, auth_type: 'bearer', token: 'mcp-secret-123' })
    ids.push(r.data.id)
  }
  assert.equal((await mcp(env, '/api/mcp', 'POST', { name: 's5', url: MCP_URL })).status, 400)
  const server = mcpServer({ tools: many })
  await withFetch(server.handler, async () => {
    await mcp(env, `/api/mcp/${ids[0]}/test`, 'POST', {})
    const r = await mcp(env, `/api/mcp/${ids[1]}/test`, 'POST', {})
    assert.equal(r.data.disabled, 20)
  })
  const r = await mcp(env, `/api/mcp/${ids[1]}/tools`, 'PUT', { disabled_tools: [] })
  assert.equal(r.status, 400)
})

test('MCP helpers: namespacing, SSE parsing, redirects refused', async () => {
  assert.equal(namespacedToolName('gh', 'create.issue'), 'mcp__gh__create_issue')
  const long = namespacedToolName('server', 'x'.repeat(80))
  assert.ok(long.length <= 64 && /^[A-Za-z0-9_-]+$/.test(long))
  const sse = 'event: message\ndata: {"jsonrpc":"2.0","method":"notifications/progress"}\n\nevent: message\ndata: {"jsonrpc":"2.0","id":7,"result":{"ok":1}}\n\n'
  assert.deepEqual(parseRpcBody(sse, 'text/event-stream', 7).result, { ok: 1 })
  const client = new McpClient({ url: MCP_URL })
  await withFetch(async () => new Response(null, { status: 307, headers: { location: 'https://169.254.169.254/' } }), async () => {
    await assert.rejects(() => client.initialize(), /重新導向/)
  })
})

test('project settings can disable skills and MCP servers', async () => {
  const env = await providerEnv()
  await skills(env, '/api/skills', 'POST', { name: 'only-main', description: 'x', instructions: 'x' })
  const p = (await call(projectsApiRoute, env, '/api/projects', 'POST', { name: 'P' })).data.project
  await call(projectsApiRoute, env, `/api/projects/${p.id}`, 'PUT', { settings: { skills_disabled: ['only-main'], mcp_disabled: ['mock'] } })
  let body
  await withFetch(async (u, init) => { body = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ project_id: p.id, message: 'hi' }), env, {})).text()
  })
  assert.ok(!body.tools.some((t) => t.function.name === 'load_skill'))
  assert.doesNotMatch(body.messages[0].content, /only-main/)
})
