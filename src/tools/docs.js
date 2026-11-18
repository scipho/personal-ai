// Lightweight keyword retrieval over the user's own documents.
// Chinese/Japanese/Korean text has no spaces, so whitespace splitting alone
// turns a whole CJK sentence into one "term" that almost never matches.
// We therefore also index CJK runs as overlapping bigrams.

const CJK_RUN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff]+/g

export function queryTerms(query) {
  const q = String(query || '').toLowerCase().trim()
  if (!q) return []
  const terms = new Set()
  // Latin-ish words (keep tokens of length >= 2).
  for (const word of q.replace(CJK_RUN, ' ').split(/[^\p{L}\p{N}_.-]+/u)) {
    if (word.length > 1) terms.add(word)
  }
  // CJK bigrams (single characters only when the run is one char long).
  for (const run of q.match(CJK_RUN) || []) {
    if (run.length === 1) { terms.add(run); continue }
    for (let i = 0; i < run.length - 1; i++) terms.add(run.slice(i, i + 2))
  }
  return [...terms].slice(0, 32)
}

function countOccurrences(haystack, needle, cap = 5) {
  let count = 0
  let from = 0
  while (count < cap) {
    const i = haystack.indexOf(needle, from)
    if (i < 0) break
    count++
    from = i + needle.length
  }
  return count
}

export function searchDocuments(query, documents, limit = 5) {
  const terms = queryTerms(query)
  if (!terms.length || !Array.isArray(documents)) return []
  const scored = []
  for (const doc of documents.slice(0, 200)) {
    if (!doc || typeof doc.content !== 'string') continue
    const title = String(doc.title || '')
    const text = doc.content
    const lowerTitle = title.toLowerCase()
    const lower = text.toLowerCase()
    let score = 0
    let matched = 0
    let first = -1
    for (const term of terms) {
      const inTitle = lowerTitle.includes(term)
      const hits = countOccurrences(lower, term)
      if (!inTitle && !hits) continue
      matched++
      score += (inTitle ? 4 : 0) + hits
      const at = lower.indexOf(term)
      if (at >= 0 && (first < 0 || at < first)) first = at
    }
    if (!matched) continue
    // Reward documents that cover more of the query, not just repeat one term.
    score *= 0.5 + matched / terms.length
    const start = Math.max(0, (first < 0 ? 0 : first) - 200)
    scored.push({
      title,
      score: Math.round(score * 100) / 100,
      snippet: text.slice(start, Math.min(text.length, start + 1500)),
    })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}
