import test from 'node:test'
import assert from 'node:assert/strict'

import { createSession, verifySession, passwordMatches } from '../src/auth.js'
import {
  chatCompletionsUrl,
  isBlockedHost,
  modelsUrl,
  normalizeBaseUrl,
} from '../src/providers.js'
import { calculate } from '../src/tools/calc.js'
import { searchDocuments } from '../src/tools/docs.js'
import { buildPollinationsUrl, normalizeImageOptions } from '../src/images.js'
import { handleSync } from '../src/sync.js'

const env = {
  APP_PASSWORD: 'correct horse battery staple',
  AUTH_SECRET: 'test-secret-that-is-long-enough-123456',
  SESSION_DAYS: '30',
}

test('session round-trip and tamper rejection', async () => {
  const token = await createSession(env, 30)
  const request = new Request('https://example.com/', {
    headers: { cookie: `__Host-session=${encodeURIComponent(token)}` },
  })
  const session = await verifySession(request, env)
  assert.equal(session.sub, 'owner')

  const bad = token.slice(0, -2) + 'aa'
  const badRequest = new Request('https://example.com/', {
    headers: { cookie: `__Host-session=${encodeURIComponent(bad)}` },
  })
  assert.equal(await verifySession(badRequest, env), null)
})

test('password comparison is exact', async () => {
  assert.equal(await passwordMatches('correct horse battery staple', env), true)
  assert.equal(await passwordMatches('wrong', env), false)
})

test('provider URLs normalize to OpenAI-compatible endpoints', () => {
  assert.equal(normalizeBaseUrl('https://api.groq.com/openai/v1/'), 'https://api.groq.com/openai/v1')
  assert.equal(chatCompletionsUrl('https://api.groq.com/openai/v1'), 'https://api.groq.com/openai/v1/chat/completions')
  assert.equal(modelsUrl('https://api.openai.com/v1'), 'https://api.openai.com/v1/models')
  assert.equal(chatCompletionsUrl('https://example.com/v1/chat/completions'), 'https://example.com/v1/chat/completions')
})

test('provider URL rejects insecure and private targets', () => {
  for (const bad of [
    'http://api.example.com/v1',
    'https://localhost/v1',
    'https://127.0.0.1/v1',
    'https://10.0.0.2/v1',
    'https://172.16.1.2/v1',
    'https://192.168.1.2/v1',
    'https://printer.local/v1',
    'https://service.internal/v1',
    'https://[::1]/v1',
    'https://[fe80::1]/v1',
    'https://[fc00::1]/v1',
    'https://0x7f000001/v1',
  ]) {
    assert.throws(() => normalizeBaseUrl(bad), /HTTPS|主機/, bad)
  }
})

test('provider hostnames beginning with fc/fd are not treated as IPv6', () => {
  assert.equal(normalizeBaseUrl('https://fc-api.example.com/v1'), 'https://fc-api.example.com/v1')
  assert.equal(normalizeBaseUrl('https://fd.example.com/v1'), 'https://fd.example.com/v1')
})

test('SSRF guard blocks mapped, metadata and reserved addresses', () => {
  for (const host of ['[::ffff:7f00:1]', '[::ffff:127.0.0.1]', '[::ffff:a9fe:a9fe]', '169.254.169.254', 'metadata.google.internal', '192.0.0.1', '198.18.0.1', '0.1.2.3', '[fd12::1]', '[ff02::1]', 'localhost.', '2130706433']) {
    let hostname = host
    try { hostname = new URL(`https://${host}/`).hostname } catch {}
    assert.equal(isBlockedHost(hostname), true, host)
  }
  for (const host of ['api.openai.com', '8.8.8.8', '[2606:4700::1111]', 'fc-api.example.com']) {
    assert.equal(isBlockedHost(new URL(`https://${host}/`).hostname), false, host)
  }
})

test('provider URL handles /openai and /v1beta style bases', () => {
  assert.equal(chatCompletionsUrl('https://generativelanguage.googleapis.com/v1beta/openai'), 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions')
  assert.equal(modelsUrl('https://api.example.com/v1/chat/completions'), 'https://api.example.com/v1/models')
})

test('calculator handles precedence, parentheses, unary and errors', () => {
  assert.equal(calculate('1+2*3'), 7)
  assert.equal(calculate('(1+2)*3'), 9)
  assert.equal(calculate('-2^2'), -4)
  assert.equal(calculate('10%4'), 2)
  assert.throws(() => calculate('1/0'), /除以零/)
  assert.throws(() => calculate('alert(1)'), /只支援/)
})

test('document search ranks title and content matches', () => {
  const docs = [
    { title: '旅遊計畫', content: '東京與京都五天行程' },
    { title: '工作筆記', content: '東京辦公室的會議紀錄' },
    { title: '無關', content: '今天天氣很好' },
  ]
  const results = searchDocuments('東京', docs)
  assert.equal(results.length, 2)
  assert.equal(results[0].title, '旅遊計畫')
})

test('image options are bounded and URL uses Pollinations', () => {
  const options = normalizeImageOptions({ prompt: '貓與太空船', width: 9999, height: 10, seed: 7 })
  assert.equal(options.width, 1536)
  assert.equal(options.height, 256)
  const url = buildPollinationsUrl(options)
  assert.match(url, /^https:\/\/image\.pollinations\.ai\/prompt\//)
  assert.match(url, /width=1536/)
  assert.match(url, /nologo=true/)
  assert.throws(() => normalizeImageOptions({ prompt: '' }), /提示詞/)
})

test('sync disabled without D1', async () => {
  const request = new Request('https://example.com/api/sync')
  const response = await handleSync(request, {})
  assert.equal(response.status, 503)
})

test('sync rejects malformed keys before touching D1', async () => {
  const request = new Request('https://example.com/api/sync', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ changes: [{ key: 'bad key', value: '{}', updatedAt: 1 }] }),
  })
  const response = await handleSync(request, { DB: {} })
  assert.equal(response.status, 400)
})
