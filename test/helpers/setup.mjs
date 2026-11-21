import { dataApiRoute } from '../../src/api.js'
import { _resetSchemaForTests } from '../../src/db.js'
import { jsonRequest, testEnv } from './d1.mjs'

// Fresh env with D1 and one provider (key sk-12345678, model test-model).
export async function providerEnv(extra = {}, provider = {}) {
  _resetSchemaForTests()
  const env = testEnv(extra)
  const res = await dataApiRoute(jsonRequest('/api/providers', 'POST', {
    name: 'Test', base_url: 'https://api.example.com/v1', api_key: 'sk-12345678', default_model: 'test-model', ...provider,
  }), env, '/api/providers', 'POST')
  const data = await res.json()
  if (!data.ok) throw new Error('seed provider failed: ' + JSON.stringify(data))
  env.providerId = data.id
  return env
}

export async function api(env, path, method = 'GET', body) {
  const res = await dataApiRoute(jsonRequest(path, method, body), env, new URL('https://x' + path).pathname, method)
  return { status: res.status, data: await res.json() }
}

export function chatRequest(body) {
  return jsonRequest('/api/chat', 'POST', body)
}
