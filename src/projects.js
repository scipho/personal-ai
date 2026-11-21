// Projects: one folder (D1 `files`) + one permanent conversation
// (D1 `project_messages`) + project memory, instructions and settings.
//
// A project chat request carries only { project_id, message, toggles }; the
// Worker loads settings, provider, memories, the project row, the file tree
// and recent messages in ONE D1 batch, saves the user message, runs the agent
// and saves the reply. A rolling summary (one extra LLM call, counted in the
// budget) keeps the context bounded.

import { errorJson, json } from './config.js'
import { bodyErrorMessage, readJsonBody } from './body.js'
import { Budget, dbMissingResponse, newId, openDb } from './db.js'
import { normalizeParams, mergeParams, parseJson } from './store.js'
import {
  baseSystemParts,
  configErrorResponse,
  loadBaseContext,
  memoryBlock,
  providerForRequest,
  secretGetter,
  streamAgent,
  upstreamErrorResponse,
} from './chat.js'
import { UpstreamError, clampText, completionStep, looksLikeToolsUnsupported } from './agent.js'
import { FILE_TOOL_DEFS, FILE_TOOL_NAMES, FsError, MAX_FILE_BYTES, ProjectFs, PathError, normalizePath, runFileTool } from './tools/files.js'
import { TOOLS, openAiTools, runTool } from './tools/registry.js'

export const PROJECT_ID_RE = /^[A-Za-z0-9_-]{1,60}$/
export const MAX_PROJECTS = 100
export const MAX_MESSAGE_CHARS = 60_000
const CONTEXT_CHARS = 48_000 // recent messages sent to the model
const RECENT_LIMIT = 80
const SUMMARY_TRIGGER_CHARS = 60_000 // unsummarized chars that trigger a summary
const SUMMARY_KEEP_CHARS = 24_000 // keep this much recent text unsummarized
const SUMMARY_INPUT_CHARS = 40_000
const TREE_IN_PROMPT = 300
const META_RESULT_CHARS = 1_500

// Tool groups the project settings can switch off.
export const TOOL_GROUPS = {
  web: ['web_search', 'fetch_url'],
  files: [...FILE_TOOL_NAMES],
  memory: ['remember', 'forget', 'recall'],
  history: ['search_history'],
  utility: ['calculate', 'current_time'],
}

export const SEARCH_HISTORY_DEF = {
  name: 'search_history',
  description: '搜尋這個專案較早的對話內容（子字串比對，支援中文）。需要回想很久以前討論過的細節、而摘要不夠時使用。',
  parameters: {
    type: 'object',
    properties: { query: { type: 'string', description: '要找的文字' }, limit: { type: 'integer', description: '最多幾筆（預設 8）' } },
    required: ['query'],
  },
}

export function normalizeProjectSettings(input) {
  const s = input && typeof input === 'object' && !Array.isArray(input) ? input : {}
  const out = {}
  out.params = normalizeParams(s.params || {}, { partial: true })
  out.provider_id = typeof s.provider_id === 'string' ? s.provider_id.slice(0, 60) : ''
  out.model = typeof s.model === 'string' ? s.model.trim().slice(0, 200) : ''
  const groups = Object.keys(TOOL_GROUPS)
  out.tools_disabled = Array.isArray(s.tools_disabled) ? s.tools_disabled.filter((g) => groups.includes(g)) : []
  return out
}

function projectView(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    instructions: row.instructions || '',
    settings: normalizeProjectSettings(parseJson(row.settings, {})),
    summary: row.summary || '',
    summary_upto: Number(row.summary_upto) || 0,
    rev: Number(row.rev) || 0,
    epoch: Number(row.epoch) || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function messageView(row) {
  return {
    id: Number(row.id),
    role: row.role,
    content: row.content,
    meta: parseJson(row.meta, {}),
    created_at: row.created_at,
  }
}

async function body(request) {
  try {
    return { data: await readJsonBody(request) }
  } catch (err) {
    return { error: errorJson(bodyErrorMessage(err), err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, 'invalid_body') }
  }
}

// ---- REST ------------------------------------------------------------------------

export async function projectsApiRoute(request, env, path, method) {
  if (path !== '/api/projects' && !path.startsWith('/api/projects/')) return null
  const db = await openDb(env)
  if (!db) return dbMissingResponse()
  const parts = path.split('/').slice(3).map((p) => decodeURIComponent(p))
  const id = parts[0] || ''
  const sub = parts[1] || ''
  try {
    if (!id) {
      if (method === 'GET') return listProjects(db)
      if (method === 'POST') return createProject(request, db)
      return errorJson('Method not allowed', 405)
    }
    if (!PROJECT_ID_RE.test(id)) return errorJson('專案 ID 不正確', 400, 'invalid_project')
    const project = await db.first('SELECT * FROM projects WHERE id = ?', id)
    if (!project) return errorJson('找不到專案', 404, 'not_found')
    if (!sub) {
      if (method === 'GET') return json({ ok: true, project: projectView(project) })
      if (method === 'PUT' || method === 'PATCH') return updateProject(request, db, project)
      if (method === 'DELETE') return deleteProject(db, id)
    }
    if (sub === 'messages') {
      if (method === 'GET') return listMessages(request, db, project)
      if (method === 'DELETE') return clearMessages(db, project)
    }
    if (sub === 'poll' && method === 'GET') return poll(request, db, project)
    if (sub === 'compact' && method === 'POST') return compactNow(request, env, db, project)
    if (sub === 'files' && method === 'GET') return listTree(db, id)
    if (sub === 'file') {
      if (method === 'GET') return readFileRoute(request, db, id)
      if (method === 'PUT') return writeFileRoute(request, db, id)
    }
    if (sub === 'fs' && method === 'POST') return fsOpRoute(request, db, id)
    return errorJson('Not found', 404, 'not_found')
  } catch (err) {
    console.error('projects api failed', err && err.stack ? err.stack : err)
    return errorJson('資料庫操作失敗', 500, 'd1_error')
  }
}

async function listProjects(db) {
  const rows = await db.all(`SELECT p.id, p.name, p.updated_at, p.rev, p.epoch,
      (SELECT COUNT(*) FROM files f WHERE f.project_id = p.id AND f.is_dir = 0) AS files,
      (SELECT MAX(id) FROM project_messages m WHERE m.project_id = p.id) AS last_message
    FROM projects p ORDER BY p.updated_at DESC LIMIT ?`, MAX_PROJECTS)
  return json({ ok: true, projects: rows })
}

async function createProject(request, db) {
  const { data, error } = await body(request)
  if (error) return error
  const name = String(data.name || '').trim().slice(0, 80)
  if (!name) return errorJson('請輸入專案名稱', 400, 'name_required')
  const count = await db.first('SELECT COUNT(*) AS n FROM projects')
  if (count && count.n >= MAX_PROJECTS) return errorJson(`最多 ${MAX_PROJECTS} 個專案`, 400, 'too_many_projects')
  const id = newId('pr_')
  const now = Date.now()
  await db.run('INSERT INTO projects (id, name, instructions, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    id, name, String(data.instructions || '').slice(0, 20_000), JSON.stringify(normalizeProjectSettings(data.settings)), now, now)
  return json({ ok: true, project: projectView(await db.first('SELECT * FROM projects WHERE id = ?', id)) })
}

async function updateProject(request, db, project) {
  const { data, error } = await body(request)
  if (error) return error
  const name = data.name !== undefined ? String(data.name).trim().slice(0, 80) : project.name
  if (!name) return errorJson('請輸入專案名稱', 400, 'name_required')
  const instructions = data.instructions !== undefined ? String(data.instructions).slice(0, 20_000) : project.instructions
  const settings = data.settings !== undefined
    ? normalizeProjectSettings({ ...parseJson(project.settings, {}), ...data.settings })
    : normalizeProjectSettings(parseJson(project.settings, {}))
  await db.run('UPDATE projects SET name = ?, instructions = ?, settings = ?, updated_at = ? WHERE id = ?',
    name, instructions, JSON.stringify(settings), Date.now(), project.id)
  return json({ ok: true, project: projectView(await db.first('SELECT * FROM projects WHERE id = ?', project.id)) })
}

async function deleteProject(db, id) {
  await db.batch([
    ['DELETE FROM project_messages WHERE project_id = ?', id],
    ['DELETE FROM files WHERE project_id = ?', id],
    ['DELETE FROM memories WHERE scope = ?', id],
    ['DELETE FROM projects WHERE id = ?', id],
  ])
  return json({ ok: true })
}

async function listMessages(request, db, project) {
  const url = new URL(request.url)
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '30', 10) || 30))
  const before = Number.parseInt(url.searchParams.get('before') || '0', 10) || 0
  const after = Number.parseInt(url.searchParams.get('after') || '0', 10) || 0
  let rows
  if (after) {
    rows = await db.all('SELECT * FROM project_messages WHERE project_id = ? AND id > ? ORDER BY id ASC LIMIT ?', project.id, after, limit)
  } else {
    rows = (await db.all(
      `SELECT * FROM project_messages WHERE project_id = ?${before ? ' AND id < ?' : ''} ORDER BY id DESC LIMIT ?`,
      ...(before ? [project.id, before, limit + 1] : [project.id, limit + 1]),
    )).reverse()
  }
  const more = !after && rows.length > limit
  if (more) rows = rows.slice(1)
  return json({ ok: true, messages: rows.map(messageView), more, epoch: Number(project.epoch) || 0, rev: Number(project.rev) || 0 })
}

// Cheap poll for other devices: new messages after `after`, plus rev/epoch.
async function poll(request, db, project) {
  const url = new URL(request.url)
  const after = Number.parseInt(url.searchParams.get('after') || '0', 10) || 0
  const rows = await db.all('SELECT * FROM project_messages WHERE project_id = ? AND id > ? ORDER BY id ASC LIMIT 50', project.id, after)
  return json({ ok: true, epoch: Number(project.epoch) || 0, rev: Number(project.rev) || 0, messages: rows.map(messageView), summary_upto: Number(project.summary_upto) || 0 })
}

async function clearMessages(db, project) {
  await db.batch([
    ['DELETE FROM project_messages WHERE project_id = ?', project.id],
    ["UPDATE projects SET summary = '', summary_upto = 0, epoch = epoch + 1, updated_at = ? WHERE id = ?", Date.now(), project.id],
  ])
  return json({ ok: true })
}

async function listTree(db, id) {
  const fs = new ProjectFs(db, id)
  const rows = await fs.tree()
  const rev = await db.first('SELECT rev FROM projects WHERE id = ?', id)
  return json({ ok: true, rev: rev ? rev.rev : 0, entries: rows.map((r) => ({ path: r.path, dir: !!r.is_dir, size: r.size, updated_at: r.updated_at })) })
}

async function readFileRoute(request, db, id) {
  const url = new URL(request.url)
  let path
  try { path = normalizePath(url.searchParams.get('path')) } catch (err) { return errorJson(err.message, 400, 'bad_path') }
  const file = await new ProjectFs(db, id).file(path)
  if (!file) return errorJson('找不到檔案', 404, 'not_found')
  return json({ ok: true, path, content: file.content, size: file.size, updated_at: file.updated_at, seq: file.seq })
}

async function writeFileRoute(request, db, id) {
  const { data, error } = await body(request)
  if (error) return error
  const res = await runFsWrite(db, id, () => {
    const path = normalizePath(data.path)
    const expect = data.seq === undefined || data.seq === null ? null : Number(data.seq)
    return new ProjectFs(db, id).write(path, String(data.content ?? ''), { expectSeq: expect })
  })
  return res
}

async function fsOpRoute(request, db, id) {
  const { data, error } = await body(request)
  if (error) return error
  const fs = new ProjectFs(db, id)
  return runFsWrite(db, id, async () => {
    switch (data.op) {
      case 'mkdir': return fs.mkdir(normalizePath(data.path))
      case 'move': return fs.move(normalizePath(data.from), normalizePath(data.to, { allowRoot: true }))
      case 'delete': return fs.remove(normalizePath(data.path), { recursive: !!data.recursive })
      default: throw new PathError('不支援的操作')
    }
  })
}

async function runFsWrite(db, id, fn) {
  try {
    return json({ ok: true, ...(await fn()) })
  } catch (err) {
    if (err instanceof PathError) return errorJson(err.message, 400, 'bad_path')
    if (err instanceof FsError) {
      const status = err.code === 'not_found' ? 404 : err.code === 'stale' || err.code === 'exists' ? 409 : err.code === 'too_large' ? 413 : 400
      return errorJson(err.message, status, err.code || 'fs_error')
    }
    throw err
  }
}

// ---- Context -----------------------------------------------------------------------

export function treeBlock(rows) {
  if (!rows.length) return '專案資料夾目前是空的。'
  const lines = rows.slice(0, TREE_IN_PROMPT).map((r) => (r.is_dir ? `${r.path}/` : r.path))
  const more = rows.length > TREE_IN_PROMPT ? `\n…（還有 ${rows.length - TREE_IN_PROMPT} 個項目，用 list_files 查看）` : ''
  return `專案資料夾檔案樹（只列路徑；需要內容時用 read_file 或 search_files）：\n${lines.join('\n')}${more}`
}

// Picks the newest messages that fit the character budget (oldest first).
export function recentWindow(rowsDesc, maxChars = CONTEXT_CHARS) {
  const picked = []
  let used = 0
  for (const row of rowsDesc) {
    const len = String(row.content || '').length
    if (picked.length && used + len > maxChars) break
    picked.push(row)
    used += len
  }
  return picked.reverse()
}

const PROJECT_RULES =
  '你在一個專案中工作。專案有自己的資料夾（只有文字檔），可用檔案工具讀寫：list_files、read_file、write_file、edit_file、append_file、move_file、delete_file、make_dir、search_files。\n' +
  '- 修改檔案前先 read_file 確認原文；小改動用 edit_file，不要整檔覆寫。\n' +
  '- 只有使用者明確要求時才刪除檔案。\n' +
  '- 這個專案只有一段永久對話；較早的內容已濃縮成下方摘要，需要細節時用 search_history。\n' +
  '- 專案記憶（remember 預設存為專案範圍）只在這個專案使用；scope="global" 才存成全域記憶。'

function projectSystemPrompt(body, { project, prefs, memoryOn, searchFirst, globalMemories, projectMemories, treeRows, toolsOn }) {
  const parts = baseSystemParts(body, { prefs, agent: true, memoryOn, searchFirst })
  parts.push(`目前專案：「${project.name}」。`)
  if (toolsOn.files) parts.push(PROJECT_RULES)
  if (toolsOn.files) parts.push(treeBlock(treeRows))
  const g = memoryBlock(globalMemories)
  if (g) parts.push(g)
  const pm = memoryBlock(projectMemories, '這個專案的記憶')
  if (pm) parts.push(pm)
  if (project.summary) parts.push(`先前對話摘要（較早的訊息已濃縮於此）：\n${project.summary}`)
  const custom = clampText(prefs.custom_prompt, 8000).trim()
  if (custom) parts.push('使用者自訂指示：\n' + custom)
  if (project.instructions) parts.push(`專案指示（優先遵守）：\n${clampText(project.instructions, 20_000)}`)
  return parts.join('\n\n')
}

// ---- Rolling summary -------------------------------------------------------------------

const SUMMARY_SYSTEM = '請把以下對話壓縮成給 AI 助理日後參考的摘要（rolling summary）。保留：使用者的目標、已做的決定、重要事實與數字、檔案名稱、待辦事項。刪除寒暄與重複內容。使用繁體中文條列，不超過 1200 字。'

export async function summarize(db, provider, project, { keepChars = SUMMARY_KEEP_CHARS, force = false, budget, signal, stripped } = {}) {
  const upto = Number(project.summary_upto) || 0
  const rows = await db.all('SELECT id, role, substr(content, 1, 8000) AS content, length(content) AS len FROM project_messages WHERE project_id = ? AND id > ? ORDER BY id ASC LIMIT 400', project.id, upto)
  const total = rows.reduce((n, r) => n + (r.len || 0), 0)
  if (!rows.length || (!force && total <= SUMMARY_TRIGGER_CHARS)) return null
  // Keep the newest `keepChars` unsummarized; summarize everything before.
  let kept = 0
  let cut = rows.length
  while (cut > 0 && kept + (rows[cut - 1].len || 0) <= keepChars) { kept += rows[cut - 1].len || 0; cut-- }
  if (force) cut = Math.max(cut, rows.length - 4)
  const chunk = rows.slice(0, cut)
  if (!chunk.length) return null
  let text = ''
  for (const r of chunk) {
    const line = `${r.role === 'user' ? '使用者' : '助理'}：${r.content}\n\n`
    if (text.length + line.length > SUMMARY_INPUT_CHARS) break
    text += line
  }
  const lastId = chunk[chunk.length - 1].id
  const messages = [
    { role: 'system', content: SUMMARY_SYSTEM },
    { role: 'user', content: `${project.summary ? `既有摘要：\n${project.summary}\n\n` : ''}新增的對話：\n${text}` },
  ]
  const step = await completionStep(provider, { model: provider.model, stream: false, messages, params: { temperature: 0.2, max_tokens: 2048 } }, { budget, signal, stripped })
  const summary = String(step.content || '').trim().slice(0, 6000)
  if (!summary) return null
  await db.run('UPDATE projects SET summary = ?, summary_upto = ?, updated_at = ? WHERE id = ?', summary, lastId, Date.now(), project.id)
  return { summary, summary_upto: lastId }
}

async function compactNow(request, env, db, project) {
  const budget = new Budget({ maxSteps: 1 })
  db.budget = budget
  const base = await loadBaseContext(db)
  const settings = normalizeProjectSettings(parseJson(project.settings, {}))
  let provider
  try {
    provider = await providerForRequest(env, base, { provider_id: settings.provider_id, model: settings.model })
  } catch (err) {
    return configErrorResponse(err)
  }
  try {
    const res = await summarize(db, provider, project, { force: true, budget, signal: request.signal })
    return json({ ok: true, compacted: !!res, ...(res || {}) })
  } catch (err) {
    return upstreamErrorResponse(err)
  }
}

// ---- Project chat ------------------------------------------------------------------------

function toolDefsFor(project, capabilities) {
  const disabled = new Set(project.settings.tools_disabled.flatMap((g) => TOOL_GROUPS[g] || []))
  const defs = [...TOOLS, ...FILE_TOOL_DEFS, SEARCH_HISTORY_DEF].filter((t) => !disabled.has(t.name))
  return openAiTools({ ...capabilities, docs: false }, defs)
}

export async function handleProjectChat(request, env, execCtx, body) {
  const projectId = String(body.project_id || '')
  if (!PROJECT_ID_RE.test(projectId)) return errorJson('專案 ID 不正確', 400, 'invalid_project')
  const text = clampText(body.message, MAX_MESSAGE_CHARS).trim()
  if (!text) return errorJson('請輸入訊息', 400, 'empty_message')

  const budget = new Budget()
  const db = await openDb(env, budget)
  if (!db) return dbMissingResponse()

  // One batch: settings, providers, keys, global+project memory, project row,
  // recent unsummarized messages and the file tree.
  let base
  try {
    base = await loadBaseContext(db, {
      memoryScopes: ['global', projectId],
      extra: [
        ['SELECT * FROM projects WHERE id = ?', projectId],
        [`SELECT id, role, substr(content, 1, ${MAX_MESSAGE_CHARS}) AS content FROM project_messages
           WHERE project_id = ? AND id > COALESCE((SELECT summary_upto FROM projects WHERE id = ?), 0)
           ORDER BY id DESC LIMIT ?`, projectId, projectId, RECENT_LIMIT],
        ['SELECT path, is_dir FROM files WHERE project_id = ? ORDER BY path LIMIT ?', projectId, TREE_IN_PROMPT + 1],
      ],
    })
  } catch (err) {
    console.error('project context failed', err && err.message)
    return errorJson('讀取專案失敗', 500, 'd1_read_failed')
  }
  const [projectRows, recentRows, treeRows] = base.extra
  const project = projectView(projectRows[0])
  if (!project) return errorJson('找不到專案', 404, 'not_found')
  const { settings } = base
  const params = mergeParams(settings.params, project.settings.params)
  budget.maxSteps = params.max_steps

  let provider
  try {
    provider = await providerForRequest(env, base, {
      provider_id: body.provider_id || project.settings.provider_id,
      model: body.model || project.settings.model,
    })
  } catch (err) {
    return configErrorResponse(err)
  }

  const memoryOn = settings.memory.enabled
  const globalMemories = memoryOn ? base.memories.filter((m) => m.scope === 'global') : []
  const projectMemories = memoryOn ? base.memories.filter((m) => m.scope === projectId) : []
  const capabilities = { search: true, memory: memoryOn }
  let tools = toolDefsFor(project, capabilities)
  const toggles = Array.isArray(body.tools_off) ? new Set(body.tools_off.map(String)) : null
  if (toggles) tools = tools.filter((t) => !toggles.has(t.function.name))
  const allowed = new Set(tools.map((t) => t.function.name))
  const toolsOn = { files: allowed.has('read_file') }

  // Save the user message now so other devices see it while we work.
  const now = Date.now()
  const [inserted] = await db.batch([
    ['INSERT INTO project_messages (project_id, role, content, meta, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id', projectId, 'user', text, '{}', now],
    ['UPDATE projects SET updated_at = ? WHERE id = ?', now, projectId],
  ])
  const userId = inserted[0] ? Number(inserted[0].id) : 0
  const history = recentWindow([{ id: userId, role: 'user', content: text }, ...recentRows])
  const sys = projectSystemPrompt(body, {
    project, prefs: settings.prefs, memoryOn, searchFirst: !!body.search_web,
    globalMemories, projectMemories, treeRows, toolsOn,
  })
  const messages = [{ role: 'system', content: sys }, ...history.map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }))]

  const fs = new ProjectFs(db, projectId)
  const getSecret = secretGetter(env, base)
  const memoryEvents = []
  const toolContext = {
    db, budget, getSecret, search: settings.search,
    timeZone: clampText(body.timezone, 64) || undefined,
    locale: clampText(body.locale, 32) || undefined,
    memoryScopes: ['global', projectId], writeScope: projectId,
    onMemory: (op, t) => memoryEvents.push({ op, text: t }),
  }
  const agentCtx = {
    budget, allowed, stripped: new Set(), sequential: true,
    execute: async (name, args) => {
      if (FILE_TOOL_NAMES.has(name)) {
        const out = await runFileTool(name, args, fs)
        return { ...out.result, __events: out.events }
      }
      if (name === 'search_history') return searchHistory(db, projectId, args)
      if (name === 'remember' && args && args.scope === 'global') return runTool(name, args, { ...toolContext, writeScope: 'global' })
      return runTool(name, args, toolContext)
    },
    afterTools: async (send) => {
      while (memoryEvents.length) await send({ memory: memoryEvents.shift() })
    },
  }
  const baseReq = { model: provider.model, stream: false, params }

  let first
  try {
    first = await completionStep(provider, { ...baseReq, messages, tools, tool_choice: 'auto' }, { signal: request.signal, budget, stripped: agentCtx.stripped })
  } catch (err) {
    let res = upstreamErrorResponse(err)
    if (err instanceof UpstreamError && looksLikeToolsUnsupported(err.status, err.detail || '')) {
      res = errorJson('這個模型不支援工具呼叫，專案對話需要支援 tools 的模型。', 400, 'tools_unsupported')
    }
    // Keep the conversation consistent: drop the message we could not answer.
    await db.run('DELETE FROM project_messages WHERE id = ?', userId).catch(() => {})
    return res
  }
  budget.steps = 1

  const persist = async (record) => {
    const content = record.content || (record.error ? `（錯誤：${record.error}）` : '')
    if (!content) return null
    const meta = {
      model: provider.model,
      provider: provider.name,
      steps: record.steps.slice(0, 30).map((s) => ({ ...s, result: s.result ? String(s.result).slice(0, META_RESULT_CHARS) : undefined })),
      sources: [...record.sources.values()].slice(0, 12),
      error: record.error || undefined,
      budget: budget.snapshot(),
    }
    const [row] = await db.batch([
      ['INSERT INTO project_messages (project_id, role, content, meta, created_at) VALUES (?, ?, ?, ?, ?) RETURNING id', projectId, 'assistant', content, JSON.stringify(meta), Date.now()],
      ['UPDATE projects SET updated_at = ? WHERE id = ?', Date.now(), projectId],
    ])
    const saved = { saved: { user_id: userId, assistant_id: row[0] ? Number(row[0].id) : 0 } }
    // Rolling summary when the unsummarized part grows too large.
    if (budget.canFetch(1) && budget.canQuery(3)) {
      try {
        const latest = projectView(await db.first('SELECT * FROM projects WHERE id = ?', projectId))
        const res = await summarize(db, provider, latest, { budget, signal: null, stripped: agentCtx.stripped })
        if (res) saved.summary = { summary_upto: res.summary_upto }
      } catch (err) {
        saved.notice = `摘要更新失敗：${(err && err.message) || err}`
      }
    }
    return saved
  }

  const headers = {
    'Content-Type': 'text/event-stream; charset=UTF-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
    'X-Agent': 'on',
    'X-Model': encodeURIComponent(provider.model),
  }
  return streamAgent({
    request, ctx: execCtx, provider, base: baseReq, messages, tools, firstStep: first, agentCtx, headers, persist,
    before: [{ saved: { user_id: userId } }],
  })
}

export async function searchHistory(db, projectId, args) {
  const q = String((args && args.query) || '').trim().slice(0, 100)
  if (!q) return { ok: false, error: 'query 不可為空' }
  const limit = Math.min(20, Math.max(1, Number.parseInt(args.limit, 10) || 8))
  const rows = await db.all(
    `SELECT id, role, created_at,
        substr(content, max(1, instr(lower(content), lower(?1)) - 150), 400) AS snippet
       FROM project_messages
      WHERE project_id = ?2 AND instr(lower(content), lower(?1)) > 0
      ORDER BY id DESC LIMIT ?3`,
    q, projectId, limit,
  )
  if (!rows.length) return { ok: true, results: [], note: '對話紀錄中找不到這段文字。' }
  return { ok: true, results: rows.map((r) => ({ id: r.id, role: r.role, at: new Date(r.created_at).toISOString(), snippet: r.snippet })) }
}

export { MAX_FILE_BYTES }
