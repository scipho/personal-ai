// Data access for settings, secrets, providers and memory (D1).
// All functions take a Db (src/db.js) so query counts stay in budget.

import { newId } from './db.js'
import { openSecret, previewSecret, sealSecret } from './secret_box.js'

// ---- Settings ----------------------------------------------------------------

export const PUBLIC_SETTING_KEYS = ['params', 'active', 'prefs', 'search', 'memory']

export const DEFAULT_PARAMS = Object.freeze({
  temperature: 0.3,
  top_p: null,
  max_tokens: 8192,
  reasoning_effort: '',
  max_steps: 8,
})

export const REASONING_EFFORTS = ['', 'none', 'minimal', 'low', 'medium', 'high']

function num(value, min, max) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.min(max, Math.max(min, n))
}

// Normalizes a (possibly partial) params object. `partial` keeps missing keys
// missing, which is what project overrides need.
export function normalizeParams(input, { partial = false } = {}) {
  const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {}
  const out = {}
  const has = (k) => Object.prototype.hasOwnProperty.call(src, k)
  if (!partial || has('temperature')) out.temperature = num(src.temperature, 0, 2)
  if (!partial || has('top_p')) out.top_p = num(src.top_p, 0, 1)
  if (!partial || has('max_tokens')) {
    const m = num(src.max_tokens, 256, 65_536)
    out.max_tokens = m === null ? null : Math.round(m)
  }
  if (!partial || has('reasoning_effort')) {
    const r = String(src.reasoning_effort ?? '').toLowerCase()
    out.reasoning_effort = REASONING_EFFORTS.includes(r) ? r : ''
  }
  if (!partial || has('max_steps')) {
    const s = num(src.max_steps, 1, 20)
    out.max_steps = s === null ? null : Math.round(s)
  }
  if (partial) {
    for (const k of Object.keys(out)) if (out[k] === null || out[k] === '') delete out[k]
  }
  return out
}

// Global params with defaults, then project overrides (only set fields win).
export function mergeParams(globalParams, override) {
  const base = { ...DEFAULT_PARAMS }
  const g = normalizeParams(globalParams || {}, { partial: true })
  for (const [k, v] of Object.entries(g)) base[k] = v
  // A global null for temperature/top_p means "provider default".
  if (globalParams && globalParams.temperature === null) base.temperature = null
  if (globalParams && globalParams.top_p === null) base.top_p = null
  const o = normalizeParams(override || {}, { partial: true })
  for (const [k, v] of Object.entries(o)) base[k] = v
  if (!base.max_steps) base.max_steps = DEFAULT_PARAMS.max_steps
  if (!base.max_tokens) base.max_tokens = DEFAULT_PARAMS.max_tokens
  return base
}

export function normalizeSetting(key, value) {
  const v = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const str = (x, max) => (typeof x === 'string' ? x.slice(0, max) : '')
  switch (key) {
    case 'params':
      return normalizeParams(v)
    case 'active':
      return { provider_id: str(v.provider_id, 60), model: str(v.model, 200).trim() }
    case 'prefs':
      return { custom_prompt: str(v.custom_prompt, 8000), tone: str(v.tone, 20) }
    case 'search': {
      const provider = ['auto', 'tavily', 'jina', 'duckduckgo'].includes(v.provider) ? v.provider : 'auto'
      return { provider, jina_reader: v.jina_reader !== false }
    }
    case 'memory':
      return { enabled: v.enabled !== false }
    default:
      throw new Error(`未知設定：${String(key).slice(0, 40)}`)
  }
}

export function parseJson(text, fallback) {
  if (text === null || text === undefined || text === '') return fallback
  try { return JSON.parse(text) } catch { return fallback }
}

// Statement tuples for use inside a larger batch.
export const sql = {
  allSettings: () => ['SELECT k, v FROM settings'],
  providerList: () => ['SELECT id, name, base_url, default_model, models, sort, updated_at FROM providers ORDER BY sort, created_at'],
  secretPreviews: () => ['SELECT name, preview, updated_at FROM secrets'],
  secret: (name) => ['SELECT name, sealed, preview FROM secrets WHERE name = ?', name],
  memories: (scopes, limit = 100) => [
    `SELECT id, scope, content, updated_at FROM memories WHERE scope IN (${scopes.map(() => '?').join(',')}) ORDER BY updated_at DESC LIMIT ?`,
    ...scopes, limit,
  ],
}

export function settingsFromRows(rows) {
  const out = {}
  for (const row of rows || []) {
    if (!PUBLIC_SETTING_KEYS.includes(row.k)) continue
    out[row.k] = parseJson(row.v, {})
  }
  return {
    params: mergeParams(out.params),
    active: normalizeSetting('active', out.active),
    prefs: normalizeSetting('prefs', out.prefs),
    search: normalizeSetting('search', out.search),
    memory: normalizeSetting('memory', out.memory),
  }
}

export async function getSettings(db) {
  return settingsFromRows(await db.all(...sql.allSettings()))
}

// Partial updates: each given key is shallow-merged into what is stored.
export async function putSettings(db, patch) {
  const now = Date.now()
  const items = []
  const keys = PUBLIC_SETTING_KEYS.filter((key) => patch && key in patch)
  if (!keys.length) return getSettings(db)
  const stored = {}
  for (const row of await db.all(`SELECT k, v FROM settings WHERE k IN (${keys.map(() => '?').join(',')})`, ...keys)) stored[row.k] = parseJson(row.v, {})
  for (const key of keys) {
    const value = patch[key] && typeof patch[key] === 'object' && !Array.isArray(patch[key]) ? { ...(stored[key] || {}), ...patch[key] } : patch[key]
    items.push(['INSERT INTO settings (k, v, updated_at) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = excluded.updated_at',
      key, JSON.stringify(normalizeSetting(key, value)), now])
  }
  await db.batch(items)
  return getSettings(db)
}

export async function getRawSetting(db, key) {
  const row = await db.first('SELECT v FROM settings WHERE k = ?', key)
  return row ? parseJson(row.v, null) : null
}

export function setRawSettingStmt(key, value) {
  return ['INSERT INTO settings (k, v, updated_at) VALUES (?, ?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v, updated_at = excluded.updated_at',
    key, JSON.stringify(value), Date.now()]
}

// ---- Secrets -----------------------------------------------------------------

export const SECRET_NAME_RE = /^(provider|search|mcp):[A-Za-z0-9_-]{1,60}$/

export async function sealedSecretStmt(env, name, value) {
  if (!SECRET_NAME_RE.test(name)) throw new Error('金鑰名稱不正確')
  const sealed = await sealSecret(value, env.AUTH_SECRET, name)
  return ['INSERT INTO secrets (name, sealed, preview, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(name) DO UPDATE SET sealed = excluded.sealed, preview = excluded.preview, updated_at = excluded.updated_at',
    name, sealed, previewSecret(value), Date.now()]
}

export async function putSecret(db, env, name, value) {
  await db.batch([await sealedSecretStmt(env, name, value)])
}

export async function deleteSecret(db, name) {
  await db.run('DELETE FROM secrets WHERE name = ?', name)
}

// Opens a sealed row; throws SecretUnavailableError when undecryptable.
export async function openSecretRow(env, row) {
  if (!row) return ''
  return openSecret(row.sealed, env.AUTH_SECRET, row.name)
}

// Returns '' when missing or undecryptable (used for optional keys).
export async function tryOpenSecretRow(env, row) {
  try { return await openSecretRow(env, row) } catch { return '' }
}

export function secretStatus(previewRows) {
  const out = {}
  for (const r of previewRows || []) out[r.name] = { set: true, preview: r.preview || '', updated_at: r.updated_at }
  return out
}

// ---- Providers ---------------------------------------------------------------

export function providerFromRow(row, secretRow) {
  return {
    id: row.id,
    name: row.name,
    base_url: row.base_url,
    default_model: row.default_model || '',
    models: parseJson(row.models, []),
    key: secretRow ? { set: true, preview: secretRow.preview || '' } : { set: false, preview: '' },
  }
}

export async function listProviders(db) {
  const [rows, secrets] = await db.batch([sql.providerList(), sql.secretPreviews()])
  const byName = new Map(secrets.map((s) => [s.name, s]))
  return rows.map((row) => providerFromRow(row, byName.get(`provider:${row.id}`)))
}

export const PROVIDER_ID_RE = /^[A-Za-z0-9_-]{1,60}$/

export function cleanModelList(list) {
  if (!Array.isArray(list)) return []
  const out = []
  for (const m of list) {
    const id = typeof m === 'string' ? m.trim() : ''
    if (id && id.length < 200 && !out.includes(id)) out.push(id)
    if (out.length >= 500) break
  }
  return out
}

export async function getProviderRow(db, id) {
  if (!PROVIDER_ID_RE.test(String(id || ''))) return null
  return db.first('SELECT id, name, base_url, default_model, models FROM providers WHERE id = ?', id)
}

// ---- Memory ------------------------------------------------------------------

export const MEMORY_MAX_CHARS = 500
export const MEMORY_MAX_ITEMS = 200 // per scope

export function memoryScope(value) {
  const s = String(value || 'global')
  return s === 'global' || /^[A-Za-z0-9_-]{1,60}$/.test(s) ? s : 'global'
}

export async function listMemories(db, scopes, limit = 200) {
  return db.all(...sql.memories(scopes.map(memoryScope), Math.min(500, limit)))
}

export async function addMemory(db, scope, content) {
  const text = String(content || '').replace(/\s+/g, ' ').trim().slice(0, MEMORY_MAX_CHARS)
  if (!text) throw new Error('記憶內容不可為空')
  const sc = memoryScope(scope)
  const now = Date.now()
  const id = newId('m_')
  // Insert, skip exact duplicates, and trim the scope to its cap: one batch.
  const [, , countRows] = await db.batch([
    ['INSERT INTO memories (id, scope, content, created_at, updated_at) SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM memories WHERE scope = ? AND content = ?)',
      id, sc, text, now, now, sc, text],
    ['DELETE FROM memories WHERE scope = ? AND id NOT IN (SELECT id FROM memories WHERE scope = ? ORDER BY updated_at DESC LIMIT ?)', sc, sc, MEMORY_MAX_ITEMS],
    ['SELECT id FROM memories WHERE scope = ? AND content = ?', sc, text],
  ])
  return { id: (countRows[0] && countRows[0].id) || id, scope: sc, content: text }
}

export async function updateMemory(db, id, content) {
  const text = String(content || '').replace(/\s+/g, ' ').trim().slice(0, MEMORY_MAX_CHARS)
  if (!text) throw new Error('記憶內容不可為空')
  const res = await db.run('UPDATE memories SET content = ?, updated_at = ? WHERE id = ?', text, Date.now(), String(id || ''))
  return !!(res && res.meta && res.meta.changes)
}

export async function deleteMemory(db, id) {
  const res = await db.run('DELETE FROM memories WHERE id = ?', String(id || ''))
  return !!(res && res.meta && res.meta.changes)
}

// Deletes memories whose content contains `needle` (case-insensitive for
// ASCII) within the given scopes. Uses instr() so long needles are fine.
export async function forgetMemories(db, scopes, needle) {
  const n = String(needle || '').trim().slice(0, 200)
  if (!n) throw new Error('text 不可為空')
  const sc = scopes.map(memoryScope)
  const res = await db.run(
    `DELETE FROM memories WHERE scope IN (${sc.map(() => '?').join(',')}) AND instr(lower(content), lower(?)) > 0`,
    ...sc, n,
  )
  return (res && res.meta && res.meta.changes) || 0
}

export async function recallMemories(db, scopes, query, limit = 20) {
  const q = String(query || '').trim().slice(0, 200)
  const sc = scopes.map(memoryScope)
  if (!q) return listMemories(db, sc, limit)
  return db.all(
    `SELECT id, scope, content, updated_at FROM memories WHERE scope IN (${sc.map(() => '?').join(',')}) AND instr(lower(content), lower(?)) > 0 ORDER BY updated_at DESC LIMIT ?`,
    ...sc, q, Math.min(50, limit),
  )
}
