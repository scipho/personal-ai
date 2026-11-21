// Web search backends: Tavily -> Jina -> DuckDuckGo (no key, best effort).
// `config` = { provider: 'auto'|'tavily'|'jina'|'duckduckgo', tavilyKey, jinaKey }
// where the keys come from encrypted D1 secrets. 'auto' picks the first
// configured backend, otherwise the no-key DuckDuckGo HTML endpoint, so
// web_search works out of the box. A failing keyed backend falls back to
// DuckDuckGo. Every HTTP call counts against the request budget.

const cache = new Map()
const CACHE_TTL = 10 * 60_000
const MAX_SNIPPET = 1200
const TIMEOUT_MS = 15_000
export const SEARCH_PROVIDERS = ['auto', 'tavily', 'jina', 'duckduckgo']

function decodeEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(Number(n)) } catch { return '' } })
    .replace(/&amp;/gi, '&')
}

function clean(text, max = MAX_SNIPPET) {
  return decodeEntities(String(text || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export function normalizeSearchConfig(input) {
  const c = input && typeof input === 'object' && !Array.isArray(input) ? input : {}
  const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  return {
    provider: SEARCH_PROVIDERS.includes(c.provider) ? c.provider : 'auto',
    tavilyKey: str(c.tavilyKey, 500),
    jinaKey: str(c.jinaKey, 500),
  }
}

// Which backend actually runs for this config.
export function resolveSearchBackend(config) {
  const c = normalizeSearchConfig(config)
  if (c.provider === 'tavily' && c.tavilyKey) return { name: 'tavily', key: c.tavilyKey }
  if (c.provider === 'jina' && c.jinaKey) return { name: 'jina', key: c.jinaKey }
  if (c.provider === 'duckduckgo') return { name: 'duckduckgo' }
  if (c.tavilyKey) return { name: 'tavily', key: c.tavilyKey }
  if (c.jinaKey) return { name: 'jina', key: c.jinaKey }
  return { name: 'duckduckgo' }
}

// DuckDuckGo often hangs for datacenter IPs: give it a shorter timeout.
async function timedFetch(url, init, budget) {
  if (budget) budget.fetch(1)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort('timeout'), /duckduckgo/.test(String(url)) ? 8_000 : TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

function onlyHttp(results, max) {
  return results.filter((r) => r && /^https?:\/\//i.test(r.url)).slice(0, max)
}

async function tavily(q, key, max, budget) {
  const res = await timedFetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({
      query: q, search_depth: 'basic', max_results: max,
      include_answer: false, include_raw_content: false, include_images: false,
    }),
  }, budget)
  if (!res.ok) throw new Error(`search_http_${res.status}`)
  const data = await res.json().catch(() => ({}))
  return onlyHttp((Array.isArray(data.results) ? data.results : []).map((r) => ({
    title: clean(r.title, 180) || clean(r.url, 180),
    url: String(r.url || ''),
    content: clean(r.content || r.snippet || ''),
  })), max)
}

async function jina(q, key, max, budget) {
  const res = await timedFetch(`https://s.jina.ai/?q=${encodeURIComponent(q)}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${key}`,
      // Titles, URLs and descriptions only; fetch_url reads full pages.
      'X-Respond-With': 'no-content',
    },
  }, budget)
  if (!res.ok) throw new Error(`search_http_${res.status}`)
  const data = await res.json().catch(() => ({}))
  const rows = Array.isArray(data.data) ? data.data : []
  return onlyHttp(rows.map((r) => ({
    title: clean(r.title, 180) || clean(r.url, 180),
    url: String(r.url || ''),
    content: clean(r.description || r.content || ''),
  })), max)
}

function ddgTarget(href) {
  const raw = decodeEntities(href)
  try {
    const u = new URL(raw, 'https://duckduckgo.com')
    const target = u.searchParams.get('uddg')
    if (target) return target
    if (/duckduckgo\.com$/i.test(u.hostname)) return ''
    return u.toString()
  } catch {
    return ''
  }
}

// Parses https://html.duckduckgo.com/html/ result markup. Ads link through
// duckduckgo.com/y.js and are skipped.
export function parseDuckDuckGoHtml(html, max = 5) {
  const out = []
  const text = String(html || '')
  const starts = []
  const re = /<div[^>]+class="([^"]*)"[^>]*>/gi
  let m
  while ((m = re.exec(text))) {
    if (/(^|\s)result(\s|$)/.test(m[1])) starts.push({ at: m.index, ad: /result--ad/.test(m[1]) })
  }
  for (let i = 0; i < starts.length; i++) {
    if (starts[i].ad) continue
    const block = text.slice(starts[i].at, i + 1 < starts.length ? starts[i + 1].at : text.length)
    const link = block.match(/<a[^>]+class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
      block.match(/<a[^>]+href="([^"]+)"[^>]*class="[^"]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>/i)
    if (!link) continue
    const url = ddgTarget(link[1])
    if (!url || /duckduckgo\.com\/y\.js/i.test(url)) continue
    const snippet = block.match(/class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/(?:a|div|td)>/i)
    out.push({ title: clean(link[2], 180) || url, url, content: clean(snippet ? snippet[1] : '') })
    if (out.length >= max) break
  }
  return onlyHttp(out, max)
}

async function duckduckgo(q, max, budget) {
  const res = await timedFetch('https://html.duckduckgo.com/html/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0 (compatible; personal-ai/1.1)',
    },
    body: new URLSearchParams({ q, kl: 'wt-wt' }).toString(),
  }, budget)
  if (!res.ok) throw new Error(`search_http_${res.status}`)
  return parseDuckDuckGoHtml(await res.text(), max)
}

async function runBackend(backend, q, max, budget) {
  if (backend.name === 'tavily') return tavily(q, backend.key, max, budget)
  if (backend.name === 'jina') return jina(q, backend.key, max, budget)
  return duckduckgo(q, max, budget)
}

function errorCode(err) {
  if (err && (err.name === 'AbortError' || /timeout/i.test(String(err.message || err)))) return 'timeout'
  const m = String((err && err.message) || '')
  return /^search_http_\d+$/.test(m) ? m : (m || 'network_error')
}

export async function searchWeb(query, { maxResults = 5, config, budget = null } = {}) {
  const q = String(query || '').trim().slice(0, 400)
  if (!q) return { results: [], error: 'empty_query' }
  const max = Math.min(8, Math.max(1, Number(maxResults) || 5))
  const backend = resolveSearchBackend(config)

  const cacheKey = `${backend.name}:${q.toLowerCase().slice(0, 200)}`
  const hit = cache.get(cacheKey)
  if (hit && Date.now() - hit.at < CACHE_TTL) return { results: hit.results, cached: true, backend: backend.name }

  let results
  let used = backend.name
  try {
    results = await runBackend(backend, q, max, budget)
  } catch (err) {
    if (err && err.name === 'BudgetError') throw err
    if (backend.name === 'duckduckgo') return { results: [], error: errorCode(err), backend: used }
    // A configured backend failed (quota, bad key, outage): fall back to the
    // no-key backend instead of leaving the model without search.
    try {
      results = await duckduckgo(q, max, budget)
      used = 'duckduckgo'
    } catch (err2) {
      if (err2 && err2.name === 'BudgetError') throw err2
      return { results: [], error: errorCode(err), backend: backend.name }
    }
  }
  cache.set(cacheKey, { results, at: Date.now() })
  if (cache.size > 100) {
    const now = Date.now()
    for (const [k, v] of cache) if (now - v.at > CACHE_TTL) cache.delete(k)
    while (cache.size > 100) cache.delete(cache.keys().next().value)
  }
  return { results, backend: used }
}

export function _clearSearchCache() {
  cache.clear()
}

export function formatSearchContext(results) {
  if (!Array.isArray(results) || !results.length) return ''
  return results.map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`).join('\n\n')
}
