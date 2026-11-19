// OpenAI-compatible tool-calling loop with a per-request budget.
//
// Limits (Workers Free): every model call and every tool fetch is an external
// subrequest (max 50 per invocation, we stop at 40); D1 queries are capped by
// Budget too. When a budget runs out, tools return an error telling the model
// to wrap up and the last step is forced to answer without tools.

import { BudgetError } from './db.js'
import {
  chatCompletionsUrl,
  fetchWithTimeout,
  rejectedParam,
  samplingFields,
  upstreamHeaders,
} from './providers.js'

export const MAX_TOOL_CALLS_PER_STEP = 5
const TOOL_TIMEOUT_MS = 25_000
const STEP_TIMEOUT_MS = 90_000
const TOTAL_BUDGET_MS = 170_000
export const TOOL_RESULT_MAX_CHARS = 8_000
const EVENT_PREVIEW_CHARS = 1_500

export class UpstreamError extends Error {
  constructor(status, detail) {
    super(detail || `供應商回傳 HTTP ${status}`)
    this.status = status
    this.detail = detail
  }
}

export async function readUpstreamError(upstream) {
  try {
    const text = await upstream.text()
    if (text.length < 8000) {
      try {
        const parsed = JSON.parse(text)
        const e = parsed?.error
        return String((e && (e.message || e.code)) || parsed?.message || (typeof e === 'string' ? e : '') || '')
      } catch {
        return text.slice(0, 300)
      }
    }
  } catch {}
  return ''
}

export function looksLikeToolsUnsupported(status, detail) {
  if (status !== 400 && status !== 404 && status !== 422) return false
  return /tool|function/i.test(detail) && /support|unknown|unrecogni[sz]ed|not (allowed|available)|invalid|extra/i.test(detail)
}

// Assemble a chat completion message from either a JSON body or an SSE body
// (some providers stream even when asked not to).
export function parseCompletion(text, contentType) {
  if (!/event-stream/i.test(contentType)) {
    const data = JSON.parse(text)
    if (data && data.error) throw new Error(typeof data.error === 'string' ? data.error : data.error.message || '供應商錯誤')
    const choice = data?.choices?.[0] || {}
    const message = choice.message || {}
    return {
      content: typeof message.content === 'string' ? message.content : '',
      tool_calls: Array.isArray(message.tool_calls) ? message.tool_calls : [],
      finish_reason: choice.finish_reason || '',
    }
  }
  let content = ''
  let finish = ''
  const calls = []
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue
    const payload = trimmed.slice(5).trim()
    if (!payload || payload === '[DONE]') continue
    let chunk
    try { chunk = JSON.parse(payload) } catch { continue }
    if (chunk.error) throw new Error(typeof chunk.error === 'string' ? chunk.error : chunk.error.message || '供應商錯誤')
    const choice = chunk.choices?.[0]
    if (!choice) continue
    if (choice.finish_reason) finish = choice.finish_reason
    const delta = choice.delta || choice.message || {}
    if (typeof delta.content === 'string') content += delta.content
    for (const tc of delta.tool_calls || []) {
      const i = Number.isInteger(tc.index) ? tc.index : calls.length
      calls[i] = calls[i] || { id: '', type: 'function', function: { name: '', arguments: '' } }
      if (tc.id) calls[i].id = tc.id
      if (tc.function?.name) calls[i].function.name += tc.function.name
      if (tc.function?.arguments) calls[i].function.arguments += tc.function.arguments
    }
  }
  return { content, tool_calls: calls.filter(Boolean), finish_reason: finish }
}

// One non-streaming completion. Counts one subrequest per HTTP call; on a
// 400 that names an optional sampling param, strips it and retries once
// (the param stays stripped for the rest of the request).
export async function completionStep(provider, payload, { signal, budget, stripped = new Set(), timeoutMs = STEP_TIMEOUT_MS } = {}) {
  let body = { ...payload, ...samplingFields(payload.params || {}, stripped) }
  delete body.params
  for (let attempt = 0; attempt < 2; attempt++) {
    if (budget) budget.fetch(1)
    const upstream = await fetchWithTimeout(
      chatCompletionsUrl(provider.baseUrl),
      { method: 'POST', headers: upstreamHeaders(provider.apiKey), body: JSON.stringify(body), signal },
      timeoutMs,
    )
    if (!upstream.ok) {
      const detail = await readUpstreamError(upstream)
      const bad = attempt === 0 ? rejectedParam(upstream.status, detail, body) : ''
      if (bad && (!budget || budget.canFetch(1))) {
        stripped.add(bad)
        body = { ...body }
        delete body[bad]
        continue
      }
      throw new UpstreamError(upstream.status, detail)
    }
    const type = (upstream.headers.get('content-type') || '').toLowerCase()
    const text = await upstream.text()
    try {
      return parseCompletion(text, type)
    } catch (err) {
      throw new UpstreamError(502, err && err.message ? err.message : '供應商回傳格式不正確')
    }
  }
  throw new UpstreamError(400, '供應商拒絕參數')
}

function parseArgs(raw) {
  if (raw && typeof raw === 'object') return raw
  const text = String(raw || '').trim()
  if (!text) return {}
  return JSON.parse(text)
}

export function clampText(value, max) {
  return String(value ?? '').slice(0, max)
}

function withTimeout(promise, ms) {
  let timer
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('工具逾時')), ms) }),
  ]).finally(() => clearTimeout(timer))
}

export function serializeToolResult(result) {
  let text = JSON.stringify(result)
  if (text.length > TOOL_RESULT_MAX_CHARS) text = text.slice(0, TOOL_RESULT_MAX_CHARS) + '…（內容過長已截斷）'
  return text
}

function previewJson(value, max = EVENT_PREVIEW_CHARS) {
  let text = ''
  try { text = JSON.stringify(value) } catch { text = String(value) }
  return text.length > max ? text.slice(0, max) + '…' : text
}

const WRAP_UP = '本次請求的工具預算（外部連線或資料庫查詢）已用完。不要再呼叫工具，請根據目前已取得的資訊直接回答，並說明哪些部分未能查證。'

async function executeToolCall(call, ctx) {
  const name = call?.function?.name || ''
  let args = {}
  try {
    args = parseArgs(call?.function?.arguments)
    if (!args || typeof args !== 'object' || Array.isArray(args)) args = {}
  } catch {
    return { name, args, result: { ok: false, error: '工具參數不是有效 JSON，請修正後重試' } }
  }
  if (!ctx.allowed.has(name)) {
    return { name, args, result: { ok: false, error: `工具 ${name || '(空)'} 不可用。可用工具：${[...ctx.allowed].join(', ')}` } }
  }
  if (ctx.budget.exhausted()) return { name, args, result: { ok: false, error: WRAP_UP, code: 'budget' } }
  try {
    let result = await withTimeout(ctx.execute(name, args), TOOL_TIMEOUT_MS)
    if (!result || typeof result !== 'object') result = { ok: true, result }
    let events
    if (result.__events) {
      events = result.__events
      result = { ...result }
      delete result.__events
    }
    return { name, args, result, events }
  } catch (err) {
    if (err instanceof BudgetError) return { name, args, result: { ok: false, error: WRAP_UP, code: 'budget' } }
    return { name, args, result: { ok: false, error: err && err.message ? err.message : '工具執行失敗' } }
  }
}

function finalEvents(step) {
  const events = []
  if (step.content) events.push({ content: step.content })
  if (step.finish_reason === 'length') {
    events.push(step.content
      ? { notice: '回覆因長度上限被截斷。' }
      : { error: '模型在產生答案前用完了 max_tokens（推理模型常見），請提高最大長度後重試。' })
  } else if (!step.content) {
    events.push({ error: '供應商沒有回傳內容' })
  }
  return events
}

// Runs the loop after the first step. `send(event)` streams SSE events; the
// returned record is what callers persist (content, steps, sources).
//   opts: { provider, base, messages, tools, firstStep, ctx, signal, label, collectSources }
export async function runAgentLoop(opts) {
  const { provider, base, messages, tools, ctx, signal, send, label, collectSources } = opts
  const started = Date.now()
  const remaining = () => TOTAL_BUDGET_MS - (Date.now() - started)
  const budget = ctx.budget
  const record = { content: '', steps: [], sources: new Map(), error: '', notices: [] }
  let step = opts.firstStep
  for (let n = 1; ; n++) {
    if (!step.tool_calls.length) {
      for (const ev of finalEvents(step)) {
        if (ev.content) record.content += ev.content
        if (ev.error) record.error = ev.error
        if (ev.notice) record.notices.push(ev.notice)
        await send(ev)
      }
      break
    }
    const calls = step.tool_calls.slice(0, MAX_TOOL_CALLS_PER_STEP).map((c, i) => ({
      ...c,
      id: c.id || `call_${n}_${i}`,
      type: 'function',
    }))
    messages.push({ role: 'assistant', content: step.content || null, tool_calls: calls })

    // Sequential when tools touch D1/files (ordering matters), else parallel.
    const runOne = async (call) => {
      let preview = {}
      try { preview = parseArgs(call.function.arguments) } catch {}
      const info = { id: call.id, name: call.function.name, step: n, label: label(call.function.name, preview) }
      await send({ tool: { ...info, status: 'running', args: previewJson(preview, 600) } })
      const out = await executeToolCall(call, ctx)
      const ok = !!(out.result && out.result.ok !== false)
      const ev = {
        ...info,
        status: ok ? 'done' : 'error',
        error: ok ? undefined : clampText(out.result.error, 300),
        args: previewJson(out.args, 600),
        result: previewJson(out.result),
      }
      record.steps.push({ name: ev.name, step: n, label: ev.label, status: ev.status, error: ev.error, args: ev.args, result: ev.result })
      await send({ tool: ev })
      if (out.events) for (const extra of out.events) await send(extra)
      return { call, out }
    }
    const outcomes = []
    if (ctx.sequential) {
      for (const call of calls) outcomes.push(await runOne(call))
    } else {
      outcomes.push(...await Promise.all(calls.map(runOne)))
    }
    for (const { call, out } of outcomes) {
      if (collectSources) collectSources(out.name, out.args, out.result, record.sources)
      messages.push({ role: 'tool', tool_call_id: call.id, content: serializeToolResult(out.result) })
    }
    if (record.sources.size) await send({ sources: [...record.sources.values()].slice(0, 12) })
    if (ctx.afterTools) await ctx.afterTools(send)

    if (signal && signal.aborted) break
    const timeLeft = remaining()
    if (timeLeft < 5_000) {
      record.error = '已達處理時間上限，請把問題縮小後再試。'
      await send({ error: record.error })
      break
    }
    if (!budget.canFetch(1)) {
      record.error = '本次請求的外部連線預算已用完，無法再呼叫模型。'
      await send({ error: record.error })
      break
    }
    budget.steps = n
    // Last allowed step or exhausted budget: force a written answer.
    const forceAnswer = n >= budget.maxSteps || budget.exhausted() || !budget.canFetch(2)
    const payload = forceAnswer
      ? { ...base, messages, tools, tool_choice: 'none' }
      : { ...base, messages, tools, tool_choice: 'auto' }
    const stepOpts = { signal, budget, stripped: ctx.stripped, timeoutMs: Math.min(STEP_TIMEOUT_MS, timeLeft) }
    try {
      step = await completionStep(provider, payload, stepOpts)
    } catch (err) {
      // One retry for malformed tool generations (e.g. Groq tool_use_failed).
      if (err instanceof UpstreamError && /tool_use_failed|failed to call a function|parse/i.test(err.detail || '') && budget.canFetch(1)) {
        step = await completionStep(provider, { ...payload, params: { ...payload.params, temperature: 0 } }, stepOpts)
      } else {
        throw err
      }
    }
    if (forceAnswer) step.tool_calls = []
  }
  return record
}

export { executeToolCall as _executeToolCall }
