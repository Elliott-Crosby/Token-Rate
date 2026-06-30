import type { Metadata } from 'next'
import type { ModelPricing, ProviderGroup } from '@/lib/types'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import PriceCompareClient from '@/components/PriceCompareClient'
import { PROVIDER_PREFIXES } from '@/lib/models'

export const metadata: Metadata = buildMetadata({
  title: 'Compare AI Token Prices — Multi-Model Price Comparison',
  description:
    'Select specific AI models by provider and compare their token prices side-by-side. See input vs output costs, context windows, and tiers for Claude, GPT, Gemini, Llama, and more.',
  path: '/tools/compare-prices',
})

interface OpenRouterModel {
  id: string
  name: string
  pricing?: { prompt?: string; completion?: string }
  context_length?: number
}

// Derived from the single source of truth in models.ts — keeps this tool in sync
// with the homepage calculator and the model catalogue.
const PROVIDER_MAP = PROVIDER_PREFIXES.map((p) => ({ prefix: p.prefix, label: p.name }))

async function fetchProviderGroups(): Promise<ProviderGroup[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`)

    const json: { data: OpenRouterModel[] } = await res.json()
    const groups: Record<string, ModelPricing[]> = {}
    const seen: Record<string, Set<string>> = {}
    PROVIDER_MAP.forEach(({ label }) => { groups[label] = []; seen[label] = new Set() })

    for (const m of json.data) {
      const entry = PROVIDER_MAP.find(({ prefix }) => m.id.startsWith(prefix))
      if (!entry) continue
      if (!m.pricing?.prompt || !m.pricing?.completion) continue
      const input = parseFloat(m.pricing.prompt)
      const output = parseFloat(m.pricing.completion)
      if (input <= 0 || output <= 0) continue
      const name = m.name.replace(/^[^:]+:\s*/i, '')
      if (seen[entry.label].has(name)) continue
      seen[entry.label].add(name)
      groups[entry.label].push({
        id: m.id, name, provider: entry.label,
        inputPricePerToken: input, outputPricePerToken: output,
        contextLength: m.context_length,
      })
    }

    // Dedupe by label — one provider can map from multiple id-prefixes.
    const emitted = new Set<string>()
    return PROVIDER_MAP.filter(({ label }) => {
      if (emitted.has(label) || groups[label].length === 0) return false
      emitted.add(label)
      return true
    }).map(({ label }) => ({ name: label, models: groups[label].sort((a, b) => b.inputPricePerToken - a.inputPricePerToken) }))
  } catch {
    return []
  }
}

export default async function ComparePricesPage() {
  const providerGroups = await fetchProviderGroups()

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools/words-to-tokens' },
          { label: 'Compare Prices' },
        ]}
      />

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Tool</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
          Compare AI Token Prices
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed max-w-2xl">
          Pick a provider, then select the models you want to compare. Mix and match across Claude,
          GPT, Gemini, Llama, and more — pricing shown side-by-side instantly.
        </p>
      </div>

      <PriceCompareClient providerGroups={providerGroups} />
    </div>
  )
}
