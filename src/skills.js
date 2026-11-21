// Skills: reusable instructions stored in D1. The system prompt carries only
// an index (name + description); the model calls load_skill for the full
// text. Typing /name in the composer forces a skill for that turn.

import { errorJson, json } from './config.js'
import { bodyErrorMessage, readJsonBody } from './body.js'
import { dbMissingResponse, newId, openDb } from './db.js'
import { parseJson } from './store.js'

export const SKILL_NAME_RE = /^[a-z0-9][a-z0-9-]{0,39}$/
export const MAX_SKILLS = 50
export const MAX_INSTRUCTIONS = 50_000
export const MAX_SKILL_FILES = 10
export const MAX_SKILL_FILE_CHARS = 100_000
const MAX_SKILL_TOTAL = 600_000
const INDEX_DESC_CHARS = 300
const LOAD_CHUNK = 18_000

export class SkillError extends Error {}

export function normalizeSkill(input) {
  const s = input && typeof input === 'object' ? input : {}
  const name = String(s.name || '').trim().toLowerCase()
  if (!SKILL_NAME_RE.test(name)) throw new SkillError('技能名稱只能用小寫英數與 -，最多 40 字，例如 weekly-report')
  const description = String(s.description || '').trim().slice(0, 1000)
  if (!description) throw new SkillError('請填寫「何時使用」的描述')
  const instructions = String(s.instructions || '').slice(0, MAX_INSTRUCTIONS)
  let allowed = s.allowed_tools
  if (typeof allowed === 'string') allowed = allowed.split(/[\s,]+/)
  allowed = Array.isArray(allowed) ? [...new Set(allowed.map((t) => String(t).trim()).filter((t) => /^[A-Za-z0-9_-]{1,64}$/.test(t)))].slice(0, 60) : []
  const files = []
  let total = instructions.length
  for (const f of Array.isArray(s.files) ? s.files.slice(0, MAX_SKILL_FILES) : []) {
    const fname = String((f && f.name) || '').trim().replace(/[\\/\u0000-\u001f]+/g, '-').slice(0, 120)
    const content = String((f && f.content) || '')
    if (!fname) continue
    if (content.length > MAX_SKILL_FILE_CHARS) throw new SkillError(`參考檔 ${fname} 超過 ${MAX_SKILL_FILE_CHARS} 字`)
    total += content.length
    files.push({ name: fname, content })
  }
  if (total > MAX_SKILL_TOTAL) throw new SkillError('技能內容總長度過大')
  return { name, description, instructions, allowed_tools: allowed, files, enabled: s.enabled !== false }
}

export function skillView(row, { full = false } = {}) {
  const files = parseJson(row.files, [])
  const out = {
    id: row.id,
    name: row.name,
    description: row.description,
    allowed_tools: parseJson(row.allowed_tools, []),
    enabled: !!row.enabled,
    files: files.map((f) => ({ name: f.name, chars: String(f.content || '').length })),
    updated_at: row.updated_at,
  }
  if (full) {
    out.instructions = row.instructions
    out.files = files
  }
  return out
}

// ---- SKILL.md import / export ---------------------------------------------------

const FILE_MARK = /^<!-- personal-ai:file name="([^"]+)" -->$/

export function parseSkillMd(text) {
  const src = String(text || '').replace(/\r\n/g, '\n')
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new SkillError('SKILL.md 需要以 --- 開頭的 frontmatter（name、description）')
  const meta = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_-]+)\s*:\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
    else v = v.replace(/^['"]|['"]$/g, '')
    meta[kv[1].toLowerCase()] = v
  }
  // Optional reference files appended after markers (our own export format).
  const lines = m[2].split('\n')
  const files = []
  const body = []
  let current = null
  for (const line of lines) {
    const fm = line.match(FILE_MARK)
    if (fm) { current = { name: fm[1], lines: [] }; files.push(current); continue }
    if (current) current.lines.push(line)
    else body.push(line)
  }
  return {
    name: meta.name,
    description: meta.description,
    allowed_tools: meta['allowed-tools'] || meta.allowed_tools || [],
    instructions: body.join('\n').trim(),
    files: files.map((f) => ({ name: f.name, content: f.lines.join('\n').replace(/\n$/, '') })),
  }
}

function yamlValue(v) {
  return /[:#\n'"]/.test(v) ? JSON.stringify(v) : v
}

export function renderSkillMd(skill) {
  const fm = ['---', `name: ${skill.name}`, `description: ${yamlValue(skill.description.replace(/\n+/g, ' '))}`]
  if (skill.allowed_tools && skill.allowed_tools.length) fm.push(`allowed-tools: [${skill.allowed_tools.join(', ')}]`)
  fm.push('---', '')
  let out = fm.join('\n') + (skill.instructions || '').trim() + '\n'
  for (const f of skill.files || []) out += `\n<!-- personal-ai:file name="${String(f.name).replace(/"/g, '')}" -->\n${f.content}\n`
  return out
}

// ---- Prompt + tool ---------------------------------------------------------------

export function skillIndexBlock(skills) {
  if (!skills.length) return ''
  const lines = skills.map((s) => `- ${s.name}：${String(s.description).replace(/\s+/g, ' ').slice(0, INDEX_DESC_CHARS)}`)
  return '可用技能（只列名稱與用途；符合情境時先呼叫 load_skill 取得完整說明再照做）：\n' + lines.join('\n')
}

export function forcedSkillBlock(row) {
  const files = parseJson(row.files, [])
  const allowed = parseJson(row.allowed_tools, [])
  return `使用者用 /${row.name} 指定了這個技能，這一輪請依照它的說明工作：\n` +
    `--- 技能 ${row.name} ---\n${String(row.instructions).slice(0, MAX_INSTRUCTIONS)}\n--- 結束 ---` +
    (files.length ? `\n參考檔（用 load_skill 的 file 參數讀取）：${files.map((f) => f.name).join('、')}` : '') +
    (allowed.length ? `\n這個技能允許使用的工具：${allowed.join('、')}` : '')
}

export const LOAD_SKILL_DEF = {
  name: 'load_skill',
  description: '載入技能的完整說明（或它的參考檔）。系統提示中的技能清單只有名稱與用途；要使用某個技能前先呼叫這個工具。',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: '技能名稱' },
      file: { type: 'string', description: '要讀取的參考檔名稱（可省略）' },
      offset: { type: 'integer', description: '從第幾個字開始讀（長內容分段用）' },
    },
    required: ['name'],
  },
}

export async function runLoadSkill(db, args, enabledNames) {
  const name = String((args && args.name) || '').trim().toLowerCase().replace(/^\//, '')
  if (!enabledNames.has(name)) return { ok: false, error: `沒有啟用名為 ${name || '(空)'} 的技能。可用：${[...enabledNames].join('、') || '無'}` }
  const row = await db.first('SELECT * FROM skills WHERE name = ?', name)
  if (!row) return { ok: false, error: '找不到技能' }
  const files = parseJson(row.files, [])
  const offset = Math.max(0, Number.parseInt(args.offset, 10) || 0)
  let text = String(row.instructions || '')
  let label = 'instructions'
  if (args.file) {
    const f = files.find((x) => x.name === String(args.file))
    if (!f) return { ok: false, error: `技能 ${name} 沒有參考檔 ${args.file}。可用：${files.map((x) => x.name).join('、') || '無'}` }
    text = String(f.content || '')
    label = f.name
  }
  const chunk = text.slice(offset, offset + LOAD_CHUNK)
  const next = offset + LOAD_CHUNK < text.length ? offset + LOAD_CHUNK : undefined
  return {
    ok: true,
    name,
    part: label,
    content: chunk,
    next_offset: next,
    reference_files: label === 'instructions' ? files.map((f) => f.name) : undefined,
    allowed_tools: label === 'instructions' ? parseJson(row.allowed_tools, []) : undefined,
    __maxChars: LOAD_CHUNK + 2_000,
  }
}

// Leading "/name" in the message forces a skill.
export function forcedSkillName(text) {
  const m = String(text || '').match(/^\/([a-z0-9][a-z0-9-]{0,39})(?:\s|$)/)
  return m ? m[1] : ''
}

// ---- REST ------------------------------------------------------------------------

async function readBody(request) {
  try { return { data: await readJsonBody(request) } } catch (err) {
    return { error: errorJson(bodyErrorMessage(err), err.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, 'invalid_body') }
  }
}

export async function skillsApiRoute(request, env, path, method) {
  if (path !== '/api/skills' && !path.startsWith('/api/skills/')) return null
  const db = await openDb(env)
  if (!db) return dbMissingResponse()
  const parts = path.split('/').slice(3).map((p) => decodeURIComponent(p))
  const id = parts[0] || ''
  const sub = parts[1] || ''
  try {
    if (id === 'import' && method === 'POST') {
      const { data, error } = await readBody(request)
      if (error) return error
      return await saveSkill(db, null, parseSkillMd(data.markdown), { upsertByName: true })
    }
    if (!id) {
      if (method === 'GET') {
        const rows = await db.all('SELECT * FROM skills ORDER BY name LIMIT ?', MAX_SKILLS)
        return json({ ok: true, skills: rows.map((r) => skillView(r)) })
      }
      if (method === 'POST') {
        const { data, error } = await readBody(request)
        if (error) return error
        return await saveSkill(db, null, data)
      }
      return errorJson('Method not allowed', 405)
    }
    const row = await db.first('SELECT * FROM skills WHERE id = ?', id)
    if (!row) return errorJson('找不到技能', 404, 'not_found')
    if (sub === 'export' && method === 'GET') {
      return new Response(renderSkillMd({ ...skillView(row, { full: true }) }), {
        headers: { 'Content-Type': 'text/markdown; charset=UTF-8', 'Content-Disposition': `attachment; filename="${row.name}.SKILL.md"`, 'Cache-Control': 'no-store' },
      })
    }
    if (!sub && method === 'GET') return json({ ok: true, skill: skillView(row, { full: true }) })
    if (!sub && method === 'PUT') {
      const { data, error } = await readBody(request)
      if (error) return error
      return await saveSkill(db, row, { ...skillView(row, { full: true }), ...data })
    }
    if (!sub && method === 'DELETE') {
      await db.run('DELETE FROM skills WHERE id = ?', id)
      return json({ ok: true })
    }
    return errorJson('Not found', 404, 'not_found')
  } catch (err) {
    if (err instanceof SkillError) return errorJson(err.message, 400, 'invalid_skill')
    console.error('skills api failed', err && err.stack ? err.stack : err)
    return errorJson('資料庫操作失敗', 500, 'd1_error')
  }
}

async function saveSkill(db, existing, input, { upsertByName = false } = {}) {
  const skill = normalizeSkill(input)
  const now = Date.now()
  let target = existing
  const sameName = await db.first('SELECT id FROM skills WHERE name = ?', skill.name)
  if (!target && sameName && upsertByName) target = sameName
  if (sameName && (!target || sameName.id !== target.id)) throw new SkillError(`已有名為 ${skill.name} 的技能`)
  if (!target) {
    const count = await db.first('SELECT COUNT(*) AS n FROM skills')
    if (count && count.n >= MAX_SKILLS) throw new SkillError(`最多 ${MAX_SKILLS} 個技能`)
  }
  const id = target ? target.id : newId('sk_')
  await db.run(
    `INSERT INTO skills (id, name, description, instructions, allowed_tools, files, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, instructions = excluded.instructions,
       allowed_tools = excluded.allowed_tools, files = excluded.files, enabled = excluded.enabled, updated_at = excluded.updated_at`,
    id, skill.name, skill.description, skill.instructions, JSON.stringify(skill.allowed_tools), JSON.stringify(skill.files), skill.enabled ? 1 : 0, now, now,
  )
  return json({ ok: true, skill: skillView(await db.first('SELECT * FROM skills WHERE id = ?', id)) })
}
