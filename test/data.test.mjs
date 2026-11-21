import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

import { openSecret, sealSecret, previewSecret } from '../src/secret_box.js'
import { Budget, BudgetError, Db, SCHEMA_VERSION, _resetSchemaForTests, openDb } from '../src/db.js'
import { MIGRATIONS } from '../src/schema_sql.js'
import { readMigrations, renderSchemaModule } from '../scripts/build-schema.mjs'
import { handleSync } from '../src/sync.js'
import { passwordMatches } from '../src/auth.js'
import worker from '../src/index.js'
import { FakeD1, jsonRequest, testEnv, withFetch } from './helpers/d1.mjs'
import { api, providerEnv } from './helpers/setup.mjs'

test('generated schema module matches migrations/*.sql', () => {
  const expected = renderSchemaModule(readMigrations())
  assert.equal(fs.readFileSync(new URL('../src/schema_sql.js', import.meta.url), 'utf8'), expected)
  assert.equal(SCHEMA_VERSION, MIGRATIONS.at(-1).version)
})

test('schema is applied once per isolate and migrations are idempotent', async () => {
  _resetSchemaForTests()
  const env = testEnv()
  await openDb(env)
  const tables = env.DB.sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name)
  for (const t of ['settings', 'secrets', 'providers', 'memories', 'sync_items_v2', 'schema_meta']) assert.ok(tables.includes(t), t)
  const before = env.DB.queries
  await openDb(env)
  assert.equal(env.DB.queries, before) // cached
  // Re-running every migration (as `wrangler d1 migrations apply` would) is safe.
  for (const m of MIGRATIONS) for (const s of m.statements) env.DB.sqlite.exec(s)
})

test('legacy sync_items rows are carried into sync_items_v2', async () => {
  _resetSchemaForTests()
  const env = testEnv()
  env.DB.sqlite.exec(fs.readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8'))
  env.DB.sqlite.prepare("INSERT INTO sync_items (owner_id, item_key, value, updated_at, deleted) VALUES ('owner','chat:1','{}',5,0)").run()
  await openDb(env)
  const row = env.DB.sqlite.prepare("SELECT item_key, seq FROM sync_items_v2").get()
  assert.equal(row.item_key, 'chat:1')
  assert.ok(row.seq > 0)
})

test('secret box round-trips and binds the secret name', async () => {
  const secret = 'x'.repeat(40)
  const sealed = await sealSecret('sk-live-123456', secret, 'provider:a')
  assert.match(sealed, /^enc:v1:/)
  assert.equal(await openSecret(sealed, secret, 'provider:a'), 'sk-live-123456')
  await assert.rejects(() => openSecret(sealed, secret, 'provider:b'), /重新輸入/)
  await assert.rejects(() => openSecret(sealed, 'y'.repeat(40), 'provider:a'), /AUTH_SECRET/)
  assert.equal(previewSecret('sk-live-123456'), 'sk-…3456')
})

test('providers API never returns the key and keeps it when not re-entered', async () => {
  const env = await providerEnv()
  let { data } = await api(env, '/api/providers')
  assert.equal(data.providers.length, 1)
  assert.deepEqual(data.providers[0].key, { set: true, preview: 'sk-…5678' })
  assert.ok(!JSON.stringify(data).includes('sk-12345678'))
  const id = data.providers[0].id
  ;({ data } = await api(env, `/api/providers/${id}`, 'PUT', { name: 'Renamed', base_url: 'https://api.example.com/v1', default_model: 'm2' }))
  assert.equal(data.providers[0].name, 'Renamed')
  assert.equal(data.providers[0].key.set, true)
  const bad = await api(env, '/api/providers', 'POST', { name: 'x', base_url: 'http://insecure.example.com', api_key: 'sk-12345678' })
  assert.equal(bad.status, 400)
  const local = await api(env, '/api/providers', 'POST', { name: 'x', base_url: 'https://10.0.0.1/v1', api_key: 'sk-12345678' })
  assert.equal(local.status, 400)
  ;({ data } = await api(env, `/api/providers/${id}`, 'DELETE'))
  assert.equal(data.providers.length, 0)
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) AS n FROM secrets').get().n, 0)
})

test('model list is fetched with the stored key and cached on the provider', async () => {
  const env = await providerEnv()
  let auth
  await withFetch(async (url, init) => {
    auth = init.headers.Authorization
    assert.equal(url, 'https://api.example.com/v1/models')
    return new Response(JSON.stringify({ data: [{ id: 'a' }, { id: 'b' }, { id: '<img src=x>' }] }), { headers: { 'content-type': 'application/json' } })
  }, async () => {
    const { data } = await api(env, '/api/providers/models', 'POST', { id: env.providerId })
    assert.deepEqual(data.models.slice(0, 2), ['a', 'b'])
  })
  assert.equal(auth, 'Bearer sk-12345678')
  const { data } = await api(env, '/api/providers')
  assert.deepEqual(data.providers[0].models.slice(0, 2), ['a', 'b'])
})

test('settings are normalized and clamped', async () => {
  const env = await providerEnv()
  const { data } = await api(env, '/api/settings', 'PUT', {
    params: { temperature: 9, top_p: -1, max_tokens: 10, reasoning_effort: 'ultra', max_steps: 99 },
    active: { provider_id: env.providerId, model: 'm' },
    search: { provider: 'brave' },
  })
  assert.equal(data.settings.params.temperature, 2)
  assert.equal(data.settings.params.top_p, 0)
  assert.equal(data.settings.params.max_tokens, 256)
  assert.equal(data.settings.params.reasoning_effort, '')
  assert.equal(data.settings.params.max_steps, 20)
  assert.equal(data.settings.search.provider, 'auto')
  const got = await api(env, '/api/settings')
  assert.equal(got.data.settings.active.model, 'm')
  assert.deepEqual(got.data.secrets['search:tavily'], { set: false, preview: '' })
})

test('search keys are stored encrypted and only previews come back', async () => {
  const env = await providerEnv()
  let r = await api(env, '/api/secrets/search:tavily', 'PUT', { value: 'tvly-abcdefgh1234' })
  assert.equal(r.data.secrets['search:tavily'].preview, 'tvl…1234')
  assert.ok(!JSON.stringify(r.data).includes('abcdefgh'))
  r = await api(env, '/api/secrets/provider:x', 'PUT', { value: 'tvly-abcdefgh1234' })
  assert.equal(r.status, 400)
  r = await api(env, '/api/secrets/search:tavily', 'DELETE')
  assert.equal(r.data.secrets['search:tavily'].set, false)
})

test('memory CRUD', async () => {
  const env = await providerEnv()
  let r = await api(env, '/api/memory', 'POST', { scope: 'global', content: '喜歡 Rust' })
  const id = r.data.saved[0].id
  await api(env, '/api/memory', 'POST', { scope: 'global', content: '喜歡 Rust' }) // duplicate ignored
  r = await api(env, '/api/memory?scope=global')
  assert.equal(r.data.memories.length, 1)
  await api(env, `/api/memory/${id}`, 'PUT', { content: '喜歡 Go' })
  r = await api(env, '/api/memory')
  assert.equal(r.data.memories[0].content, '喜歡 Go')
  r = await api(env, `/api/memory/${id}`, 'DELETE')
  assert.equal(r.status, 200)
  r = await api(env, '/api/memory')
  assert.equal(r.data.memories.length, 0)
})

test('password change is real: PBKDF2 hash in D1 overrides APP_PASSWORD', async () => {
  const env = await providerEnv()
  let r = await api(env, '/api/password', 'POST', { current: 'wrong', next: 'new-password-123' })
  assert.equal(r.status, 400)
  r = await api(env, '/api/password', 'POST', { current: env.APP_PASSWORD, next: 'short' })
  assert.equal(r.status, 400)
  r = await api(env, '/api/password', 'POST', { current: env.APP_PASSWORD, next: 'new-password-123' })
  assert.equal(r.status, 200)
  const stored = JSON.parse(env.DB.sqlite.prepare("SELECT v FROM settings WHERE k = 'auth.password'").get().v)
  assert.equal(stored.alg, 'pbkdf2-sha256')
  assert.ok(!JSON.stringify(stored).includes('new-password-123'))
  assert.equal(await passwordMatches('new-password-123', env, stored), true)
  assert.equal(await passwordMatches(env.APP_PASSWORD, env, stored), false)
  // Login through the Worker uses the stored hash.
  const login = (password) => worker.fetch(jsonRequest('/api/login', 'POST', { password }), env, {})
  assert.equal((await login(env.APP_PASSWORD)).status, 401)
  const ok = await login('new-password-123')
  assert.equal(ok.status, 200)
  assert.match(ok.headers.get('set-cookie'), /__Host-session=/)
})

test('clear all data needs the confirm phrase and keeps the password', async () => {
  const env = await providerEnv()
  await api(env, '/api/password', 'POST', { current: env.APP_PASSWORD, next: 'new-password-123' })
  await api(env, '/api/memory', 'POST', { content: 'x fact' })
  let r = await api(env, '/api/data/clear', 'POST', { confirm: 'yes' })
  assert.equal(r.status, 400)
  r = await api(env, '/api/data/clear', 'POST', { confirm: '清除所有資料' })
  assert.equal(r.status, 200)
  const count = (t) => env.DB.sqlite.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n
  assert.equal(count('providers'), 0)
  assert.equal(count('secrets'), 0)
  assert.equal(count('memories'), 0)
  assert.equal(env.DB.sqlite.prepare("SELECT COUNT(*) AS n FROM settings WHERE k = 'auth.password'").get().n, 1)
})

test('sync pages by server sequence, so a device with a slow clock is not skipped', async () => {
  _resetSchemaForTests()
  const env = testEnv()
  const push = (changes) => handleSync(jsonRequest('/api/sync', 'POST', { changes }), env)
  const pull = async (since) => (await handleSync(jsonRequest(`/api/sync?since=${since}`), env)).json()
  await push([{ key: 'chat:a', value: '{"a":1}', updatedAt: 2_000_000 }])
  const first = await pull(0)
  assert.equal(first.items.length, 1)
  // Second device's clock is far behind the first one's.
  await push([{ key: 'chat:b', value: '{"b":1}', updatedAt: 1_000 }])
  const second = await pull(first.cursor)
  assert.deepEqual(second.items.map((i) => i.key), ['chat:b'])
  // Older write to an existing key does not win, and does not reappear.
  await push([{ key: 'chat:a', value: '{"a":0}', updatedAt: 10 }])
  const third = await pull(second.cursor)
  assert.equal(third.items.length, 0)
  const tooMany = await push(Array.from({ length: 41 }, (_, i) => ({ key: `chat:x${i}`, value: '1', updatedAt: 1 })))
  assert.equal(tooMany.status, 413)
})

test('Db enforces the D1 query budget (batch counts once)', async () => {
  const db = new Db(new FakeD1(), new Budget({ maxQueries: 40 }))
  await db.batch(Array.from({ length: 30 }, () => ['SELECT 1']))
  assert.equal(db.budget.queries, 1)
  for (let i = 0; i < 47; i++) await db.first('SELECT 1')
  await assert.rejects(() => db.first('SELECT 1'), BudgetError)
})

test('/api/me reports D1 status', async () => {
  const env = await providerEnv()
  const { createSession } = await import('../src/auth.js')
  const token = await createSession(env, 1)
  const res = await worker.fetch(new Request('https://example.com/api/me', { headers: { cookie: `__Host-session=${token}` } }), env, {})
  const data = await res.json()
  assert.equal(data.config.d1.ok, true)
  assert.equal(data.config.d1.providers, 1)
  const res2 = await worker.fetch(new Request('https://example.com/api/me', { headers: { cookie: `__Host-session=${token}` } }), { ...env, DB: undefined }, {})
  assert.equal((await res2.json()).config.d1.ok, false)
})

test('settings PUT merges partial updates', async () => {
  const env = await providerEnv()
  await api(env, '/api/settings', 'PUT', { params: { max_steps: 4, temperature: 0.2 } })
  const { data } = await api(env, '/api/settings', 'PUT', { params: { temperature: 0.9 } })
  assert.equal(data.settings.params.max_steps, 4)
  assert.equal(data.settings.params.temperature, 0.9)
})
