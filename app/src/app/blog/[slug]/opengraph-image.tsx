import { renderOGCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'
import { getBlogPost } from '@/lib/blog'

export const alt = 'TokenRate blog'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) {
    return renderOGCard({
      eyebrow: 'Blog',
      title: 'TokenRate Blog',
      subtitle: 'AI API pricing, token math, and cost optimization.',
    })
  }
  return renderOGCard({
    eyebrow: post.tags && post.tags.length > 0 ? `Blog · ${post.tags[0]}` : 'Blog',
    title: post.title,
    subtitle: post.description,
  })
}
