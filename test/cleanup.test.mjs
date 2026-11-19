import test from 'node:test'
import assert from 'node:assert/strict'

import { handleChat } from '../src/chat.js'
import { jsonReply, sseEvents, withFetch } from './helpers/d1.mjs'
import { api, chatRequest, providerEnv } from './helpers/setup.mjs'

test('length_mode and tone become system instructions', async () => {
  const env = await providerEnv()
  await api(env, '/api/settings', 'PUT', { prefs: { tone: 'concise', custom_prompt: '用條列' } })
  let body
  await withFetch(async (u, init) => { body = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ prompt: 'hi', length_mode: 'corto' }), env)).text()
  })
  assert.match(body.messages[0].content, /簡短/)
  assert.match(body.messages[0].content, /最少但足夠/)
  assert.match(body.messages[0].content, /用條列/)
})

test('remember writes to D1 memory and streams a memory event', async () => {
  const env = await providerEnv()
  let n = 0
  let seenTools
  await withFetch(async (u, init) => {
    n++
    const body = JSON.parse(init.body)
    if (n === 1) {
      seenTools = body.tools.map((t) => t.function.name)
      return jsonReply({ content: null, tool_calls: [{ id: 'm1', type: 'function', function: { name: 'remember', arguments: '{"fact":"偏好 TypeScript"}' } }] }, 'tool_calls')
    }
    return jsonReply({ content: '記住了' })
  }, async () => {
    const res = await handleChat(chatRequest({ prompt: '記住我偏好 TypeScript' }), env)
    const evs = sseEvents(await res.text())
    assert.ok(seenTools.includes('remember'))
    const ev = evs.find((e) => e.memory)
    assert.deepEqual(ev.memory, { op: 'remember', text: '偏好 TypeScript' })
  })
  const { data } = await api(env, '/api/memory?scope=global')
  assert.equal(data.memories[0].content, '偏好 TypeScript')
})

test('forget removes matching memories', async () => {
  const env = await providerEnv()
  await api(env, '/api/memory', 'POST', { items: [{ content: '住在台北' }, { content: '喜歡貓' }] })
  let n = 0
  await withFetch(async () => {
    n++
    if (n === 1) return jsonReply({ content: null, tool_calls: [{ id: 'f', type: 'function', function: { name: 'forget', arguments: '{"text":"台北"}' } }] }, 'tool_calls')
    return jsonReply({ content: '好' })
  }, async () => {
    await (await handleChat(chatRequest({ prompt: '忘掉我住哪' }), env)).text()
  })
  const { data } = await api(env, '/api/memory')
  assert.deepEqual(data.memories.map((m) => m.content), ['喜歡貓'])
})
