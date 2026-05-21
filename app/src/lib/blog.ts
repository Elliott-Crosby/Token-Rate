import fs from 'fs'
import path from 'path'

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

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8')
      return JSON.parse(raw) as BlogPost
    })
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
}

export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as BlogPost
}
