import {
  APP_NAME,
  APP_VERSION,
  appConfig,
  errorJson,
  json,
} from './config.js'
import {
  clearSessionCookie,
  createSession,
  loginAllowed,
  passwordMatches,
  recordLoginFailure,
  recordLoginSuccess,
  requireAuth,
  sessionCookie,
} from './auth.js'
import { loginResponse } from './login_page.js'
import { htmlResponse } from './html_shell.js'
import { applySecurityHeaders, previewFrameResponse, sameOriginRequest } from './security.js'
import { bodyErrorMessage, readFormBody, readJsonBody } from './body.js'
import { handleChat } from './chat.js'
import { handleImageRequest } from './images.js'
import { publicTools, runTool } from './tools/registry.js'
import { handleSync } from './sync.js'
import { dataApiRoute } from './api.js'
import { projectsApiRoute } from './projects.js'
import { skillsApiRoute } from './skills.js'
import { mcpApiRoute } from './mcp.js'
import { openDb } from './db.js'
import { PASSWORD_SETTING } from './auth.js'

const STATIC_PREFIXES = ['/assets/', '/favicon']
const STATIC_FILES = new Set(['/avatar.png', '/manifest.json', '/robots.txt', '/favicon.ico'])

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method.toUpperCase()

    let response
    try {
      if (path === '/api/health' && method === 'GET') {
        response = json({ ok: true, app: APP_NAME, version: APP_VERSION, time: new Date().toISOString() })
      } else if (path === '/api/config' && method === 'GET') {
        response = json({
          ok: true,
          app: APP_NAME,
          version: APP_VERSION,
          d1: !!env.DB,
          image: true,
          agent: true,
        })
      } else if (path === '/api/login') {
        response = await loginRoute(request, env)
      } else if (path === '/api/logout' && method === 'POST') {
        response = await logoutRoute(request, env)
      } else if (path === '/api/me' && method === 'GET') {
        response = await meRoute(request, env)
      } else if (path === '/login' && method === 'GET') {
        response = await loginPageRoute(request, env)
      } else if (path === '/sandbox/frame' && method === 'GET') {
        response = previewFrameResponse()
      } else if (path === '/robots.txt' && method === 'GET') {
        response = new Response('User-agent: *\nDisallow: /\n', {
          headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'public, max-age=3600' },
        })
      } else if (path.startsWith('/api/')) {
        response = await apiRoute(request, env, path, method, ctx)
      } else if (path === '/' || path === '/index.html') {
        const session = await requireAuth(request, env)
        if (!session) return redirect('/login')
        response = htmlResponse(request, env, { lang: preferredLang(request) })
      } else if (STATIC_FILES.has(path) || STATIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
        response = await serveAsset(request, env)
      } else {
        response = new Response('Not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=UTF-8', 'Cache-Control': 'no-store' },
        })
      }
    } catch (err) {
      console.error('request failed', err && err.stack ? err.stack : err)
      response = errorJson('伺服器發生錯誤', 500, 'internal_error')
    }

    return applySecurityHeaders(request, response)
  },
}

async function apiRoute(request, env, path, method, ctx) {
  if (!['GET', 'HEAD'].includes(method) && !sameOriginRequest(request)) {
    return errorJson('跨來源請求被拒絕', 403, 'bad_origin')
  }
  if (path === '/api/chat') {
    if (method !== 'POST') return errorJson('Method not allowed', 405)
    if (!(await requireAuth(request, env))) return errorJson('請先登入', 401, 'unauthorized')
    return handleChat(request, env, ctx)
  }
  if (path === '/api/image') {
    if (!['GET', 'POST'].includes(method)) return errorJson('Method not allowed', 405)
    if (!(await requireAuth(request, env))) return errorJson('請先登入', 401, 'unauthorized')
    return handleImageRequest(request, env)
  }
  if (path === '/api/tool') {
    if (method === 'GET') {
      if (!(await requireAuth(request, env))) return errorJson('請先登入', 401, 'unauthorized')
      return json({ ok: true, tools: publicTools() })
    }
    if (method !== 'POST') return errorJson('Method not allowed', 405)
    if (!(await requireAuth(request, env))) return errorJson('請先登入', 401, 'unauthorized')
    return toolRoute(request, env)
  }
  if (!(await requireAuth(request, env))) return errorJson('請先登入', 401, 'unauthorized')
  const data = await dataApiRoute(request, env, path, method)
  if (data) return data
  const projects = await projectsApiRoute(request, env, path, method)
  if (projects) return projects
  const skills = await skillsApiRoute(request, env, path, method)
  if (skills) return skills
  const mcp = await mcpApiRoute(request, env, path, method)
  if (mcp) return mcp
  if (path === '/api/sync' || path === '/api/sync/status') {
    if (!(await requireAuth(request, env))) return errorJson('請先登入', 401, 'unauthorized')
    if (path === '/api/sync/status' && method === 'GET') {
      return json({ ok: true, enabled: !!env.DB })
    }
    if (!['GET', 'POST', 'DELETE'].includes(method)) return errorJson('Method not allowed', 405)
    return handleSync(request, env)
  }
  return errorJson('Not found', 404, 'not_found')
}

async function loginPageRoute(request, env) {
  const session = await requireAuth(request, env)
  if (session) return redirect('/')
  const url = new URL(request.url)
  return loginResponse({
    error: url.searchParams.get('error') || '',
    next: url.searchParams.get('next') || '/',
  })
}

async function loginRoute(request, env) {
  if (request.method !== 'POST') return errorJson('Method not allowed', 405)
  if (!sameOriginRequest(request)) return errorJson('跨來源請求被拒絕', 403, 'bad_origin')
  const cfg = appConfig(env)
  if (!cfg.hasPassword || !cfg.hasAuthSecret) {
    return errorJson('尚未設定 APP_PASSWORD 與 AUTH_SECRET', 503, 'auth_not_configured')
  }
  if (!loginAllowed(request)) {
    return requestIsForm(request)
      ? redirect('/login?error=rate')
      : errorJson('嘗試次數過多，請稍後再試', 429, 'rate_limited')
  }

  let password = ''
  let next = '/'
  const isForm = requestIsForm(request)
  try {
    if (isForm) {
      const form = await readFormBody(request)
      password = form.get('password') || ''
      next = safeNext(form.get('next') || '/')
    } else {
      const body = await readJsonBody(request)
      password = String(body.password || '')
      next = safeNext(body.next || '/')
    }
  } catch (err) {
    return isForm ? redirect('/login?error=1') : errorJson(bodyErrorMessage(err), 400, 'invalid_body')
  }

  let stored = null
  try {
    const db = await openDb(env)
    if (db) {
      const row = await db.first('SELECT v FROM settings WHERE k = ?', PASSWORD_SETTING)
      stored = row ? JSON.parse(row.v) : null
    }
  } catch (err) {
    console.error('password lookup failed', err && err.message)
  }
  if (!password || !(await passwordMatches(password, env, stored))) {
    recordLoginFailure(request)
    return isForm ? redirect('/login?error=1') : errorJson('密碼不正確', 401, 'bad_password')
  }

  recordLoginSuccess(request)
  const token = await createSession(env, cfg.sessionDays)
  const headers = new Headers({
    'Set-Cookie': sessionCookie(request, token, cfg.sessionDays * 86400),
    'Cache-Control': 'no-store',
  })
  if (isForm) {
    headers.set('Location', next)
    return new Response(null, { status: 303, headers })
  }
  return json({ ok: true, user: { name: 'Owner' } }, 200, { 'Set-Cookie': headers.get('Set-Cookie') })
}

async function logoutRoute(request, env) {
  if (!sameOriginRequest(request)) return errorJson('跨來源請求被拒絕', 403, 'bad_origin')
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie(request) })
}

async function meRoute(request, env) {
  const session = await requireAuth(request, env)
  if (!session) return errorJson('請先登入', 401, 'unauthorized')
  let d1 = { ok: false, error: 'D1 未綁定（binding: DB）' }
  if (env.DB) {
    try {
      const db = await openDb(env)
      const row = await db.first('SELECT COUNT(*) AS n FROM providers')
      d1 = { ok: true, providers: (row && row.n) || 0 }
    } catch (err) {
      d1 = { ok: false, error: `D1 無法使用：${String((err && err.message) || err).slice(0, 200)}` }
    }
  }
  return json({
    ok: true,
    user: { name: 'Owner' },
    config: {
      d1,
      sync: d1.ok,
      image: true,
      version: APP_VERSION,
    },
  })
}

async function toolRoute(request, env) {
  let body
  try { body = await readJsonBody(request) } catch (err) {
    return errorJson(bodyErrorMessage(err), 400, 'invalid_body')
  }
  const name = String(body.name || body.tool || '')
  if (!name) return errorJson('缺少工具名稱', 400, 'missing_tool')
  // Only side-effect-free tools are callable directly.
  if (!['calculate', 'current_time', 'fetch_url'].includes(name)) return errorJson('此工具只能在對話中使用', 400, 'tool_not_direct')
  const result = await runTool(name, body.arguments || body.args || {}, {})
  return json(result, result.ok ? 200 : 400)
}

async function serveAsset(request, env) {
  if (!env.ASSETS) return new Response('Not found', { status: 404 })
  const response = await env.ASSETS.fetch(request)
  if (!response || response.status === 404) {
    return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=UTF-8' } })
  }
  return response
}

function redirect(location, status = 302) {
  return new Response(null, {
    status,
    headers: { Location: location, 'Cache-Control': 'no-store' },
  })
}

function safeNext(value) {
  const text = String(value || '/')
  return text.startsWith('/') && !text.startsWith('//') ? text : '/'
}

function requestIsForm(request) {
  return /application\/x-www-form-urlencoded|multipart\/form-data/i.test(request.headers.get('content-type') || '')
}

function preferredLang(request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|;\s*)ta_lang=([^;]+)/)
  if (match && /^zh-TW$/.test(decodeURIComponent(match[1]))) return 'zh-TW'
  const accept = request.headers.get('accept-language') || ''
  if (/^zh-TW|zh-Hant/i.test(accept)) return 'zh-TW'
  return 'zh-TW'
}