import test from 'node:test'
import assert from 'node:assert/strict'

import { handleChat, parseCompletion, messagesForProvider } from '../src/chat.js'
import { DEFAULT_PARAMS } from '../src/store.js'
import { providerEnv } from './helpers/setup.mjs'
import { openAiTools, runTool } from '../src/tools/registry.js'
import { searchDocuments, queryTerms } from '../src/tools/docs.js'


function chatRequest(body) {
  return new Request('https://example.com/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function jsonReply(message, finish = 'stop') {
  return new Response(JSON.stringify({ choices: [{ message, finish_reason: finish }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

function events(text) {
  return text.split('\n')
    .filter((l) => l.startsWith('data:') && !l.includes('[DONE]'))
    .map((l) => JSON.parse(l.slice(5)))
}

async function withFetch(impl, fn) {
  const original = globalThis.fetch
  globalThis.fetch = impl
  try { return await fn() } finally { globalThis.fetch = original }
}

test('agent sends tools and runs a tool-calling loop', async () => {
  const calls = []
  await withFetch(async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    if (calls.length === 1) {
      return jsonReply({
        content: null,
        tool_calls: [{ id: 'c1', type: 'function', function: { name: 'calculate', arguments: '{"expression":"(12+3)*4"}' } }],
      }, 'tool_calls')
    }
    return jsonReply({ content: '答案是 60' })
  }, async () => {
    const response = await handleChat(chatRequest({ prompt: '(12+3)*4 是多少？' }), await providerEnv())
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('x-agent'), 'on')
    const evs = events(await response.text())
    assert.ok(evs.some((e) => e.tool && e.tool.name === 'calculate' && e.tool.status === 'done'))
    assert.equal(evs.filter((e) => e.content).map((e) => e.content).join(''), '答案是 60')
  })
  assert.equal(calls.length, 2)
  assert.ok(Array.isArray(calls[0].tools) && calls[0].tools.length > 0)
  assert.equal(calls[0].stream, false)
  const toolMsg = calls[1].messages.find((m) => m.role === 'tool')
  assert.equal(toolMsg.tool_call_id, 'c1')
  assert.match(toolMsg.content, /"result":60/)
  const assistant = calls[1].messages.find((m) => m.role === 'assistant' && m.tool_calls)
  assert.equal(assistant.tool_calls[0].function.name, 'calculate')
})

test('web_search needs a search key; fetch_url is always offered', () => {
  const names = (caps) => openAiTools(caps).map((t) => t.function.name)
  assert.deepEqual(names({}), ['fetch_url', 'calculate', 'current_time'])
  assert.ok(names({ search: true }).includes('web_search'))
  assert.ok(names({ memory: true }).includes('recall'))
  assert.ok(names({ docs: true }).includes('document_search'))
})

test('agent reports unknown tools and bad JSON back to the model instead of crashing', async () => {
  const calls = []
  await withFetch(async (url, init) => {
    calls.push(JSON.parse(init.body))
    if (calls.length === 1) {
      return jsonReply({
        content: '',
        tool_calls: [
          { id: 'a', type: 'function', function: { name: 'web_search', arguments: '{"query":"x"}' } },
          { id: 'b', type: 'function', function: { name: 'calculate', arguments: '{bad json' } },
        ],
      }, 'tool_calls')
    }
    return jsonReply({ content: 'ok' })
  }, async () => {
    const response = await handleChat(chatRequest({ prompt: 'hi' }), await providerEnv())
    const evs = events(await response.text())
    assert.equal(evs.filter((e) => e.tool && e.tool.status === 'error').length, 2)
  })
  const toolMsgs = calls[1].messages.filter((m) => m.role === 'tool')
  assert.match(toolMsgs[0].content, /不可用/)
  assert.match(toolMsgs[1].content, /JSON/)
})

test('agent stops after MAX_AGENT_STEPS and forces a final answer', async () => {
  const calls = []
  await withFetch(async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    if (body.tool_choice === 'none') return jsonReply({ content: '最終答案' })
    return jsonReply({
      content: null,
      tool_calls: [{ id: `t${calls.length}`, type: 'function', function: { name: 'current_time', arguments: '{}' } }],
    }, 'tool_calls')
  }, async () => {
    const response = await handleChat(chatRequest({ prompt: '現在幾點' }), await providerEnv())
    const evs = events(await response.text())
    assert.equal(evs.filter((e) => e.content).map((e) => e.content).join(''), '最終答案')
  })
  assert.equal(calls.length, DEFAULT_PARAMS.max_steps + 1)
  assert.equal(calls.at(-1).tool_choice, 'none')
})

test('agent falls back to plain streaming when the provider rejects tools', async () => {
  const calls = []
  await withFetch(async (url, init) => {
    const body = JSON.parse(init.body)
    calls.push(body)
    if (body.tools) {
      return new Response(JSON.stringify({ error: { message: 'tools are not supported for this model' } }), {
        status: 400, headers: { 'content-type': 'application/json' },
      })
    }
    return new Response('data: {"choices":[{"delta":{"content":"純聊天"}}]}\n\ndata: [DONE]\n\n', {
      status: 200, headers: { 'content-type': 'text/event-stream' },
    })
  }, async () => {
    const response = await handleChat(chatRequest({ prompt: 'hi' }), await providerEnv())
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('x-agent-fallback'), 'tools_unsupported')
    assert.match(await response.text(), /純聊天/)
  })
  assert.equal(calls.length, 2)
  assert.equal(calls[1].stream, true)
  assert.equal(calls[1].tools, undefined)
})

test('provider errors keep their HTTP status and message', async () => {
  await withFetch(async () => new Response(JSON.stringify({ error: { message: 'Invalid API Key' } }), {
    status: 401, headers: { 'content-type': 'application/json' },
  }), async () => {
    const response = await handleChat(chatRequest({ prompt: 'hi' }), await providerEnv())
    assert.equal(response.status, 400)
    const data = await response.json()
    assert.match(data.error, /Invalid API Key/)
  })
})

test('errors during the loop are streamed as error events, not swallowed', async () => {
  let n = 0
  await withFetch(async () => {
    n++
    if (n === 1) {
      return jsonReply({ content: null, tool_calls: [{ id: 'x', type: 'function', function: { name: 'current_time', arguments: '{}' } }] }, 'tool_calls')
    }
    return new Response(JSON.stringify({ error: { message: 'Rate limit reached' } }), { status: 429, headers: { 'content-type': 'application/json' } })
  }, async () => {
    const response = await handleChat(chatRequest({ prompt: 'hi' }), await providerEnv())
    const evs = events(await response.text())
    assert.ok(evs.some((e) => e.error && /Rate limit/.test(e.error)))
  })
})

test('empty answer caused by max_tokens is reported, not shown as blank', async () => {
  await withFetch(async () => jsonReply({ content: '' }, 'length'), async () => {
    const response = await handleChat(chatRequest({ prompt: 'hi' }), await providerEnv())
    const evs = events(await response.text())
    assert.ok(evs.some((e) => e.error && /max_tokens/.test(e.error)))
  })
})

test('defaults are agent friendly: low temperature, larger max_tokens', async () => {
  let captured
  await withFetch(async (url, init) => { captured = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await handleChat(chatRequest({ prompt: 'hi' }), await providerEnv())
  })
  assert.equal(captured.temperature, 0.3)
  assert.equal(captured.max_tokens, 8192)
})

test('current user message is not duplicated from chat_history', () => {
  const messages = messagesForProvider({
    prompt: '第二個問題',
    chat_history: [
      { role: 'user', content: '第一個問題' },
      { role: 'ai', content: '第一個回答' },
      { role: 'user', content: '第二個問題' },
    ],
  }, {})
  assert.equal(messages.filter((m) => m.content === '第二個問題').length, 1)
  assert.equal(messages.length, 4)
})

test('parseCompletion assembles streamed tool call deltas', () => {
  const sse = [
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"c1","function":{"name":"web_","arguments":"{\\"qu"}}]}}]}',
    'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"function":{"name":"search","arguments":"ery\\":\\"a\\"}"}}]},"finish_reason":"tool_calls"}]}',
    'data: [DONE]',
  ].join('\n\n')
  const step = parseCompletion(sse, 'text/event-stream')
  assert.equal(step.tool_calls[0].function.name, 'web_search')
  assert.deepEqual(JSON.parse(step.tool_calls[0].function.arguments), { query: 'a' })
})

test('large document sets become a searchable index instead of being truncated', async () => {
  let captured
  const big = 'A'.repeat(9000) + ' 部署方式：使用 wrangler deploy。'
  await withFetch(async (url, init) => { captured = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await handleChat(chatRequest({ prompt: '怎麼部署？', documents: [{ title: '說明', content: big }] }), await providerEnv())
  })
  assert.ok(captured.tools.some((t) => t.function.name === 'document_search'))
  assert.match(captured.messages[0].content, /document_search/)
  assert.doesNotMatch(captured.messages[0].content, /AAAAAAAAAA/)
  const result = await runTool('document_search', { query: '怎麼部署' }, { documents: [{ title: '說明', content: big }] })
  assert.equal(result.ok, true)
  assert.match(result.results[0].snippet, /wrangler deploy/)
})

test('document search tokenizes CJK text without spaces', () => {
  assert.ok(queryTerms('東京旅遊預算').includes('東京'))
  const docs = [
    { title: '筆記', content: '下個月去東京旅遊，預算五萬元。' },
    { title: '其他', content: '今天天氣很好。' },
  ]
  const hits = searchDocuments('東京旅遊預算是多少', docs)
  assert.equal(hits.length, 1)
  assert.equal(hits[0].title, '筆記')
})
