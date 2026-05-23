import type { MetadataRoute } from 'next'

// Explicit allowlist for the major AI crawlers. Listing each bot by name —
// instead of relying on the wildcard rule alone — makes intent machine-readable
// and survives CDN/WAF policies that target unlisted user agents.
const AI_BOTS = [
  // OpenAI
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google AI (separate from Googlebot so site owners can opt in/out)
  'Google-Extended',
  // Microsoft / Bing AI
  'BingBot',
  // Meta
  'Meta-ExternalAgent',
  // Apple Intelligence
  'Applebot-Extended',
  // Common Crawl (training corpus for many LLMs)
  'CCBot',
  // DuckDuckGo AI
  'DuckAssistBot',
  // You.com
  'YouBot',
  // Cohere
  'cohere-ai',
  // Mistral
  'MistralAI-User',
  // Diffbot (used by several AI assistants)
  'Diffbot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: 'https://tokenrate.dev/sitemap.xml',
    host: 'https://tokenrate.dev',
  }
}
