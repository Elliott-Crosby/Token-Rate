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

const TOPICS = [
  { slug: 'how-to-calculate-openai-api-costs', title: 'How to Calculate Your OpenAI API Costs Before You Ship' },
  { slug: 'claude-sonnet-vs-gpt4o-cost-comparison', title: 'Claude Sonnet vs GPT-4o: Real-World API Cost Comparison' },
  { slug: 'why-your-llm-bill-is-higher-than-expected', title: 'Why Your LLM Bill Is Higher Than Expected — And How to Fix It' },
  { slug: 'token-budgeting-for-production-ai-apps', title: 'Token Budgeting for Production AI Apps' },
  { slug: 'gpt4o-mini-vs-claude-haiku-cost', title: 'GPT-4o Mini vs Claude Haiku: Which Is Cheaper for High-Volume Tasks?' },
  { slug: 'understanding-context-windows-api-costs', title: 'Context Windows Explained: What 200K Tokens Really Costs You' },
  { slug: 'prompt-caching-save-90-percent-on-ai-costs', title: 'Prompt Caching: How to Save Up to 90% on Repeated Context Costs' },
  { slug: 'batch-api-cut-ai-costs-in-half', title: 'Batch API Processing: Cut Your AI Costs in Half' },
  { slug: 'system-prompts-are-costing-you-money', title: 'System Prompts Are Costing You Money — Here Is How to Optimize Them' },
  { slug: 'output-token-pricing-explained', title: 'Output Token Pricing Explained (And Why It Costs More Than Input)' },
  { slug: 'llm-pricing-trends-2026', title: 'LLM Pricing Trends: How AI Model Costs Changed in 2026' },
  { slug: 'deepseek-r1-vs-openai-o3-cost', title: 'DeepSeek R1 vs OpenAI o3: Reasoning Model Cost Comparison' },
  { slug: 'how-to-pick-the-right-ai-model-for-your-budget', title: 'How to Pick the Right AI Model for Your Budget' },
  { slug: 'token-usage-auditing-find-hidden-costs', title: 'Token Usage Auditing: Find Hidden Costs in Your AI App' },
  { slug: 'anthropic-vs-openai-cheaper-for-startups', title: 'Anthropic Claude vs OpenAI: Which Is Cheaper for Startups?' },
  { slug: 'building-cost-aware-ai-agent', title: 'Building a Cost-Aware AI Agent That Stays Within Budget' },
  { slug: 'mistral-vs-claude-token-pricing', title: 'Mistral vs Claude: Token Pricing Breakdown for 2026' },
  { slug: 'rag-pipeline-cost-optimization', title: 'Building Cost-Efficient RAG Pipelines: Token Strategies That Work' },
  { slug: 'fine-tuning-vs-prompt-engineering-cost', title: 'Fine-Tuning vs Prompt Engineering: A Cost Analysis' },
  { slug: 'gemini-flash-vs-gpt4o-mini-budget-model', title: 'Gemini 2.0 Flash vs GPT-4o Mini: The Budget Model Showdown' },
  { slug: 'real-cost-1-million-token-context', title: 'The Real Cost of a 1-Million-Token Context Window' },
  { slug: 'streaming-vs-batch-ai-cost', title: 'Streaming vs Batch Requests: Which AI API Mode Costs Less?' },
  { slug: 'embedding-models-cost-optimization', title: 'Why Embedding Models Are Underrated for Cutting AI Costs' },
  { slug: 'what-happens-when-you-exceed-token-limit', title: 'What Happens When You Exceed Your Token Limit?' },
  { slug: 'ai-cost-monitor-production', title: 'How to Build a Cost Monitor for Your AI Application' },
  { slug: 'tokens-per-dollar-comparison-2026', title: 'Tokens Per Dollar: Comparing Every Major LLM in 2026' },
  { slug: 'llama-3-vs-claude-haiku-cost', title: 'Llama 3 vs Claude Haiku: Open-Source vs Commercial Cost Tradeoffs' },
  { slug: 'claude-opus-4-worth-the-price', title: 'Is Claude Opus 4 Worth the Price? A Developer Cost Analysis' },
  { slug: 'multimodal-token-costs-images-vision', title: 'Multimodal Token Costs: What You Pay for Image and Vision APIs' },
  { slug: 'ai-agent-loops-cost-spiral', title: 'AI Agent Loops and Cost Spirals: How to Keep Agentic Workflows Cheap' },
  { slug: 'openai-o3-mini-cost-reasoning', title: 'OpenAI o3-mini Cost Guide: When Cheap Reasoning Makes Sense' },
  { slug: 'claude-haiku-4-review-and-pricing', title: 'Claude Haiku 4 Review: Speed, Quality, and Pricing Breakdown' },
  { slug: 'input-vs-output-token-ratio-optimization', title: 'Optimizing Your Input-to-Output Token Ratio for Lower API Bills' },
  { slug: 'per-token-pricing-vs-subscription-ai', title: 'Pay-Per-Token vs AI Subscriptions: Which Is Better for Developers?' },
  { slug: 'ai-api-cost-for-mvp-startups', title: 'Estimating AI API Costs for Your MVP: A Startup Founders Guide' },
  { slug: 'structured-outputs-token-cost-impact', title: 'How Structured Outputs Affect Your Token Count and Cost' },
  { slug: 'gpt-4-turbo-vs-gpt-4o-cost', title: 'GPT-4 Turbo vs GPT-4o: A Pricing and Performance Comparison' },
  { slug: 'ai-saas-cost-per-user-calculation', title: 'How to Calculate AI API Cost Per User for Your SaaS Product' },
  { slug: 'claude-extended-thinking-cost-analysis', title: 'Claude Extended Thinking Tokens: Cost Impact and When to Enable It' },
  { slug: 'token-counting-tools-for-developers', title: 'Token Counting Tools Every LLM Developer Should Know' },
  { slug: 'llm-cost-at-scale-1m-requests', title: 'LLM Costs at Scale: What 1 Million API Requests Actually Costs' },
  { slug: 'ai-provider-comparison-2026-cost', title: 'AI Provider Showdown 2026: Pricing, Performance, and Value' },
  { slug: 'reducing-hallucinations-vs-token-cost', title: 'Reducing Hallucinations Without Blowing Your Token Budget' },
  { slug: 'json-mode-token-overhead', title: 'JSON Mode and Structured Outputs: The Hidden Token Overhead' },
  { slug: 'reasoning-models-worth-the-cost', title: 'Are Reasoning Models Worth the Extra Cost? A Practical Guide' },
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
  const ts = Date.now()
  return {
    slug: `ai-token-pricing-insights-${ts}`,
    title: `AI Token Pricing Insights: What Developers Need to Know in ${new Date().getFullYear()}`,
  }
}

function callAnthropicAPI(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
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
            resolve(parsed.content?.[0]?.text ?? '')
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

function buildPrompt(topic) {
  const now = new Date().toISOString()
  return `You are a technical blog writer for TokenRate.dev, a tool that helps developers calculate and compare AI API token costs.

Write a blog post with the title: "${topic.title}"

Return ONLY valid JSON matching this exact structure — no markdown fences, no explanation:

{
  "slug": "${topic.slug}",
  "keyword": "<primary SEO keyword phrase, 3-6 words>",
  "title": "${topic.title}",
  "description": "<140-160 char meta description>",
  "readTime": "<e.g. 6 min read>",
  "publishedAt": "${now}",
  "tags": ["<tag1>", "<tag2>"],
  "sections": [
    { "heading": "<section heading>", "body": "<100-200 words of plain prose, no markdown>" }
  ],
  "faq": [
    { "question": "<question>", "answer": "<2-4 sentence answer>" }
  ],
  "ctaText": "<1-2 sentence CTA encouraging use of the TokenRate calculator>"
}

Requirements:
- Include 4-6 sections
- Include 3-5 FAQ items
- Body text must be plain prose — no bullet points, no markdown headers
- Use real model names, real pricing data, and specific numbers where possible
- Link to internal pages where relevant using paths like /tools/token-to-usd, /tools/api-cost-estimator, /models/<slug>, /compare/<slug>
- Return ONLY raw JSON starting with { and ending with }`
}

async function main() {
  const existingSlugs = getExistingSlugs()
  console.log(`Existing posts: ${existingSlugs.size}`)

  const topic = pickNextTopic(existingSlugs)
  console.log(`Generating: "${topic.title}" (slug: ${topic.slug})`)

  const prompt = buildPrompt(topic)
  console.log('Calling Anthropic API (claude-haiku-4-5)...')

  let raw
  try {
    raw = await callAnthropicAPI(prompt)
  } catch (err) {
    console.error('API call failed:', err.message)
    process.exit(1)
  }

  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

  let post
  try {
    post = JSON.parse(cleaned)
  } catch (err) {
    console.error('Failed to parse JSON response:', err.message)
    console.error('Raw response (first 500 chars):', raw.slice(0, 500))
    process.exit(1)
  }

  post.slug = topic.slug
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
