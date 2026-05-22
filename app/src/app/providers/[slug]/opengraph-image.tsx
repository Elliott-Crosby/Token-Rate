import { renderOGCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getProviderBySlug, getModelsByProvider } from '@/lib/models'

export const alt = 'Provider pricing — TokenRate'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

function fmt(n: number) {
  return '$' + n.toFixed(n < 1 ? 3 : 2)
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const provider = getProviderBySlug(slug)
  if (!provider) {
    return renderOGCard({
      eyebrow: 'Provider',
      title: 'AI Provider Pricing',
      subtitle: 'Side-by-side model costs.',
    })
  }
  const models = getModelsByProvider(slug)
  const cheapest = [...models].sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)[0]
  return renderOGCard({
    eyebrow: 'Provider · API pricing',
    title: `${provider.name} API pricing`,
    subtitle: cheapest
      ? `${models.length} models · from ${fmt(cheapest.inputPricePerMillion)}/1M input tokens`
      : `${models.length} models`,
    badges: models.slice(0, 3).map((m) => m.name),
  })
}
