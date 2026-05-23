import { renderOGCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getBlogPost } from '@/lib/blog'
import { getCategory } from '@/lib/categories'

export const alt = 'TokenRate'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  const post = getBlogPost(slug)
  const cat = getCategory(category)
  if (!post || post.category !== category) {
    return renderOGCard({
      eyebrow: 'TokenRate',
      title: 'TokenRate Blog',
      subtitle: 'AI API pricing, token math, and cost optimization.',
    })
  }
  const kindLabel = post.kind === 'guide' ? 'Guide' : 'Article'
  return renderOGCard({
    eyebrow: `${kindLabel} · ${cat?.label ?? category}`,
    title: post.title,
    subtitle: post.description,
  })
}
