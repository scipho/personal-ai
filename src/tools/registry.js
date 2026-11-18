import { searchWeb } from './search.js'
import { fetchPage } from './fetch.js'
import { calculate } from './calc.js'
import { currentTime } from './time.js'
import { searchDocuments } from './docs.js'

// Tool contracts. `parameters` is what the model sees (JSON Schema).
// `needs` marks tools that are only offered when a capability is available.
export const TOOLS = [
  {
    name: 'web_search',
    description: '搜尋公開網頁，回傳最多 5 筆結果（標題、網址、摘要）。需要最新資訊、新聞、價格、版本或你不確定的事實時使用。查詢請寫成精簡關鍵字，必要時把對話中的代名詞換成具體名稱。',
    needs: 'search',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜尋關鍵字，例如「Cloudflare Workers CPU 時間限制 2026」' },
      },
      required: ['query'],
    },
  },
  {
    name: 'fetch_url',
    description: '讀取一個公開 HTTPS 網頁的文字內容。搜尋摘要不足以回答、或使用者給了網址時使用。',
    needs: 'fetch',
    parameters: {
      type: 'object',
      properties: { url: { type: 'string', description: '完整的 HTTPS URL' } },
      required: ['url'],
    },
  },
  {
    name: 'calculate',
    description: '精確計算算術表達式（+ - * / % ^ 與括號）。任何需要準確數字的計算都要用它，不要心算。',
    parameters: {
      type: 'object',
      properties: { expression: { type: 'string', description: '例如 (12+3)*4/7' } },
      required: ['expression'],
    },
  },
  {
    name: 'current_time',
    description: '取得指定時區的目前日期與時間。',
    parameters: {
      type: 'object',
      properties: {
        timeZone: { type: 'string', description: 'IANA 時區，例如 Asia/Taipei；省略則用使用者時區' },
      },
    },
  },
  {
    name: 'document_search',
    description: '在使用者提供的文件中以關鍵字搜尋相關段落。問題可能與使用者的筆記、規格或上傳檔案有關時使用。',
    needs: 'docs',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string', description: '要找的關鍵字或短句' } },
      required: ['query'],
    },
  },
]

export const TOOL_NAMES = new Set(TOOLS.map((tool) => tool.name))

// Public, MCP-style description (no internal fields).
export function publicTools() {
  return TOOLS.map(({ name, description, parameters }) => ({ name, description, parameters }))
}

// OpenAI-compatible `tools` array, filtered by available capabilities.
export function openAiTools(capabilities = {}) {
  return TOOLS
    .filter((tool) => !tool.needs || capabilities[tool.needs])
    .map(({ name, description, parameters }) => ({
      type: 'function',
      function: { name, description, parameters },
    }))
}

// `context` carries server-side data the model must not have to pass itself,
// e.g. the user's documents or default time zone.
export async function runTool(name, args, env, context = {}) {
  const input = args && typeof args === 'object' ? args : {}
  switch (name) {
    case 'web_search': {
      const result = await searchWeb(input.query, env, { maxResults: input.maxResults })
      if (result.error === 'no_key') return { ok: false, error: '未設定 Tavily API Key' }
      if (result.error) return { ok: false, error: `搜尋失敗：${result.error}` }
      return { ok: true, results: result.results }
    }
    case 'fetch_url': {
      try {
        const page = await fetchPage(input.url, { maxChars: context.fetchMaxChars || 12_000 })
        return { ok: true, ...page }
      } catch (err) {
        return { ok: false, error: err && err.message ? err.message : '讀取失敗' }
      }
    }
    case 'calculate': {
      try { return { ok: true, expression: String(input.expression || ''), result: calculate(input.expression) } } catch (err) {
        return { ok: false, error: err && err.message ? err.message : '計算失敗' }
      }
    }
    case 'current_time':
      return { ok: true, ...currentTime(input.timeZone || context.timeZone, input.locale || context.locale) }
    case 'document_search': {
      const docs = Array.isArray(context.documents) ? context.documents : input.documents
      const results = searchDocuments(input.query, docs)
      return results.length
        ? { ok: true, results }
        : { ok: true, results: [], note: '沒有找到相符段落，可換個關鍵字再試，或告訴使用者文件中沒有相關內容。' }
    }
    default:
      return { ok: false, error: `未知工具：${String(name).slice(0, 60)}` }
  }
}
