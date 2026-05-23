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
