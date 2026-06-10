/** Fetches model quality scores from ArtificialAnalysis (if AA_API_KEY is set)
 *  and/or the Arena AI leaderboard (no auth). Results are merged and cached for
 *  the same 1-hour window as OpenRouter pricing. */

import { QUALITY_BY_KEY } from './models.generated'

export type QualitySource = 'aa' | 'arena'

export interface QualityEntry {
  score: number          // 0–100 normalised
  source: QualitySource
}

// ── normalisation helpers ────────────────────────────────────────────────────

/** Canonical key for looking up a model in the quality map.
 *  Works on both human-readable names and OpenRouter-style IDs. */
function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .split('/').pop()!                              // strip provider prefix (anthropic/...)
    .replace(/[._\s]+/g, '-')                       // dots/spaces → hyphens
    .replace(/-(thinking|preview|instruct|latest|exp|turbo)$/g, '') // strip common suffixes
    .replace(/-\d{4}-\d{2}-\d{2}$/, '')            // strip date suffix -2024-11-20
    .replace(/[^a-z0-9-]/g, '')                     // remove anything else weird
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Like normalizeKey but also strips the trailing minor-version segment
 *  so "claude-opus-4-5" → "claude-opus-4" matching wulong "claude-opus-4-6". */
function normalizeId(id: string): string {
  return normalizeKey(id).replace(/-\d+$/, '')
}

// ── source fetchers ──────────────────────────────────────────────────────────

async function fetchAA(): Promise<Map<string, QualityEntry>> {
  const map = new Map<string, QualityEntry>()
  const apiKey = process.env.AA_API_KEY
  if (!apiKey) return map

  try {
    const res = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', {
      next: { revalidate: 3600 },
      headers: { 'x-api-key': apiKey, Accept: 'application/json' },
    })
    if (!res.ok) return map

    const json = await res.json()
    for (const m of json.data ?? []) {
      const raw = m.evaluations?.artificial_analysis_intelligence_index
      if (raw == null) continue
      const entry: QualityEntry = { score: Math.round(raw), source: 'aa' }
      const slug = normalizeKey(m.slug ?? '')
      const name = normalizeKey(m.name ?? '')
      if (slug) map.set(slug, entry)
      if (name && name !== slug) map.set(name, entry)
    }
  } catch { /* ignore */ }

  return map
}

async function fetchArena(): Promise<Map<string, QualityEntry>> {
  const map = new Map<string, QualityEntry>()

  try {
    const res = await fetch(
      'https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text',
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return map

    const json = await res.json()
    const models: { model: string; score: number }[] = json.models ?? []

    // Normalise Elo to 0-100 using a broad empirical range.
    // Best current models ~1500-1520; weaker tracked ones ~1350-1400.
    const ELO_MIN = 1150
    const ELO_MAX = 1600

    for (const m of models) {
      const normalised = Math.round(
        Math.min(100, Math.max(0, ((m.score - ELO_MIN) / (ELO_MAX - ELO_MIN)) * 100)),
      )
      const key = normalizeKey(m.model)
      if (key) map.set(key, { score: normalised, source: 'arena' })
    }
  } catch { /* ignore */ }

  return map
}

// ── Static fallback ──────────────────────────────────────────────────────────
// Curated quality scores for popular models that fall OUTSIDE Arena's top-20
// leaderboard. Scores are approximate, scaled to match Artificial Analysis's
// intelligence index (0–100, based on MMLU-Pro/GPQA/MATH/HumanEval/IFEval).
// Sourced from publicly reported benchmark results. Updated 2026-05.
const STATIC_FALLBACK: Record<string, number> = {
  // ── OpenAI ──
  'gpt-5':                     78, // older non-Arena-tracked variants
  'gpt-5-mini':                68,
  'gpt-5-nano':                55,
  'gpt-4-1':                   62,
  'gpt-4-1-mini':              52,
  'gpt-4o':                    64,
  'gpt-4o-mini':               51,
  'gpt-4-turbo':               58,
  'gpt-3-5-turbo':             35,
  'o1':                        78,
  'o1-mini':                   65,
  'o3':                        82,
  'o3-mini':                   72,
  'o4-mini':                   75,

  // ── Anthropic ──
  'claude-fable-5':            74,
  'claude-opus-4-8':           73,
  'claude-opus-4-7':           76,
  'claude-opus-4-6':           78,
  'claude-opus-4-5':           72,
  'claude-opus-4-1':           70,
  'claude-opus-4':             68,
  'claude-sonnet-4-7':         80,
  'claude-sonnet-4-6':         78,
  'claude-sonnet-4-5':         75,
  'claude-sonnet-4':           72,
  'claude-haiku-4-5':          65,
  'claude-haiku-4':            60,
  'claude-3-7-sonnet':         70,
  'claude-3-5-sonnet':         65,
  'claude-3-5-haiku':          55,
  'claude-3-opus':             52,
  'claude-3-sonnet':           38,
  'claude-3-haiku':            30,

  // ── Google ──
  'gemini-2-5-pro':            76,
  'gemini-2-5-flash':          66,
  'gemini-2-5-flash-lite':     55,
  'gemini-2-0-flash':          55,
  'gemini-2-0-flash-lite':     45,
  'gemini-2-0-pro':            66,
  'gemini-1-5-pro':            56,
  'gemini-1-5-flash':          46,
  'gemini-1-5-flash-8b':       38,

  // ── Meta ──
  'llama-4-maverick':          62,
  'llama-4-scout':             55,
  'llama-3-3-70b':             52,
  'llama-3-1-405b':            56,
  'llama-3-1-70b':             47,
  'llama-3-1-8b':              30,
  'llama-3-70b':               44,
  'llama-3-8b':                26,
  'llama-3-2-90b':             40,
  'llama-3-2-11b':             32,
  'llama-3-2-3b':              22,
  'llama-3-2-1b':              15,

  // ── DeepSeek ──
  'deepseek-v3':               65,
  'deepseek-r1':               73,
  'deepseek-chat':             60,
  'deepseek-coder':            55,
  'deepseek-v2-5':             52,

  // ── Mistral ──
  'mistral-large':             51,
  'mistral-large-2407':        50,
  'mistral-medium':            48,
  'mistral-small':             42,
  'mistral-nemo':              38,
  'mixtral-8x22b':             40,
  'mixtral-8x7b':              30,
  'codestral':                 50,
  'pixtral-large':             52,
  'ministral-8b':              35,
  'ministral-3b':              28,

  // ── xAI ──
  'grok-4':                    78,
  'grok-3':                    65,
  'grok-3-mini':               55,
  'grok-2':                    50,
  'grok-beta':                 45,

  // ── Qwen (Alibaba) ──
  'qwen-2-5-72b':              53,
  'qwen-2-5-coder-32b':        58,
  'qwen-2-5-32b':              48,
  'qwen-2-5-14b':              42,
  'qwen-2-5-7b':               36,
}

function buildStaticMap(): Map<string, QualityEntry> {
  const map = new Map<string, QualityEntry>()
  for (const [k, score] of Object.entries(STATIC_FALLBACK)) {
    // store under normalized key (and normalizeId variant) so lookup matches
    const norm = normalizeKey(k)
    map.set(norm, { score, source: 'aa' })
    // also store version-stripped variant for fuzzier matching
    map.set(norm.replace(/-\d+$/, ''), { score, source: 'aa' })
  }
  return map
}

// ── public API ───────────────────────────────────────────────────────────────

let _cache: Map<string, QualityEntry> | null = null

export async function getQualityMap(): Promise<Map<string, QualityEntry>> {
  if (_cache) return _cache

  const [aaMap, arenaMap] = await Promise.all([fetchAA(), fetchArena()])
  const staticMap = buildStaticMap()

  // Daily snapshot baked by the model generator (Arena + AA-via-CI). Gives full,
  // up-to-date coverage at runtime even though production has no AA_API_KEY.
  const bakedMap = new Map<string, QualityEntry>()
  for (const [k, v] of Object.entries(QUALITY_BY_KEY)) {
    bakedMap.set(k, { score: v.score, source: v.source })
  }

  // Precedence (low → high): static baseline ← daily baked snapshot ←
  // live Arena Elo ← live AA (gold standard). Later sources overwrite earlier.
  const merged = new Map<string, QualityEntry>(staticMap)
  for (const [k, v] of bakedMap) merged.set(k, v)
  for (const [k, v] of arenaMap) merged.set(k, v)
  for (const [k, v] of aaMap)    merged.set(k, v)

  _cache = merged
  return merged
}

export function lookupQuality(
  map: Map<string, QualityEntry>,
  modelId: string,
  modelName: string,
): QualityEntry | null {
  // Full keys preserve the minor version so "claude-opus-4.8" doesn't collapse
  // onto "claude-opus-4" before we've tried an exact match.
  const idFull   = normalizeKey(modelId)
  const nameFull = normalizeKey(modelName)
  const idBase   = normalizeId(modelId)    // version-stripped, for fuzzy fallback
  const nameBase = normalizeId(modelName)

  // 1. Exact match on the version-preserving key (most precise).
  if (idFull   && map.has(idFull))   return map.get(idFull)!
  if (nameFull && map.has(nameFull)) return map.get(nameFull)!

  // 2. Exact match on the version-stripped key (e.g. dated snapshot → base model).
  if (idBase   && map.has(idBase))   return map.get(idBase)!
  if (nameBase && map.has(nameBase)) return map.get(nameBase)!

  // 3. Prefix / substring match (last resort for minor key drift). Prefer the
  // longest matching key so we don't grab an unrelated shorter prefix.
  let best: QualityEntry | null = null
  let bestLen = 0
  for (const [k, v] of map) {
    if (!k) continue
    const hit =
      (idFull   && (idFull.startsWith(k)   || k.startsWith(idFull)))   ||
      (nameFull && (nameFull.startsWith(k) || k.startsWith(nameFull)))
    if (hit && k.length > bestLen) { best = v; bestLen = k.length }
  }
  return best
}
