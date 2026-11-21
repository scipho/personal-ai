import test from 'node:test'
import assert from 'node:assert/strict'

import { handleChat } from '../src/chat.js'
import { projectsApiRoute, recentWindow } from '../src/projects.js'
import { ProjectFs, normalizePath, runFileTool } from '../src/tools/files.js'
import { Db } from '../src/db.js'
import { jsonReply, jsonRequest, sseEvents, withFetch } from './helpers/d1.mjs'
import { api, chatRequest, providerEnv } from './helpers/setup.mjs'

async function papi(env, path, method = 'GET', body) {
  const res = await projectsApiRoute(jsonRequest(path, method, body), env, new URL('https://x' + path).pathname, method)
  return { status: res.status, data: await res.json() }
}

async function newProject(env, extra = {}) {
  const r = await papi(env, '/api/projects', 'POST', { name: '測試專案', instructions: '專案指示：回答要附檔名', ...extra })
  return r.data.project
}

function tool(name, args, id = name) {
  return { id, type: 'function', function: { name, arguments: JSON.stringify(args) } }
}

test('paths are confined to the project root', () => {
  assert.equal(normalizePath('a//b/./c.md'), 'a/b/c.md')
  for (const bad of ['../x', '/etc/passwd', 'a/../../b', 'C:/x', 'a\\b', 'a\u0000b', '~/x', 'a /b']) {
    assert.throws(() => normalizePath(bad), undefined, bad)
  }
})

test('project CRUD, messages paging, clear and delete', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  let r = await papi(env, '/api/projects')
  assert.equal(r.data.projects.length, 1)
  r = await papi(env, `/api/projects/${p.id}`, 'PUT', { name: '改名', settings: { params: { temperature: 1.1 }, tools_disabled: ['web', 'bogus'] } })
  assert.equal(r.data.project.name, '改名')
  assert.equal(r.data.project.settings.params.temperature, 1.1)
  assert.deepEqual(r.data.project.settings.tools_disabled, ['web'])
  for (let i = 0; i < 5; i++) env.DB.sqlite.prepare('INSERT INTO project_messages (project_id, role, content, meta, created_at) VALUES (?, ?, ?, ?, ?)').run(p.id, i % 2 ? 'assistant' : 'user', `m${i}`, '{}', i)
  r = await papi(env, `/api/projects/${p.id}/messages?limit=2`)
  assert.deepEqual(r.data.messages.map((m) => m.content), ['m3', 'm4'])
  assert.equal(r.data.more, true)
  r = await papi(env, `/api/projects/${p.id}/messages?limit=2&before=${r.data.messages[0].id}`)
  assert.deepEqual(r.data.messages.map((m) => m.content), ['m1', 'm2'])
  r = await papi(env, `/api/projects/${p.id}/poll?after=0`)
  assert.equal(r.data.messages.length, 5)
  await papi(env, `/api/projects/${p.id}/file`, 'PUT', { path: 'a.md', content: 'x' })
  await api(env, '/api/memory', 'POST', { scope: p.id, content: '專案記憶' })
  r = await papi(env, `/api/projects/${p.id}/messages`, 'DELETE')
  r = await papi(env, `/api/projects/${p.id}/poll?after=0`)
  assert.equal(r.data.messages.length, 0)
  assert.equal(r.data.epoch, 1)
  assert.equal((await papi(env, `/api/projects/${p.id}/files`)).data.entries.length, 1, 'clearing chat keeps files')
  r = await papi(env, `/api/projects/${p.id}`, 'DELETE')
  const count = (sql) => env.DB.sqlite.prepare(sql).get().n
  assert.equal(count('SELECT COUNT(*) AS n FROM files'), 0)
  assert.equal(count('SELECT COUNT(*) AS n FROM memories'), 0)
  assert.equal(count('SELECT COUNT(*) AS n FROM projects'), 0)
})

test('file REST: tree, write limits, stale writes, folder ops', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  let r = await papi(env, `/api/projects/${p.id}/file`, 'PUT', { path: 'docs/notes/a.md', content: '第一行\n第二行' })
  assert.equal(r.status, 200)
  const seq = r.data.seq
  r = await papi(env, `/api/projects/${p.id}/files`)
  assert.deepEqual(r.data.entries.map((e) => [e.path, e.dir]), [['docs', true], ['docs/notes', true], ['docs/notes/a.md', false]])
  assert.ok(r.data.rev > 0)
  r = await papi(env, `/api/projects/${p.id}/file`, 'PUT', { path: '../x', content: 'x' })
  assert.equal(r.status, 400)
  r = await papi(env, `/api/projects/${p.id}/file`, 'PUT', { path: 'big.txt', content: '中'.repeat(400_000) })
  assert.equal(r.status, 413, '1.2 MB of UTF-8 exceeds the 1 MB limit')
  r = await papi(env, `/api/projects/${p.id}/file`, 'PUT', { path: 'docs/notes/a.md', content: 'v2', seq })
  assert.equal(r.status, 200)
  assert.ok(r.data.seq > seq)
  r = await papi(env, `/api/projects/${p.id}/file`, 'PUT', { path: 'docs/notes/a.md', content: 'v3', seq })
  assert.equal(r.status, 409, 'stale updated_at is rejected')
  r = await papi(env, `/api/projects/${p.id}/fs`, 'POST', { op: 'move', from: 'docs', to: 'archive' })
  assert.equal(r.data.to, 'archive')
  r = await papi(env, `/api/projects/${p.id}/file?path=archive/notes/a.md`)
  assert.equal(r.data.content, 'v2')
  r = await papi(env, `/api/projects/${p.id}/fs`, 'POST', { op: 'delete', path: 'archive' })
  assert.equal(r.status, 400)
  r = await papi(env, `/api/projects/${p.id}/fs`, 'POST', { op: 'delete', path: 'archive', recursive: true })
  assert.equal(r.status, 200)
  r = await papi(env, `/api/projects/${p.id}/files`)
  assert.equal(r.data.entries.length, 0)
})

test('file tools: write, read with line numbers, edit uniqueness, append, search CJK', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  const fs = new ProjectFs(new Db(env.DB), p.id)
  let out = await runFileTool('write_file', { path: 'plan.md', content: '# 計畫\n東京旅遊預算五萬\nTODO: 訂機票\nTODO: 訂飯店' }, fs)
  assert.equal(out.result.ok, true)
  assert.deepEqual(out.events, [{ fs_op: { op: 'write', path: 'plan.md' } }])
  out = await runFileTool('read_file', { path: 'plan.md', start_line: 2, end_line: 3 }, fs)
  assert.equal(out.result.content, '2| 東京旅遊預算五萬\n3| TODO: 訂機票\n')
  out = await runFileTool('edit_file', { path: 'plan.md', old: 'TODO', new: 'DONE' }, fs)
  assert.equal(out.result.code, 'not_unique')
  out = await runFileTool('edit_file', { path: 'plan.md', old: 'TODO: 訂機票', new: 'DONE: 訂機票' }, fs)
  assert.equal(out.result.ok, true)
  out = await runFileTool('append_file', { path: 'plan.md', content: '備註：七月出發' }, fs)
  assert.equal(out.result.ok, true)
  await runFileTool('write_file', { path: 'other/旅遊.txt', content: '京都、大阪' }, fs)
  out = await runFileTool('search_files', { query: '東京 預算' }, fs)
  assert.equal(out.result.results.length, 1)
  assert.equal(out.result.results[0].path, 'plan.md')
  assert.equal(out.result.results[0].line, 2)
  out = await runFileTool('search_files', { query: '旅遊' }, fs)
  assert.deepEqual(out.result.results.map((r) => r.path).sort(), ['other/旅遊.txt', 'plan.md'])
  out = await runFileTool('read_file', { path: 'nope.md' }, fs)
  assert.equal(out.result.code, 'not_found')
  out = await runFileTool('write_file', { path: 'plan.md/x', content: 'x' }, fs)
  assert.equal(out.result.ok, false)
  out = await runFileTool('list_files', { recursive: true }, fs)
  assert.deepEqual(out.result.entries.map((e) => e.path), ['other', 'other/旅遊.txt', 'plan.md'])
})

test('project chat: one context batch, persisted messages, file tools with fs_op events', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  await papi(env, `/api/projects/${p.id}/file`, 'PUT', { path: 'readme.md', content: 'hello' })
  await api(env, '/api/memory', 'POST', { scope: p.id, content: '這個專案用 Python' })
  const calls = []
  await withFetch(async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    if (calls.length === 1) return jsonReply({ content: null, tool_calls: [tool('write_file', { path: 'out/result.md', content: '結果' }), tool('search_history', { query: '舊訊息' }, 'h')] }, 'tool_calls')
    return jsonReply({ content: '已寫入 out/result.md' })
  }, async () => {
    const before = env.DB.queries
    const res = await handleChat(chatRequest({ project_id: p.id, message: '幫我寫結果' }), env, { waitUntil() {} })
    assert.equal(res.status, 200)
    const evs = sseEvents(await res.text())
    assert.ok(evs.some((e) => e.fs_op && e.fs_op.path === 'out/result.md'))
    assert.ok(evs.some((e) => e.saved && e.saved.assistant_id))
    assert.ok(env.DB.queries - before < 20, `queries used: ${env.DB.queries - before}`)
  })
  const sys = calls[0].messages[0].content
  assert.match(sys, /readme\.md/)
  assert.match(sys, /專案指示：回答要附檔名/)
  assert.match(sys, /這個專案用 Python/)
  assert.ok(calls[0].tools.some((t) => t.function.name === 'edit_file'))
  assert.ok(calls[0].tools.some((t) => t.function.name === 'search_history'))
  const msgs = (await papi(env, `/api/projects/${p.id}/messages`)).data.messages
  assert.deepEqual(msgs.map((m) => m.role), ['user', 'assistant'])
  assert.equal(msgs[1].meta.steps[0].name, 'write_file')
  const file = await papi(env, `/api/projects/${p.id}/file?path=out/result.md`)
  assert.equal(file.data.content, '結果')
})

test('project settings: tools can be disabled and params overridden', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  await papi(env, `/api/projects/${p.id}`, 'PUT', { settings: { tools_disabled: ['files', 'web'], params: { temperature: 1.3, max_tokens: 1000 } } })
  let body
  await withFetch(async (u, init) => { body = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ project_id: p.id, message: 'hi' }), env, {})).text()
  })
  const names = body.tools.map((t) => t.function.name)
  assert.ok(!names.includes('write_file') && !names.includes('web_search'))
  assert.ok(names.includes('search_history'))
  assert.equal(body.temperature, 1.3)
  assert.equal(body.max_tokens, 1000)
})

test('provider failure on the first step does not leave an orphan user message', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  await withFetch(async () => new Response(JSON.stringify({ error: { message: 'bad key' } }), { status: 401, headers: { 'content-type': 'application/json' } }), async () => {
    const res = await handleChat(chatRequest({ project_id: p.id, message: 'hi' }), env, {})
    assert.equal(res.status, 400)
  })
  assert.equal((await papi(env, `/api/projects/${p.id}/messages`)).data.messages.length, 0)
})

test('rolling summary kicks in when the unsummarized history grows', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  const ins = env.DB.sqlite.prepare('INSERT INTO project_messages (project_id, role, content, meta, created_at) VALUES (?, ?, ?, ?, ?)')
  for (let i = 0; i < 40; i++) ins.run(p.id, i % 2 ? 'assistant' : 'user', `舊訊息 ${i} ` + 'x'.repeat(2000), '{}', i)
  const calls = []
  await withFetch(async (u, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    if (/rolling summary/.test(body.messages[0].content)) return jsonReply({ content: '摘要：使用者在規劃旅行' })
    return jsonReply({ content: '好的' })
  }, async () => {
    const evs = sseEvents(await (await handleChat(chatRequest({ project_id: p.id, message: '繼續' }), env, {})).text())
    assert.ok(evs.some((e) => e.summary))
  })
  // The main request only carried a bounded window of history.
  const chars = calls[0].messages.slice(1).reduce((n, m) => n + m.content.length, 0)
  assert.ok(chars <= 50_000, `window ${chars}`)
  const proj = (await papi(env, `/api/projects/${p.id}`)).data.project
  assert.equal(proj.summary, '摘要：使用者在規劃旅行')
  assert.ok(proj.summary_upto > 0)
  let next
  await withFetch(async (u, init) => { next = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ project_id: p.id, message: '還記得嗎' }), env, {})).text()
  })
  assert.match(next.messages[0].content, /摘要：使用者在規劃旅行/)
  assert.ok(!next.messages.some((m) => m.content.startsWith('舊訊息 0 ')))
})

test('recentWindow keeps newest messages within the char budget', () => {
  const rows = [{ content: 'c'.repeat(10) }, { content: 'b'.repeat(10) }, { content: 'a'.repeat(10) }]
  assert.deepEqual(recentWindow(rows, 25).map((r) => r.content[0]), ['b', 'c'])
})

test('search_history finds older messages', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  env.DB.sqlite.prepare('INSERT INTO project_messages (project_id, role, content, meta, created_at) VALUES (?, ?, ?, ?, ?)').run(p.id, 'user', '我們決定用 PostgreSQL 當資料庫', '{}', 1)
  const { searchHistory } = await import('../src/projects.js')
  const r = await searchHistory(new Db(env.DB), p.id, { query: 'postgresql' })
  assert.equal(r.results.length, 1)
  assert.match(r.results[0].snippet, /PostgreSQL/)
})

test('project remember defaults to project scope; scope=global is shared', async () => {
  const env = await providerEnv()
  const p = await newProject(env)
  let n = 0
  await withFetch(async () => {
    n++
    if (n === 1) return jsonReply({ content: null, tool_calls: [tool('remember', { fact: '專案用 Rust' }, 'a'), tool('remember', { fact: '我叫小明', scope: 'global' }, 'b')] }, 'tool_calls')
    return jsonReply({ content: 'ok' })
  }, async () => {
    await (await handleChat(chatRequest({ project_id: p.id, message: '記住' }), env, {})).text()
  })
  const rows = env.DB.sqlite.prepare('SELECT scope, content FROM memories ORDER BY content').all().map((r) => [r.scope === 'global' ? 'global' : 'project', r.content])
  assert.deepEqual(rows, [['project', '專案用 Rust'], ['global', '我叫小明']])
})
