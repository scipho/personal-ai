import test from 'node:test'
import assert from 'node:assert/strict'

import { handleChat } from '../src/chat.js'

const provider = { baseUrl: 'https://api.example.com/v1', apiKey: 'sk-12345678', model: 'test-model' }
const req = (body) => new Request('https://example.com/api/chat', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
})
const reply = (message, finish = 'stop') => new Response(JSON.stringify({ choices: [{ message, finish_reason: finish }] }), {
  status: 200, headers: { 'content-type': 'application/json' },
})

test('length_mode becomes a system instruction', async () => {
  const original = globalThis.fetch
  let body
  globalThis.fetch = async (u, init) => { body = JSON.parse(init.body); return reply({ content: 'ok' }) }
  try {
    await handleChat(req({ prompt: 'hi', provider, length_mode: 'corto' }), {})
    assert.match(body.messages[0].content, /簡短/)
  } finally { globalThis.fetch = original }
})

test('remember tool updates the browser profile and streams it back', async () => {
  const original = globalThis.fetch
  let n = 0
  let seenTools
  globalThis.fetch = async (u, init) => {
    n++
    const body = JSON.parse(init.body)
    if (n === 1) {
      seenTools = body.tools.map((t) => t.function.name)
      return reply({ content: null, tool_calls: [{ id: 'm1', type: 'function', function: { name: 'remember', arguments: '{"fact":"偏好 TypeScript"}' } }] }, 'tool_calls')
    }
    return reply({ content: '記住了' })
  }
  try {
    const res = await handleChat(req({ prompt: '記住我偏好 TypeScript', provider, adapt: true, profile: { notes: [] } }), {})
    const evs = (await res.text()).split('\n').filter((l) => l.startsWith('data:') && !l.includes('[DONE]')).map((l) => JSON.parse(l.slice(5)))
    assert.ok(seenTools.includes('remember'))
    const ev = evs.find((e) => e.profile)
    assert.equal(ev.profile.notes[0].fact, '偏好 TypeScript')
    assert.deepEqual(ev.remembered, ['偏好 TypeScript'])
  } finally { globalThis.fetch = original }
})

test('memory tools are not offered when adapt is off', async () => {
  const original = globalThis.fetch
  let body
  globalThis.fetch = async (u, init) => { body = JSON.parse(init.body); return reply({ content: 'ok' }) }
  try {
    await handleChat(req({ prompt: 'hi', provider, profile: { notes: [] } }), {})
    assert.ok(!body.tools.some((t) => t.function.name === 'remember'))
  } finally { globalThis.fetch = original }
})
