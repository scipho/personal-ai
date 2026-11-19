// REST endpoints for the D1 data layer: settings, secrets, providers, memory,
// password change and "clear all data". Every handler costs at most a few
// D1 queries (batches count as one) and no large JSON.

import { errorJson, json } from './config.js'
import { bodyErrorMessage, readJsonBody } from './body.js'
import { dbMissingResponse, newId, openDb } from './db.js'
import { fetchWithTimeout, modelsUrl, normalizeBaseUrl } from './providers.js'
import {
  MEMORY_MAX_CHARS,
  PROVIDER_ID_RE,
  addMemory,
  cleanModelList,
  deleteMemory,
  listMemories,
  listProviders,
  memoryScope,
  openSecretRow,
  putSecret,
  putSettings,
  sealedSecretStmt,
  settingsFromRows,
  secretStatus,
  setRawSettingStmt,
  sql,
  updateMemory,
} from './store.js'
import { MIN_PASSWORD_LENGTH, PASSWORD_SETTING, hashPassword, passwordMatches } from './auth.js'
import { SecretUnavailableError } from './secret_box.js'

const USER_SECRETS = new Set(['search:tavily', 'search:jina'])

// Tables wiped by "清除所有資料". Later PRs append their tables.
export const DATA_TABLES = ['sync_items_v2', 'sync_items', 'secrets', 'providers', 'memories']

async function body(request) {
  try {
    return { data: await readJsonBody(request) }
  } catch (err) {
    return { error: errorJson(bodyErrorMessage(err), err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, 'invalid_body') }
  }
}

function seg(path, i) {
  return decodeURIComponent(path.split('/')[i] || '')
}

// Returns a Response, or null when the path is not handled here.
export async function dataApiRoute(request, env, path, method) {
  const handled = path === '/api/settings' || path.startsWith('/api/secrets/') ||
    path === '/api/providers' || path.startsWith('/api/providers/') ||
    path === '/api/memory' || path.startsWith('/api/memory/') ||
    path === '/api/password' || path === '/api/data/clear'
  if (!handled) return null
  const db = await openDb(env)
  if (!db) return dbMissingResponse()
  try {
    if (path === '/api/settings') return settingsRoute(request, env, db, method)
    if (path.startsWith('/api/secrets/')) return secretRoute(request, env, db, method, seg(path, 3))
    if (path === '/api/providers/models') return modelsRoute(request, env, db, method)
    if (path === '/api/providers' || path.startsWith('/api/providers/')) return providersRoute(request, env, db, method, seg(path, 3))
    if (path === '/api/memory' || path.startsWith('/api/memory/')) return memoryRoute(request, env, db, method, seg(path, 3))
    if (path === '/api/password') return passwordRoute(request, env, db, method)
    if (path === '/api/data/clear') return clearRoute(request, env, db, method)
  } catch (err) {
    if (err instanceof SecretUnavailableError) return errorJson(err.message, 409, 'secret_undecryptable')
    console.error('data api failed', err && err.stack ? err.stack : err)
    return errorJson('資料庫操作失敗', 500, 'd1_error')
  }
  return errorJson('Not found', 404, 'not_found')
}

// ---- Settings ------------------------------------------------------------------

async function settingsRoute(request, env, db, method) {
  if (method === 'GET') {
    const [settingRows, secretRows] = await db.batch([sql.allSettings(), sql.secretPreviews()])
    return json({ ok: true, settings: settingsFromRows(settingRows), secrets: publicSecretStatus(secretRows) })
  }
  if (method === 'PUT' || method === 'PATCH') {
    const { data, error } = await body(request)
    if (error) return error
    try {
      const settings = await putSettings(db, data.settings || data)
      return json({ ok: true, settings })
    } catch (err) {
      return errorJson(err.message || '設定格式不正確', 400, 'invalid_settings')
    }
  }
  return errorJson('Method not allowed', 405)
}

function publicSecretStatus(rows) {
  const all = secretStatus(rows)
  const out = {}
  for (const name of USER_SECRETS) out[name] = all[name] || { set: false, preview: '' }
  return out
}

async function secretRoute(request, env, db, method, name) {
  if (!USER_SECRETS.has(name)) return errorJson('不支援的金鑰名稱', 400, 'invalid_secret')
  if (method === 'PUT' || method === 'POST') {
    const { data, error } = await body(request)
    if (error) return error
    const value = String(data.value || '').trim()
    if (value.length < 8 || value.length > 500) return errorJson('金鑰長度不正確', 400, 'invalid_secret')
    await putSecret(db, env, name, value)
    const rows = await db.all(...sql.secretPreviews())
    return json({ ok: true, secrets: publicSecretStatus(rows) })
  }
  if (method === 'DELETE') {
    await db.run('DELETE FROM secrets WHERE name = ?', name)
    const rows = await db.all(...sql.secretPreviews())
    return json({ ok: true, secrets: publicSecretStatus(rows) })
  }
  return errorJson('Method not allowed', 405)
}

// ---- Providers -------------------------------------------------------------------

async function providersRoute(request, env, db, method, id) {
  if (method === 'GET' && !id) return json({ ok: true, providers: await listProviders(db) })
  if ((method === 'POST' && !id) || (method === 'PUT' && id)) {
    const { data, error } = await body(request)
    if (error) return error
    return saveProvider(env, db, id || data.id || '', data)
  }
  if (method === 'DELETE' && id) {
    if (!PROVIDER_ID_RE.test(id)) return errorJson('供應商 ID 不正確', 400, 'invalid_provider')
    await db.batch([
      ['DELETE FROM providers WHERE id = ?', id],
      ['DELETE FROM secrets WHERE name = ?', `provider:${id}`],
    ])
    return json({ ok: true, providers: await listProviders(db) })
  }
  return errorJson('Method not allowed', 405)
}

async function saveProvider(env, db, id, data) {
  const name = String(data.name || '').trim().slice(0, 60) || '供應商'
  let baseUrl
  try { baseUrl = normalizeBaseUrl(data.base_url || data.baseUrl) } catch (err) {
    return errorJson(err.message, 400, 'invalid_base_url')
  }
  const apiKey = String(data.api_key || data.apiKey || '').trim()
  if (apiKey && (apiKey.length < 8 || apiKey.length > 500)) return errorJson('API Key 長度不正確', 400, 'invalid_key')
  const defaultModel = String(data.default_model || data.model || '').trim().slice(0, 200)
  const models = cleanModelList(data.models)
  const now = Date.now()
  let pid = String(id || '')
  let existing = null
  if (pid) {
    if (!PROVIDER_ID_RE.test(pid)) return errorJson('供應商 ID 不正確', 400, 'invalid_provider')
    existing = await db.first('SELECT id, models FROM providers WHERE id = ?', pid)
  }
  if (!existing && !apiKey) return errorJson('新增供應商時必須填寫 API Key', 400, 'missing_key')
  if (!pid) pid = newId('p_')
  const stmts = []
  if (existing) {
    stmts.push(['UPDATE providers SET name = ?, base_url = ?, default_model = ?, models = CASE WHEN ? = 1 THEN ? ELSE models END, updated_at = ? WHERE id = ?',
      name, baseUrl, defaultModel, Array.isArray(data.models) ? 1 : 0, JSON.stringify(models), now, pid])
  } else {
    const count = await db.first('SELECT COUNT(*) AS n FROM providers')
    if (count && count.n >= 20) return errorJson('最多 20 個供應商', 400, 'too_many_providers')
    stmts.push(['INSERT INTO providers (id, name, base_url, default_model, models, sort, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      pid, name, baseUrl, defaultModel, JSON.stringify(models), (count && count.n) || 0, now, now])
  }
  if (apiKey) stmts.push(await sealedSecretStmt(env, `provider:${pid}`, apiKey))
  await db.batch(stmts)
  return json({ ok: true, id: pid, providers: await listProviders(db) })
}

// Lists models from a provider. Uses the stored key when `id` is given and no
// new key was typed; caches the list on the provider row.
async function modelsRoute(request, env, db, method) {
  if (method !== 'POST') return errorJson('Method not allowed', 405)
  const { data, error } = await body(request)
  if (error) return error
  const id = String(data.id || '')
  let baseUrl = data.base_url || data.baseUrl || ''
  let apiKey = String(data.api_key || data.apiKey || '').trim()
  if (id) {
    if (!PROVIDER_ID_RE.test(id)) return errorJson('供應商 ID 不正確', 400, 'invalid_provider')
    const [rows, secrets] = await db.batch([
      ['SELECT base_url FROM providers WHERE id = ?', id],
      [...sql.secret(`provider:${id}`)],
    ])
    if (!rows.length) return errorJson('找不到供應商', 404, 'not_found')
    if (!baseUrl) baseUrl = rows[0].base_url
    if (!apiKey) {
      if (!secrets.length) return errorJson('這個供應商沒有 API Key', 400, 'missing_key')
      apiKey = await openSecretRow(env, secrets[0])
    }
  }
  if (!baseUrl || !apiKey) return errorJson('請先填寫 Base URL 與 API Key', 400, 'missing_fields')
  let url
  try { url = modelsUrl(baseUrl) } catch (err) { return errorJson(err.message, 400, 'invalid_base_url') }
  let upstream
  try {
    upstream = await fetchWithTimeout(url, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json', 'User-Agent': 'personal-ai/2.0' },
      signal: request.signal,
    }, 30_000)
  } catch {
    return errorJson('無法連線到供應商', 502, 'provider_unreachable')
  }
  if (!upstream.ok) {
    return errorJson(`供應商回傳 HTTP ${upstream.status}`, upstream.status === 401 || upstream.status === 403 ? 400 : 502, 'provider_error')
  }
  const text = await upstream.text()
  if (text.length > 1_500_000) return errorJson('模型清單過大', 502, 'models_too_large')
  let parsed
  try { parsed = JSON.parse(text) } catch { return errorJson('供應商回應格式不正確', 502, 'bad_provider_json') }
  const rows = Array.isArray(parsed.data) ? parsed.data : Array.isArray(parsed.models) ? parsed.models : []
  const models = cleanModelList(rows.map((row) => (typeof row === 'string' ? row : row && (row.id || row.name))))
  if (id) await db.run('UPDATE providers SET models = ?, updated_at = ? WHERE id = ?', JSON.stringify(models), Date.now(), id)
  return json({ ok: true, models })
}

// ---- Memory ----------------------------------------------------------------------

async function memoryRoute(request, env, db, method, id) {
  if (method === 'GET' && !id) {
    const url = new URL(request.url)
    const scope = url.searchParams.get('scope')
    const scopes = scope ? [memoryScope(scope)] : null
    const rows = scopes
      ? await listMemories(db, scopes, 500)
      : await db.all('SELECT id, scope, content, updated_at FROM memories ORDER BY updated_at DESC LIMIT 500')
    return json({ ok: true, memories: rows })
  }
  if (method === 'POST' && !id) {
    const { data, error } = await body(request)
    if (error) return error
    const items = Array.isArray(data.items) ? data.items.slice(0, 50) : [{ scope: data.scope, content: data.content }]
    const saved = []
    for (const item of items) {
      const content = String((item && item.content) || '').trim()
      if (!content) continue
      if (content.length > MEMORY_MAX_CHARS) return errorJson(`單則記憶最多 ${MEMORY_MAX_CHARS} 字`, 400, 'too_long')
      saved.push(await addMemory(db, item.scope || 'global', content))
      if (saved.length >= 20) break // D1 query budget per request
    }
    return json({ ok: true, saved })
  }
  if (method === 'PUT' && id) {
    const { data, error } = await body(request)
    if (error) return error
    try {
      const ok = await updateMemory(db, id, data.content)
      return ok ? json({ ok: true }) : errorJson('找不到記憶', 404, 'not_found')
    } catch (err) {
      return errorJson(err.message, 400, 'invalid_memory')
    }
  }
  if (method === 'DELETE' && id) {
    const ok = await deleteMemory(db, id)
    return ok ? json({ ok: true }) : errorJson('找不到記憶', 404, 'not_found')
  }
  if (method === 'DELETE' && !id) {
    const url = new URL(request.url)
    const scope = url.searchParams.get('scope')
    if (!scope) return errorJson('缺少 scope', 400, 'missing_scope')
    await db.run('DELETE FROM memories WHERE scope = ?', memoryScope(scope))
    return json({ ok: true })
  }
  return errorJson('Method not allowed', 405)
}

// ---- Password & data -------------------------------------------------------------

async function passwordRoute(request, env, db, method) {
  if (method !== 'POST') return errorJson('Method not allowed', 405)
  const { data, error } = await body(request)
  if (error) return error
  const current = String(data.current || '')
  const next = String(data.next || '')
  if (next.length < MIN_PASSWORD_LENGTH) return errorJson(`新密碼至少 ${MIN_PASSWORD_LENGTH} 個字元`, 400, 'weak_password')
  if (next.length > 200) return errorJson('新密碼過長', 400, 'weak_password')
  const row = await db.first('SELECT v FROM settings WHERE k = ?', PASSWORD_SETTING)
  const stored = row ? JSON.parse(row.v) : null
  if (!(await passwordMatches(current, env, stored))) return errorJson('目前密碼不正確', 400, 'bad_password')
  const hash = await hashPassword(next, env)
  await db.batch([setRawSettingStmt(PASSWORD_SETTING, hash)])
  return json({ ok: true })
}

export const CLEAR_CONFIRM = '清除所有資料'

async function clearRoute(request, env, db, method) {
  if (method !== 'POST') return errorJson('Method not allowed', 405)
  const { data, error } = await body(request)
  if (error) return error
  if (String(data.confirm || '') !== CLEAR_CONFIRM) return errorJson(`請輸入「${CLEAR_CONFIRM}」確認`, 400, 'confirm_required')
  // The changed password (auth.*) is kept so the owner is not locked out.
  await db.batch([
    ...DATA_TABLES.map((t) => [`DELETE FROM ${t}`]),
    ["DELETE FROM settings WHERE k NOT LIKE 'auth.%'"],
  ])
  return json({ ok: true })
}
