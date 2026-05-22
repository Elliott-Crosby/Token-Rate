import type { ModelData } from './models'

interface OpenRouterModel {
  id: string
  name: string
  pricing?: { prompt?: string; completion?: string }
  context_length?: number
}

export interface LivePricing {
  inputPricePerMillion: number
  outputPricePerMillion: number
  source: 'openrouter'
  openRouterId: string
}

interface OpenRouterResponse {
  data: OpenRouterModel[]
}

let cached: Map<string, LivePricing> | null = null

async function fetchOpenRouter(): Promise<Map<string, LivePricing>> {
  if (cached) return cached
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
    const json = (await res.json()) as OpenRouterResponse
    const map = new Map<string, LivePricing>()
    for (const m of json.data) {
      if (!m.pricing?.prompt || !m.pricing?.completion) continue
      const input = parseFloat(m.pricing.prompt)
      const output = parseFloat(m.pricing.completion)
      if (!(input > 0) || !(output > 0)) continue
      map.set(m.id, {
        inputPricePerMillion: input * 1_000_000,
        outputPricePerMillion: output * 1_000_000,
        source: 'openrouter',
        openRouterId: m.id,
      })
    }
    cached = map
    return map
  } catch {
    return new Map()
  }
}

export async function getLivePricing(model: ModelData): Promise<LivePricing | null> {
  if (!model.openRouterIds || model.openRouterIds.length === 0) return null
  const map = await fetchOpenRouter()
  for (const id of model.openRouterIds) {
    const hit = map.get(id)
    if (hit) return hit
  }
  return null
}

export function resolveModelPricing(model: ModelData, live: LivePricing | null) {
  if (!live) {
    return {
      inputPricePerMillion: model.inputPricePerMillion,
      outputPricePerMillion: model.outputPricePerMillion,
      source: 'static' as const,
    }
  }
  return {
    inputPricePerMillion: live.inputPricePerMillion,
    outputPricePerMillion: live.outputPricePerMillion,
    source: 'live' as const,
  }
}
