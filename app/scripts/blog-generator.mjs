/**
 * Auto Blog Generator
 *
 * Fetches trending + suggested keywords from Google, picks the best one
 * not yet covered, then uses Claude API to write a full blog post.
 * Output lands in content/drafts/ as JSON. Move to content/blog/ to publish.
 *
 * Required env var: ANTHROPIC_API_KEY
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DRAFTS_DIR = path.join(ROOT, 'content', 'drafts')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')

// Seed queries — what your site is about
const SEED_QUERIES = [
  'llm token pricing',
  'ai api cost',
  'gpt tokens',
  'claude tokens',
  'gemini api pricing',
  'openai api cost calculator',
  'how many tokens',
  'ai model comparison cost',
  'prompt tokens',
  'context window tokens',
  'anthropic claude pricing',
  'chatgpt api pricing 2025',
]

// ── Google Autocomplete ────────────────────────────────────────────────────

async function fetchSuggestions(query) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TokenRate-BlogBot/1.0)' },
    })
    const json = await res.json()
    return json[1] ?? []
  } catch {
    return []
  }
}

// ── Google Trends RSS ──────────────────────────────────────────────────────

async function fetchTrendingKeywords() {
  const url = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US'
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TokenRate-BlogBot/1.0)' },
    })
    const text = await res.text()
    const titles = [...text.matchAll(/<title><!\[CDATA\[(.+?)\]\]><\/title>/g)].map((m) => m[1])
    return titles.slice(0, 20)
  } catch {
    return []
  }
}

// ── Collect & score candidates ─────────────────────────────────────────────

const RELEVANCE_TERMS = [
  'token', 'llm', 'ai', 'gpt', 'claude', 'gemini', 'openai', 'anthropic',
  'api', 'cost', 'price', 'pricing', 'model', 'context', 'prompt', 'inference',
  'chatgpt', 'language model', 'neural', 'embedding', 'fine-tun',
]

function scoreRelevance(keyword) {
  const lower = keyword.toLowerCase()
  return RELEVANCE_TERMS.filter((t) => lower.includes(t)).length
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

function existingSlugs() {
  const slugs = new Set()
  for (const dir of [DRAFTS_DIR, BLOG_DIR]) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.json')) slugs.add(f.replace('.json', ''))
    }
  }
  return slugs
}

async function pickKeyword() {
  const existing = existingSlugs()
  const candidates = new Map() // keyword → score

  // Suggestions from each seed
  for (const seed of SEED_QUERIES) {
    const suggestions = await fetchSuggestions(seed)
    for (const kw of suggestions) {
      const score = scoreRelevance(kw)
      if (score > 0) candidates.set(kw, (candidates.get(kw) ?? 0) + score + 1)
    }
  }

  // Trending topics that match
  const trending = await fetchTrendingKeywords()
  for (const kw of trending) {
    const score = scoreRelevance(kw)
    if (score > 0) candidates.set(kw, (candidates.get(kw) ?? 0) + score + 3) // bonus for trending
  }

  // Sort by score descending, skip already-written slugs
  const sorted = [...candidates.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([kw]) => kw)
    .filter((kw) => !existing.has(slugify(kw)))

  return sorted[0] ?? null
}

// ── Claude API call ────────────────────────────────────────────────────────

async function generateBlogPost(keyword) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const systemPrompt = `You are an expert SEO content writer for TokenRate (tokenrate.dev), a free AI token calculator and pricing comparison tool. You write clear, practical, data-driven blog posts for developers and product managers who use AI APIs.

Your posts:
- Target the specific keyword naturally (in title, first paragraph, subheadings, conclusion)
- Are accurate about AI model pricing and token math
- Link naturally to relevant tools on tokenrate.dev (the main calculator, /tools/words-to-tokens, /tools/token-to-usd, /tools/api-cost-estimator, /models/[slug], /guides/)
- Are written in a confident, direct tone — no fluff, no filler
- Include real numbers and examples where possible
- End with a practical CTA pointing to the TokenRate calculator`

  const userPrompt = `Write a comprehensive SEO blog post targeting this keyword: "${keyword}"

Return ONLY valid JSON matching this exact schema:
{
  "title": "string — compelling H1, includes keyword naturally, under 65 chars for SEO",
  "description": "string — meta description, 140-160 chars, includes keyword, clear value prop",
  "readTime": "string — e.g. '5 min read'",
  "publishedAt": "${new Date().toISOString().split('T')[0]}",
  "tags": ["array", "of", "3-5", "relevant", "tags"],
  "sections": [
    {
      "heading": "string — H2 heading",
      "body": "string — 2-4 paragraphs of prose, can use \\n\\n for paragraph breaks. No markdown headers inside body."
    }
  ],
  "faq": [
    { "question": "string", "answer": "string — 1-2 sentences" }
  ],
  "ctaText": "string — 1 sentence CTA for the TokenRate calculator"
}

Requirements:
- 6-9 sections
- 3-5 FAQ items
- Each section body: 150-300 words
- Total word count: 900-1400 words
- Naturally mention tokenrate.dev tools where relevant (format internal links as: [tool name](/path))
- Include real pricing data if you know it (Claude Sonnet 4: $3/$15 per 1M tokens, GPT-4o: $2.50/$10, Gemini 2.5 Pro: $1.25/$10, etc.)
- Do NOT use markdown formatting inside body strings — plain prose only`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content[0].text.trim()

  // Strip markdown code fences if Claude wraps the JSON
  const jsonText = text.startsWith('```') ? text.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '') : text

  return JSON.parse(jsonText)
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching keyword candidates...')
  const keyword = await pickKeyword()

  if (!keyword) {
    console.log('No new relevant keywords found. Skipping.')
    process.exit(0)
  }

  console.log(`Selected keyword: "${keyword}"`)
  console.log('Generating blog post with Claude...')

  const post = await generateBlogPost(keyword)
  const slug = slugify(post.title ?? keyword)

  const outPath = path.join(DRAFTS_DIR, `${slug}.json`)
  fs.mkdirSync(DRAFTS_DIR, { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify({ slug, keyword, ...post }, null, 2))

  console.log(`Draft saved: content/drafts/${slug}.json`)
  console.log(`Title: ${post.title}`)
  console.log(`Sections: ${post.sections?.length ?? 0} | FAQ: ${post.faq?.length ?? 0}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
