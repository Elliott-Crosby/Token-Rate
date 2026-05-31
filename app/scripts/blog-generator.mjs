#!/usr/bin/env node
/**
 * Generates one new blog post per run using the Anthropic API (Haiku for cost efficiency).
 * Called by .github/workflows/blog-generator.yml once a day.
 *
 * PRIMARY MODE — new-model comparison posts:
 *   Each run pulls the live OpenRouter model feed (the same source the site's
 *   calculator uses) plus best-effort Arena quality scores, detects models it
 *   hasn't written about yet (auto-discovered releases + anything curated in
 *   src/lib/models.ts), and publishes a comparison post grounded in REAL pricing.
 *   The numeric comparison table is built in code — the LLM only writes the prose
 *   around it and is forbidden from inventing figures. A committed ledger
 *   (content/models-ledger.json) tracks which models are covered; on first run it
 *   seeds the current feed as a baseline so only genuinely new models trigger posts.
 *
 * FALLBACK MODE — legacy curated TOPICS list (now exhausted → no-op).
 *
 * Usage:
 *   node scripts/blog-generator.mjs            # generate + write
 *   node scripts/blog-generator.mjs --dry-run  # show selection/table/prompt, no API call, no writes
 * Requires: ANTHROPIC_API_KEY env var (not needed for --dry-run)
 */

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'
import { validateBlogPost } from './_lib/validate-blog-post.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog')
const MODELS_TS = path.join(__dirname, '..', 'src', 'lib', 'models.ts')
const LEDGER_PATH = path.join(__dirname, '..', 'content', 'models-ledger.json')
const API_KEY = process.env.ANTHROPIC_API_KEY
const DRY_RUN = process.argv.includes('--dry-run')

// Same provider prefixes the homepage uses to group the OpenRouter feed.
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

// Valid categories — mirror of CATEGORY_SLUGS in src/lib/categories.ts and validate-blog-post.mjs.
// Keep in sync. Every TOPIC must declare a category from this list, so the validator
// (which requires `category`) is always satisfied even if the model omits the field.
const VALID_CATEGORIES = ['fundamentals', 'comparisons', 'cost-optimization', 'providers', 'building']

const TOPICS = [
  { slug: 'how-to-calculate-openai-api-costs', title: 'How to Calculate Your OpenAI API Costs Before You Ship', category: 'providers' },
  { slug: 'claude-sonnet-vs-gpt4o-cost-comparison', title: 'Claude Sonnet vs GPT-4o: Real-World API Cost Comparison', category: 'comparisons' },
  { slug: 'why-your-llm-bill-is-higher-than-expected', title: 'Why Your LLM Bill Is Higher Than Expected — And How to Fix It', category: 'cost-optimization' },
  { slug: 'token-budgeting-for-production-ai-apps', title: 'Token Budgeting for Production AI Apps', category: 'cost-optimization' },
  { slug: 'gpt4o-mini-vs-claude-haiku-cost', title: 'GPT-4o Mini vs Claude Haiku: Which Is Cheaper for High-Volume Tasks?', category: 'comparisons' },
  { slug: 'understanding-context-windows-api-costs', title: 'Context Windows Explained: What 200K Tokens Really Costs You', category: 'fundamentals' },
  { slug: 'prompt-caching-save-90-percent-on-ai-costs', title: 'Prompt Caching: How to Save Up to 90% on Repeated Context Costs', category: 'cost-optimization' },
  { slug: 'batch-api-cut-ai-costs-in-half', title: 'Batch API Processing: Cut Your AI Costs in Half', category: 'cost-optimization' },
  { slug: 'system-prompts-are-costing-you-money', title: 'System Prompts Are Costing You Money — Here Is How to Optimize Them', category: 'cost-optimization' },
  { slug: 'output-token-pricing-explained', title: 'Output Token Pricing Explained (And Why It Costs More Than Input)', category: 'fundamentals' },
  { slug: 'llm-pricing-trends-2026', title: 'LLM Pricing Trends: How AI Model Costs Changed in 2026', category: 'fundamentals' },
  { slug: 'deepseek-r1-vs-openai-o3-cost', title: 'DeepSeek R1 vs OpenAI o3: Reasoning Model Cost Comparison', category: 'comparisons' },
  { slug: 'how-to-pick-the-right-ai-model-for-your-budget', title: 'How to Pick the Right AI Model for Your Budget', category: 'building' },
  { slug: 'token-usage-auditing-find-hidden-costs', title: 'Token Usage Auditing: Find Hidden Costs in Your AI App', category: 'cost-optimization' },
  { slug: 'anthropic-vs-openai-cheaper-for-startups', title: 'Anthropic Claude vs OpenAI: Which Is Cheaper for Startups?', category: 'comparisons' },
  { slug: 'building-cost-aware-ai-agent', title: 'Building a Cost-Aware AI Agent That Stays Within Budget', category: 'building' },
  { slug: 'mistral-vs-claude-token-pricing', title: 'Mistral vs Claude: Token Pricing Breakdown for 2026', category: 'comparisons' },
  { slug: 'rag-pipeline-cost-optimization', title: 'Building Cost-Efficient RAG Pipelines: Token Strategies That Work', category: 'building' },
  { slug: 'fine-tuning-vs-prompt-engineering-cost', title: 'Fine-Tuning vs Prompt Engineering: A Cost Analysis', category: 'cost-optimization' },
  { slug: 'gemini-flash-vs-gpt4o-mini-budget-model', title: 'Gemini 2.0 Flash vs GPT-4o Mini: The Budget Model Showdown', category: 'comparisons' },
  { slug: 'real-cost-1-million-token-context', title: 'The Real Cost of a 1-Million-Token Context Window', category: 'fundamentals' },
  { slug: 'streaming-vs-batch-ai-cost', title: 'Streaming vs Batch Requests: Which AI API Mode Costs Less?', category: 'comparisons' },
  { slug: 'embedding-models-cost-optimization', title: 'Why Embedding Models Are Underrated for Cutting AI Costs', category: 'cost-optimization' },
  { slug: 'what-happens-when-you-exceed-token-limit', title: 'What Happens When You Exceed Your Token Limit?', category: 'fundamentals' },
  { slug: 'ai-cost-monitor-production', title: 'How to Build a Cost Monitor for Your AI Application', category: 'building' },
  { slug: 'tokens-per-dollar-comparison-2026', title: 'Tokens Per Dollar: Comparing Every Major LLM in 2026', category: 'comparisons' },
  { slug: 'llama-3-vs-claude-haiku-cost', title: 'Llama 3 vs Claude Haiku: Open-Source vs Commercial Cost Tradeoffs', category: 'comparisons' },
  { slug: 'claude-opus-4-worth-the-price', title: 'Is Claude Opus 4 Worth the Price? A Developer Cost Analysis', category: 'providers' },
  { slug: 'multimodal-token-costs-images-vision', title: 'Multimodal Token Costs: What You Pay for Image and Vision APIs', category: 'fundamentals' },
  { slug: 'ai-agent-loops-cost-spiral', title: 'AI Agent Loops and Cost Spirals: How to Keep Agentic Workflows Cheap', category: 'building' },
  { slug: 'openai-o3-mini-cost-reasoning', title: 'OpenAI o3-mini Cost Guide: When Cheap Reasoning Makes Sense', category: 'providers' },
  { slug: 'claude-haiku-4-review-and-pricing', title: 'Claude Haiku 4 Review: Speed, Quality, and Pricing Breakdown', category: 'providers' },
  { slug: 'input-vs-output-token-ratio-optimization', title: 'Optimizing Your Input-to-Output Token Ratio for Lower API Bills', category: 'cost-optimization' },
  { slug: 'per-token-pricing-vs-subscription-ai', title: 'Pay-Per-Token vs AI Subscriptions: Which Is Better for Developers?', category: 'fundamentals' },
  { slug: 'ai-api-cost-for-mvp-startups', title: 'Estimating AI API Costs for Your MVP: A Startup Founders Guide', category: 'cost-optimization' },
  { slug: 'structured-outputs-token-cost-impact', title: 'How Structured Outputs Affect Your Token Count and Cost', category: 'cost-optimization' },
  { slug: 'gpt-4-turbo-vs-gpt-4o-cost', title: 'GPT-4 Turbo vs GPT-4o: A Pricing and Performance Comparison', category: 'comparisons' },
  { slug: 'ai-saas-cost-per-user-calculation', title: 'How to Calculate AI API Cost Per User for Your SaaS Product', category: 'building' },
  { slug: 'claude-extended-thinking-cost-analysis', title: 'Claude Extended Thinking Tokens: Cost Impact and When to Enable It', category: 'providers' },
  { slug: 'token-counting-tools-for-developers', title: 'Token Counting Tools Every LLM Developer Should Know', category: 'building' },
  { slug: 'llm-cost-at-scale-1m-requests', title: 'LLM Costs at Scale: What 1 Million API Requests Actually Costs', category: 'cost-optimization' },
  { slug: 'ai-provider-comparison-2026-cost', title: 'AI Provider Showdown 2026: Pricing, Performance, and Value', category: 'comparisons' },
  { slug: 'reducing-hallucinations-vs-token-cost', title: 'Reducing Hallucinations Without Blowing Your Token Budget', category: 'building' },
  { slug: 'json-mode-token-overhead', title: 'JSON Mode and Structured Outputs: The Hidden Token Overhead', category: 'fundamentals' },
  { slug: 'reasoning-models-worth-the-cost', title: 'Are Reasoning Models Worth the Extra Cost? A Practical Guide', category: 'fundamentals' },
]

function getExistingSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return new Set()
  return new Set(
    fs.readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
  )
}

function pickNextTopic(existingSlugs) {
  for (const topic of TOPICS) {
    if (!existingSlugs.has(topic.slug)) return topic
  }
  // All curated topics are published — generate nothing.
  //
  // The previous fallback emitted a generic, timestamp-slugged
  // `ai-token-pricing-insights-<ts>` post on every run. With the curated list
  // exhausted, that produced a near-duplicate, ungrounded filler article every
  // 2 hours. Google flagged the site for "Low value content" / scaled content
  // abuse and AdSense review failed. Returning null makes main() exit cleanly.
  //
  // To publish more posts, add real entries to the TOPICS table above.
  return null
}

function callAnthropicAPI(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      // max_tokens: haiku 4.5 caps output at 8192. 2048 was truncating posts mid-JSON
      // (4-6 sections * ~150 words + FAQ + boilerplate routinely exceeds 2k tokens).
      // 6000 gives plenty of headroom while leaving room for the response envelope.
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            reject(new Error(`Anthropic API error: ${JSON.stringify(parsed.error)}`))
          } else {
            resolve({
              text: parsed.content?.[0]?.text ?? '',
              stopReason: parsed.stop_reason ?? null,
              usage: parsed.usage ?? null,
            })
          }
        } catch (e) {
          reject(new Error(`Failed to parse API response: ${e.message}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function callWithRetry(prompt, attempts = 3) {
  let lastErr
  for (let i = 1; i <= attempts; i++) {
    try {
      return await callAnthropicAPI(prompt)
    } catch (err) {
      lastErr = err
      const transient = /ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|5\d\d/i.test(err.message || '')
      if (!transient || i === attempts) throw err
      const delay = 1000 * 2 ** (i - 1)
      console.warn(`Attempt ${i} failed (${err.message}); retrying in ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}

function buildPrompt(topic) {
  const now = new Date().toISOString()
  return `You are a technical blog writer for TokenRate.dev, a tool that helps developers calculate and compare AI API token costs.

Write a blog post with the title: "${topic.title}"

Return ONLY valid JSON matching this exact structure — no markdown fences, no explanation:

{
  "category": "${topic.category}",
  "slug": "${topic.slug}",
  "keyword": "<primary SEO keyword phrase, 3-6 words>",
  "title": "${topic.title}",
  "description": "<140-160 char meta description>",
  "readTime": "<e.g. 6 min read>",
  "publishedAt": "${now}",
  "tags": ["<tag1>", "<tag2>"],
  "sections": [
    { "heading": "<section heading>", "body": "<100-180 words of plain prose, no markdown>" }
  ],
  "faq": [
    { "question": "<question>", "answer": "<2-3 sentence answer>" }
  ],
  "ctaText": "<1-2 sentence CTA encouraging use of the TokenRate calculator>"
}

Requirements:
- "category" MUST be exactly one of: ${VALID_CATEGORIES.map((c) => `"${c}"`).join(', ')}
- Include 4-5 sections (keep total output under 5000 tokens)
- Include 3-4 FAQ items
- Body text must be plain prose — no bullet points, no markdown headers
- Use real model names, real pricing data, and specific numbers where possible
- Link to internal pages where relevant using paths like /tools/token-to-usd, /tools/api-cost-estimator, /models/<slug>, /compare/<slug>
- Return ONLY raw JSON starting with { and ending with }`
}

// ─────────────────────────────────────────────────────────────────────────────
// New-model comparison mode
// ─────────────────────────────────────────────────────────────────────────────

// Quality-key normalisation — ported from src/lib/quality-index.ts so the
// generator matches the site's own model↔score lookup behaviour.
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

/** Stable per-model identity for the ledger. Keyed on the display name so dated
 *  snapshots collapse (e.g. "GPT-4o (2024-08-06)" / "(2024-11-20)" → one entry)
 *  while genuine new versions (GPT-5 vs GPT-5.5) stay distinct. Provider-prefixed
 *  to avoid any cross-provider name collision. */
function modelKey(m) {
  return `${m.provider}|${normalizeKey(m.name)}`
}

async function fetchOpenRouterModels() {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { Accept: 'application/json' },
  })
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
    })
  }
  return out
}

/** Best-effort live quality scores from the (free, no-auth) Arena leaderboard.
 *  Covers roughly the current top-20; anything unrated simply has no score, which
 *  is fine — posts are grounded on price/context and quality is a bonus column. */
async function fetchArenaQuality() {
  const map = new Map()
  try {
    const res = await fetch('https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text')
    if (!res.ok) return map
    const json = await res.json()
    const ELO_MIN = 1150
    const ELO_MAX = 1600
    for (const m of json.models || []) {
      const norm = Math.round(Math.min(100, Math.max(0, ((m.score - ELO_MIN) / (ELO_MAX - ELO_MIN)) * 100)))
      const k = normalizeKey(m.model)
      if (k) map.set(k, norm)
    }
  } catch { /* offline / changed schema → no quality, still publish on price */ }
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

/** Extract curated models from src/lib/models.ts WITHOUT importing TS (CI runs
 *  Node 20, no tsx). Guarded regex: matches each block from `slug:` to its own
 *  `openRouterIds:` without crossing into the next `slug:`, so entries that omit
 *  openRouterIds are skipped rather than mis-paired. Failure is non-fatal — the
 *  model just falls through to auto-discovery. */
function readCuratedModels() {
  let src
  try {
    src = fs.readFileSync(MODELS_TS, 'utf-8')
  } catch {
    return []
  }
  const out = []
  const re = /slug:\s*'([^']+)'((?:(?!slug:)[\s\S])*?)openRouterIds:\s*\[([^\]]*)\]/g
  let m
  while ((m = re.exec(src))) {
    const slug = m[1]
    const block = m[2]
    const ids = [...m[3].matchAll(/'([^']+)'/g)].map((x) => x[1])
    if (ids.length === 0) continue
    const name = (block.match(/name:\s*'([^']*)'/) || [])[1] || slug
    const tier = (block.match(/tier:\s*'([^']*)'/) || [])[1] || ''
    out.push({ slug, name, tier, openRouterIds: ids })
  }
  return out
}

function readLedger() {
  try {
    const raw = fs.readFileSync(LEDGER_PATH, 'utf-8')
    const data = JSON.parse(raw)
    return { seeded: !!data.seeded, covered: data.covered || {} }
  } catch {
    return { seeded: false, covered: {} }
  }
}
function writeLedger(ledger) {
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + '\n')
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

const PROVIDER_BONUS = { Anthropic: 30, OpenAI: 30, Google: 30, Meta: 15, DeepSeek: 15, Mistral: 15, xAI: 15 }

function scoreModel(m, qmap) {
  let s = 0
  if (m.curated) s += 10_000
  const q = lookupQuality(qmap, m.id, m.name)
  if (q != null) s += q * 10
  s += PROVIDER_BONUS[m.provider] || 0
  s += Math.min(m.inputPerM, 50) // pricier models skew flagship/notable; capped
  return s
}

/** Up to 4 competitors: nearest 2 by input price within the same provider, then
 *  fill with nearest cross-provider rivals. Deduped by model key. */
function pickCompetitors(subject, all) {
  const sk = modelKey(subject)
  const others = all.filter((m) => modelKey(m) !== sk)
  // Relative distance on BOTH input and output price, so a model pairs with peers
  // of a similar overall cost profile (not, say, a $10/$10 image model next to a
  // $10/$30 chat model just because their input prices match).
  const dist = (m) =>
    Math.abs(m.inputPerM - subject.inputPerM) / Math.max(subject.inputPerM, 0.01) +
    Math.abs(m.outputPerM - subject.outputPerM) / Math.max(subject.outputPerM, 0.01)
  const byCloseness = (a, b) => dist(a) - dist(b)
  const same = others.filter((m) => m.provider === subject.provider).sort(byCloseness)
  const cross = others.filter((m) => m.provider !== subject.provider).sort(byCloseness)
  const chosen = []
  const seen = new Set()
  for (const m of [...same.slice(0, 2), ...cross]) {
    const k = modelKey(m)
    if (seen.has(k)) continue
    seen.add(k)
    chosen.push(m)
    if (chosen.length >= 4) break
  }
  return chosen
}

function buildComparisonTable(subject, competitors, qmap) {
  const rows = [subject, ...competitors]
  const quals = rows.map((m) => lookupQuality(qmap, m.id, m.name))
  const hasQuality = quals.some((q) => q != null)
  const columns = ['Model', 'Input / 1M', 'Output / 1M', 'Context']
  if (hasQuality) columns.push('Quality')
  const tableRows = rows.map((m, i) => {
    const row = [m.name, fmtPrice(m.inputPerM), fmtPrice(m.outputPerM), fmtContext(m.context)]
    if (hasQuality) row.push(quals[i] != null ? String(quals[i]) : '—')
    return row
  })
  return { caption: `${subject.name} vs. alternatives — live pricing`, columns, rows: tableRows, hasQuality }
}

const PROVIDER_GUIDE_SLUG = {
  Anthropic: 'all-anthropic-models-compare-prices',
  OpenAI: 'all-openai-models-compare-prices',
  Google: 'all-google-models-compare-prices',
  Meta: 'all-meta-llama-models-compare-prices',
  DeepSeek: 'all-deepseek-models-compare-prices',
  Mistral: 'all-mistral-models-compare-prices',
  xAI: 'all-xai-grok-models-compare-prices',
}
function pickRelated(subject, existingSlugs) {
  const candidates = [
    PROVIDER_GUIDE_SLUG[subject.provider],
    'compare-ai-model-prices-side-by-side-tool',
    'how-ai-api-pricing-works',
    'quality-per-dollar-llm-ranking-2026',
    'how-to-reduce-ai-api-costs',
    'tokens-to-dollars-conversion',
  ]
  return candidates.filter((s) => s && existingSlugs.has(s)).slice(0, 3)
}
function buildSources(hasQuality) {
  const s = [
    { label: 'OpenRouter — live model pricing', url: 'https://openrouter.ai/models', note: 'Input/output price per token and context length' },
  ]
  if (hasQuality) {
    s.push({ label: 'LMArena leaderboard', url: 'https://lmarena.ai/leaderboard', note: 'Crowd-sourced Elo, normalised to a 0–100 quality score' })
  }
  s.push({ label: 'TokenRate price comparison tool', url: 'https://tokenrate.dev/tools/compare-prices' })
  return s
}
function uniqueSlug(base, existingSlugs) {
  let slug = base.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (!existingSlugs.has(slug)) return slug
  let i = 2
  while (existingSlugs.has(`${slug}-${i}`)) i++
  return `${slug}-${i}`
}
function estimateReadTime(prose) {
  const text = [
    prose.tldr || '',
    ...(prose.sections || []).map((s) => s.body || ''),
    ...(prose.faq || []).map((f) => f.answer || ''),
  ].join(' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return `${Math.max(3, Math.round(words / 200))} min read`
}

function buildModelPrompt(subject, competitors, table, qualityNote) {
  const lines = [subject, ...competitors].map((m, i) => {
    const q = table.hasQuality ? `, quality ${table.rows[i][4]}` : ''
    return `${i === 0 ? '[SUBJECT] ' : ''}${m.name} (${m.provider}): input ${fmtPrice(m.inputPerM)}/1M, output ${fmtPrice(m.outputPerM)}/1M, context ${fmtContext(m.context)}${q}`
  }).join('\n')

  const modelLink = subject.curatedSlug ? `/models/${subject.curatedSlug}` : '/tools/compare-prices'

  return `You are a technical writer for TokenRate.dev, a tool that compares AI API token costs. Write a factual, useful comparison article about a model and how it stacks up against alternatives.

THE ONLY FACTS YOU MAY USE (all figures are live and verified — do NOT state any price, context size, quality score, release date, or benchmark number that is not in this list):
${lines}
${qualityNote ? `\nNote: ${qualityNote}` : ''}

The reader will see a data table with exactly these numbers directly above your article, so do not repeat the full table — interpret it. Focus on: what the subject model is for, how its input/output pricing compares to the alternatives, the output-to-input cost ratio, context-window trade-offs, and which workloads make it the right (or wrong) pick versus the named alternatives.

Return ONLY valid JSON (no markdown fences, no commentary) matching:
{
  "title": "<concise title naming the subject model; no date>",
  "description": "<140-160 char meta description>",
  "tldr": "<2-3 sentence answer-first summary a reader can act on>",
  "tags": ["<tag>", "<tag>", "<tag>"],
  "sections": [ { "heading": "<heading>", "body": "<110-170 words of plain prose, no markdown, no bullet lists>" } ],
  "faq": [ { "question": "<question>", "answer": "<2-3 sentence answer>" } ],
  "ctaText": "<1-2 sentence CTA to use the TokenRate calculator>"
}

Requirements:
- Exactly 4 sections and 3-4 FAQ items.
- Plain prose only in every body and answer — no markdown, no headings, no bullet points.
- You MAY include at most two internal links written as [anchor text](path), choosing from: ${modelLink}, /tools/compare-prices, / (the calculator). Do not invent other links.
- Never state a number that is not in the facts list above. When you reference cost, use the exact figures given.
- Return ONLY raw JSON starting with { and ending with }.`
}

async function tryModelComparisonPost(existingSlugs) {
  let live, qmap
  try {
    ;[live, qmap] = await Promise.all([fetchOpenRouterModels(), fetchArenaQuality()])
  } catch (err) {
    console.warn(`Live data unavailable (${err.message}) — skipping model mode this run.`)
    return false
  }
  if (!live || live.length === 0) {
    console.warn('OpenRouter returned no usable models — skipping model mode this run.')
    return false
  }
  console.log(`Live feed: ${live.length} models with pricing across ${PROVIDER_MAP.length} providers; ${qmap.size} quality scores.`)

  const curated = readCuratedModels()
  const curatedIds = new Set(curated.flatMap((c) => c.openRouterIds))
  const curatedById = new Map()
  for (const c of curated) for (const id of c.openRouterIds) curatedById.set(id, c)
  console.log(`Curated catalog: ${curated.length} models parsed from models.ts.`)

  for (const m of live) {
    m.curated = curatedIds.has(m.id)
    m.curatedSlug = m.curated ? curatedById.get(m.id)?.slug ?? null : null
  }

  // Collapse dated snapshots / duplicates to one entry per key (prefer the curated one).
  const byKey = new Map()
  for (const m of live) {
    const k = modelKey(m)
    const existing = byKey.get(k)
    if (!existing || (m.curated && !existing.curated)) byKey.set(k, m)
  }
  const liveUniq = [...byKey.values()]

  const ledger = readLedger()
  const covered = ledger.covered

  const pool = liveUniq.filter((m) => !covered[modelKey(m)])
  if (pool.length === 0) {
    console.log('No new models since last run — nothing to publish.')
    return false
  }

  if (!ledger.seeded) {
    // One-time showcase: lead with the highest-quality model so the first post
    // features a current flagship rather than whatever curated model ranks first.
    const qOf = (m) => lookupQuality(qmap, m.id, m.name) ?? -1
    pool.sort((a, b) => qOf(b) - qOf(a) || b.inputPerM - a.inputPerM)
    console.log(`[cold start] establishing baseline of ${liveUniq.length} models; showcasing the highest-rated one.`)
  } else {
    pool.sort((a, b) => scoreModel(b, qmap) - scoreModel(a, qmap))
    console.log(`Seeded ledger has ${Object.keys(covered).length} models; ${pool.length} not yet covered.`)
  }
  const subject = pool[0]
  const competitors = pickCompetitors(subject, liveUniq)
  if (competitors.length === 0) {
    console.warn('No competitors available for comparison — skipping.')
    return false
  }
  const table = buildComparisonTable(subject, competitors, qmap)

  console.log(`\nSelected: ${subject.name} (${subject.provider})${subject.curated ? ' [curated]' : ' [auto-discovered]'}`)
  console.log(`Competitors: ${competitors.map((c) => c.name).join(', ')}`)
  console.log('Comparison table:')
  console.log('  ' + table.columns.join(' | '))
  for (const r of table.rows) console.log('  ' + r.join(' | '))

  if (DRY_RUN) {
    console.log('\n--- prompt preview (first 1200 chars) ---')
    console.log(buildModelPrompt(subject, competitors, table).slice(0, 1200))
    console.log('\n[dry-run] would write a post and update the ledger. Stopping here.')
    return true
  }

  const prompt = buildModelPrompt(subject, competitors, table)
  console.log('\nCalling Anthropic API (claude-haiku-4-5)...')
  let resp
  try {
    resp = await callWithRetry(prompt)
  } catch (err) {
    console.error('API call failed after retries:', err.message)
    process.exit(1)
  }
  const { text: raw, stopReason, usage } = resp
  if (usage) console.log(`Usage: input=${usage.input_tokens} output=${usage.output_tokens} stop_reason=${stopReason}`)
  if (stopReason === 'max_tokens') {
    console.error('Generation hit max_tokens — output truncated.')
    process.exit(1)
  }

  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  let prose
  try {
    prose = JSON.parse(cleaned)
  } catch (err) {
    console.error('Failed to parse JSON response:', err.message)
    console.error('Raw (first 500):', raw.slice(0, 500))
    process.exit(1)
  }

  const slug = uniqueSlug(`${normalizeKey(subject.name)}-pricing-comparison`, existingSlugs)
  const post = {
    slug,
    category: 'comparisons',
    kind: 'guide',
    keyword: `${subject.name} pricing`,
    title: prose.title || `${subject.name}: Pricing & How It Compares`,
    description: prose.description || `${subject.name} pricing compared to alternatives — input/output cost per million tokens, context window, and which workloads it fits.`,
    tldr: prose.tldr,
    readTime: estimateReadTime(prose),
    publishedAt: new Date().toISOString(),
    tags: Array.isArray(prose.tags) && prose.tags.length ? prose.tags : [subject.provider, 'pricing', 'comparison'],
    sections: prose.sections,
    faq: prose.faq,
    ctaText: prose.ctaText,
    sources: buildSources(table.hasQuality),
    relatedSlugs: pickRelated(subject, existingSlugs),
    comparison: { caption: table.caption, columns: table.columns, rows: table.rows },
  }

  const filename = `${slug}.json`
  const validationErrors = validateBlogPost(filename, post)
  if (validationErrors.length > 0) {
    console.error('Generated post failed validation; refusing to write:')
    for (const e of validationErrors) console.error(`  - ${e}`)
    process.exit(1)
  }

  if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true })
  fs.writeFileSync(path.join(BLOG_DIR, filename), JSON.stringify(post, null, 2))
  console.log(`Post saved: ${filename}`)

  // Update ledger: mark the subject covered; on first run, baseline-seed the rest.
  covered[modelKey(subject)] = { name: subject.name, slug, postedAt: post.publishedAt }
  if (!ledger.seeded) {
    for (const m of liveUniq) {
      const k = modelKey(m)
      if (!covered[k]) covered[k] = { name: m.name, slug: null, postedAt: null }
    }
    ledger.seeded = true
  }
  writeLedger(ledger)
  console.log(`Ledger updated: ${Object.keys(covered).length} models tracked (seeded=${ledger.seeded}).`)
  return true
}

async function main() {
  if (DRY_RUN) console.log('[dry-run] no API calls will be made and no files will be written.\n')
  const existingSlugs = getExistingSlugs()
  console.log(`Existing posts: ${existingSlugs.size}`)

  // PRIMARY: a fresh comparison post about a newly-tracked model, grounded in
  // live pricing. Returns true if it produced (or, in dry-run, would produce) one.
  let made = false
  try {
    made = await tryModelComparisonPost(existingSlugs)
  } catch (err) {
    console.error('Model-comparison post failed:', err.message)
    if (!DRY_RUN) process.exit(1)
  }
  if (made) return

  // FALLBACK: legacy curated TOPICS list (currently exhausted → no-op).
  const topic = pickNextTopic(existingSlugs)
  if (!topic) {
    console.log('No new models to cover and all curated topics are published — nothing to generate.')
    return
  }
  console.log(`Generating: "${topic.title}" (slug: ${topic.slug}, category: ${topic.category})`)

  const prompt = buildPrompt(topic)
  console.log('Calling Anthropic API (claude-haiku-4-5)...')

  let resp
  try {
    resp = await callWithRetry(prompt)
  } catch (err) {
    console.error('API call failed after retries:', err.message)
    process.exit(1)
  }

  const { text: raw, stopReason, usage } = resp
  if (usage) {
    console.log(`Usage: input=${usage.input_tokens} output=${usage.output_tokens} stop_reason=${stopReason}`)
  }
  if (stopReason === 'max_tokens') {
    // Output was cut off. Parsing will almost certainly fail with "Unterminated string".
    // Fail loudly so the workflow run is visibly bad and we don't write a half-post.
    console.error('Generation hit max_tokens — output truncated. Bump max_tokens or shorten the prompt.')
    process.exit(1)
  }

  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  let post
  try {
    post = JSON.parse(cleaned)
  } catch (err) {
    console.error('Failed to parse JSON response:', err.message)
    console.error('Raw response (first 500 chars):', raw.slice(0, 500))
    console.error('Raw response (last 500 chars):', raw.slice(-500))
    process.exit(1)
  }

  // Topic table is the source of truth for slug + category. Overwrite whatever the
  // model returned so the post always satisfies the validator's requirements, even if
  // the model misclassifies or omits the field.
  post.slug = topic.slug
  post.category = topic.category
  post.publishedAt = new Date().toISOString()

  const filename = `${post.slug}.json`
  const validationErrors = validateBlogPost(filename, post)
  if (validationErrors.length > 0) {
    console.error('Generated post failed validation; refusing to write:')
    for (const e of validationErrors) console.error(`  - ${e}`)
    process.exit(1)
  }

  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }

  const outPath = path.join(BLOG_DIR, filename)
  fs.writeFileSync(outPath, JSON.stringify(post, null, 2))
  console.log(`Post saved: ${outPath}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
