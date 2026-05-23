import { ALL_BLOG_POSTS } from './blog-catalog.generated'
import type { BlogPost } from './blog-types'

export type { BlogPost, BlogSection, BlogFaq } from './blog-types'

export function getAllBlogPosts(): BlogPost[] {
  return [...ALL_BLOG_POSTS].sort((a, b) =>
    (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
  )
}

export function getBlogPost(slug: string): BlogPost | null {
  return ALL_BLOG_POSTS.find((p) => p.slug === slug) ?? null
}
