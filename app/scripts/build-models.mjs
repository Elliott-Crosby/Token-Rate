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

import { writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'src', 'lib', 'models.generated.ts')

// ── Providers we surface (prefix on the OpenRouter id) ──────────────────────
const PROVIDER_META = [
  { prefix: 'anthropic/',  slug: 'anthropic',  name: 'Anthropic' },
  { prefix: 'openai/',     slug: 'openai',     name: 'OpenAI' },
  { prefix: 'google/',     slug: 'google',     name: 'Google' },
  { prefix: 'meta-llama/', slug: 'meta',       name: 'Meta' },
  { prefix: 'deepseek/',   slug: 'deepseek',   name: 'DeepSeek' },
  { prefix: 'mistralai/',  slug: 'mistral',    name: 'Mistral' },
  { prefix: 'x-ai/',       slug: 'xai',        name: 'xAI' },
  { prefix: 'qwen/',       slug: 'qwen',       name: 'Qwen' },
  { prefix: 'cohere/',     slug: 'cohere',     name: 'Cohere' },
  { prefix: 'amazon/',     slug: 'amazon',     name: 'Amazon' },
  { prefix: 'microsoft/',  slug: 'microsoft',  name: 'Microsoft' },
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
  if (/\bo\d(?:[\s-]mini)?\b|deepseek[\s-]?r\d|\br1\b|reason|thinking|qwq/.test(n)) return 'reasoning'
  if (/haiku|flash[\s-]?lite|nano|mini|micro|small|lite|8b|7b|3b|1b|\bphi\b/.test(n)) return 'fast'
  if (/opus|large|405b|70b|72b|\bpro\b|ultra|\bgpt[\s-]?5\b|gemini[\s-]?2[\s-.]?5[\s-]?pro/.test(n)) return 'flagship'
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
  const parts = cleaned.match(/[^.!?]+[.!?]+/g)
  if (!parts) return cleaned.slice(0, 280)
  let out = parts.slice(0, max).join(' ').trim()
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

// ── Fetch + build ─────────────────────────────────────────────────────────────
async function main() {
  const res = await fetch('https://openrouter.ai/api/v1/models', { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
  const json = await res.json()

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

  const header = `// AUTO-GENERATED by scripts/build-models.mjs — DO NOT EDIT BY HAND.
// Regenerated daily from the live OpenRouter model feed.
// Last run: ${today} · ${extras.length} live models · ${Object.keys(livePricing).length} priced endpoints.
import type { ModelData } from './models'

export const LIVE_UPDATED_AT = '${today}'

export const LIVE_PRICING: Record<string, { input: number; output: number; context: number }> = ${JSON.stringify(livePricing, null, 2)}

export const EXTRA_MODELS: ModelData[] = ${JSON.stringify(extras, null, 2)}
`

  writeFileSync(OUT, header, 'utf8')
  console.log(`Wrote ${OUT}`)
  console.log(`  ${extras.length} live models, ${Object.keys(livePricing).length} priced endpoints, dated ${today}`)
}

main().catch((e) => {
  console.error('build-models failed:', e.message)
  // Don't break a deploy if OpenRouter is briefly unreachable — keep the last
  // committed snapshot. Only hard-fail if there's no generated file at all.
  if (existsSync(OUT)) {
    console.error('Keeping existing models.generated.ts')
    process.exit(0)
  }
  process.exit(1)
})
