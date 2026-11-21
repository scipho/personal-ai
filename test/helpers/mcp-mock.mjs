// In-process Streamable HTTP MCP server for tests.
export function mcpServer({ token = 'mcp-secret-123', tools = null, sse = false, session = 's-1' } = {}) {
  const state = { calls: [], sessions: new Set(), initCount: 0, listCount: 0 }
  const toolList = tools || [
    { name: 'echo', description: 'Echo text back', inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] } },
    { name: 'add', description: 'Add numbers', inputSchema: { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } } } },
  ]
  const respond = (id, result, extraHeaders = {}) => {
    const msg = JSON.stringify({ jsonrpc: '2.0', id, result })
    if (sse) return new Response(`event: message\ndata: ${msg}\n\n`, { headers: { 'content-type': 'text/event-stream', ...extraHeaders } })
    return new Response(msg, { headers: { 'content-type': 'application/json', ...extraHeaders } })
  }
  const handler = async (url, init) => {
    const headers = new Headers(init.headers)
    if (headers.get('authorization') !== `Bearer ${token}`) return new Response('unauthorized', { status: 401 })
    const body = JSON.parse(init.body)
    state.calls.push({ method: body.method, session: headers.get('mcp-session-id'), protocol: headers.get('mcp-protocol-version') })
    if (body.method === 'initialize') {
      state.initCount++
      const sid = `${session}-${state.initCount}`
      state.sessions.add(sid)
      return respond(body.id, { protocolVersion: '2025-06-18', capabilities: { tools: {} }, serverInfo: { name: 'mock', version: '1' } }, { 'mcp-session-id': sid })
    }
    if (!state.sessions.has(headers.get('mcp-session-id'))) return new Response('session not found', { status: 404 })
    if (body.method === 'notifications/initialized') return new Response(null, { status: 202 })
    if (body.method === 'tools/list') { state.listCount++; return respond(body.id, { tools: toolList }) }
    if (body.method === 'tools/call') {
      const { name, arguments: args } = body.params
      if (name === 'echo') return respond(body.id, { content: [{ type: 'text', text: `echo: ${args.text}` }] })
      if (name === 'add') return respond(body.id, { content: [{ type: 'text', text: String(args.a + args.b) }] })
      return respond(body.id, { content: [{ type: 'text', text: 'unknown tool' }], isError: true })
    }
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: body.id, error: { code: -32601, message: 'not found' } }), { headers: { 'content-type': 'application/json' } })
  }
  return { state, handler, expire() { state.sessions.clear() } }
}
