import { renderOGCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getComparisonBySlug, getComparisonModels } from '@/lib/comparisons'

export const alt = 'AI model comparison — TokenRate'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comp = getComparisonBySlug(slug)
  if (!comp) {
    return renderOGCard({
      eyebrow: 'Compare',
      title: 'AI Model Comparison',
      subtitle: 'Side-by-side pricing, context, and capability.',
    })
  }

  const models = getComparisonModels(comp)
  const badges = models.slice(0, 3).map((m) => m.name)

  return renderOGCard({
    eyebrow: 'Side-by-side comparison',
    title: comp.title,
    subtitle: comp.description,
    badges,
  })
}
