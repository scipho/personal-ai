// Minimal in-memory D1 stand-in backed by node:sqlite, for tests only.
import { DatabaseSync } from 'node:sqlite'

function returnsRows(sql) {
  return /^\s*(SELECT|WITH|PRAGMA)/i.test(sql) || /\bRETURNING\b/i.test(sql)
}

class Stmt {
  constructor(db, sql, params = []) {
    this.db = db
    this.sql = sql
    this.params = params
  }
  bind(...params) {
    return new Stmt(this.db, this.sql, params)
  }
  _exec() {
    const s = this.db.sqlite.prepare(this.sql)
    const params = this.params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p))
    if (returnsRows(this.sql)) {
      const rows = s.all(...params).map((r) => ({ ...r }))
      return { results: rows, meta: { changes: 0 } }
    }
    const info = s.run(...params)
    return { results: [], meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } }
  }
  async all() { this.db.queries++; return this._exec() }
  async first(col) {
    this.db.queries++
    const row = this._exec().results[0]
    if (!row) return null
    return col ? row[col] : row
  }
  async run() { this.db.queries++; return this._exec() }
}

export class FakeD1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:')
    this.queries = 0
  }
  prepare(sql) {
    return new Stmt(this, sql)
  }
  async batch(stmts) {
    this.queries++
    this.sqlite.exec('BEGIN')
    try {
      const out = stmts.map((s) => s._exec())
      this.sqlite.exec('COMMIT')
      return out
    } catch (err) {
      this.sqlite.exec('ROLLBACK')
      throw err
    }
  }
  async exec(sql) {
    this.sqlite.exec(sql)
    return { count: 1 }
  }
}

export function testEnv(extra = {}) {
  return {
    APP_PASSWORD: 'correct horse battery staple',
    AUTH_SECRET: 'test-secret-that-is-long-enough-123456',
    DB: new FakeD1(),
    ...extra,
  }
}

export function jsonRequest(path, method = 'GET', body, headers = {}) {
  const init = { method, headers: { ...headers } }
  if (body !== undefined) {
    init.body = JSON.stringify(body)
    init.headers['content-type'] = 'application/json'
  }
  return new Request(`https://example.com${path}`, init)
}

export function sseEvents(text) {
  return text.split('\n')
    .filter((l) => l.startsWith('data:') && !l.includes('[DONE]'))
    .map((l) => JSON.parse(l.slice(5)))
}

export async function withFetch(impl, fn) {
  const original = globalThis.fetch
  globalThis.fetch = impl
  try { return await fn() } finally { globalThis.fetch = original }
}

export function jsonReply(message, finish = 'stop') {
  return new Response(JSON.stringify({ choices: [{ message, finish_reason: finish }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
