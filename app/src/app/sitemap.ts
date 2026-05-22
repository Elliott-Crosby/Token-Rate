import type { MetadataRoute } from 'next'
import { ALL_MODELS, PROVIDERS } from '@/lib/models'
import { ALL_COMPARISONS } from '@/lib/comparisons'
import { ALL_GUIDES } from '@/lib/guides'
import { getAllBlogPosts } from '@/lib/blog'

const BASE = 'https://tokenrate.dev'
const HUB_LAST_MODIFIED = new Date('2026-05-22')

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/models`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE}/compare`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/providers`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/guides`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/blog`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${BASE}/about`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/tools/words-to-tokens`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/token-to-usd`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/api-cost-estimator`, lastModified: HUB_LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
  ]

  const providerPages: MetadataRoute.Sitemap = PROVIDERS.map((p) => ({
    url: `${BASE}/providers/${p.slug}`,
    lastModified: HUB_LAST_MODIFIED,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const modelPages: MetadataRoute.Sitemap = ALL_MODELS.map((model) => ({
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

  const guidePages: MetadataRoute.Sitemap = ALL_GUIDES.map((guide) => ({
    url: `${BASE}/guides/${guide.slug}`,
    lastModified: new Date(guide.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date('2026-01-01'),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...staticPages, ...providerPages, ...modelPages, ...comparisonPages, ...guidePages, ...blogPages]
}
