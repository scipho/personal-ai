import { errorJson } from './config.js'

export function normalizeBaseUrl(input) {
  const raw = String(input || '').trim()
  if (!raw) throw new Error('請填寫 Base URL')
  let url
  try { url = new URL(raw) } catch { throw new Error('Base URL 格式不正確') }
  if (url.protocol !== 'https:') throw new Error('Base URL 必須使用 HTTPS')
  if (url.username || url.password) throw new Error('Base URL 不可包含帳號密碼')
  if (url.hash || url.search) throw new Error('Base URL 不可包含查詢字串或片段')
  if (isBlockedHost(url.hostname)) throw new Error('此主機位址不被允許')
  return url.toString().replace(/\/+$/, '')
}

function ipv4Blocked(a, b) {
  if (a === 10 || a === 127 || a === 0) return true
  if (a === 169 && b === 254) return true // link-local, cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 192 && b === 0) return true // 192.0.0.0/24 IETF, 192.0.2.0/24 docs
  if (a === 198 && (b === 18 || b === 19)) return true // benchmarking
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  if (a >= 224) return true // multicast + reserved
  return false
}

// SSRF guard on the hostname as parsed by WHATWG URL (which already turns
// decimal/hex/octal IPv4 forms like 0x7f000001 into dotted quads).
export function isBlockedHost(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '')
  if (!host) return true
  if (host === 'localhost' || host.endsWith('.localhost')) return true
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.home.arpa') || host.endsWith('.lan') || host.endsWith('.intranet')) return true
  if (host === 'metadata' || host === 'metadata.google.internal' || host === 'instance-data') return true
  if (host === '0.0.0.0' || host === '::' || host === '::1') return true
  if (host.includes(':')) {
    // IPv4-mapped / translated IPv6, in dotted or hex form.
    const mapped = host.match(/^(?:::ffff:|::ffff:0:|64:ff9b::)(.+)$/)
    if (mapped) {
      const tail = mapped[1]
      if (/^\d+\.\d+\.\d+\.\d+$/.test(tail)) return isBlockedHost(tail)
      const hex = tail.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
      if (hex) {
        const hi = Number.parseInt(hex[1], 16)
        return ipv4Blocked(hi >> 8, hi & 255)
      }
      return true
    }
    // Link-local (fe80::/10), unique-local (fc00::/7), site-local, multicast.
    if (/^(fe[89ab][0-9a-f]?|fc|fd|fec|fed|fee|fef|ff)/.test(host)) return true
    return false
  }
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number)
    if ([a, b, c, d].some((n) => n > 255)) return true
    return ipv4Blocked(a, b)
  }
  // A bare number or other odd forms that slipped past the URL parser.
  if (/^[0-9x.]+$/.test(host)) return true
  return false
}

export function chatCompletionsUrl(baseUrl) {
  const base = normalizeBaseUrl(baseUrl)
  if (/\/chat\/completions$/i.test(base)) return base
  if (/\/v\d+[a-z]*$/i.test(base) || /\/openai$/i.test(base)) return `${base}/chat/completions`
  return `${base}/v1/chat/completions`
}

export function modelsUrl(baseUrl) {
  const base = normalizeBaseUrl(baseUrl).replace(/\/chat\/completions$/i, '')
  if (/\/models$/i.test(base)) return base
  if (/\/v\d+[a-z]*$/i.test(base) || /\/openai$/i.test(base)) return `${base}/models`
  return `${base}/v1/models`
}

export function upstreamHeaders(apiKey) {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream, application/json',
    'User-Agent': 'personal-ai/2.0',
  }
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 120_000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs)
  const onAbort = () => controller.abort('client-abort')
  if (options.signal) {
    if (options.signal.aborted) controller.abort('client-abort')
    else options.signal.addEventListener('abort', onAbort, { once: true })
  }
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
    if (options.signal) options.signal.removeEventListener('abort', onAbort)
  }
}

export function providerError(status, detail = '') {
  const message = detail ? `供應商錯誤：${detail}` : `供應商回傳 HTTP ${status}`
  return errorJson(message, status === 401 || status === 403 ? 400 : 502, 'provider_error')
}

// ---- Sampling parameters ------------------------------------------------------

export const SAMPLING_KEYS = ['temperature', 'top_p', 'max_tokens', 'reasoning_effort']

// Turns merged params into the request fields an OpenAI-compatible API
// expects. Unset values are omitted so the provider default applies.
export function samplingFields(params = {}, stripped = new Set()) {
  const out = {}
  if (params.temperature !== null && params.temperature !== undefined && !stripped.has('temperature')) out.temperature = params.temperature
  if (params.top_p !== null && params.top_p !== undefined && !stripped.has('top_p')) out.top_p = params.top_p
  if (params.max_tokens && !stripped.has('max_tokens')) out.max_tokens = params.max_tokens
  if (params.reasoning_effort && !stripped.has('reasoning_effort')) out.reasoning_effort = params.reasoning_effort
  return out
}

// A 400/422 that names one of our optional params means the model rejects
// it: strip it and retry once.
export function rejectedParam(status, detail, payload) {
  if (status !== 400 && status !== 422) return ''
  const text = String(detail || '').toLowerCase()
  for (const key of SAMPLING_KEYS) {
    if (!(key in payload)) continue
    const spaced = key.replace(/_/g, ' ')
    if (text.includes(key) || text.includes(spaced) || (key === 'reasoning_effort' && /reasoning/.test(text))) return key
  }
  return ''
}
