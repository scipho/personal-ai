import { isBlockedHost } from '../providers.js'

const MAX_BYTES = 220_000

export function validateFetchUrl(input) {
  let url
  try { url = new URL(String(input || '')) } catch { throw new Error('URL 格式不正確') }
  if (url.protocol !== 'https:') throw new Error('只允許 HTTPS')
  if (url.username || url.password) throw new Error('URL 不可包含帳號密碼')
  if (!url.hostname || isBlockedHost(url.hostname)) throw new Error('此主機位址不被允許')
  return url
}

function textFromHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function titleFromHtml(html) {
  const m = String(html || '').match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200) : ''
}

export async function fetchPage(input, { maxChars = 12_000, budget = null } = {}) {
  let url = validateFetchUrl(input)
  let response = null
  for (let hop = 0; hop < 4; hop++) {
    // Every hop (including redirects) is a separate subrequest.
    if (budget) budget.fetch(1)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort('timeout'), 20_000)
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'personal-ai/1.0 (+private assistant)',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.7',
        },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) break
      try { await response.body?.cancel() } catch {}
      url = validateFetchUrl(new URL(location, url).toString())
      if (hop === 3) throw new Error('重新導向次數過多')
      continue
    }
    break
  }
  if (!response) throw new Error('無法取得頁面')
  if (!response.ok) throw new Error(`頁面回傳 HTTP ${response.status}`)
  const type = (response.headers.get('content-type') || '').toLowerCase()
  if (!/text\/html|text\/plain|text\/markdown|text\/csv|application\/xhtml|application\/json|application\/xml|text\/xml/.test(type)) {
    try { await response.body?.cancel() } catch {}
    throw new Error('此內容類型不支援（只讀取文字網頁）')
  }
  if (!response.body) return { url: url.toString(), title: '', text: '' }
  const reader = response.body.getReader()
  const chunks = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_BYTES) {
      try { await reader.cancel() } catch {}
      break
    }
    chunks.push(value)
  }
  const merged = new Uint8Array(Math.min(total, MAX_BYTES))
  let offset = 0
  for (const chunk of chunks) {
    const take = Math.min(chunk.byteLength, merged.length - offset)
    merged.set(take === chunk.byteLength ? chunk : chunk.subarray(0, take), offset)
    offset += take
  }
  const raw = new TextDecoder('utf-8', { fatal: false }).decode(merged.subarray(0, offset))
  const isHtml = /html|xhtml/.test(type)
  return {
    url: url.toString(),
    title: isHtml ? titleFromHtml(raw) : '',
    text: (isHtml ? textFromHtml(raw) : raw.trim()).slice(0, maxChars),
  }
}
// Jina Reader returns cleaner Markdown for JS-heavy pages. The target URL
// passes the same SSRF validation as a direct fetch.
export async function fetchPageViaJina(input, key, { maxChars = 12_000, budget = null } = {}) {
  const url = validateFetchUrl(input)
  if (budget) budget.fetch(1)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort('timeout'), 25_000)
  try {
    const res = await fetch(`https://r.jina.ai/${url.toString()}`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${key}`, 'X-Return-Format': 'markdown' },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Jina Reader 回傳 HTTP ${res.status}`)
    const raw = await res.text()
    if (raw.length > 1_000_000) throw new Error('Jina Reader 回應過大')
    let data = {}
    try { data = JSON.parse(raw) } catch {}
    const d = data && data.data ? data.data : {}
    const text = String(d.content || d.text || '').trim()
    if (!text) throw new Error('Jina Reader 沒有回傳內容')
    return { url: url.toString(), title: String(d.title || '').slice(0, 200), text: text.slice(0, maxChars), via: 'jina' }
  } finally {
    clearTimeout(timer)
  }
}

// fetch_url entry point: Jina Reader when a key is configured, falling back
// to the built-in fetcher on any Reader failure.
export async function readPage(input, { maxChars = 12_000, jinaKey = '', budget = null } = {}) {
  if (jinaKey) {
    try {
      return await fetchPageViaJina(input, jinaKey, { maxChars, budget })
    } catch (err) {
      if (err && err.name === 'BudgetError') throw err
      // Invalid/blocked URLs must not fall through to the direct fetcher.
      if (/URL|HTTPS|主機|帳號/.test(String(err && err.message))) throw err
    }
  }
  return fetchPage(input, { maxChars, budget })
}
