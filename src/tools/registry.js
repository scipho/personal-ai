import { searchWeb } from './search.js'
import { fetchPage } from './fetch.js'
import { calculate } from './calc.js'
import { currentTime } from './time.js'
import { searchDocuments } from './docs.js'
import { addMemory, forgetMemories, recallMemories } from '../store.js'

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
  {
    name: 'remember',
    description: '把一則關於使用者的長期事實或偏好存進記憶（例如「偏好 TypeScript」）。只在使用者要求記住、或透露長期有用的偏好時使用；不要存密碼、金鑰或證件號碼。',
    needs: 'memory',
    parameters: {
      type: 'object',
      properties: { fact: { type: 'string', description: '一句簡短事實' } },
      required: ['fact'],
    },
  },
  {
    name: 'forget',
    description: '刪除記憶中包含指定文字的事實。',
    needs: 'memory',
    parameters: {
      type: 'object',
      properties: { text: { type: 'string', description: '要刪除的事實中的關鍵字' } },
      required: ['text'],
    },
  },
  {
    name: 'recall',
    description: '查詢記憶中與關鍵字相關的事實（query 省略則列出最近的記憶）。',
    needs: 'memory',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string', description: '關鍵字' } },
    },
  },
]

export const TOOL_NAMES = new Set(TOOLS.map((tool) => tool.name))

// Public, MCP-style description (no internal fields).
export function publicTools() {
  return TOOLS.map(({ name, description, parameters }) => ({ name, description, parameters }))
}

// OpenAI-compatible `tools` array, filtered by available capabilities.
export function openAiTools(capabilities = {}, defs = TOOLS) {
  return defs
    .filter((tool) => !tool.needs || capabilities[tool.needs])
    .map(({ name, description, parameters }) => ({
      type: 'function',
      function: { name, description, parameters },
    }))
}

// `context` carries server-side data the model must not pass itself:
//   { budget, db, getSecret(name), documents, timeZone, locale, memoryScopes, writeScope }
export async function runTool(name, args, context = {}) {
  const input = args && typeof args === 'object' ? args : {}
  switch (name) {
    case 'web_search': {
      const tavilyKey = context.getSecret ? await context.getSecret('search:tavily') : ''
      const result = await searchWeb(input.query, { maxResults: input.maxResults, tavilyKey, budget: context.budget })
      if (result.error === 'no_key') return { ok: false, error: '尚未在設定中填寫 Tavily API Key' }
      if (result.error) return { ok: false, error: `搜尋失敗：${result.error}` }
      return { ok: true, results: result.results }
    }
    case 'fetch_url': {
      try {
        const page = await fetchPage(input.url, { maxChars: context.fetchMaxChars || 12_000, budget: context.budget })
        return { ok: true, ...page }
      } catch (err) {
        if (err && err.name === 'BudgetError') throw err
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
      const docs = Array.isArray(context.documents) ? context.documents : []
      const results = searchDocuments(input.query, docs)
      return results.length
        ? { ok: true, results }
        : { ok: true, results: [], note: '沒有找到相符段落，可換個關鍵字再試，或告訴使用者文件中沒有相關內容。' }
    }
    case 'remember': {
      if (!context.db) return { ok: false, error: '記憶功能需要 D1' }
      try {
        const saved = await addMemory(context.db, context.writeScope || 'global', input.fact)
        if (context.onMemory) context.onMemory('remember', saved.content)
        return { ok: true, saved: saved.content, scope: saved.scope }
      } catch (err) {
        if (err && err.name === 'BudgetError') throw err
        return { ok: false, error: err.message || '儲存失敗' }
      }
    }
    case 'forget': {
      if (!context.db) return { ok: false, error: '記憶功能需要 D1' }
      try {
        const removed = await forgetMemories(context.db, context.memoryScopes || ['global'], input.text)
        if (context.onMemory) context.onMemory('forget', String(input.text || ''))
        return { ok: true, removed }
      } catch (err) {
        if (err && err.name === 'BudgetError') throw err
        return { ok: false, error: err.message || '刪除失敗' }
      }
    }
    case 'recall': {
      if (!context.db) return { ok: false, error: '記憶功能需要 D1' }
      const rows = await recallMemories(context.db, context.memoryScopes || ['global'], input.query)
      return { ok: true, memories: rows.map((r) => ({ scope: r.scope, fact: r.content })) }
    }
    default:
      return { ok: false, error: `未知工具：${String(name).slice(0, 60)}` }
  }
}
