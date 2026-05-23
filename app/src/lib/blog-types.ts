import type { CategorySlug } from './categories'

export interface BlogSection {
  heading: string
  body: string
}

export interface BlogFaq {
  question: string
  answer: string
}

export interface BlogSource {
  label: string
  url: string
  note?: string
}

export interface BlogPost {
  slug: string
  category: CategorySlug
  /** 'guide' renders TLDR + Sources block; 'article' is the default blog layout. */
  kind?: 'article' | 'guide'
  keyword?: string
  title: string
  description: string
  /** Optional answer-first summary rendered above the first section (guide layout). */
  tldr?: string
  readTime: string
  publishedAt: string
  updatedAt?: string
  tags?: string[]
  sections: BlogSection[]
  faq: BlogFaq[]
  ctaText?: string
  sources?: BlogSource[]
  relatedSlugs?: string[]
}
