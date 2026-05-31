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

/** A structured comparison table. Built in code from live pricing data (never
 *  authored by the LLM), so the numbers are always accurate. Rendered as a real
 *  HTML table. `rows[0]` is the subject ("new") model and is highlighted. */
export interface ComparisonTable {
  caption?: string
  columns: string[]
  /** Each row must have the same length as `columns`. */
  rows: string[][]
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
  /** Optional data table rendered between the intro and the body sections. */
  comparison?: ComparisonTable
}
