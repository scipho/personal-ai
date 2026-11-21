import { errorJson, json } from './config.js'
import { readJsonBody, bodyErrorMessage } from './body.js'
import { dbMissingResponse, openDb } from './db.js'

const OWNER = 'owner'
export const SYNC_TYPES = ['chat', 'doc', 'project', 'prompt', 'setting']
const KEY_RE = new RegExp(`^(${SYNC_TYPES.join('|')}):[A-Za-z0-9_-]{1,100}$`)
const MAX_ITEMS = 40 // D1: one batch per push, keep payloads small
const MAX_VALUE = 900_000
const MAX_PULL = 200

export function isValidSyncKey(key) {
  return KEY_RE.test(String(key || ''))
}

export function syncAvailable(env) {
  return !!env.DB
}

// Main (non-project) chats, documents and UI prefs sync as one row per item
// with last-write-wins on the client's updatedAt. Pulls page by a
// server-assigned sequence (`seq`), never by the client clock: devices with a
// clock behind used to have their pushes skipped by other devices.
export async function handleSync(request, env) {
  if (!env.DB) return dbMissingResponse()
  if (request.method === 'POST') {
    // Validate before touching D1.
    let body
    try { body = await readJsonBody(request) } catch (err) {
      return errorJson(bodyErrorMessage(err), err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, 'invalid_body')
    }
    const rows = validateChanges(body)
    if (rows instanceof Response) return rows
    const db = await openDb(env)
    return push(db, rows)
  }
  const db = await openDb(env)
  if (request.method === 'GET') return pull(request, db)
  if (request.method === 'DELETE') return clear(db)
  return errorJson('Method not allowed', 405)
}

async function pull(request, db) {
  const url = new URL(request.url)
  const since = Math.max(0, Number.parseInt(url.searchParams.get('since') || '0', 10) || 0)
  const limit = Math.min(MAX_PULL, Math.max(1, Number.parseInt(url.searchParams.get('limit') || String(MAX_PULL), 10) || MAX_PULL))
  let results
  try {
    results = await db.all(
      `SELECT item_key, value, updated_at, deleted, seq
         FROM sync_items_v2
        WHERE owner_id = ? AND seq > ?
        ORDER BY seq ASC
        LIMIT ?`,
      OWNER, since, limit,
    )
  } catch {
    return errorJson('讀取同步資料失敗', 500, 'sync_read_failed')
  }
  const items = results.map((row) => ({
    key: row.item_key,
    value: row.value == null ? '' : row.value,
    updatedAt: Number(row.updated_at) || 0,
    deleted: !!row.deleted,
  }))
  const cursor = results.reduce((max, row) => Math.max(max, Number(row.seq) || 0), since)
  return json({ ok: true, items, cursor, more: results.length === limit })
}

export function validateChanges(body) {
  const changes = Array.isArray(body.changes) ? body.changes : null
  if (!changes) return errorJson('缺少 changes', 400, 'invalid_changes')
  if (changes.length > MAX_ITEMS) return errorJson(`一次最多同步 ${MAX_ITEMS} 項`, 413, 'too_many_changes')
  const rows = []
  for (const change of changes) {
    if (!change || typeof change !== 'object') continue
    const key = String(change.key || '')
    if (!KEY_RE.test(key)) return errorJson(`同步鍵不正確：${key.slice(0, 40)}`, 400, 'invalid_key')
    const deleted = !!change.deleted
    const value = deleted ? '' : String(change.value ?? '')
    if (value.length > MAX_VALUE) return errorJson(`項目過大：${key.slice(0, 40)}`, 413, 'item_too_large')
    const updatedAt = Math.max(0, Number.parseInt(change.updatedAt, 10) || 0)
    if (!updatedAt) return errorJson('同步項目缺少 updatedAt', 400, 'invalid_timestamp')
    rows.push({ key, value, updatedAt, deleted })
  }
  return rows
}

async function push(db, rows) {
  if (!rows.length) return json({ ok: true, applied: 0 })
  try {
    // Each statement takes MAX(seq)+1 inside the batch transaction, so the
    // sequence is strictly increasing and never reused.
    await db.batch(rows.map((row) => [
      `INSERT INTO sync_items_v2 (owner_id, item_key, value, updated_at, deleted, seq)
       VALUES (?, ?, ?, ?, ?, (SELECT COALESCE(MAX(seq), 0) + 1 FROM sync_items_v2 WHERE owner_id = ?))
       ON CONFLICT(owner_id, item_key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at,
         deleted = excluded.deleted,
         seq = excluded.seq
       WHERE excluded.updated_at > sync_items_v2.updated_at`,
      OWNER, row.key, row.value, row.updatedAt, row.deleted ? 1 : 0, OWNER,
    ]))
    return json({ ok: true, applied: rows.length })
  } catch {
    return errorJson('寫入同步資料失敗', 500, 'sync_write_failed')
  }
}

async function clear(db) {
  try {
    await db.batch([['DELETE FROM sync_items_v2 WHERE owner_id = ?', OWNER], ['DELETE FROM sync_items WHERE owner_id = ?', OWNER]])
    return json({ ok: true })
  } catch {
    return errorJson('清除同步資料失敗', 500, 'sync_clear_failed')
  }
}
