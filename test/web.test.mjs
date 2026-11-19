import test from 'node:test'
import assert from 'node:assert/strict'

import { parseDuckDuckGoHtml, resolveSearchBackend, searchWeb, _clearSearchCache } from '../src/tools/search.js'
import { readPage } from '../src/tools/fetch.js'
import { Budget } from '../src/db.js'
import { withFetch } from './helpers/d1.mjs'

test('search backend order: Tavily -> Jina -> DuckDuckGo', () => {
  assert.equal(resolveSearchBackend({}).name, 'duckduckgo')
  assert.equal(resolveSearchBackend({ jinaKey: 'j' }).name, 'jina')
  assert.equal(resolveSearchBackend({ tavilyKey: 't', jinaKey: 'j' }).name, 'tavily')
  assert.equal(resolveSearchBackend({ provider: 'jina', tavilyKey: 't', jinaKey: 'j' }).name, 'jina')
  assert.equal(resolveSearchBackend({ provider: 'duckduckgo', tavilyKey: 't' }).name, 'duckduckgo')
})

test('DuckDuckGo HTML parsing skips ads and unwraps redirect links', () => {
  const html = `
    <div class="result results_links result--ad"><a class="result__a" href="https://duckduckgo.com/y.js?ad=1">Ad</a></div>
    <div class="result results_links"><a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fa&amp;rut=x">Example &amp; Co</a>
      <a class="result__snippet" href="#">Snippet <b>text</b></a></div>`
  const results = parseDuckDuckGoHtml(html)
  assert.deepEqual(results, [{ title: 'Example & Co', url: 'https://example.com/a', content: 'Snippet text' }])
})

test('a failing keyed backend falls back to DuckDuckGo and every call is budgeted', async () => {
  _clearSearchCache()
  const budget = new Budget()
  const urls = []
  await withFetch(async (url) => {
    urls.push(String(url))
    if (String(url).includes('tavily')) return new Response('{"error":"quota"}', { status: 432 })
    return new Response('<div class="result"><a class="result__a" href="https://e.com/">E</a></div>', { headers: { 'content-type': 'text/html' } })
  }, async () => {
    const r = await searchWeb('cloudflare d1 limits', { config: { tavilyKey: 'tvly-1234567' }, budget })
    assert.equal(r.backend, 'duckduckgo')
    assert.equal(r.results[0].url, 'https://e.com/')
  })
  assert.equal(budget.subrequests, 2)
  assert.match(urls[0], /tavily/)
})

test('fetch_url uses Jina Reader when a key is set and still blocks private hosts', async () => {
  let seen
  await withFetch(async (url, init) => {
    seen = { url: String(url), auth: init.headers.Authorization }
    return new Response(JSON.stringify({ data: { title: 'T', content: '# Hello' } }), { headers: { 'content-type': 'application/json' } })
  }, async () => {
    const page = await readPage('https://example.com/x', { jinaKey: 'jina_abcdef12' })
    assert.equal(page.via, 'jina')
    assert.equal(page.text, '# Hello')
  })
  assert.equal(seen.url, 'https://r.jina.ai/https://example.com/x')
  assert.equal(seen.auth, 'Bearer jina_abcdef12')
  await assert.rejects(() => readPage('https://10.1.2.3/', { jinaKey: 'jina_abcdef12' }), /主機/)
})

test('fetch_url counts each redirect hop and refuses redirects into private space', async () => {
  const budget = new Budget()
  await withFetch(async (url) => {
    if (String(url) === 'https://a.example/') return new Response(null, { status: 302, headers: { location: 'https://b.example/' } })
    if (String(url) === 'https://b.example/') return new Response(null, { status: 302, headers: { location: 'https://192.168.1.1/' } })
    return new Response('x')
  }, async () => {
    await assert.rejects(() => readPage('https://a.example/', { budget }), /主機/)
  })
  assert.equal(budget.subrequests, 2)
})
