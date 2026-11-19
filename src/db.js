// Thin D1 wrapper that counts queries against the per-request budget.
//
// Workers Free / D1 Free: at most 50 D1 queries per invocation, where one
// db.batch() counts as a single query. Every data-access path goes through
// Db so the agent can stop before the platform limit is hit.

import { MIGRATIONS } from './schema_sql.js'
import { errorJson } from './config.js'

export const SCHEMA_VERSION = MIGRATIONS.reduce((max, m) => Math.max(max, m.version), 0)
export const D1_HARD_LIMIT = 48 // platform limit is 50; keep two for safety

export class BudgetError extends Error {
  constructor(kind) {
    super(kind === 'd1' ? '本次請求的資料庫查詢次數已用完' : '本次請求的外部連線次數已用完')
    this.name = 'BudgetError'
    this.kind = kind
  }
}

// Per-request budget: model steps, external subrequests and D1 queries.
export class Budget {
  constructor({ maxSteps = 8, maxSubrequests = 40, maxQueries = 40 } = {}) {
    this.maxSteps = maxSteps
    this.maxSubrequests = maxSubrequests
    this.maxQueries = maxQueries
    this.steps = 0
    this.subrequests = 0
    this.queries = 0
  }

  canFetch(n = 1) { return this.subrequests + n <= this.maxSubrequests }
  // Count `n` external subrequests (redirect hops count individually).
  fetch(n = 1) {
    if (!this.canFetch(n)) throw new BudgetError('fetch')
    this.subrequests += n
  }

  canQuery(n = 1) { return this.queries + n <= this.maxQueries }
  query(n = 1) {
    if (this.queries + n > D1_HARD_LIMIT) throw new BudgetError('d1')
    this.queries += n
  }

  exhausted() {
    return this.subrequests >= this.maxSubrequests || this.queries >= this.maxQueries
  }

  snapshot() {
    return { steps: this.steps, subrequests: this.subrequests, queries: this.queries }
  }
}

export class Db {
  constructor(d1, budget = new Budget({ maxQueries: D1_HARD_LIMIT })) {
    this.d1 = d1
    this.budget = budget
  }

  stmt(sql, params = []) {
    const s = this.d1.prepare(sql)
    return params.length ? s.bind(...params) : s
  }

  async all(sql, ...params) {
    this.budget.query()
    const { results } = await this.stmt(sql, params).all()
    return results || []
  }

  async first(sql, ...params) {
    this.budget.query()
    return (await this.stmt(sql, params).first()) || null
  }

  async run(sql, ...params) {
    this.budget.query()
    return this.stmt(sql, params).run()
  }

  // items: [[sql, ...params], ...] -> array of result arrays. One query.
  async batch(items) {
    if (!items.length) return []
    this.budget.query()
    const out = await this.d1.batch(items.map(([sql, ...params]) => this.stmt(sql, params)))
    return out.map((r) => (r && r.results) || [])
  }
}

let schemaReadyFor = null

export function _resetSchemaForTests() {
  schemaReadyFor = null
}

// Applies pending idempotent migrations once per isolate. Costs one query on
// a warm schema (the version check) and one batch when something is missing.
export async function ensureSchema(db) {
  if (schemaReadyFor === db.d1) return
  let version = 0
  try {
    const row = await db.first("SELECT v FROM schema_meta WHERE k = 'version'")
    version = row ? Number.parseInt(row.v, 10) || 0 : 0
  } catch {
    version = 0
  }
  if (version < SCHEMA_VERSION) {
    const pending = MIGRATIONS.filter((m) => m.version > version)
    const statements = pending.flatMap((m) => m.statements.map((sql) => [sql]))
    await db.batch(statements)
  }
  schemaReadyFor = db.d1
}

export function dbMissingResponse() {
  return errorJson('此部署尚未綁定 D1 資料庫（binding: DB）。請依 README 建立 D1 並重新部署。', 503, 'd1_required')
}

// Returns a schema-checked Db or null when the binding is missing.
export async function openDb(env, budget) {
  if (!env || !env.DB) return null
  const db = new Db(env.DB, budget)
  await ensureSchema(db)
  return db
}

export function newId(prefix = '') {
  const bytes = crypto.getRandomValues(new Uint8Array(9))
  let s = ''
  for (const b of bytes) s += b.toString(36).padStart(2, '0')
  return `${prefix}${Date.now().toString(36)}${s}`.slice(0, 40)
}
