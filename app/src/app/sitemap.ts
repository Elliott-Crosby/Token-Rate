import type { MetadataRoute } from 'next'
import { ALL_MODELS, PROVIDERS, MODELS_UPDATED_AT } from '@/lib/models'
import { ALL_COMPARISONS } from '@/lib/comparisons'
import { getAllBlogPosts } from '@/lib/blog'
import { CATEGORIES } from '@/lib/categories'

const BASE = 'https://tokenrate.dev'
const HUB_LAST_MODIFIED = new Date('2026-05-23')

export default function sitemap(): MetadataRoute.Sitemap {
  // Hub pages change whenever their underlying content does, so stamp them with
  // real freshness (newest model/post/comparison) instead of a fixed date. A
  // stale lastModified tells crawlers "nothing new here" and suppresses re-crawl
  // of the very hubs that link to brand-new pages.
  const posts = getAllBlogPosts() // sorted newest-first
  const modelsUpdated = new Date(MODELS_UPDATED_AT)
  const blogUpdated = posts[0]
    ? new Date(posts[0].updatedAt ?? posts[0].publishedAt)
    : HUB_LAST_MODIFIED
  const compareUpdated = ALL_COMPARISONS.reduce(
    (max, c) => (c.updatedAt > max ? c.updatedAt : max),
    '2026-05-23',
  )
  const compareUpdatedDate = new Date(compareUpdated)

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/models`, lastModified: modelsUpdated, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE}/compare`, lastModified: compareUpdatedDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/providers`, lastModified: modelsUpdated, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/blog`, lastModified: blogUpdated, changeFrequency: 'daily', priority: 0.85 },
    { url: `${BASE}/about`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/tools/words-to-tokens`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/token-to-usd`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/api-cost-estimator`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/compare-prices`, lastModified: modelsUpdated, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const providerPages: MetadataRoute.Sitemap = PROVIDERS.map((p) => ({
    url: `${BASE}/providers/${p.slug}`,
    lastModified: HUB_LAST_MODIFIED,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  // Exclude noindex'd variant pages (speed tiers, dated snapshots) so the sitemap
  // only advertises canonical, indexable model pages.
  const modelPages: MetadataRoute.Sitemap = ALL_MODELS.filter((m) => !m.variant).map((model) => ({
    url: `${BASE}/models/${model.slug}`,
    lastModified: new Date(model.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const comparisonPages: MetadataRoute.Sitemap = ALL_COMPARISONS.map((comp) => ({
    url: `${BASE}/compare/${comp.slug}`,
    lastModified: new Date(comp.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/blog/${c.slug}`,
    lastModified: HUB_LAST_MODIFIED,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${BASE}/blog/${post.category}/${post.slug}`,
    lastModified: post.updatedAt
      ? new Date(post.updatedAt)
      : post.publishedAt
        ? new Date(post.publishedAt)
        : new Date('2026-01-01'),
    changeFrequency: 'monthly' as const,
    // Blog posts are deprioritized vs tools/models/hubs so the long tail of
    // posts doesn't dilute crawl budget away from the pages that convert.
    priority: 0.5,
  }))

  return [
    ...staticPages,
    ...providerPages,
    ...modelPages,
    ...comparisonPages,
    ...categoryPages,
    ...blogPages,
  ]
}
