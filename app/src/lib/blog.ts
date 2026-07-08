import { ALL_BLOG_POSTS } from './blog-catalog.generated'
import type { BlogPost } from './blog-types'
import type { CategorySlug } from './categories'

export type { BlogPost, BlogSection, BlogFaq, BlogSource } from './blog-types'

export function getAllBlogPosts(): BlogPost[] {
  return [...ALL_BLOG_POSTS].sort((a, b) =>
    (b.publishedAt ?? '').localeCompare(a.publishedAt ?? '')
  )
}

export function getBlogPost(slug: string): BlogPost | null {
  return ALL_BLOG_POSTS.find((p) => p.slug === slug) ?? null
}

/** How recent (in days) a post must be to earn the "New" badge, relative to
 *  build/render time. The site rebuilds daily, so this stays current. */
export const NEW_POST_WINDOW_DAYS = 7

/** The newest posts across every category — powers the "Featured & Latest"
 *  strip pinned to the top of the blog index. */
export function getFeaturedPosts(limit = 4): BlogPost[] {
  return getAllBlogPosts().slice(0, limit)
}

/** True when a post was published within the last {@link NEW_POST_WINDOW_DAYS}
 *  days. Drives the "New" badge. */
export function isNewPost(post: BlogPost): boolean {
  if (!post.publishedAt) return false
  const published = new Date(post.publishedAt).getTime()
  if (Number.isNaN(published)) return false
  const ageMs = Date.now() - published
  return ageMs >= 0 && ageMs <= NEW_POST_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

export function getBlogPostsByCategory(category: CategorySlug): BlogPost[] {
  return getAllBlogPosts().filter((p) => p.category === category)
}

/**
 * Build a slug -> category lookup. Used by old-URL redirects to find the
 * canonical new location of a post.
 */
export function getCategoryForSlug(slug: string): CategorySlug | null {
  return getBlogPost(slug)?.category ?? null
}

/** Group all posts by category, in category-definition order. */
export function getPostsGroupedByCategory(): Record<CategorySlug, BlogPost[]> {
  const grouped: Record<string, BlogPost[]> = {}
  for (const post of getAllBlogPosts()) {
    if (!grouped[post.category]) grouped[post.category] = []
    grouped[post.category].push(post)
  }
  return grouped as Record<CategorySlug, BlogPost[]>
}
