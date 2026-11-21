// Remote MCP servers over Streamable HTTP (the legacy HTTP+SSE transport is
// not supported; stdio is impossible on Workers). OAuth is not supported yet:
// auth is none, a Bearer token, or a custom header, encrypted in D1.
//
// "測試連線" runs initialize + tools/list and caches the tool list in D1; chat
// requests never re-list. The session id is cached; on 404/400 for a stale
// session the client re-initializes once. Every HTTP call counts against the
// per-request subrequest budget.

import { errorJson, json } from './config.js'
import { bodyErrorMessage, readJsonBody } from './body.js'
import { Budget, dbMissingResponse, newId, openDb } from './db.js'
import { isBlockedHost } from './providers.js'
import { parseJson, sealedSecretStmt, tryOpenSecretRow } from './store.js'

export const MAX_SERVERS = 5
export const MAX_TOOLS_TOTAL = 40
export const PROTOCOL_VERSION = '2025-06-18'
const MAX_RESPONSE_CHARS = 1_000_000
const MAX_SCHEMA_CHARS = 8_000
const TIMEOUT_MS = 30_000
const SERVER_NAME_RE = /^[a-z0-9][a-z0-9_-]{0,19}$/
const AUTH_TYPES = ['none', 'bearer', 'header']

export class McpError extends Error {
  constructor(message, code = 'mcp_error') {
    super(message)
    this.code = code
  }
}

export function validateMcpUrl(input) {
  let url
  try { url = new URL(String(input || '').trim()) } catch { throw new McpError('MCP URL 格式不正確', 'invalid_url') }
  if (url.protocol !== 'https:') throw new McpError('MCP URL 必須使用 HTTPS', 'invalid_url')
  if (url.username || url.password) throw new McpError('MCP URL 不可包含帳號密碼', 'invalid_url')
  if (isBlockedHost(url.hostname)) throw new McpError('此主機位址不被允許', 'invalid_url')
  url.hash = ''
  return url.toString()
}

// OpenAI function names: ^[a-zA-Z0-9_-]{1,64}$
export function namespacedToolName(serverName, toolName) {
  const clean = String(toolName).replace(/[^A-Za-z0-9_-]/g, '_')
  let name = `mcp__${serverName}__${clean}`
  if (name.length > 64) {
    let h = 0
    for (const ch of String(toolName)) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    name = name.slice(0, 57) + '_' + h.toString(36).slice(0, 6)
  }
  return name
}

// Extracts the JSON-RPC response with `id` from a JSON or SSE body.
export function parseRpcBody(text, contentType, id) {
  if (/event-stream/i.test(contentType)) {
    let found = null
    for (const block of String(text).split(/\n\n+/)) {
      const data = block.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trimStart()).join('\n')
      if (!data) continue
      let msg
      try { msg = JSON.parse(data) } catch { continue }
      const list = Array.isArray(msg) ? msg : [msg]
      for (const m of list) if (m && m.id === id && ('result' in m || 'error' in m)) found = m
      if (found) break
    }
    if (!found) throw new McpError('MCP 伺服器的 SSE 回應中沒有對應的結果')
    return found
  }
  let msg
  try { msg = JSON.parse(text) } catch { throw new McpError('MCP 伺服器回應不是 JSON') }
  if (Array.isArray(msg)) msg = msg.find((m) => m && m.id === id) || msg[0]
  return msg
}

export class McpClient {
  constructor({ url, authType = 'none', headerName = '', token = '', sessionId = '', protocolVersion = '', budget = null, signal = null }) {
    this.url = validateMcpUrl(url)
    this.authType = authType
    this.headerName = headerName
    this.token = token
    this.sessionId = sessionId || ''
    this.protocolVersion = protocolVersion || ''
    this.budget = budget
    this.signal = signal
    this.nextId = 1
    this.sessionChanged = false
  }

  headers() {
    const h = { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream', 'User-Agent': 'personal-ai/2.0' }
    if (this.protocolVersion) h['MCP-Protocol-Version'] = this.protocolVersion
    if (this.sessionId) h['Mcp-Session-Id'] = this.sessionId
    if (this.token && this.authType === 'bearer') h['Authorization'] = `Bearer ${this.token}`
    if (this.token && this.authType === 'header' && /^[A-Za-z0-9-]{1,60}$/.test(this.headerName)) h[this.headerName] = this.token
    return h
  }

  async post(payload) {
    if (this.budget) this.budget.fetch(1)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort('timeout'), TIMEOUT_MS)
    const onAbort = () => controller.abort('client-abort')
    if (this.signal) this.signal.addEventListener('abort', onAbort, { once: true })
    try {
      const res = await fetch(this.url, { method: 'POST', headers: this.headers(), body: JSON.stringify(payload), redirect: 'manual', signal: controller.signal })
      if (res.status >= 300 && res.status < 400) throw new McpError('MCP 伺服器回傳重新導向，為了安全不跟隨', 'redirect')
      const text = await res.text()
      if (text.length > MAX_RESPONSE_CHARS) throw new McpError('MCP 回應過大')
      return { status: res.status, text, type: res.headers.get('content-type') || '', session: res.headers.get('mcp-session-id') || '' }
    } catch (err) {
      if (err instanceof McpError) throw err
      if (err && err.name === 'BudgetError') throw err
      throw new McpError(err && (err.name === 'AbortError' || /timeout/.test(String(err.message || err))) ? 'MCP 伺服器逾時' : '無法連線到 MCP 伺服器', 'unreachable')
    } finally {
      clearTimeout(timer)
      if (this.signal) this.signal.removeEventListener('abort', onAbort)
    }
  }

  async rpc(method, params, { retried = false } = {}) {
    const id = this.nextId++
    const res = await this.post({ jsonrpc: '2.0', id, method, params })
    if ((res.status === 404 || res.status === 400) && this.sessionId && method !== 'initialize' && !retried) {
      // Session expired: initialize again once, then retry.
      this.sessionId = ''
      await this.initialize()
      return this.rpc(method, params, { retried: true })
    }
    if (res.status === 401 || res.status === 403) throw new McpError(`MCP 伺服器拒絕授權（HTTP ${res.status}），請確認金鑰`, 'unauthorized')
    if (res.status < 200 || res.status >= 300) throw new McpError(`MCP 伺服器回傳 HTTP ${res.status}${res.text ? '：' + res.text.slice(0, 200) : ''}`, 'http_error')
    if (res.session && res.session !== this.sessionId) { this.sessionId = res.session; this.sessionChanged = true }
    const msg = parseRpcBody(res.text, res.type, id)
    if (msg && msg.error) throw new McpError(`MCP 錯誤：${(msg.error.message || JSON.stringify(msg.error)).slice(0, 300)}`, 'rpc_error')
    return msg ? msg.result : null
  }

  async initialize() {
    this.sessionId = ''
    const result = await this.rpc('initialize', {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: 'personal-ai', version: '2.2.0' },
    })
    this.protocolVersion = (result && result.protocolVersion) || PROTOCOL_VERSION
    this.sessionChanged = true
    // Notification: no id, server answers 202 Accepted.
    const res = await this.post({ jsonrpc: '2.0', method: 'notifications/initialized' })
    if (res.status >= 400 && res.status !== 405) throw new McpError(`MCP 初始化通知失敗（HTTP ${res.status}）`, 'http_error')
    return result
  }

  async listTools(maxPages = 3) {
    const tools = []
    let cursor
    for (let i = 0; i < maxPages; i++) {
      const result = await this.rpc('tools/list', cursor ? { cursor } : {})
      for (const t of (result && result.tools) || []) tools.push(t)
      cursor = result && result.nextCursor
      if (!cursor) break
    }
    return tools
  }

  async callTool(name, args) {
    return this.rpc('tools/call', { name, arguments: args || {} })
  }
}

export function cleanToolList(tools) {
  const out = []
  for (const t of tools || []) {
    if (!t || typeof t.name !== 'string' || !t.name) continue
    let schema = t.inputSchema && typeof t.inputSchema === 'object' ? t.inputSchema : { type: 'object', properties: {} }
    if (JSON.stringify(schema).length > MAX_SCHEMA_CHARS) schema = { type: 'object', properties: {}, additionalProperties: true }
    if (schema.type !== 'object') schema = { type: 'object', properties: {} }
    out.push({ name: t.name.slice(0, 120), description: String(t.description || '').slice(0, 1000), inputSchema: schema })
    if (out.length >= 100) break
  }
  return out
}

// Text from a tools/call result.
export function toolResultText(result) {
  const parts = []
  for (const c of (result && result.content) || []) {
    if (c && c.type === 'text') parts.push(String(c.text || ''))
    else if (c && c.type === 'resource' && c.resource && typeof c.resource.text === 'string') parts.push(c.resource.text)
    else if (c && c.type) parts.push(`[${c.type} 內容未顯示]`)
  }
  if (!parts.length && result && result.structuredContent) parts.push(JSON.stringify(result.structuredContent))
  return parts.join('\n').slice(0, 20_000)
}

// ---- Chat integration --------------------------------------------------------------

// Builds OpenAI tool defs + a router from cached server rows (no network).
export function mcpToolsFromRows(rows, { disabledServers = new Set() } = {}) {
  const defs = []
  const routes = new Map()
  for (const row of rows || []) {
    if (!row.enabled || disabledServers.has(row.id) || disabledServers.has(row.name)) continue
    const disabled = new Set(parseJson(row.disabled_tools, []))
    for (const t of parseJson(row.tools, [])) {
      if (disabled.has(t.name)) continue
      if (defs.length >= MAX_TOOLS_TOTAL) break
      const fn = namespacedToolName(row.name, t.name)
      if (routes.has(fn)) continue
      routes.set(fn, { serverId: row.id, tool: t.name })
      defs.push({ type: 'function', function: { name: fn, description: `[MCP ${row.name}] ${t.description || t.name}`.slice(0, 1024), parameters: t.inputSchema } })
    }
  }
  return { defs, routes }
}

export async function runMcpTool(db, env, rowsById, secretRows, route, args, { budget, signal }) {
  const row = rowsById.get(route.serverId)
  if (!row) return { ok: false, error: 'MCP 伺服器不存在' }
  const token = await tryOpenSecretRow(env, secretRows.get(`mcp:${row.id}`))
  const client = new McpClient({ url: row.url, authType: row.auth_type, headerName: row.header_name, token, sessionId: row.session_id, protocolVersion: row.protocol_version, budget, signal })
  try {
    if (!client.sessionId) await client.initialize()
    const result = await client.callTool(route.tool, args)
    const text = toolResultText(result)
    return result && result.isError ? { ok: false, error: text.slice(0, 2000) || 'MCP 工具回報錯誤' } : { ok: true, server: row.name, tool: route.tool, content: text }
  } finally {
    if (client.sessionChanged) {
      row.session_id = client.sessionId
      row.protocol_version = client.protocolVersion
      try {
        await db.run('UPDATE mcp_servers SET session_id = ?, protocol_version = ? WHERE id = ?', client.sessionId, client.protocolVersion, row.id)
      } catch {}
    }
  }
}

// ---- REST ------------------------------------------------------------------------

function serverView(row, secret) {
  const tools = parseJson(row.tools, [])
  const disabled = parseJson(row.disabled_tools, [])
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    auth_type: row.auth_type,
    header_name: row.header_name,
    enabled: !!row.enabled,
    token: secret ? { set: true, preview: secret.preview } : { set: false, preview: '' },
    tools: tools.map((t) => ({ name: t.name, description: t.description, enabled: !disabled.includes(t.name) })),
    last_tested_at: row.last_tested_at,
    last_error: row.last_error,
  }
}

async function readBody(request) {
  try { return { data: await readJsonBody(request) } } catch (err) {
    return { error: errorJson(bodyErrorMessage(err), err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, 'invalid_body') }
  }
}

async function listServers(db) {
  const [rows, secrets] = await db.batch([
    ['SELECT * FROM mcp_servers ORDER BY created_at'],
    ["SELECT name, preview FROM secrets WHERE name LIKE 'mcp:%'"],
  ])
  const byName = new Map(secrets.map((s) => [s.name, s]))
  return rows.map((r) => serverView(r, byName.get(`mcp:${r.id}`)))
}

async function enabledToolCount(db, exceptId = '') {
  const rows = await db.all('SELECT id, tools, disabled_tools FROM mcp_servers WHERE enabled = 1')
  let n = 0
  for (const r of rows) {
    if (r.id === exceptId) continue
    const disabled = new Set(parseJson(r.disabled_tools, []))
    n += parseJson(r.tools, []).filter((t) => !disabled.has(t.name)).length
  }
  return n
}

export async function mcpApiRoute(request, env, path, method) {
  if (path !== '/api/mcp' && !path.startsWith('/api/mcp/')) return null
  const db = await openDb(env, new Budget({ maxQueries: 48, maxSubrequests: 10 }))
  if (!db) return dbMissingResponse()
  const parts = path.split('/').slice(3).map((p) => decodeURIComponent(p))
  const id = parts[0] || ''
  const sub = parts[1] || ''
  try {
    if (!id) {
      if (method === 'GET') return json({ ok: true, servers: await listServers(db), limits: { servers: MAX_SERVERS, tools: MAX_TOOLS_TOTAL } })
      if (method === 'POST') return await saveServer(request, env, db, null)
      return errorJson('Method not allowed', 405)
    }
    const row = await db.first('SELECT * FROM mcp_servers WHERE id = ?', id)
    if (!row) return errorJson('找不到 MCP 伺服器', 404, 'not_found')
    if (!sub && method === 'PUT') return await saveServer(request, env, db, row)
    if (!sub && method === 'DELETE') {
      await db.batch([['DELETE FROM mcp_servers WHERE id = ?', id], ['DELETE FROM secrets WHERE name = ?', `mcp:${id}`]])
      return json({ ok: true, servers: await listServers(db) })
    }
    if (sub === 'test' && method === 'POST') return await testServer(env, db, row, request.signal)
    if (sub === 'tools' && method === 'PUT') {
      const { data, error } = await readBody(request)
      if (error) return error
      const names = new Set(parseJson(row.tools, []).map((t) => t.name))
      const disabled = (Array.isArray(data.disabled_tools) ? data.disabled_tools : []).map(String).filter((n) => names.has(n))
      const enabledHere = names.size - disabled.length
      if (row.enabled && (await enabledToolCount(db, id)) + enabledHere > MAX_TOOLS_TOTAL) {
        return errorJson(`所有 MCP 伺服器合計最多啟用 ${MAX_TOOLS_TOTAL} 個工具`, 400, 'too_many_tools')
      }
      await db.run('UPDATE mcp_servers SET disabled_tools = ?, updated_at = ? WHERE id = ?', JSON.stringify(disabled), Date.now(), id)
      return json({ ok: true, servers: await listServers(db) })
    }
    return errorJson('Not found', 404, 'not_found')
  } catch (err) {
    if (err instanceof McpError) return errorJson(err.message, 400, err.code)
    console.error('mcp api failed', err && err.stack ? err.stack : err)
    return errorJson('MCP 操作失敗', 500, 'mcp_error')
  }
}

async function saveServer(request, env, db, existing) {
  const { data, error } = await readBody(request)
  if (error) return error
  const name = String(data.name ?? (existing && existing.name) ?? '').trim().toLowerCase()
  if (!SERVER_NAME_RE.test(name)) return errorJson('名稱只能用小寫英數、_ 與 -（最多 20 字），會成為工具名稱前綴 mcp__名稱__', 400, 'invalid_name')
  const url = validateMcpUrl(data.url ?? (existing && existing.url))
  const authType = AUTH_TYPES.includes(data.auth_type) ? data.auth_type : (existing ? existing.auth_type : 'none')
  const headerName = String(data.header_name ?? (existing && existing.header_name) ?? '').trim()
  if (authType === 'header' && !/^[A-Za-z0-9-]{1,60}$/.test(headerName)) return errorJson('請填寫自訂標頭名稱，例如 X-API-Key', 400, 'invalid_header')
  const token = String(data.token || '').trim()
  if (token.length > 2000) return errorJson('金鑰過長', 400, 'invalid_token')
  const enabled = data.enabled === undefined ? (existing ? !!existing.enabled : true) : !!data.enabled
  const dup = await db.first('SELECT id FROM mcp_servers WHERE name = ?', name)
  if (dup && (!existing || dup.id !== existing.id)) return errorJson(`已有名為 ${name} 的 MCP 伺服器`, 400, 'duplicate')
  const now = Date.now()
  const id = existing ? existing.id : newId('mcp_')
  if (!existing) {
    const count = await db.first('SELECT COUNT(*) AS n FROM mcp_servers')
    if (count && count.n >= MAX_SERVERS) return errorJson(`最多 ${MAX_SERVERS} 個 MCP 伺服器`, 400, 'too_many_servers')
  }
  const urlChanged = existing && existing.url !== url
  const stmts = [[
    `INSERT INTO mcp_servers (id, name, url, auth_type, header_name, enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, url = excluded.url, auth_type = excluded.auth_type, header_name = excluded.header_name,
       enabled = excluded.enabled, updated_at = excluded.updated_at`,
    id, name, url, authType, authType === 'header' ? headerName : '', enabled ? 1 : 0, now, now,
  ]]
  if (urlChanged) stmts.push(["UPDATE mcp_servers SET tools = '[]', disabled_tools = '[]', session_id = '', protocol_version = '' WHERE id = ?", id])
  if (token) stmts.push(await sealedSecretStmt(env, `mcp:${id}`, token))
  if (authType === 'none') stmts.push(['DELETE FROM secrets WHERE name = ?', `mcp:${id}`])
  await db.batch(stmts)
  return json({ ok: true, id, servers: await listServers(db) })
}

// initialize + tools/list, then cache the list. New tools beyond the global
// cap are stored disabled.
async function testServer(env, db, row, signal) {
  const secret = await db.first('SELECT name, sealed FROM secrets WHERE name = ?', `mcp:${row.id}`)
  const token = secret ? await tryOpenSecretRow(env, secret) : ''
  if (row.auth_type !== 'none' && !token) return errorJson(secret ? '舊金鑰無法解密（AUTH_SECRET 已更換），請重新輸入' : '請先填寫金鑰', 400, 'missing_token')
  const client = new McpClient({ url: row.url, authType: row.auth_type, headerName: row.header_name, token, budget: db.budget, signal })
  let info
  let tools
  try {
    info = await client.initialize()
    tools = cleanToolList(await client.listTools())
  } catch (err) {
    await db.run('UPDATE mcp_servers SET last_error = ?, last_tested_at = ? WHERE id = ?', String(err.message || err).slice(0, 300), Date.now(), row.id)
    throw err
  }
  const prevDisabled = new Set(parseJson(row.disabled_tools, []))
  let room = MAX_TOOLS_TOTAL - (await enabledToolCount(db, row.id))
  const disabled = []
  for (const t of tools) {
    const wasDisabled = prevDisabled.has(t.name)
    if (wasDisabled || room <= 0) disabled.push(t.name)
    else room--
  }
  await db.run('UPDATE mcp_servers SET tools = ?, disabled_tools = ?, session_id = ?, protocol_version = ?, last_tested_at = ?, last_error = ?, updated_at = ? WHERE id = ?',
    JSON.stringify(tools), JSON.stringify(disabled), client.sessionId, client.protocolVersion, Date.now(), '', Date.now(), row.id)
  return json({
    ok: true,
    server_info: info && info.serverInfo ? { name: String(info.serverInfo.name || '').slice(0, 100), version: String(info.serverInfo.version || '').slice(0, 40) } : null,
    protocol_version: client.protocolVersion,
    tools: tools.length,
    disabled: disabled.length,
    servers: await listServers(db),
  })
}

export { newId }
