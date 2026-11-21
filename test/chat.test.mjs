import test from 'node:test'
import assert from 'node:assert/strict'

import { handleChat } from '../src/chat.js'
import { _resetSchemaForTests } from '../src/db.js'
import { jsonReply, sseEvents, testEnv, withFetch } from './helpers/d1.mjs'
import { api, chatRequest, providerEnv } from './helpers/setup.mjs'

test('chat requires D1', async () => {
  const response = await handleChat(chatRequest({ prompt: 'hi' }), { APP_PASSWORD: 'x', AUTH_SECRET: 'y'.repeat(32) })
  assert.equal(response.status, 503)
  assert.equal((await response.json()).code, 'd1_required')
})

test('chat without a provider guides the user to settings', async () => {
  _resetSchemaForTests()
  const response = await handleChat(chatRequest({ prompt: 'hi' }), testEnv())
  assert.equal(response.status, 400)
  const data = await response.json()
  assert.equal(data.code, 'no_provider')
  assert.match(data.error, /設定/)
})

test('chat uses the stored, encrypted provider key and model; browser keys are ignored', async () => {
  const env = await providerEnv()
  let captured
  await withFetch(async (url, init) => {
    captured = { url, auth: init.headers.Authorization, body: JSON.parse(init.body) }
    return new Response('data: {"choices":[{"delta":{"content":"你好"}}]}\n\ndata: [DONE]\n\n', {
      status: 200, headers: { 'content-type': 'text/event-stream' },
    })
  }, async () => {
    const response = await handleChat(chatRequest({
      prompt: '哈囉', tools: false,
      provider: { baseUrl: 'https://evil.example/v1', apiKey: 'sk-browser-key', model: 'x' },
      chat_history: [{ role: 'user', content: '先前訊息' }, { role: 'ai', content: '先前回覆' }],
    }), env)
    assert.equal(response.status, 200)
    assert.match(await response.text(), /你好/)
  })
  assert.equal(captured.url, 'https://api.example.com/v1/chat/completions')
  assert.equal(captured.auth, 'Bearer sk-12345678')
  assert.equal(captured.body.model, 'test-model')
  assert.equal(captured.body.messages.at(-1).content, '哈囉')
  assert.ok(captured.body.messages.some((m) => m.role === 'assistant'))
  // The raw key never sits in D1 in plaintext.
  const row = env.DB.sqlite.prepare("SELECT sealed FROM secrets WHERE name LIKE 'provider:%'").get()
  assert.ok(row.sealed.startsWith('enc:v1:'))
  assert.ok(!row.sealed.includes('sk-12345678'))
})

test('chat accepts a messages array and picks provider_id + model from the request', async () => {
  const env = await providerEnv()
  const second = await api(env, '/api/providers', 'POST', { name: 'B', base_url: 'https://b.example.com/v1', api_key: 'sk-bbbbbbbb', default_model: 'b-default' })
  let captured
  await withFetch(async (url, init) => { captured = { url, body: JSON.parse(init.body) }; return jsonReply({ content: 'ok' }) }, async () => {
    const res = await handleChat(chatRequest({ provider_id: second.data.id, model: 'b-large', messages: [{ role: 'user', content: '問' }] }), env)
    assert.equal(res.status, 200)
    await res.text()
  })
  assert.match(captured.url, /^https:\/\/b\.example\.com/)
  assert.equal(captured.body.model, 'b-large')
})

test('chat converts a non-stream JSON provider response to SSE', async () => {
  const env = await providerEnv()
  await withFetch(async () => jsonReply({ content: 'JSON 回覆' }), async () => {
    const response = await handleChat(chatRequest({ prompt: 'test', tools: false }), env)
    const text = await response.text()
    assert.match(text, /JSON 回覆/)
    assert.match(text, /\[DONE\]/)
  })
})

test('chat rejects image attachments', async () => {
  const env = await providerEnv()
  const response = await handleChat(chatRequest({ prompt: 'test', image: 'data:image/png;base64,abc' }), env)
  assert.equal(response.status, 400)
})

test('a provider that rejects a sampling param gets one retry without it', async () => {
  const env = await providerEnv()
  await api(env, '/api/settings', 'PUT', { params: { temperature: 0.5, reasoning_effort: 'high', max_tokens: 4000, max_steps: 4 } })
  const bodies = []
  await withFetch(async (url, init) => {
    const body = JSON.parse(init.body)
    bodies.push(body)
    if ('temperature' in body) {
      return new Response(JSON.stringify({ error: { message: "Unsupported parameter: 'temperature' is not supported with this model." } }), { status: 400, headers: { 'content-type': 'application/json' } })
    }
    return jsonReply({ content: 'ok' })
  }, async () => {
    const res = await handleChat(chatRequest({ prompt: 'hi' }), env)
    assert.equal(res.status, 200)
    assert.match(await res.text(), /ok/)
  })
  assert.equal(bodies.length, 2)
  assert.equal(bodies[0].temperature, 0.5)
  assert.equal(bodies[0].reasoning_effort, 'high')
  assert.equal(bodies[0].max_tokens, 4000)
  assert.equal('temperature' in bodies[1], false)
  assert.equal(bodies[1].reasoning_effort, 'high')
})

test('a rotated AUTH_SECRET makes stored keys undecryptable with a clear error', async () => {
  const env = await providerEnv()
  env.AUTH_SECRET = 'a-completely-different-secret-value-0000'
  const res = await handleChat(chatRequest({ prompt: 'hi' }), env)
  assert.equal(res.status, 409)
  const data = await res.json()
  assert.equal(data.code, 'secret_undecryptable')
  assert.match(data.error, /重新輸入/)
})

test('global memory is injected into the system prompt', async () => {
  const env = await providerEnv()
  await api(env, '/api/memory', 'POST', { scope: 'global', content: '使用者偏好 TypeScript' })
  let body
  await withFetch(async (u, init) => { body = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ prompt: 'hi' }), env)).text()
  })
  assert.match(body.messages[0].content, /偏好 TypeScript/)
  await api(env, '/api/settings', 'PUT', { memory: { enabled: false } })
  await withFetch(async (u, init) => { body = JSON.parse(init.body); return jsonReply({ content: 'ok' }) }, async () => {
    await (await handleChat(chatRequest({ prompt: 'hi' }), env)).text()
  })
  assert.doesNotMatch(body.messages[0].content, /偏好 TypeScript/)
  assert.ok(!body.tools.some((t) => t.function.name === 'remember'))
})
