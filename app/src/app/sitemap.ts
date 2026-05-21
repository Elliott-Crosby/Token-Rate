import type { MetadataRoute } from 'next'
import { ALL_MODELS } from '@/lib/models'
import { ALL_COMPARISONS } from '@/lib/comparisons'
import { ALL_GUIDES } from '@/lib/guides'
import { getAllBlogPosts } from '@/lib/blog'

const BASE = 'https://tokenrate.dev'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/tools/words-to-tokens`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/token-to-usd`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tools/api-cost-estimator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  const modelPages: MetadataRoute.Sitemap = ALL_MODELS.map((model) => ({
    url: `${BASE}/models/${model.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const comparisonPages: MetadataRoute.Sitemap = ALL_COMPARISONS.map((comp) => ({
    url: `${BASE}/compare/${comp.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }))

  const guidePages: MetadataRoute.Sitemap = ALL_GUIDES.map((guide) => ({
    url: `${BASE}/guides/${guide.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const blogPages: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }))

  return [...staticPages, ...modelPages, ...comparisonPages, ...guidePages, ...blogPages]
}
