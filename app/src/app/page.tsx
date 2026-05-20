import type { ProviderGroup, ModelPricing } from '@/lib/types'
import ConverterClient from '@/components/ConverterClient'
import ThemeToggle from '@/components/ThemeToggle'

interface OpenRouterModel {
  id: string
  name: string
  pricing?: {
    prompt?: string
    completion?: string
  }
  context_length?: number
}

interface OpenRouterResponse {
  data: OpenRouterModel[]
}

async function fetchAnthropicModels(): Promise<ProviderGroup[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      next: { revalidate: 3600 },
      headers: { 'Accept': 'application/json' },
    })

    if (!res.ok) throw new Error(`OpenRouter returned ${res.status}`)

    const json: OpenRouterResponse = await res.json()

    const anthropic: ModelPricing[] = json.data
      .filter(
        (m) =>
          m.id.startsWith('anthropic/') &&
          m.pricing?.prompt &&
          m.pricing?.completion &&
          parseFloat(m.pricing.prompt) > 0
      )
      .map((m) => ({
        id: m.id,
        name: m.name.replace(/^Anthropic:\s*/i, ''),
        provider: 'Anthropic',
        inputPricePerToken: parseFloat(m.pricing!.prompt!),
        outputPricePerToken: parseFloat(m.pricing!.completion!),
        contextLength: m.context_length,
      }))
      .sort((a, b) => b.inputPricePerToken - a.inputPricePerToken)

    const seen = new Set<string>()
    const deduped = anthropic.filter((m) => {
      if (seen.has(m.name)) return false
      seen.add(m.name)
      return true
    })

    return [{ name: 'Anthropic', models: deduped }]
  } catch {
    return [
      {
        name: 'Anthropic',
        models: [
          {
            id: 'anthropic/claude-opus-4-5',
            name: 'Claude Opus 4.5',
            provider: 'Anthropic',
            inputPricePerToken: 0.000015,
            outputPricePerToken: 0.000075,
          },
          {
            id: 'anthropic/claude-sonnet-4-5',
            name: 'Claude Sonnet 4.5',
            provider: 'Anthropic',
            inputPricePerToken: 0.000003,
            outputPricePerToken: 0.000015,
          },
          {
            id: 'anthropic/claude-haiku-4-5',
            name: 'Claude Haiku 4.5',
            provider: 'Anthropic',
            inputPricePerToken: 0.00000025,
            outputPricePerToken: 0.00000125,
          },
        ],
      },
    ]
  }
}

export default async function Home() {
  const providerGroups = await fetchAnthropicModels()

  return (
    <>
      {/* Accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />

      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Token Conversion Rate
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Live pricing from OpenRouter · ~4 chars per token
              </p>
            </div>
            <ThemeToggle />
          </div>

          <ConverterClient providerGroups={providerGroups} />
        </div>
      </main>
    </>
  )
}
