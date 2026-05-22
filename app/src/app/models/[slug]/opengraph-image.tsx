import { renderOGCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getModelBySlug } from '@/lib/models'

export const alt = 'Model pricing — TokenRate'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

function fmt(n: number) {
  return '$' + n.toFixed(n < 1 ? 3 : 2)
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const model = getModelBySlug(slug)
  if (!model) {
    return renderOGCard({
      eyebrow: 'Model',
      title: 'AI Model Pricing',
      subtitle: 'Live token costs across major LLM providers.',
    })
  }

  const ctx =
    model.contextWindow >= 1_000_000
      ? `${Math.round(model.contextWindow / 1_000_000)}M context`
      : `${Math.round(model.contextWindow / 1_000)}K context`

  return renderOGCard({
    eyebrow: `${model.provider} · ${model.tier}`,
    title: `${model.name} pricing`,
    subtitle: `${fmt(model.inputPricePerMillion)}/1M input · ${fmt(model.outputPricePerMillion)}/1M output`,
    badges: [ctx, 'Per-token costs', 'Side-by-side compare'],
  })
}
