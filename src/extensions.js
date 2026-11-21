// Skills + MCP + per-chat tool toggles, shared by main and project chats.
// Everything comes from rows already loaded in the context batch: no extra
// D1 queries and no MCP network calls until a tool is actually used.

import { parseJson } from './store.js'
import { LOAD_SKILL_DEF, forcedSkillBlock, forcedSkillName, runLoadSkill, skillIndexBlock } from './skills.js'
import { mcpToolsFromRows, runMcpTool } from './mcp.js'
import { FILE_TOOL_NAMES } from './tools/files.js'

// Tool groups the UI toggles (project settings and the composer 工具 menu).
export const TOOL_GROUPS = {
  web: ['web_search', 'fetch_url'],
  files: [...FILE_TOOL_NAMES],
  memory: ['remember', 'forget', 'recall'],
  history: ['search_history'],
  utility: ['calculate', 'current_time'],
  docs: ['document_search'],
}

// Statements to append to the context batch.
export function extensionQueries(body) {
  const forced = forcedSkillName(body.skill ? `/${body.skill}` : (body.message || lastUser(body)))
  return {
    forced,
    queries: [
      ['SELECT id, name, description, allowed_tools FROM skills WHERE enabled = 1 ORDER BY name LIMIT 50'],
      ['SELECT * FROM mcp_servers WHERE enabled = 1 ORDER BY created_at LIMIT 5'],
      ["SELECT name, sealed, preview FROM secrets WHERE name LIKE 'mcp:%'"],
      forced ? ['SELECT * FROM skills WHERE name = ? AND enabled = 1', forced] : ['SELECT 1 WHERE 0'],
    ],
  }
}

function lastUser(body) {
  if (!Array.isArray(body.messages)) return ''
  for (let i = body.messages.length - 1; i >= 0; i--) {
    const m = body.messages[i]
    if (m && m.role === 'user') return String(m.content || '')
  }
  return ''
}

// off: group names, tool names, 'skills', 'mcp' or 'mcp:<server>'.
export function normalizeOff(list) {
  return new Set((Array.isArray(list) ? list : []).map((x) => String(x).slice(0, 80)).slice(0, 200))
}

export function filterTools(defs, off) {
  if (!off.size) return defs
  const names = new Set()
  for (const item of off) {
    if (TOOL_GROUPS[item]) TOOL_GROUPS[item].forEach((n) => names.add(n))
    else names.add(item)
  }
  return defs.filter((d) => {
    const n = d.function.name
    if (names.has(n)) return false
    if (n === 'load_skill' && off.has('skills')) return false
    if (n.startsWith('mcp__')) {
      if (off.has('mcp')) return false
      const server = n.split('__')[1]
      if (off.has(`mcp:${server}`)) return false
    }
    return true
  })
}

// Returns { tools, systemParts, execute(name,args) | null }.
export function buildExtensions({ rows, env, db, budget, signal, off, disabledSkills = new Set(), disabledServers = new Set() }) {
  const [skillRows, mcpRows, mcpSecretRows, forcedRows] = rows
  const skills = skillRows.filter((s) => !disabledSkills.has(s.name))
  const skillNames = new Set(skills.map((s) => s.name))
  const systemParts = []
  const tools = []
  if (skills.length && !off.has('skills')) {
    systemParts.push(skillIndexBlock(skills))
    tools.push({ type: 'function', function: { name: LOAD_SKILL_DEF.name, description: LOAD_SKILL_DEF.description, parameters: LOAD_SKILL_DEF.parameters } })
  }
  let forced = null
  if (forcedRows && forcedRows[0] && skillNames.has(forcedRows[0].name)) {
    forced = forcedRows[0]
    systemParts.push(forcedSkillBlock(forced))
  }
  const { defs, routes } = mcpToolsFromRows(mcpRows, { disabledServers })
  tools.push(...defs)
  const rowsById = new Map(mcpRows.map((r) => [r.id, r]))
  const secrets = new Map(mcpSecretRows.map((r) => [r.name, r]))
  const execute = async (name, args) => {
    if (name === 'load_skill') return runLoadSkill(db, args, skillNames)
    const route = routes.get(name)
    if (route) return runMcpTool(db, env, rowsById, secrets, route, args, { budget, signal })
    return null
  }
  return {
    tools,
    systemParts,
    execute,
    forced,
    // A forced skill with allowed_tools narrows the tool list for this turn.
    restrict(defs) {
      const allowed = forced ? parseJson(forced.allowed_tools, []) : []
      if (!allowed.length) return defs
      const keep = new Set([...allowed, 'load_skill'])
      return defs.filter((d) => keep.has(d.function.name))
    },
  }
}
