export interface BlogSection {
  heading: string
  body: string
}

export interface BlogFaq {
  question: string
  answer: string
}

export interface BlogPost {
  slug: string
  keyword: string
  title: string
  description: string
  readTime: string
  publishedAt: string
  tags: string[]
  sections: BlogSection[]
  faq: BlogFaq[]
  ctaText: string
}
