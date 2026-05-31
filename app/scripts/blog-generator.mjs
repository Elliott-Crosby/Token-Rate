#!/usr/bin/env node
/**
 * Generates one new blog post per run using the Anthropic API (Haiku for cost efficiency).
 * Called by .github/workflows/blog-generator.yml every 2 hours.
 *
 * Usage: node scripts/blog-generator.mjs
 * Requires: ANTHROPIC_API_KEY env var
 */

import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import { fileURLToPath } from 'node:url'
import { validateBlogPost } from './_lib/validate-blog-post.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog')
const API_KEY = process.env.ANTHROPIC_API_KEY

if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is not set.')
  process.exit(1)
}

// Valid categories — mirror of CATEGORY_SLUGS in src/lib/categories.ts and validate-blog-post.mjs.
// Keep in sync. Every TOPIC must declare a category from this list, so the validator
// (which requires `category`) is always satisfied even if the model omits the field.
const VALID_CATEGORIES = ['fundamentals', 'comparisons', 'cost-optimization', 'providers', 'building']

const TOPICS = [
  { slug: 'how-to-calculate-openai-api-costs', title: 'How to Calculate Your OpenAI API Costs Before You Ship', category: 'providers' },
  { slug: 'claude-sonnet-vs-gpt4o-cost-comparison', title: 'Claude Sonnet vs GPT-4o: Real-World API Cost Comparison', category: 'comparisons' },
  { slug: 'why-your-llm-bill-is-higher-than-expected', title: 'Why Your LLM Bill Is Higher Than Expected — And How to Fix It', category: 'cost-optimization' },
  { slug: 'token-budgeting-for-production-ai-apps', title: 'Token Budgeting for Production AI Apps', category: 'cost-optimization' },
  { slug: 'gpt4o-mini-vs-claude-haiku-cost', title: 'GPT-4o Mini vs Claude Haiku: Which Is Cheaper for High-Volume Tasks?', category: 'comparisons' },
  { slug: 'understanding-context-windows-api-costs', title: 'Context Windows Explained: What 200K Tokens Really Costs You', category: 'fundamentals' },
  { slug: 'prompt-caching-save-90-percent-on-ai-costs', title: 'Prompt Caching: How to Save Up to 90% on Repeated Context Costs', category: 'cost-optimization' },
  { slug: 'batch-api-cut-ai-costs-in-half', title: 'Batch API Processing: Cut Your AI Costs in Half', category: 'cost-optimization' },
  { slug: 'system-prompts-are-costing-you-money', title: 'System Prompts Are Costing You Money — Here Is How to Optimize Them', category: 'cost-optimization' },
  { slug: 'output-token-pricing-explained', title: 'Output Token Pricing Explained (And Why It Costs More Than Input)', category: 'fundamentals' },
  { slug: 'llm-pricing-trends-2026', title: 'LLM Pricing Trends: How AI Model Costs Changed in 2026', category: 'fundamentals' },
  { slug: 'deepseek-r1-vs-openai-o3-cost', title: 'DeepSeek R1 vs OpenAI o3: Reasoning Model Cost Comparison', category: 'comparisons' },
  { slug: 'how-to-pick-the-right-ai-model-for-your-budget', title: 'How to Pick the Right AI Model for Your Budget', category: 'building' },
  { slug: 'token-usage-auditing-find-hidden-costs', title: 'Token Usage Auditing: Find Hidden Costs in Your AI App', category: 'cost-optimization' },
  { slug: 'anthropic-vs-openai-cheaper-for-startups', title: 'Anthropic Claude vs OpenAI: Which Is Cheaper for Startups?', category: 'comparisons' },
  { slug: 'building-cost-aware-ai-agent', title: 'Building a Cost-Aware AI Agent That Stays Within Budget', category: 'building' },
  { slug: 'mistral-vs-claude-token-pricing', title: 'Mistral vs Claude: Token Pricing Breakdown for 2026', category: 'comparisons' },
  { slug: 'rag-pipeline-cost-optimization', title: 'Building Cost-Efficient RAG Pipelines: Token Strategies That Work', category: 'building' },
  { slug: 'fine-tuning-vs-prompt-engineering-cost', title: 'Fine-Tuning vs Prompt Engineering: A Cost Analysis', category: 'cost-optimization' },
  { slug: 'gemini-flash-vs-gpt4o-mini-budget-model', title: 'Gemini 2.0 Flash vs GPT-4o Mini: The Budget Model Showdown', category: 'comparisons' },
  { slug: 'real-cost-1-million-token-context', title: 'The Real Cost of a 1-Million-Token Context Window', category: 'fundamentals' },
  { slug: 'streaming-vs-batch-ai-cost', title: 'Streaming vs Batch Requests: Which AI API Mode Costs Less?', category: 'comparisons' },
  { slug: 'embedding-models-cost-optimization', title: 'Why Embedding Models Are Underrated for Cutting AI Costs', category: 'cost-optimization' },
  { slug: 'what-happens-when-you-exceed-token-limit', title: 'What Happens When You Exceed Your Token Limit?', category: 'fundamentals' },
  { slug: 'ai-cost-monitor-production', title: 'How to Build a Cost Monitor for Your AI Application', category: 'building' },
  { slug: 'tokens-per-dollar-comparison-2026', title: 'Tokens Per Dollar: Comparing Every Major LLM in 2026', category: 'comparisons' },
  { slug: 'llama-3-vs-claude-haiku-cost', title: 'Llama 3 vs Claude Haiku: Open-Source vs Commercial Cost Tradeoffs', category: 'comparisons' },
  { slug: 'claude-opus-4-worth-the-price', title: 'Is Claude Opus 4 Worth the Price? A Developer Cost Analysis', category: 'providers' },
  { slug: 'multimodal-token-costs-images-vision', title: 'Multimodal Token Costs: What You Pay for Image and Vision APIs', category: 'fundamentals' },
  { slug: 'ai-agent-loops-cost-spiral', title: 'AI Agent Loops and Cost Spirals: How to Keep Agentic Workflows Cheap', category: 'building' },
  { slug: 'openai-o3-mini-cost-reasoning', title: 'OpenAI o3-mini Cost Guide: When Cheap Reasoning Makes Sense', category: 'providers' },
  { slug: 'claude-haiku-4-review-and-pricing', title: 'Claude Haiku 4 Review: Speed, Quality, and Pricing Breakdown', category: 'providers' },
  { slug: 'input-vs-output-token-ratio-optimization', title: 'Optimizing Your Input-to-Output Token Ratio for Lower API Bills', category: 'cost-optimization' },
  { slug: 'per-token-pricing-vs-subscription-ai', title: 'Pay-Per-Token vs AI Subscriptions: Which Is Better for Developers?', category: 'fundamentals' },
  { slug: 'ai-api-cost-for-mvp-startups', title: 'Estimating AI API Costs for Your MVP: A Startup Founders Guide', category: 'cost-optimization' },
  { slug: 'structured-outputs-token-cost-impact', title: 'How Structured Outputs Affect Your Token Count and Cost', category: 'cost-optimization' },
  { slug: 'gpt-4-turbo-vs-gpt-4o-cost', title: 'GPT-4 Turbo vs GPT-4o: A Pricing and Performance Comparison', category: 'comparisons' },
  { slug: 'ai-saas-cost-per-user-calculation', title: 'How to Calculate AI API Cost Per User for Your SaaS Product', category: 'building' },
  { slug: 'claude-extended-thinking-cost-analysis', title: 'Claude Extended Thinking Tokens: Cost Impact and When to Enable It', category: 'providers' },
  { slug: 'token-counting-tools-for-developers', title: 'Token Counting Tools Every LLM Developer Should Know', category: 'building' },
  { slug: 'llm-cost-at-scale-1m-requests', title: 'LLM Costs at Scale: What 1 Million API Requests Actually Costs', category: 'cost-optimization' },
  { slug: 'ai-provider-comparison-2026-cost', title: 'AI Provider Showdown 2026: Pricing, Performance, and Value', category: 'comparisons' },
  { slug: 'reducing-hallucinations-vs-token-cost', title: 'Reducing Hallucinations Without Blowing Your Token Budget', category: 'building' },
  { slug: 'json-mode-token-overhead', title: 'JSON Mode and Structured Outputs: The Hidden Token Overhead', category: 'fundamentals' },
  { slug: 'reasoning-models-worth-the-cost', title: 'Are Reasoning Models Worth the Extra Cost? A Practical Guide', category: 'fundamentals' },
]

function getExistingSlugs() {
  if (!fs.existsSync(BLOG_DIR)) return new Set()
  return new Set(
    fs.readdirSync(BLOG_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
  )
}

function pickNextTopic(existingSlugs) {
  for (const topic of TOPICS) {
    if (!existingSlugs.has(topic.slug)) return topic
  }
  // All curated topics are published — generate nothing.
  //
  // The previous fallback emitted a generic, timestamp-slugged
  // `ai-token-pricing-insights-<ts>` post on every run. With the curated list
  // exhausted, that produced a near-duplicate, ungrounded filler article every
  // 2 hours. Google flagged the site for "Low value content" / scaled content
  // abuse and AdSense review failed. Returning null makes main() exit cleanly.
  //
  // To publish more posts, add real entries to the TOPICS table above.
  return null
}

function callAnthropicAPI(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      // max_tokens: haiku 4.5 caps output at 8192. 2048 was truncating posts mid-JSON
      // (4-6 sections * ~150 words + FAQ + boilerplate routinely exceeds 2k tokens).
      // 6000 gives plenty of headroom while leaving room for the response envelope.
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    })

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            reject(new Error(`Anthropic API error: ${JSON.stringify(parsed.error)}`))
          } else {
            resolve({
              text: parsed.content?.[0]?.text ?? '',
              stopReason: parsed.stop_reason ?? null,
              usage: parsed.usage ?? null,
            })
          }
        } catch (e) {
          reject(new Error(`Failed to parse API response: ${e.message}`))
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function callWithRetry(prompt, attempts = 3) {
  let lastErr
  for (let i = 1; i <= attempts; i++) {
    try {
      return await callAnthropicAPI(prompt)
    } catch (err) {
      lastErr = err
      const transient = /ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|5\d\d/i.test(err.message || '')
      if (!transient || i === attempts) throw err
      const delay = 1000 * 2 ** (i - 1)
      console.warn(`Attempt ${i} failed (${err.message}); retrying in ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw lastErr
}

function buildPrompt(topic) {
  const now = new Date().toISOString()
  return `You are a technical blog writer for TokenRate.dev, a tool that helps developers calculate and compare AI API token costs.

Write a blog post with the title: "${topic.title}"

Return ONLY valid JSON matching this exact structure — no markdown fences, no explanation:

{
  "category": "${topic.category}",
  "slug": "${topic.slug}",
  "keyword": "<primary SEO keyword phrase, 3-6 words>",
  "title": "${topic.title}",
  "description": "<140-160 char meta description>",
  "readTime": "<e.g. 6 min read>",
  "publishedAt": "${now}",
  "tags": ["<tag1>", "<tag2>"],
  "sections": [
    { "heading": "<section heading>", "body": "<100-180 words of plain prose, no markdown>" }
  ],
  "faq": [
    { "question": "<question>", "answer": "<2-3 sentence answer>" }
  ],
  "ctaText": "<1-2 sentence CTA encouraging use of the TokenRate calculator>"
}

Requirements:
- "category" MUST be exactly one of: ${VALID_CATEGORIES.map((c) => `"${c}"`).join(', ')}
- Include 4-5 sections (keep total output under 5000 tokens)
- Include 3-4 FAQ items
- Body text must be plain prose — no bullet points, no markdown headers
- Use real model names, real pricing data, and specific numbers where possible
- Link to internal pages where relevant using paths like /tools/token-to-usd, /tools/api-cost-estimator, /models/<slug>, /compare/<slug>
- Return ONLY raw JSON starting with { and ending with }`
}

async function main() {
  const existingSlugs = getExistingSlugs()
  console.log(`Existing posts: ${existingSlugs.size}`)

  const topic = pickNextTopic(existingSlugs)
  if (!topic) {
    console.log('All curated topics are already published — nothing to generate.')
    console.log('Add new entries to the TOPICS table in this script to publish more posts.')
    return
  }
  console.log(`Generating: "${topic.title}" (slug: ${topic.slug}, category: ${topic.category})`)

  const prompt = buildPrompt(topic)
  console.log('Calling Anthropic API (claude-haiku-4-5)...')

  let resp
  try {
    resp = await callWithRetry(prompt)
  } catch (err) {
    console.error('API call failed after retries:', err.message)
    process.exit(1)
  }

  const { text: raw, stopReason, usage } = resp
  if (usage) {
    console.log(`Usage: input=${usage.input_tokens} output=${usage.output_tokens} stop_reason=${stopReason}`)
  }
  if (stopReason === 'max_tokens') {
    // Output was cut off. Parsing will almost certainly fail with "Unterminated string".
    // Fail loudly so the workflow run is visibly bad and we don't write a half-post.
    console.error('Generation hit max_tokens — output truncated. Bump max_tokens or shorten the prompt.')
    process.exit(1)
  }

  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  let post
  try {
    post = JSON.parse(cleaned)
  } catch (err) {
    console.error('Failed to parse JSON response:', err.message)
    console.error('Raw response (first 500 chars):', raw.slice(0, 500))
    console.error('Raw response (last 500 chars):', raw.slice(-500))
    process.exit(1)
  }

  // Topic table is the source of truth for slug + category. Overwrite whatever the
  // model returned so the post always satisfies the validator's requirements, even if
  // the model misclassifies or omits the field.
  post.slug = topic.slug
  post.category = topic.category
  post.publishedAt = new Date().toISOString()

  const filename = `${post.slug}.json`
  const validationErrors = validateBlogPost(filename, post)
  if (validationErrors.length > 0) {
    console.error('Generated post failed validation; refusing to write:')
    for (const e of validationErrors) console.error(`  - ${e}`)
    process.exit(1)
  }

  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }

  const outPath = path.join(BLOG_DIR, filename)
  fs.writeFileSync(outPath, JSON.stringify(post, null, 2))
  console.log(`Post saved: ${outPath}`)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
