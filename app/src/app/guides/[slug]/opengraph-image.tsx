import { renderOGCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getGuideBySlug } from '@/lib/guides'

export const alt = 'TokenRate guide'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) {
    return renderOGCard({
      eyebrow: 'Guide',
      title: 'TokenRate Guide',
      subtitle: 'Practical AI token pricing knowledge.',
    })
  }
  return renderOGCard({
    eyebrow: `Guide · ${guide.readTime}`,
    title: guide.title,
    subtitle: guide.description,
  })
}
