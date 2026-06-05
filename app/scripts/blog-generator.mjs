#!/usr/bin/env node
/**
 * Daily high-quality blog generator for TokenRate.dev.
 * Called by .github/workflows/blog-generator.yml once a day.
 *
 * GOAL: publish ONE genuinely excellent, timely, rate-focused comparison
 * article per run — the quality bar of a hand-written piece, not templated
 * filler. (The previous version emitted cheap single-model template posts and
 * was retired; see scripts/blog-generator.legacy.mjs.bak in git history.)
 *
 * HOW IT STAYS HIGH-QUALITY AND GROUNDED:
 *   1. Live data backbone — every run pulls the live OpenRouter price feed (the
 *      same source the site's calculator uses) plus best-effort Arena quality
 *      scores. From that it computes "story leads": the newest models, output-
 *      multiplier outliers, cheapest-per-tier, biggest context windows, etc.
 *   2. Angle selection (stage A) — a capable model, with live web search when
 *      available, picks the single sharpest, most timely, NOT-yet-covered angle
 *      and the 2–6 models to feature. Degrades gracefully to a data-only choice
 *      if web search is unavailable.
 *   3. Verified table — the numeric comparison table is built IN CODE from the
 *      live feed (never written by the model), so figures are always accurate.
 *   4. Writing (stage B) — the model writes prose AROUND the verified facts and
 *      is forbidden from stating any number not in the supplied facts list.
 *   5. Quality gate — if a fresh, substantive, non-duplicate angle can't be
 *      found, or generation fails validation, the run publishes NOTHING rather
 *      than ship low-value content. A missed day beats a bad post (this is what
 *      previously got the site flagged by Google/AdSense for scaled content).
 *
 * A committed angles ledger (content/blog-angles-ledger.json) records what has
 * been published so the selector avoids repeats.
 *
 * Config (env):
 *   ANTHROPIC_API_KEY   required (except --dry-run)
 *   BLOG_MODEL          writing/selection model. Default 'claude-sonnet-4-6'.
 *                       Set to 'claude-opus-4-8' for maximum quality (higher cost).
 *   BLOG_DISABLE_SEARCH set to '1' to skip web search entirely (data-only mode).
 *   ANTHROPIC_BASE_URL  optional API base override (defaults to api.anthropic.com).
 *
 * Usage:
 *   node scripts/blog-generator.mjs            # research → write → publish
 *   node scripts/blog-generator.mjs --dry-run  # show leads + selection + table + prompts; no API calls past selection, no writes
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateBlogPost } from './_lib/validate-blog-post.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog')
const ANGLES_LEDGER_PATH = path.join(__dirname, '..', 'content', 'blog-angles-ledger.json')
const API_KEY = process.env.ANTHROPIC_API_KEY
const BASE_URL = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, '')
const MODEL = process.env.BLOG_MODEL || 'claude-sonnet-4-6'
const DISABLE_SEARCH = process.env.BLOG_DISABLE_SEARCH === '1'
const DRY_RUN = process.argv.includes('--dry-run')

const VALID_CATEGORIES = ['fundamentals', 'comparisons', 'cost-optimization', 'providers', 'building']

const PROVIDER_MAP = [
  { prefix: 'anthropic/', label: 'Anthropic' },
  { prefix: 'openai/', label: 'OpenAI' },
  { prefix: 'google/', label: 'Google' },
  { prefix: 'meta-llama/', label: 'Meta' },
  { prefix: 'deepseek/', label: 'DeepSeek' },
  { prefix: 'mistralai/', label: 'Mistral' },
  { prefix: 'x-ai/', label: 'xAI' },
]

if (!API_KEY && !DRY_RUN) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set.')
  process.exit(1)
}

// ─────────────────────────────────────────────────────────────────────────────
// Key normalisation (ported from src/lib/quality-index.ts) + formatting
// ─────────────────────────────────────────────────────────────────────────────
function normalizeKey(s) {
  return (s || '')
    .toLowerCase()
    .split('/').pop()
    .replace(/[._\s]+/g, '-')
    .replace(/-(thinking|preview|instruct|latest|exp|turbo)$/g, '')
    .replace(/-\d{4}-\d{2}-\d{2}$/, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
function normalizeId(id) {
  return normalizeKey(id).replace(/-\d+$/, '')
}
function fmtPrice(n) {
  if (n >= 100) return `$${n.toFixed(0)}`
  if (n >= 1) return `$${n.toFixed(2)}`
  return `$${n.toFixed(3)}`
}
function fmtContext(n) {
  if (!n) return '—'
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}
function fmtMult(m) {
  return `${(m.outputPerM / m.inputPerM).toFixed(1)}×`
}
/** Blended cost per 1M total tokens at a given output share (0..1). */
function blended(m, outShare) {
  return (1 - outShare) * m.inputPerM + outShare * m.outputPerM
}

// ─────────────────────────────────────────────────────────────────────────────
// Live data
// ─────────────────────────────────────────────────────────────────────────────
async function fetchOpenRouterModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
  const json = await res.json()
  const out = []
  for (const m of json.data || []) {
    const entry = PROVIDER_MAP.find((p) => m.id.startsWith(p.prefix))
    if (!entry) continue
    if (!m.pricing?.prompt || !m.pricing?.completion) continue
    const input = parseFloat(m.pricing.prompt)
    const output = parseFloat(m.pricing.completion)
    if (!(input > 0) || !(output > 0)) continue
    const name = (m.name || '').replace(/^[^:]+:\s*/i, '') || m.id
    out.push({
      id: m.id,
      name,
      provider: entry.label,
      inputPerM: input * 1_000_000,
      outputPerM: output * 1_000_000,
      context: m.context_length || 0,
      created: m.created || 0,
    })
  }
  return out
}

async function fetchArenaQuality() {
  const map = new Map()
  try {
    const res = await fetch('https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text')
    if (!res.ok) return map
    const json = await res.json()
    const ELO_MIN = 1150, ELO_MAX = 1600
    for (const m of json.models || []) {
      const norm = Math.round(Math.min(100, Math.max(0, ((m.score - ELO_MIN) / (ELO_MAX - ELO_MIN)) * 100)))
      const k = normalizeKey(m.model)
      if (k) map.set(k, norm)
    }
  } catch { /* offline / schema change → no quality, still publish on price */ }
  return map
}
function lookupQuality(map, id, name) {
  const idKey = normalizeId(id)
  const nameKey = normalizeKey(name)
  if (idKey && map.has(idKey)) return map.get(idKey)
  if (nameKey && map.has(nameKey)) return map.get(nameKey)
  for (const [k, v] of map) {
    if (idKey && (idKey.startsWith(k) || k.startsWith(idKey))) return v
    if (nameKey && (nameKey.startsWith(k) || k.startsWith(nameKey))) return v
  }
  return null
}

/** Collapse dated snapshots / duplicate ids to one entry per provider|name. */
function dedupeModels(live) {
  const byKey = new Map()
  for (const m of live) {
    const k = `${m.provider}|${normalizeKey(m.name)}`
    const existing = byKey.get(k)
    // Prefer the newer snapshot when duplicated.
    if (!existing || (m.created || 0) > (existing.created || 0)) byKey.set(k, m)
  }
  return [...byKey.values()]
}

// ─────────────────────────────────────────────────────────────────────────────
// Existing content (for de-duplication)
// ─────────────────────────────────────────────────────────────────────────────
function getExistingPosts() {
  if (!fs.existsSync(BLOG_DIR)) return []
  const out = []
  for (const f of fs.readdirSync(BLOG_DIR)) {
    if (!f.endsWith('.json')) continue
    try {
      const data = JSON.parse(fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8'))
      out.push({ slug: data.slug || f.replace(/\.json$/, ''), title: data.title || '', category: data.category || '' })
    } catch { /* skip unreadable */ }
  }
  return out
}
function readAnglesLedger() {
  try {
    const data = JSON.parse(fs.readFileSync(ANGLES_LEDGER_PATH, 'utf-8'))
    return Array.isArray(data.published) ? data : { published: [] }
  } catch {
    return { published: [] }
  }
}
function writeAnglesLedger(ledger) {
  fs.writeFileSync(ANGLES_LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n')
}
function uniqueSlug(base, existingSlugs) {
  let slug = (base || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (!slug) slug = 'llm-pricing-comparison'
  if (!existingSlugs.has(slug)) return slug
  let i = 2
  while (existingSlugs.has(`${slug}-${i}`)) i++
  return `${slug}-${i}`
}
function estimateReadTime(prose) {
  const text = [prose.tldr || '', ...(prose.sections || []).map((s) => s.body || ''), ...(prose.faq || []).map((f) => f.answer || '')].join(' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(3, Math.round(words / 200))} min read`
}

// ─────────────────────────────────────────────────────────────────────────────
// Story leads — deterministic, always-available angle fuel from the live feed
// ─────────────────────────────────────────────────────────────────────────────
function computeStoryLeads(models, qmap) {
  const withQ = models.map((m) => ({ ...m, quality: lookupQuality(qmap, m.id, m.name) }))
  const byCreated = [...withQ].filter((m) => m.created).sort((a, b) => b.created - a.created)
  const NOW = byCreated[0]?.created || 0
  const recent = byCreated.filter((m) => NOW && (NOW - m.created) <= 60 * 24 * 3600).slice(0, 12)
  const newest = byCreated.slice(0, 10)
  const byMultAsc = [...withQ].sort((a, b) => a.outputPerM / a.inputPerM - b.outputPerM / b.inputPerM)
  const lowMult = byMultAsc.slice(0, 6)
  const highMult = byMultAsc.slice(-6).reverse()
  const cheapest = [...withQ].sort((a, b) => a.inputPerM - b.inputPerM).slice(0, 8)
  const priciest = [...withQ].sort((a, b) => b.inputPerM - a.inputPerM).slice(0, 6)
  const biggestCtx = [...withQ].sort((a, b) => b.context - a.context).slice(0, 6)
  return { newest, recent, lowMult, highMult, cheapest, priciest, biggestCtx }
}
function describeModel(m) {
  const d = m.created ? new Date(m.created * 1000).toISOString().slice(0, 10) : '????-??-??'
  const q = m.quality != null ? `, quality ${m.quality}` : ''
  return `${m.name} (${m.provider}): in ${fmtPrice(m.inputPerM)}/1M, out ${fmtPrice(m.outputPerM)}/1M, ${fmtMult(m)} multiplier, ctx ${fmtContext(m.context)}${q}, added ${d}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Anthropic API (fetch-based; supports server-side web_search + pause_turn)
// ─────────────────────────────────────────────────────────────────────────────
function extractText(content) {
  return (content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
}
function extractJson(text) {
  let t = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  const first = t.indexOf('{')
  const last = t.lastIndexOf('}')
  if (first === -1 || last === -1 || last < first) throw new Error('no JSON object found in response')
  return JSON.parse(t.slice(first, last + 1))
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** POST /v1/messages with resilient handling of the org's per-minute rate limit
 *  (this org is on a low tier — 30k input tokens/min — so a 429 needs a ~60s
 *  wait, honouring retry-after, not a few-second backoff), plus transient 5xx
 *  and network retries. Returns parsed JSON; throws on a hard 4xx (e.g. the
 *  web_search tool not being enabled), which the caller can act on. */
async function postMessages(body, { maxRateWaits = 6 } = {}) {
  let rateWaits = 0
  let transientTries = 0
  for (;;) {
    let res
    try {
      res = await fetch(`${BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(body),
      })
    } catch (netErr) {
      if (transientTries++ >= 3) throw netErr
      await sleep(1500 * 2 ** transientTries)
      continue
    }
    if (res.status === 429) {
      if (rateWaits++ >= maxRateWaits) throw new Error('rate limit: exceeded wait budget')
      const ra = parseInt(res.headers.get('retry-after') || '', 10)
      const waitMs = (Number.isFinite(ra) ? ra : 60) * 1000 + 2000
      console.warn(`  rate limited (per-minute token cap); waiting ${Math.round(waitMs / 1000)}s before retry ${rateWaits}/${maxRateWaits}...`)
      await sleep(waitMs)
      continue
    }
    if (res.status >= 500) {
      if (transientTries++ >= 3) throw new Error(`Anthropic ${res.status} (server error)`)
      await sleep(1500 * 2 ** transientTries)
      continue
    }
    const data = await res.json()
    if (data.error) {
      const err = new Error(`Anthropic API error: ${JSON.stringify(data.error)}`)
      err.apiError = data.error
      err.status = res.status
      throw err
    }
    return data
  }
}

/** One logical completion. Handles server-side web search (pause_turn loop).
 *  `useSearch` adds the web_search tool; on a tool-not-enabled style 400 the
 *  caller can retry with useSearch=false. */
async function anthropic({ system, user, maxTokens = 4500, useSearch = false }) {
  const tools = useSearch && !DISABLE_SEARCH ? [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }] : undefined
  const messages = [{ role: 'user', content: user }]
  let searchCount = 0
  for (let turn = 0; turn < 6; turn++) {
    const body = { model: MODEL, max_tokens: maxTokens, messages }
    if (system) body.system = system
    if (tools) body.tools = tools
    const data = await postMessages(body)
    for (const b of data.content || []) if (b.type === 'server_tool_use') searchCount++
    if (data.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content: data.content })
      continue // resume the paused turn
    }
    if (data.stop_reason === 'max_tokens') throw new Error('generation hit max_tokens (truncated)')
    return { text: extractText(data.content), usage: data.usage, searches: searchCount }
  }
  throw new Error('exceeded pause_turn continuation limit')
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage A — pick the sharpest, most timely, not-yet-covered angle
// ─────────────────────────────────────────────────────────────────────────────
function buildSelectionPrompt(leads, existing, recentlyPublished, today) {
  const block = (label, arr) => `${label}:\n${arr.map((m) => '  - ' + describeModel(m)).join('\n')}`
  const existingSlugs = existing.map((p) => p.slug).join(', ')
  const recentTitles = existing.slice(-40).map((p) => `  - ${p.title}`).join('\n')
  const recentAngles = recentlyPublished.slice(-20).map((a) => `  - ${a.title} :: ${a.angle || ''}`).join('\n') || '  (none yet)'
  return `Today is ${today}. You are the editor of TokenRate.dev, a tool that helps developers compare AI API token prices (rates). Choose the single best NEW blog article to publish today.

The article MUST be fundamentally about comparing token rates / pricing — that is the entire point of the site. It must be timely, sharp, and genuinely useful — the kind of piece a sharp engineer would share. Favour an angle tied to a recent release, a pricing shift, or a non-obvious rate insight. Avoid anything generic or already covered.

If web search is available, use it to find what is genuinely hot right now in LLM pricing and the newest model releases — then anchor the angle to that. Verify launch facts; do not rely on stale memory.

LIVE PRICING FEED — story leads (these prices are authoritative; the article's table is built from this same feed):
${block('NEWEST MODELS (by release date)', leads.newest)}
${block('ADDED IN THE LAST ~60 DAYS', leads.recent)}
${block('LOWEST OUTPUT MULTIPLIERS (output ÷ input)', leads.lowMult)}
${block('HIGHEST OUTPUT MULTIPLIERS', leads.highMult)}
${block('CHEAPEST INPUT PRICE', leads.cheapest)}
${block('PRICIEST (flagship/frontier)', leads.priciest)}
${block('BIGGEST CONTEXT WINDOWS', leads.biggestCtx)}

ALREADY-PUBLISHED SLUGS (do NOT duplicate any of these topics):
${existingSlugs}

RECENT POST TITLES (for tone + to avoid overlap):
${recentTitles}

ANGLES THIS GENERATOR ALREADY USED (never repeat):
${recentAngles}

Pick 2 to 6 models to feature in a side-by-side price table. Use EXACT names from the leads above so the table can be built from verified figures. Choose models that make the comparison sharp (e.g., a new release vs. the incumbents it undercuts; a low-multiplier challenger vs. high-multiplier flagships; a tier face-off).

Return ONLY valid JSON (no markdown, no commentary):
{
  "title": "<headline, 50-70 chars, no date, names the comparison or insight>",
  "slug": "<kebab-case, descriptive, no dates>",
  "category": "<one of: ${VALID_CATEGORIES.join(', ')}>",
  "keyword": "<3-6 word SEO phrase>",
  "subjectModels": ["<exact model name from leads>", "..."],
  "angle": "<1-2 sentence thesis: the specific, non-obvious point this article makes about rates>",
  "whyTimely": "<1 sentence: why this is worth publishing TODAY>",
  "sources": [ { "label": "<source name>", "url": "<https url>", "note": "<what it backs up>" } ]
}
Return ONLY the JSON object.`
}

async function selectAngle(leads, existing, recentlyPublished, today) {
  const prompt = buildSelectionPrompt(leads, existing, recentlyPublished, today)
  let resp
  try {
    resp = await anthropic({ user: prompt, maxTokens: 3000, useSearch: true })
    console.log(`  (angle selection used ${resp.searches} web search${resp.searches === 1 ? '' : 'es'})`)
  } catch (err) {
    if (err.status === 400 && !DISABLE_SEARCH) {
      console.warn(`  web search unavailable (${err.message}); retrying angle selection in data-only mode.`)
      resp = await anthropic({ user: prompt, maxTokens: 3000, useSearch: false })
    } else {
      throw err
    }
  }
  return extractJson(resp.text)
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolve featured models + build the verified comparison table (in code)
// ─────────────────────────────────────────────────────────────────────────────
function resolveSubjects(names, models) {
  const chosen = []
  const seen = new Set()
  for (const n of names || []) {
    const nk = normalizeKey(n)
    let hit = models.find((m) => normalizeKey(m.name) === nk)
    if (!hit) hit = models.find((m) => normalizeKey(m.name).includes(nk) || nk.includes(normalizeKey(m.name)))
    if (hit && !seen.has(hit.id)) { seen.add(hit.id); chosen.push(hit) }
  }
  return chosen
}
/** Ensure 3–6 featured models even if the selector under-delivered: top up with
 *  recent / notable models near the chosen ones. */
function topUpSubjects(chosen, leads) {
  const seen = new Set(chosen.map((m) => m.id))
  const pool = [...leads.newest, ...leads.recent, ...leads.lowMult, ...leads.priciest]
  for (const m of pool) {
    if (chosen.length >= 4) break
    if (!seen.has(m.id)) { seen.add(m.id); chosen.push(m) }
  }
  return chosen.slice(0, 6)
}
function buildComparisonTable(subjects, qmap) {
  const quals = subjects.map((m) => lookupQuality(qmap, m.id, m.name))
  const hasQuality = quals.some((q) => q != null)
  // Sort by output multiplier ascending so the rate story reads left-to-right.
  const order = subjects.map((m, i) => ({ m, q: quals[i] })).sort((a, b) => a.m.outputPerM / a.m.inputPerM - b.m.outputPerM / b.m.inputPerM)
  const columns = ['Model', 'Input / 1M', 'Output / 1M', 'Out ÷ In', 'Context']
  if (hasQuality) columns.push('Quality')
  const rows = order.map(({ m, q }) => {
    const row = [m.name, fmtPrice(m.inputPerM), fmtPrice(m.outputPerM), fmtMult(m), fmtContext(m.context)]
    if (hasQuality) row.push(q != null ? String(q) : '—')
    return row
  })
  return {
    caption: 'Live token rates via OpenRouter, sorted by output multiplier (output ÷ input).',
    columns,
    rows,
    ordered: order.map(({ m, q }) => ({ ...m, quality: q })),
    hasQuality,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage B — write the article around the verified facts
// ─────────────────────────────────────────────────────────────────────────────
function buildWritingPrompt(sel, table) {
  const facts = table.ordered.map((m) => {
    const q = m.quality != null ? `, quality ${m.quality}/100` : ''
    const rel = m.created ? `, released ${new Date(m.created * 1000).toISOString().slice(0, 10)}` : ''
    return `- ${m.name} (${m.provider}): input ${fmtPrice(m.inputPerM)}/1M, output ${fmtPrice(m.outputPerM)}/1M, output multiplier ${fmtMult(m)}, context ${fmtContext(m.context)}${q}${rel}. Blended cost per 1M tokens: ${fmtPrice(blended(m, 0.8))} at a 1:4 input:output mix (agent/reasoning), ${fmtPrice(blended(m, 0.5))} at 1:1 (chat), ${fmtPrice(blended(m, 0.1))} at 9:1 (retrieval).`
  }).join('\n')
  return `You are a senior technical writer for TokenRate.dev. Write a genuinely excellent, factual comparison article. Title: "${sel.title}". Editorial angle: ${sel.angle}

A verified price comparison table (built from live data) renders directly ABOVE your article, so DO NOT restate the whole table — interpret it. The reader is a developer choosing a model by cost.

THE ONLY FACTS YOU MAY USE — all live and verified. Never state a price, multiplier, context size, quality score, blended cost, or release date that is not in this list:
${facts}

GROUNDING — this is a pricing site; accuracy is everything:
- Build the entire analysis on the verified facts above. Every number you write must come from that list.
- Do NOT cite external publications, blogs, news outlets, or benchmark leaderboards by name, and do NOT state benchmark scores, historical/previous prices, market-share, or funding figures — you cannot verify them and a wrong citation destroys trust. (The quality scores and release dates in the facts list are the only such figures you may use.)
- Keep any qualitative claim (a model's general strength, a typical workload shape) non-numeric and stated as reasoning, not as a sourced fact.

WRITE THE ARTICLE. Focus on rates: input vs output pricing, the output multiplier, the blended cost at the reader's real workload mix, context-window trade-offs, and which model wins for which workload (and why the cheapest headline price often is not the cheapest in production).

CRITICAL FORMATTING RULES (the renderer is strict):
- Plain prose only. NO markdown bold, NO asterisks, NO headings inside bodies, NO bullet or numbered lists — these render as literal characters.
- Separate paragraphs with a blank line (\\n\\n).
- Internal links ONLY as [anchor text](path), choosing only from: /, /tools/compare-prices, /tools/api-cost-estimator. Use 2–4 of them total across the article, where they genuinely help. Do not invent other paths.
- Use exact figures from the facts list when you cite numbers.

Return ONLY valid JSON (no markdown fences, no commentary):
{
  "title": "${sel.title}",
  "description": "<140-160 char meta description, includes the key comparison>",
  "tldr": "<2-3 sentence answer-first summary the reader can act on>",
  "tags": ["<tag>", "<tag>", "<tag>"],
  "sections": [ { "heading": "<specific, non-generic heading>", "body": "<120-190 words of plain prose>" } ],
  "faq": [ { "question": "<question a developer would actually search>", "answer": "<2-3 sentence answer>" } ],
  "ctaText": "<1-2 sentence call to action; plain text only, no links or brackets; you may mention the path /tools/compare-prices in plain text>"
}
Requirements: 5 to 7 sections, 4 to 5 FAQ items. Plain prose everywhere. Return ONLY the JSON object.`
}

async function writeArticle(sel, table) {
  const prompt = buildWritingPrompt(sel, table)
  // Writing doesn't need search; keep it grounded in the verified facts.
  const resp = await anthropic({ user: prompt, maxTokens: 6000, useSearch: false })
  if (resp.usage) console.log(`  writing usage: input=${resp.usage.input_tokens} output=${resp.usage.output_tokens}`)
  return extractJson(resp.text)
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble + persist
// ─────────────────────────────────────────────────────────────────────────────
const PROVIDER_GUIDE_SLUG = {
  Anthropic: 'all-anthropic-models-compare-prices',
  OpenAI: 'all-openai-models-compare-prices',
  Google: 'all-google-models-compare-prices',
  Meta: 'all-meta-llama-models-compare-prices',
  DeepSeek: 'all-deepseek-models-compare-prices',
  Mistral: 'all-mistral-models-compare-prices',
  xAI: 'all-xai-grok-models-compare-prices',
}
function pickRelated(subjects, existingSlugs) {
  const providers = [...new Set(subjects.map((m) => m.provider))]
  const candidates = [
    ...providers.map((p) => PROVIDER_GUIDE_SLUG[p]),
    'output-multiplier-decides-your-llm-bill',
    'quality-per-dollar-llm-ranking-2026',
    'compare-ai-model-prices-side-by-side-tool',
    'how-ai-api-pricing-works',
    'tokens-to-dollars-conversion',
  ]
  const out = []
  for (const s of candidates) {
    if (s && existingSlugs.has(s) && !out.includes(s)) out.push(s)
    if (out.length >= 4) break
  }
  return out
}
// Canonical, stable rate-card URLs per provider. We render ONLY these (plus the
// known-good aggregators below) — never a URL the model produced — so the Sources
// block can never point at a hallucinated link.
const PROVIDER_SOURCE = {
  Anthropic: { label: 'Anthropic — pricing', url: 'https://www.anthropic.com/pricing' },
  OpenAI: { label: 'OpenAI — API pricing', url: 'https://openai.com/api/pricing/' },
  Google: { label: 'Google — Gemini API pricing', url: 'https://ai.google.dev/gemini-api/docs/pricing' },
  Meta: { label: 'Llama — models', url: 'https://www.llama.com/' },
  DeepSeek: { label: 'DeepSeek — API pricing', url: 'https://api-docs.deepseek.com/quick_start/pricing' },
  Mistral: { label: 'Mistral — pricing', url: 'https://mistral.ai/pricing' },
  xAI: { label: 'xAI — API', url: 'https://x.ai/api' },
}
function buildSources(subjects, hasQuality) {
  const out = [
    { label: 'OpenRouter — live model pricing', url: 'https://openrouter.ai/models', note: 'Input/output price per token and context length for every model in the table' },
  ]
  if (hasQuality) out.push({ label: 'LMArena leaderboard', url: 'https://lmarena.ai/leaderboard', note: 'Crowd-sourced Elo, normalised to a 0–100 quality score' })
  for (const p of [...new Set(subjects.map((m) => m.provider))]) {
    if (PROVIDER_SOURCE[p]) out.push({ ...PROVIDER_SOURCE[p], note: 'Official rate card' })
  }
  out.push({ label: 'TokenRate — compare prices', url: 'https://tokenrate.dev/tools/compare-prices', note: 'Live input and output rates side by side' })
  return out
}

async function main() {
  if (DRY_RUN) console.log('[dry-run] no post will be written.\n')
  const today = new Date().toISOString().slice(0, 10)

  let live, qmap
  try {
    ;[live, qmap] = await Promise.all([fetchOpenRouterModels(), fetchArenaQuality()])
  } catch (err) {
    console.error(`Live data unavailable (${err.message}) — cannot ground an article. Skipping today.`)
    return
  }
  if (!live.length) { console.error('OpenRouter returned no usable models — skipping today.'); return }
  const models = dedupeModels(live)
  console.log(`Live feed: ${models.length} models with pricing; ${qmap.size} quality scores.`)

  const leads = computeStoryLeads(models, qmap)
  const existing = getExistingPosts()
  const existingSlugs = new Set(existing.map((p) => p.slug))
  const anglesLedger = readAnglesLedger()
  console.log(`Existing posts: ${existing.length}. Newest model in feed: ${leads.newest[0] ? leads.newest[0].name : 'n/a'}.`)

  if (DRY_RUN && !API_KEY) {
    console.log('\n[dry-run] story leads (newest):')
    for (const m of leads.newest) console.log('  - ' + describeModel(m))
    console.log('\n[dry-run] no API key set; stopping before angle selection.')
    return
  }

  // Stage A — angle
  console.log(`\nStage A: selecting today's angle (model: ${MODEL})...`)
  let sel
  try {
    sel = await selectAngle(leads, existing, anglesLedger.published, today)
  } catch (err) {
    console.error(`Angle selection failed (${err.message}) — skipping today rather than shipping filler.`)
    if (!DRY_RUN) process.exitCode = 0
    return
  }
  if (!sel || !sel.title || !sel.slug) { console.error('Selector returned no usable angle — skipping today.'); return }
  if (!VALID_CATEGORIES.includes(sel.category)) sel.category = 'comparisons'
  // Quality gate: reject duplicates.
  if (existingSlugs.has(sel.slug)) {
    console.log(`Selected slug "${sel.slug}" already exists — treating as duplicate, skipping today.`)
    return
  }
  console.log(`  angle: ${sel.title}`)
  console.log(`  thesis: ${sel.angle}`)
  console.log(`  timely: ${sel.whyTimely || '(n/a)'}`)
  console.log(`  category: ${sel.category}; featuring: ${(sel.subjectModels || []).join(', ')}`)

  // Resolve + verified table
  let subjects = resolveSubjects(sel.subjectModels, models)
  if (subjects.length < 3) subjects = topUpSubjects(subjects, leads)
  if (subjects.length < 2) { console.error('Could not resolve enough featured models — skipping today.'); return }
  const table = buildComparisonTable(subjects, qmap)
  console.log('\n  verified comparison table:')
  console.log('    ' + table.columns.join(' | '))
  for (const r of table.rows) console.log('    ' + r.join(' | '))

  if (DRY_RUN) {
    console.log('\n--- writing prompt preview (first 1400 chars) ---')
    console.log(buildWritingPrompt(sel, table).slice(0, 1400))
    console.log('\n[dry-run] would write the article and update the angles ledger. Stopping here.')
    return
  }

  // Stage B — write
  console.log('\nStage B: writing the article...')
  let prose
  try {
    prose = await writeArticle(sel, table)
  } catch (err) {
    console.error(`Writing failed (${err.message}) — skipping today.`)
    process.exitCode = 0
    return
  }

  const slug = uniqueSlug(sel.slug, existingSlugs)
  const post = {
    slug,
    category: sel.category,
    kind: 'guide',
    keyword: sel.keyword || undefined,
    title: prose.title || sel.title,
    description: prose.description || `${sel.title} — input/output token rates compared, with the blended cost that actually predicts your bill.`,
    tldr: prose.tldr,
    readTime: estimateReadTime(prose),
    publishedAt: new Date().toISOString(),
    tags: Array.isArray(prose.tags) && prose.tags.length ? prose.tags : ['LLM pricing', 'token rates', 'comparison'],
    sections: prose.sections,
    faq: prose.faq,
    ctaText: prose.ctaText,
    sources: buildSources(subjects, table.hasQuality),
    relatedSlugs: pickRelated(subjects, existingSlugs),
    comparison: { caption: table.caption, columns: table.columns, rows: table.rows },
  }

  const filename = `${slug}.json`
  const errors = validateBlogPost(filename, post)
  if (errors.length) {
    console.error('Generated post failed validation; refusing to write:')
    for (const e of errors) console.error(`  - ${e}`)
    process.exitCode = 0
    return
  }
  // Extra quality gates beyond the schema.
  if (!Array.isArray(post.sections) || post.sections.length < 4) { console.error('Too few sections — skipping.'); process.exitCode = 0; return }
  const markdownLeak = post.sections.some((s) => /\*\*/.test(s.body))
  if (markdownLeak) console.warn('Warning: a section body contains "**" which renders literally; the model was told not to.')

  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true })
  fs.writeFileSync(path.join(BLOG_DIR, filename), JSON.stringify(post, null, 2))
  console.log(`\nPost saved: ${filename} (${post.sections.length} sections, ${post.faq.length} FAQ, ${post.readTime})`)

  anglesLedger.published.push({ slug, title: post.title, angle: sel.angle, category: post.category, date: today })
  writeAnglesLedger(anglesLedger)
  console.log(`Angles ledger updated: ${anglesLedger.published.length} entries.`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  // Don't fail the workflow hard on a bad day — just publish nothing.
  process.exitCode = 0
})
