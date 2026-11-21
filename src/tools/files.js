// Project folder: text files stored in D1 (table `files`), one tree per project.
//
// Every operation is a handful of D1 queries (a batch counts as one), never a
// scan of file contents in the Worker: search ranks in SQL and only returns
// snippets. Paths are relative to the project root; '..', absolute paths and
// control characters are rejected.

export const MAX_FILE_BYTES = 1_000_000 // D1 allows 2 MB per value; keep headroom
export const MAX_ENTRIES = 2000 // files + folders per project
const READ_MAX_CHARS = 12_000
const MAX_PATH = 400
const MAX_SEGMENT = 120
const MAX_DEPTH = 12
const enc = new TextEncoder()

export class PathError extends Error {}

export function byteLength(text) {
  return enc.encode(String(text)).length
}

// Clean relative path ('' is the root).
export function normalizePath(input, { allowRoot = false } = {}) {
  if (input !== undefined && input !== null && typeof input !== 'string') throw new PathError('路徑必須是字串')
  const raw = String(input ?? '').trim()
  if (/[\u0000-\u001f\u007f]/.test(raw)) throw new PathError('路徑含有控制字元')
  if (raw.includes('\\')) throw new PathError('路徑請用 / 分隔，不可使用反斜線')
  if (raw.startsWith('/') || raw.startsWith('~') || /^[A-Za-z]:/.test(raw)) throw new PathError('不可使用絕對路徑；路徑是相對於專案根目錄')
  const parts = []
  for (const seg of raw.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') throw new PathError('路徑不可包含 ..（不能離開專案根目錄）')
    if (seg.length > MAX_SEGMENT) throw new PathError('路徑中的名稱過長')
    if (seg.trim() !== seg) throw new PathError('檔名前後不可有空白')
    parts.push(seg)
  }
  if (parts.length > MAX_DEPTH) throw new PathError('資料夾層數過深')
  const path = parts.join('/')
  if (path.length > MAX_PATH) throw new PathError('路徑過長')
  if (!path && !allowRoot) throw new PathError('請提供檔案路徑')
  return path
}

export function parentOf(path) {
  const i = path.lastIndexOf('/')
  return i < 0 ? '' : path.slice(0, i)
}

function baseName(path) {
  const i = path.lastIndexOf('/')
  return i < 0 ? path : path.slice(i + 1)
}

function ancestors(path) {
  const out = []
  let p = parentOf(path)
  while (p) { out.unshift(p); p = parentOf(p) }
  return out
}

// SQL fragment matching `path` itself or anything below it (no LIKE: D1
// limits LIKE patterns to 50 bytes).
const UNDER = '(path = ? OR substr(path, 1, ?) = ?)'
function underParams(path) {
  return [path, path.length + 1, path + '/']
}

export function lineCount(text) {
  return text ? String(text).split('\n').length : 0
}

// Lines removed/added between two texts (common prefix/suffix ignored).
export function diffSummary(before, after) {
  const a = before.split('\n')
  const b = after.split('\n')
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let endA = a.length - 1
  let endB = b.length - 1
  while (endA >= start && endB >= start && a[endA] === b[endB]) { endA--; endB-- }
  return {
    from_line: start + 1,
    removed_lines: Math.max(0, endA - start + 1),
    added_lines: Math.max(0, endB - start + 1),
    preview: b.slice(start, Math.min(endB + 1, start + 6)).join('\n').slice(0, 400),
    total_lines: b.length,
  }
}

function countOccurrences(text, needle) {
  let n = 0
  let at = text.indexOf(needle)
  while (at !== -1) {
    n++
    at = text.indexOf(needle, at + needle.length)
  }
  return n
}

class FsError extends Error {
  constructor(message, code = '') {
    super(message)
    this.code = code
  }
}

// ---- Store (D1) ---------------------------------------------------------------

export class ProjectFs {
  constructor(db, projectId) {
    this.db = db
    this.projectId = projectId
  }

  async entry(path) {
    return this.db.first('SELECT path, is_dir, size, updated_at FROM files WHERE project_id = ? AND path = ?', this.projectId, path)
  }

  async file(path) {
    return this.db.first('SELECT path, content, size, updated_at, seq FROM files WHERE project_id = ? AND path = ? AND is_dir = 0', this.projectId, path)
  }

  async tree(limit = MAX_ENTRIES) {
    return this.db.all('SELECT path, is_dir, size, updated_at, seq FROM files WHERE project_id = ? ORDER BY path LIMIT ?', this.projectId, limit)
  }

  // Statements that bump the project rev and create missing ancestors.
  revStmts(path, now) {
    const stmts = [['UPDATE projects SET rev = rev + 1, updated_at = ? WHERE id = ?', now, this.projectId]]
    for (const dir of ancestors(path)) {
      stmts.push(['INSERT OR IGNORE INTO files (project_id, path, content, is_dir, size, updated_at, seq) VALUES (?, ?, \'\', 1, 0, ?, (SELECT rev FROM projects WHERE id = ?))',
        this.projectId, dir, now, this.projectId])
    }
    return stmts
  }

  async assertParentsAreDirs(path) {
    const anc = ancestors(path)
    if (!anc.length) return
    const rows = await this.db.all(
      `SELECT path FROM files WHERE project_id = ? AND is_dir = 0 AND path IN (${anc.map(() => '?').join(',')})`,
      this.projectId, ...anc,
    )
    if (rows.length) throw new FsError(`${rows[0].path} 是檔案，不能當作資料夾`, 'conflict')
  }

  async assertCapacity(extra = 1) {
    const row = await this.db.first('SELECT COUNT(*) AS n FROM files WHERE project_id = ?', this.projectId)
    if (row && row.n + extra > MAX_ENTRIES) throw new FsError(`每個專案最多 ${MAX_ENTRIES} 個檔案與資料夾`, 'too_many')
  }

  // Writes a whole file. `expectSeq` (the file's seq when it was read) gives
  // optimistic concurrency: the write fails if anyone changed it since.
  async write(path, content, { expectSeq = null, create = true } = {}) {
    if (typeof content !== 'string') throw new FsError('content 必須是字串')
    if (content.includes('\u0000')) throw new FsError('只支援文字檔')
    const bytes = byteLength(content)
    if (bytes > MAX_FILE_BYTES) throw new FsError(`檔案過大（${bytes} bytes，上限 ${MAX_FILE_BYTES}）`, 'too_large')
    const existing = await this.entry(path)
    if (existing && existing.is_dir) throw new FsError(`${path} 是資料夾，不能當成檔案寫入`, 'is_dir')
    if (!existing && !create) throw new FsError(`找不到檔案 ${path}`, 'not_found')
    if (!existing) {
      await this.assertParentsAreDirs(path)
      await this.assertCapacity(1 + ancestors(path).length)
    }
    const now = Date.now()
    const stmts = this.revStmts(path, now)
    const guarded = existing && expectSeq !== null && expectSeq !== undefined
    if (guarded) {
      stmts.push(['UPDATE files SET content = ?, size = ?, updated_at = ?, seq = (SELECT rev FROM projects WHERE id = ?) WHERE project_id = ? AND path = ? AND seq = ? RETURNING seq',
        content, bytes, now, this.projectId, this.projectId, path, Number(expectSeq)])
    } else {
      stmts.push(['INSERT INTO files (project_id, path, content, is_dir, size, updated_at, seq) VALUES (?, ?, ?, 0, ?, ?, (SELECT rev FROM projects WHERE id = ?)) ON CONFLICT(project_id, path) DO UPDATE SET content = excluded.content, size = excluded.size, updated_at = excluded.updated_at, seq = excluded.seq RETURNING seq',
        this.projectId, path, content, bytes, now, this.projectId])
    }
    const out = await this.db.batch(stmts)
    const after = out[out.length - 1][0]
    if (!after) throw new FsError('檔案已被其他裝置或代理修改，請重新載入後再存', 'stale')
    return { path, created: !existing, bytes, updated_at: now, seq: Number(after.seq) }
  }

  async mkdir(path) {
    const existing = await this.entry(path)
    if (existing && !existing.is_dir) throw new FsError(`${path} 已經是檔案`, 'exists')
    if (existing) return { path, existed: true }
    await this.assertParentsAreDirs(path)
    await this.assertCapacity(1 + ancestors(path).length)
    const now = Date.now()
    await this.db.batch([
      ...this.revStmts(path, now),
      ['INSERT OR IGNORE INTO files (project_id, path, content, is_dir, size, updated_at, seq) VALUES (?, ?, \'\', 1, 0, ?, (SELECT rev FROM projects WHERE id = ?))', this.projectId, path, now, this.projectId],
    ])
    return { path, created: true }
  }

  // Moves a file or a folder (with everything below it). Never overwrites.
  async move(from, toInput) {
    const src = await this.entry(from)
    if (!src) throw new FsError(`找不到 ${from}`, 'not_found')
    let to = toInput
    if (to === '') to = baseName(from)
    else {
      const dest = await this.entry(to)
      if (dest && dest.is_dir) to = `${to}/${baseName(from)}`
    }
    to = normalizePath(to)
    if (to === from) throw new FsError('來源與目的地相同')
    if (src.is_dir && (to === from || to.startsWith(from + '/'))) throw new FsError('不能把資料夾移到它自己的子資料夾裡')
    if (await this.entry(to)) throw new FsError(`${to} 已存在，不會覆蓋`, 'exists')
    await this.assertParentsAreDirs(to)
    const now = Date.now()
    const stmts = this.revStmts(to, now)
    if (src.is_dir) {
      stmts.push([`UPDATE files SET path = ? || substr(path, ?), updated_at = ?, seq = (SELECT rev FROM projects WHERE id = ?) WHERE project_id = ? AND ${UNDER}`,
        to, from.length + 1, now, this.projectId, this.projectId, ...underParams(from)])
    } else {
      stmts.push(['UPDATE files SET path = ?, updated_at = ?, seq = (SELECT rev FROM projects WHERE id = ?) WHERE project_id = ? AND path = ?',
        to, now, this.projectId, this.projectId, from])
    }
    stmts.push([`SELECT COUNT(*) AS n FROM files WHERE project_id = ? AND ${UNDER}`, this.projectId, ...underParams(to)])
    const out = await this.db.batch(stmts)
    return { from, to, moved: out[out.length - 1][0].n, folder: !!src.is_dir }
  }

  async remove(path, { recursive = false } = {}) {
    const src = await this.entry(path)
    if (!src) throw new FsError(`找不到 ${path}`, 'not_found')
    const now = Date.now()
    if (!src.is_dir) {
      await this.db.batch([
        ['UPDATE projects SET rev = rev + 1, updated_at = ? WHERE id = ?', now, this.projectId],
        ['DELETE FROM files WHERE project_id = ? AND path = ?', this.projectId, path],
      ])
      return { path, deleted: 1 }
    }
    const inside = await this.db.first(`SELECT COUNT(*) AS n, SUM(CASE WHEN is_dir = 0 THEN 1 ELSE 0 END) AS files FROM files WHERE project_id = ? AND ${UNDER}`, this.projectId, ...underParams(path))
    if (inside.n > 1 && !recursive) throw new FsError(`資料夾 ${path} 不是空的（${inside.files || 0} 個檔案）。確定要刪除請設定 recursive=true。`, 'not_empty')
    await this.db.batch([
      ['UPDATE projects SET rev = rev + 1, updated_at = ? WHERE id = ?', now, this.projectId],
      [`DELETE FROM files WHERE project_id = ? AND ${UNDER}`, this.projectId, ...underParams(path)],
    ])
    return { path, deleted: inside.files || 0, folder: true }
  }

  // Substring search ranked in SQL (works for CJK without tokenizing).
  // Returns path, hit count and a snippet around the first hit with its line.
  async search(query, dir = '', limit = 20) {
    const terms = String(query || '').trim().split(/\s+/).filter(Boolean).slice(0, 3).map((t) => t.slice(0, 100))
    if (!terms.length) throw new FsError('query 不可為空')
    const params = [this.projectId]
    const p = (v) => { params.push(v); return `?${params.length}` }
    const pid = '?1'
    const conds = []
    const scores = []
    for (const term of terms) {
      const t = p(term.toLowerCase())
      conds.push(`(instr(lower(content), ${t}) > 0 OR instr(lower(path), ${t}) > 0)`)
      scores.push(`((length(content) - length(replace(lower(content), ${t}, ''))) / length(${t}) + CASE WHEN instr(lower(path), ${t}) > 0 THEN 5 ELSE 0 END)`)
    }
    let dirCond = ''
    if (dir) dirCond = ` AND (path = ${p(dir)} OR substr(path, 1, ${p(dir.length + 1)}) = ${p(dir + '/')})`
    const first = `?2`
    const sqlText = `SELECT path, size, ${scores.join(' + ')} AS score,
        instr(lower(content), ${first}) AS pos,
        CASE WHEN instr(lower(content), ${first}) > 0 THEN
          length(substr(content, 1, instr(lower(content), ${first}))) - length(replace(substr(content, 1, instr(lower(content), ${first})), char(10), '')) + 1
        ELSE 0 END AS line,
        CASE WHEN instr(lower(content), ${first}) > 0 THEN substr(content, max(1, instr(lower(content), ${first}) - 120), 320) ELSE substr(content, 1, 200) END AS snippet
      FROM files
      WHERE project_id = ${pid} AND is_dir = 0 AND ${conds.join(' AND ')}${dirCond}
      ORDER BY score DESC, path
      LIMIT ${Math.min(50, Math.max(1, limit))}`
    return this.db.all(sqlText, ...params)
  }
}

// ---- Tool definitions -----------------------------------------------------------

const P = (description) => ({ type: 'string', description })

export const FILE_TOOL_DEFS = [
  {
    name: 'list_files',
    description: '列出專案資料夾裡的檔案與資料夾。dir 省略代表根目錄。',
    parameters: { type: 'object', properties: { dir: P('相對路徑，例如 notes'), recursive: { type: 'boolean', description: '是否列出所有子資料夾內容' } } },
  },
  {
    name: 'read_file',
    description: '讀取文字檔內容（每行前有行號）。長檔案請用 start_line / end_line 分段讀。',
    parameters: { type: 'object', properties: { path: P('檔案路徑，例如 notes/plan.md'), start_line: { type: 'integer' }, end_line: { type: 'integer' } }, required: ['path'] },
  },
  {
    name: 'write_file',
    description: '建立新檔案，或用 content 覆寫整個檔案（上限 1 MB）。上層資料夾會自動建立。',
    parameters: { type: 'object', properties: { path: P('檔案路徑'), content: P('完整內容') }, required: ['path', 'content'] },
  },
  {
    name: 'edit_file',
    description: '把檔案中的 old 換成 new。old 必須逐字相符（含空白與換行）且只出現一次；replace_all=true 時取代全部。修改前先 read_file 確認原文。',
    parameters: { type: 'object', properties: { path: P('檔案路徑'), old: P('要被取代的原文'), new: P('新文字（可為空字串）'), replace_all: { type: 'boolean' } }, required: ['path', 'old', 'new'] },
  },
  {
    name: 'append_file',
    description: '在檔案結尾加上內容；檔案不存在時會建立。',
    parameters: { type: 'object', properties: { path: P('檔案路徑'), content: P('要加上的內容') }, required: ['path', 'content'] },
  },
  {
    name: 'move_file',
    description: '移動或重新命名檔案或資料夾。若 to 是既有資料夾，會移到該資料夾內。不會覆蓋既有檔案。',
    parameters: { type: 'object', properties: { from: P('原路徑'), to: P('新路徑') }, required: ['from', 'to'] },
  },
  {
    name: 'delete_file',
    description: '刪除檔案或資料夾。非空資料夾需要 recursive=true。只在使用者明確要求時使用。',
    parameters: { type: 'object', properties: { path: P('路徑'), recursive: { type: 'boolean' } }, required: ['path'] },
  },
  {
    name: 'make_dir',
    description: '建立資料夾（可多層）。',
    parameters: { type: 'object', properties: { path: P('資料夾路徑') }, required: ['path'] },
  },
  {
    name: 'search_files',
    description: '在專案檔案的內容與路徑中搜尋文字（子字串比對，支援中文；空白分隔最多 3 個詞，全部都要出現）。回傳路徑、相符次數、行號與片段。',
    parameters: { type: 'object', properties: { query: P('要找的文字'), dir: P('只搜尋這個資料夾（可省略）') }, required: ['query'] },
  },
]

export const FILE_TOOL_NAMES = new Set(FILE_TOOL_DEFS.map((t) => t.name))

function fail(message, code) {
  return { result: { ok: false, error: message, ...(code ? { code } : {}) } }
}

async function missing(fs, path) {
  const dir = parentOf(path)
  const rows = await fs.db.all(
    `SELECT path FROM files WHERE project_id = ? AND is_dir = 0 AND ${dir ? UNDER : '1 = 1'} ORDER BY path LIMIT 15`,
    fs.projectId, ...(dir ? underParams(dir) : []),
  )
  const near = rows.map((r) => r.path)
  return fail(`找不到檔案 ${path}。${near.length ? `附近的檔案：${near.join('、')}` : '可先用 list_files 查看。'}`, 'not_found')
}

function op(kind, extra) {
  return { fs_op: { op: kind, ...extra } }
}

// Runs one file tool. Returns { result, events? }.
export async function runFileTool(name, args, fs) {
  const input = args && typeof args === 'object' ? args : {}
  try {
    switch (name) {
      case 'list_files': {
        const dir = normalizePath(input.dir, { allowRoot: true })
        if (dir) {
          const e = await fs.entry(dir)
          if (!e) return fail(`找不到資料夾 ${dir}`, 'not_found')
          if (!e.is_dir) return fail(`${dir} 是檔案，不是資料夾`)
        }
        const rows = await fs.tree()
        const prefix = dir ? dir + '/' : ''
        const entries = rows
          .filter((r) => r.path !== dir && r.path.startsWith(prefix) && (input.recursive || !r.path.slice(prefix.length).includes('/')))
          .map((r) => (r.is_dir ? { path: r.path, type: 'dir' } : { path: r.path, type: 'file', bytes: r.size }))
        return { result: { ok: true, dir, entries: entries.slice(0, 300), total: entries.length } }
      }
      case 'read_file': {
        const path = normalizePath(input.path)
        const file = await fs.file(path)
        if (!file) {
          const e = await fs.entry(path)
          return e ? fail(`${path} 是資料夾；用 list_files 查看內容`) : missing(fs, path)
        }
        const lines = file.content.split('\n')
        const start = Math.max(1, Number.parseInt(input.start_line, 10) || 1)
        const end = Math.min(lines.length, Number.parseInt(input.end_line, 10) || lines.length)
        if (start > lines.length) return fail(`start_line 超出範圍（共 ${lines.length} 行）`)
        let text = ''
        let last = start - 1
        for (let i = start; i <= end; i++) {
          const line = `${i}| ${lines[i - 1]}\n`
          if (text.length + line.length > READ_MAX_CHARS) break
          text += line
          last = i
        }
        return {
          result: {
            ok: true, path, total_lines: lines.length, start_line: start, end_line: last, content: text,
            more: last < end ? `內容過長，只回傳到第 ${last} 行；用 start_line=${last + 1} 繼續讀。` : undefined,
          },
        }
      }
      case 'write_file': {
        const path = normalizePath(input.path)
        const before = await fs.file(path)
        const res = await fs.write(path, input.content)
        return {
          result: { ok: true, path, created: res.created, bytes: res.bytes, lines: lineCount(input.content), diff: before ? diffSummary(before.content, input.content) : undefined },
          events: [op('write', { path })],
        }
      }
      case 'edit_file': {
        const path = normalizePath(input.path)
        const file = await fs.file(path)
        if (!file) return missing(fs, path)
        const oldText = typeof input.old === 'string' ? input.old : ''
        if (!oldText) return fail('old 不可為空')
        if (typeof input.new !== 'string') return fail('new 必須是字串（可為空字串）')
        const n = countOccurrences(file.content, oldText)
        if (n === 0) return fail('old 的文字在檔案中找不到（必須逐字相符，包含空白與換行）。請先用 read_file 確認原文。', 'not_found')
        if (n > 1 && !input.replace_all) return { result: { ok: false, error: `old 的文字出現 ${n} 次，不是唯一。請加入更多前後文，或設定 replace_all=true。`, code: 'not_unique', occurrences: n } }
        const after = input.replace_all ? file.content.split(oldText).join(input.new) : file.content.replace(oldText, () => input.new)
        await fs.write(path, after, { expectSeq: file.seq, create: false })
        return { result: { ok: true, path, replaced: input.replace_all ? n : 1, diff: diffSummary(file.content, after) }, events: [op('write', { path })] }
      }
      case 'append_file': {
        const path = normalizePath(input.path)
        if (typeof input.content !== 'string' || !input.content) return fail('content 不可為空')
        const file = await fs.file(path)
        const before = file ? file.content : ''
        const after = before + (before && !before.endsWith('\n') && !input.content.startsWith('\n') ? '\n' : '') + input.content
        await fs.write(path, after, file ? { expectSeq: file.seq } : {})
        return { result: { ok: true, path, created: !file, diff: diffSummary(before, after) }, events: [op('write', { path })] }
      }
      case 'move_file': {
        const from = normalizePath(input.from)
        const to = normalizePath(input.to, { allowRoot: true })
        const res = await fs.move(from, to)
        return { result: { ok: true, ...res }, events: [op('move', { from: res.from, to: res.to })] }
      }
      case 'delete_file': {
        const path = normalizePath(input.path)
        const res = await fs.remove(path, { recursive: !!input.recursive })
        return { result: { ok: true, ...res }, events: [op('delete', { path })] }
      }
      case 'make_dir': {
        const path = normalizePath(input.path)
        const res = await fs.mkdir(path)
        return { result: { ok: true, ...res }, events: res.created ? [op('mkdir', { path })] : [] }
      }
      case 'search_files': {
        const dir = normalizePath(input.dir, { allowRoot: true })
        const rows = await fs.search(input.query, dir)
        if (!rows.length) return { result: { ok: true, results: [], note: '沒有找到相符內容，可換個關鍵字再試。' } }
        return { result: { ok: true, results: rows.map((r) => ({ path: r.path, hits: r.score, line: r.line || undefined, snippet: r.snippet })) } }
      }
      default:
        return fail(`未知檔案工具：${String(name).slice(0, 60)}`)
    }
  } catch (e) {
    if (e instanceof PathError) return fail(e.message, 'bad_path')
    if (e instanceof FsError) return fail(e.message, e.code)
    throw e
  }
}

export { FsError }
