// Daily model-catalog generator.
//
// Fetches the live OpenRouter model feed and emits `src/lib/models.generated.ts`,
// which contains:
//   - LIVE_PRICING:   map of openRouterId -> { input, output, context } (per-1M $)
//                     used by models.ts to refresh the CURATED editorial entries.
//   - EXTRA_MODELS:   every priced model from the major providers that ISN'T already
//                     covered by a curated entry, with auto-generated factual copy.
//   - LIVE_UPDATED_AT: the date this ran (UTC, YYYY-MM-DD).
//
// Run daily via .github/workflows/update-models.yml so the directory, calculator
// and per-model pages stay current without hand-editing models.ts. New model ships
// (e.g. a fresh Claude/GPT/Gemini) appear automatically the next day.

import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'src', 'lib', 'models.generated.ts')

// ── Providers we surface (prefix on the OpenRouter id) ──────────────────────
// MIRROR of PROVIDER_PREFIXES in src/lib/models.ts. This is a standalone Node
// script that runs before the app is built, so it can't import the TS module —
// keep the two lists in step when adding or removing a provider.
const PROVIDER_META = [
  { prefix: 'anthropic/',     slug: 'anthropic',  name: 'Anthropic' },
  { prefix: 'openai/',        slug: 'openai',     name: 'OpenAI' },
  { prefix: 'google/',        slug: 'google',     name: 'Google' },
  { prefix: 'meta-llama/',    slug: 'meta',       name: 'Meta' },
  { prefix: 'deepseek/',      slug: 'deepseek',   name: 'DeepSeek' },
  { prefix: 'mistralai/',     slug: 'mistral',    name: 'Mistral' },
  { prefix: 'x-ai/',          slug: 'xai',        name: 'xAI' },
  { prefix: 'qwen/',          slug: 'qwen',       name: 'Qwen' },
  { prefix: 'cohere/',        slug: 'cohere',     name: 'Cohere' },
  { prefix: 'amazon/',        slug: 'amazon',     name: 'Amazon' },
  { prefix: 'microsoft/',     slug: 'microsoft',  name: 'Microsoft' },
  // ── Expanded provider coverage ────────────────────────────────────────────
  { prefix: 'z-ai/',          slug: 'zhipu',      name: 'Zhipu AI' },
  { prefix: 'moonshotai/',    slug: 'moonshot',   name: 'Moonshot AI' },
  { prefix: 'nvidia/',        slug: 'nvidia',     name: 'NVIDIA' },
  { prefix: 'minimax/',       slug: 'minimax',    name: 'MiniMax' },
  { prefix: 'perplexity/',    slug: 'perplexity', name: 'Perplexity' },
  { prefix: 'nousresearch/',  slug: 'nous',       name: 'Nous Research' },
  // ByteDance ships under two OpenRouter prefixes — both map to one provider.
  { prefix: 'bytedance-seed/', slug: 'bytedance', name: 'ByteDance' },
  { prefix: 'bytedance/',     slug: 'bytedance',  name: 'ByteDance' },
  { prefix: 'arcee-ai/',      slug: 'arcee',      name: 'Arcee AI' },
  { prefix: 'ai21/',          slug: 'ai21',       name: 'AI21 Labs' },
  { prefix: 'rekaai/',        slug: 'reka',       name: 'Reka AI' },
  { prefix: 'ibm-granite/',   slug: 'ibm',        name: 'IBM' },
  { prefix: 'tencent/',       slug: 'tencent',    name: 'Tencent' },
  { prefix: 'inflection/',    slug: 'inflection', name: 'Inflection AI' },
  { prefix: 'liquid/',        slug: 'liquid',     name: 'Liquid AI' },
  { prefix: 'allenai/',       slug: 'allenai',    name: 'Allen Institute for AI' },
  { prefix: 'baidu/',         slug: 'baidu',      name: 'Baidu' },
  { prefix: 'writer/',        slug: 'writer',     name: 'Writer' },
  { prefix: 'upstage/',       slug: 'upstage',    name: 'Upstage' },
]

function providerFor(id) {
  return PROVIDER_META.find((p) => id.startsWith(p.prefix)) || null
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function slugify(id) {
  // strip provider prefix, drop any ":variant" suffix, normalise to kebab-case
  const tail = id.split('/').slice(1).join('/').split(':')[0]
  return tail
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanName(name) {
  // "Anthropic: Claude Opus 4.6" -> "Claude Opus 4.6"
  return name.replace(/^[^:]+:\s*/, '').trim()
}

// A "variant" is a near-duplicate of a primary model — a speed/preview tier or a
// dated snapshot. These get noindex'd (kept in the calculator/directory, excluded
// from the sitemap) so they don't dilute crawl budget with thin duplicate pages.
function isVariant(slug) {
  if (/(^|-)(fast|preview|beta|exp|experimental|online|nitro|thinking|latest|free)(-|$)/.test(slug)) return true
  if (/-20\d{2}(-\d{2})*$/.test(slug)) return true // -2024, -2024-08-06
  if (/-\d{4}$/.test(slug)) return true            // dated snapshots: -2407, -0125, -2501
  return false
}

function detectTier(name, inputPerM) {
  const n = name.toLowerCase()
  if (/\bo[1-9]\b|\bo[1-9][\s-]mini\b|deepseek[\s-]?r\d|\br1\b|reason|thinking|qwq/.test(n)) return 'reasoning'
  if (/haiku|flash|\blite\b|nano|mini|micro|small|8b|7b|3b|1b|\bphi\b/.test(n)) return 'fast'
  if (/opus|fable|large|405b|70b|72b|\bpro\b|ultra|\bmax\b|\bgpt[\s-]?5\b|gpt[\s-]?4\.1|grok[\s-]?[4-9]|gemini[\s-]?[3-9]|gemini[\s-]?2[\s-.]?5[\s-]?pro/.test(n)) return 'flagship'
  if (inputPerM >= 8) return 'flagship'
  if (inputPerM <= 0.3) return 'fast'
  return 'balanced'
}

const OUTPUT_LIMIT_DEFAULT = { reasoning: 64000, flagship: 32000, balanced: 16000, fast: 8192 }

function firstSentences(text, max = 2) {
  if (!text) return ''
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip markdown links
    .trim()
  // Mask the dot inside decimals / version numbers ("4.8", "30.5B", "v2.5") before
  // sentence-splitting, so the splitter doesn't treat it as a sentence boundary and
  // mangle "Claude Opus 4.8" into "Claude Opus 4. 8". Restored verbatim afterward.
  const DOT = '__DOTSEP__'
  const masked = cleaned.replace(/(\d)\.(?=\d)/g, `$1${DOT}`)
  const restore = (s) => s.split(DOT).join('.')
  const parts = masked.match(/[^.!?]+[.!?]+/g)
  if (!parts) {
    const only = restore(masked).trim().replace(/[\s,;:]*\.{2,}\s*$/, '.')
    return only.length > 280 ? only.slice(0, 277).trimEnd() + '…' : only
  }
  const chosen = parts.slice(0, max).map((s) => s.trim())
  // A source description cut off mid-thought ends its last fragment in an ellipsis
  // ("…with reasoning support and…"). Drop that dangling fragment when a complete
  // sentence still remains, rather than terminate it with an awkward bare period.
  while (chosen.length > 1 && /(\.{3,}|…)\s*$/.test(chosen[chosen.length - 1])) chosen.pop()
  let out = restore(chosen.join(' ')).trim()
  // Tidy any trailing ellipsis the source left on the LAST kept sentence, and
  // collapse double spaces introduced by the rejoin.
  out = out.replace(/[\s,;:]*\.{2,}\s*$/, '.').replace(/…\s*$/, '.').replace(/\s{2,}/g, ' ')
  // Single run-on source sentences sometimes get cut mid-clause ("…and improvements
  // across the."). If we're left ending on a dangling function word, trim back to the
  // previous comma boundary so the sentence closes cleanly.
  if (/\b(and|or|with|for|to|of|the|a|an|across|including|by|from|featuring)\.$/i.test(out)) {
    const cut = out.lastIndexOf(',')
    if (cut >= 40) out = out.slice(0, cut).replace(/[\s,;:]+$/, '') + '.'
  }
  if (out.length > 320) out = out.slice(0, 317).trimEnd() + '…'
  return out
}

function fmtCtx(ctx) {
  if (ctx >= 1_000_000) return `${(ctx / 1_000_000).toFixed(0)}M`
  if (ctx >= 1_000) return `${Math.round(ctx / 1_000)}K`
  return String(ctx)
}

const TIER_BLURB = {
  flagship: 'a flagship-tier model built for the most demanding reasoning, coding, and long-form tasks',
  balanced: 'a balanced model that trades a little peak capability for much lower cost and faster responses',
  fast: 'a fast, low-cost model tuned for high-throughput tasks like classification, extraction, and simple chat',
  reasoning: 'a reasoning model that thinks step-by-step before answering, trading latency for accuracy on hard problems',
}

function synthDescription(name, provider, tier, inputPerM, ctx, modality, orDesc) {
  const real = firstSentences(orDesc)
  if (real && real.length > 60) return real
  return `${name} is ${provider}'s ${TIER_BLURB[tier]}. It costs $${inputPerM.toFixed(inputPerM < 1 ? 3 : 2)} per million input tokens with a ${fmtCtx(ctx)}-token context window${modality?.includes('image') ? ' and native image understanding' : ''}.`
}

function synthStrengths(tier, inputPerM, ctx, modality) {
  const s = []
  if (inputPerM <= 0.2) s.push(`Extremely cheap at $${inputPerM.toFixed(3)}/1M input tokens`)
  else if (inputPerM <= 1) s.push(`Affordable at $${inputPerM.toFixed(2)}/1M input tokens`)
  if (ctx >= 1_000_000) s.push(`Massive ${fmtCtx(ctx)}-token context window`)
  else if (ctx >= 200_000) s.push(`Large ${fmtCtx(ctx)}-token context window`)
  if (tier === 'reasoning') s.push('Step-by-step chain-of-thought reasoning')
  if (tier === 'flagship') s.push('Frontier-class quality on complex tasks')
  if (tier === 'fast') s.push('Low latency for high-throughput workloads')
  if (modality?.includes('image')) s.push('Multimodal: understands images as well as text')
  while (s.length < 3) s.push(tier === 'fast' ? 'Cost-effective at scale' : 'Strong general-purpose performance')
  return s.slice(0, 4)
}

function synthWeaknesses(tier, inputPerM, ctx) {
  const w = []
  if (tier === 'flagship' && inputPerM >= 5) w.push('Premium pricing — overkill for simple tasks')
  if (tier === 'fast') w.push('Less capable than flagship models on complex reasoning')
  if (tier === 'reasoning') w.push('Higher latency; reasoning tokens add to output cost')
  if (ctx < 64_000) w.push(`Smaller ${fmtCtx(ctx)}-token context limits long-document use`)
  while (w.length < 2) w.push('Quality and availability can vary by hosting provider')
  return w.slice(0, 3)
}

function synthUseCases(tier, modality) {
  if (tier === 'reasoning') return ['Math and science problems', 'Complex code generation and debugging', 'Multi-step logical analysis', 'Research assistance']
  if (tier === 'fast') return ['High-volume classification', 'Text extraction and summarization', 'Simple chat and Q&A', 'Cost-sensitive pipelines']
  if (tier === 'flagship') return ['Complex research and analysis', 'Advanced coding and architecture', modality?.includes('image') ? 'Multimodal document understanding' : 'Long-form content generation', 'High-stakes production workloads']
  return ['Customer-facing AI apps', 'Code generation and review', 'Content creation at scale', 'Conversational interfaces']
}

// ── Quality scores (Arena Elo + Artificial Analysis) ───────────────────────
// Drives the "most popular" sort. Fetched fresh every run so the ordering tracks
// the live leaderboards. Baked into the catalogue (and re-exported as
// QUALITY_BY_KEY) so production gets AA coverage without the key at runtime —
// the GitHub Action holds AA_API_KEY and bakes the scores in.

function normalizeQ(s) {
  return String(s || '')
    .toLowerCase()
    .split('/').pop()
    .replace(/[._\s]+/g, '-')
    .replace(/-(thinking|preview|instruct|latest|exp|turbo|high|low|medium|chat|reasoning)(-\d+k)?$/g, '')
    .replace(/-\d{4}-\d{2}-\d{2}$/, '')        // -2024-11-20
    .replace(/-\d{8}$/, '')                     // -20251101
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function fetchArenaQuality() {
  const map = new Map()
  try {
    const r = await fetch('https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text')
    if (!r.ok) return map
    const j = await r.json()
    const ELO_MIN = 1150, ELO_MAX = 1600
    for (const m of j.models ?? []) {
      const score = Math.round(Math.min(100, Math.max(0, ((m.score - ELO_MIN) / (ELO_MAX - ELO_MIN)) * 100)))
      const key = normalizeQ(m.model)
      // keep the highest score seen for a normalized key (thinking variants etc.)
      if (key && (!map.has(key) || map.get(key).score < score)) map.set(key, { score, source: 'arena' })
    }
  } catch { /* offline — fall back to baked/static */ }
  return map
}

async function fetchAAQuality() {
  const map = new Map()
  const apiKey = process.env.AA_API_KEY
  if (!apiKey) return map
  try {
    const r = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', {
      headers: { 'x-api-key': apiKey, Accept: 'application/json' },
    })
    if (!r.ok) return map
    const j = await r.json()
    for (const m of j.data ?? []) {
      const raw = m.evaluations?.artificial_analysis_intelligence_index
      if (raw == null) continue
      const entry = { score: Math.round(raw), source: 'aa' }
      const slug = normalizeQ(m.slug)
      const name = normalizeQ(m.name)
      if (slug) map.set(slug, entry)
      if (name && name !== slug) map.set(name, entry)
    }
  } catch { /* ignore */ }
  return map
}

// Recover previously-baked AA scores from the committed file. Lets a build run
// WITHOUT AA_API_KEY (Vercel, local dev) keep the gold-standard scores the daily
// Action baked in, instead of regressing to Arena-only coverage.
function readPriorAAQuality() {
  const map = new Map()
  if (!existsSync(OUT)) return map
  try {
    const text = readFileSync(OUT, 'utf8')
    const m = text.match(/QUALITY_BY_KEY[^=]*=\s*(\{[\s\S]*?\})\s*\n\nexport const EXTRA_MODELS/)
    if (!m) return map
    const obj = JSON.parse(m[1])
    for (const [k, v] of Object.entries(obj)) {
      if (v?.source === 'aa' && typeof v.score === 'number') map.set(k, v)
    }
  } catch { /* ignore — just means no prior AA data */ }
  return map
}

function lookupQ(map, id, name) {
  const idKey = normalizeQ(id)
  const nameKey = normalizeQ(name)
  // 1. exact match (version preserved — no minor-version conflation)
  if (idKey && map.has(idKey)) return map.get(idKey)
  if (nameKey && map.has(nameKey)) return map.get(nameKey)
  // 2. version-stripped exact (claude-opus-4-8 -> claude-opus-4) as a softer match
  const idBase = idKey.replace(/-\d+$/, '')
  const nameBase = nameKey.replace(/-\d+$/, '')
  if (idBase && map.has(idBase)) return map.get(idBase)
  if (nameBase && map.has(nameBase)) return map.get(nameBase)
  return null
}

// ── Fetch + build ─────────────────────────────────────────────────────────────
async function main() {
  const [res, arenaQ, aaQ] = await Promise.all([
    fetch('https://openrouter.ai/api/v1/models', { headers: { Accept: 'application/json' } }),
    fetchArenaQuality(),
    fetchAAQuality(),
  ])
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
  const json = await res.json()

  // Merge: prior baked AA (preserved when this run has no key) ← live Arena ←
  // fresh AA. Fresh AA, when available, overwrites the preserved snapshot.
  const qualityMap = new Map(readPriorAAQuality())
  for (const [k, v] of arenaQ) qualityMap.set(k, v)
  for (const [k, v] of aaQ) qualityMap.set(k, v)

  const today = new Date().toISOString().slice(0, 10)

  const livePricing = {}        // id -> { input, output, context }
  const extras = []             // synthesized ModelData
  const seenSlug = new Set()

  for (const m of json.data) {
    const prov = providerFor(m.id)
    if (!prov) continue
    if (!m.pricing?.prompt || !m.pricing?.completion) continue
    const input = parseFloat(m.pricing.prompt) * 1_000_000
    const output = parseFloat(m.pricing.completion) * 1_000_000
    if (!(input > 0) || !(output > 0)) continue

    const ctx = m.context_length || m.top_provider?.context_length || 128000
    livePricing[m.id] = {
      input: Number(input.toFixed(4)),
      output: Number(output.toFixed(4)),
      context: ctx,
    }

    const slug = slugify(m.id)
    if (seenSlug.has(slug)) continue
    seenSlug.add(slug)

    const name = cleanName(m.name)
    const tier = detectTier(name, input)
    const modality = m.architecture?.modality || ''
    const outputLimit = m.top_provider?.max_completion_tokens || OUTPUT_LIMIT_DEFAULT[tier]
    const q = lookupQ(qualityMap, m.id, name)

    extras.push({
      slug,
      name,
      provider: prov.name,
      providerSlug: prov.slug,
      inputPricePerMillion: Number(input.toFixed(4)),
      outputPricePerMillion: Number(output.toFixed(4)),
      contextWindow: ctx,
      outputLimit,
      tier,
      updatedAt: today,
      description: synthDescription(name, prov.name, tier, input, ctx, modality, m.description),
      strengths: synthStrengths(tier, input, ctx, modality),
      weaknesses: synthWeaknesses(tier, input, ctx),
      useCases: synthUseCases(tier, modality),
      relatedSlugs: [],
      openRouterIds: [m.id],
      auto: true,
      variant: isVariant(slug),
      ...(q ? { qualityIndex: q.score, qualitySource: q.source } : {}),
    })
  }

  // Second pass: fill relatedSlugs with up to 3 same-provider neighbours.
  const byProvider = {}
  for (const e of extras) (byProvider[e.providerSlug] ||= []).push(e)
  for (const e of extras) {
    e.relatedSlugs = (byProvider[e.providerSlug] || [])
      .filter((o) => o.slug !== e.slug)
      .sort((a, b) => Math.abs(a.inputPricePerMillion - e.inputPricePerMillion) - Math.abs(b.inputPricePerMillion - e.inputPricePerMillion))
      .slice(0, 3)
      .map((o) => o.slug)
  }

  extras.sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)

  // Quality map for runtime lookup (normalized key -> {score, source}). Includes
  // AA scores when the Action ran with AA_API_KEY, so production gets full
  // coverage without holding the key itself.
  const qualityByKey = {}
  for (const [k, v] of qualityMap) qualityByKey[k] = v

  const scored = extras.filter((e) => e.qualityIndex != null).length

  const header = `// AUTO-GENERATED by scripts/build-models.mjs — DO NOT EDIT BY HAND.
// Regenerated daily from the live OpenRouter model feed + quality leaderboards.
// Last run: ${today} · ${extras.length} live models · ${scored} with quality scores.
import type { ModelData } from './models'

export const LIVE_UPDATED_AT = '${today}'

export const LIVE_PRICING: Record<string, { input: number; output: number; context: number }> = ${JSON.stringify(livePricing, null, 2)}

export const QUALITY_BY_KEY: Record<string, { score: number; source: 'arena' | 'aa' }> = ${JSON.stringify(qualityByKey, null, 2)}

export const EXTRA_MODELS: ModelData[] = ${JSON.stringify(extras, null, 2)}
`

  writeFileSync(OUT, header, 'utf8')
  console.log(`Wrote ${OUT}`)
  console.log(`  ${extras.length} live models, ${scored} scored, ${Object.keys(qualityByKey).length} quality keys, dated ${today}`)
}

// How old the committed snapshot may get before we treat the feed as broken.
// The catalog is regenerated on every dev start, build, and Vercel deploy, plus a
// daily GitHub Action — so anything beyond a couple of days means the live fetch
// has been silently failing and the data is genuinely rotting.
const MAX_STALE_DAYS = 3

// Days between the existing snapshot's LIVE_UPDATED_AT and today. null if unknown.
function snapshotAgeDays() {
  try {
    const text = readFileSync(OUT, 'utf8')
    const m = text.match(/LIVE_UPDATED_AT\s*=\s*'(\d{4}-\d{2}-\d{2})'/)
    if (!m) return null
    const then = new Date(m[1] + 'T00:00:00Z').getTime()
    const now = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime()
    return Math.round((now - then) / 86_400_000)
  } catch {
    return null
  }
}

main().catch((e) => {
  console.error('build-models failed:', e.message)
  // Don't break a deploy if OpenRouter is briefly unreachable — keep the last
  // committed snapshot. Only hard-fail if there's no generated file at all.
  if (existsSync(OUT)) {
    const age = snapshotAgeDays()
    console.error(`Keeping existing models.generated.ts (snapshot is ${age ?? '?'} day(s) old)`)
    // In the daily GitHub Action, fail loudly once the snapshot is rotting so the
    // run goes red and we actually notice the dead feed — but never break a Vercel
    // deploy or a local dev start over a transient OpenRouter hiccup.
    if (process.env.GITHUB_ACTIONS && age != null && age > MAX_STALE_DAYS) {
      console.error(`::error::Model catalog is ${age} days stale (> ${MAX_STALE_DAYS}) — the live feed has been failing. Investigate OpenRouter access.`)
      process.exit(1)
    }
    process.exit(0)
  }
  process.exit(1)
})
