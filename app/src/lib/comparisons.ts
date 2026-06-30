import type { ModelData } from './models'
import { getModelBySlug } from './models'

export interface ComparisonData {
  slug: string
  title: string
  description: string
  modelSlugs: string[]
  verdict: string
  winnerSlug?: string
  tags: string[]
  updatedAt: string
}

const U = '2026-05-22'

export const ALL_COMPARISONS: ComparisonData[] = [
  {
    slug: 'claude-sonnet-5-vs-opus-4-8',
    title: 'Claude Sonnet 5 vs Claude Opus 4.8',
    description:
      'Anthropic says Sonnet 5 closes the gap with Opus 4.8 — at a fraction of the price. Compare pricing, agentic coding and knowledge-work benchmarks, and context window.',
    modelSlugs: ['claude-sonnet-5', 'claude-opus-4-8'],
    verdict:
      "On knowledge work the two are effectively tied (Anthropic's Elo: Sonnet 5 1618 vs Opus 4.8 1615), yet Sonnet 5 costs ~40% less at the standard rate ($3/$15 vs $5/$25) and ~60% less during the launch promo ($2/$10 through Aug 31, 2026). Opus 4.8 still leads on agentic coding (69.2% vs 63.2%) and on some alignment metrics, so it remains the pick for the hardest engineering and highest-stakes autonomous work. For most workloads, Sonnet 5 is the better value.",
    winnerSlug: 'claude-sonnet-5',
    tags: ['anthropic', 'flagship', 'balanced', 'agents'],
    updatedAt: '2026-06-30',
  },
  {
    slug: 'claude-sonnet-5-vs-sonnet-4-6',
    title: 'Claude Sonnet 5 vs Claude Sonnet 4.6',
    description:
      'Sonnet 5 is a substantial upgrade over Sonnet 4.6 at the same standard price. Compare the benchmark jump, safety improvements, and context window.',
    modelSlugs: ['claude-sonnet-5', 'claude-sonnet-4-6'],
    verdict:
      'Sonnet 5 beats Sonnet 4.6 on every benchmark Anthropic published — agentic coding rises 58.1% to 63.2% and knowledge work jumps 1395 to 1618 — while costing the same after the promo ($3/$15) and less during it. It is also safer in agentic settings, with better prompt-injection resistance and less hallucination. Both share a 1M-token context window, so the migration is low-risk: a near-drop-in upgrade.',
    winnerSlug: 'claude-sonnet-5',
    tags: ['anthropic', 'balanced', 'agents', 'upgrade'],
    updatedAt: '2026-06-30',
  },
  {
    slug: 'gpt-4o-vs-claude-sonnet-4',
    title: 'GPT-4o vs Claude Sonnet 4',
    description:
      'Side-by-side comparison of GPT-4o and Claude Sonnet 4 on pricing, context length, strengths, and best use cases.',
    modelSlugs: ['gpt-4o', 'claude-sonnet-4'],
    verdict:
      "Claude Sonnet 4 is slightly cheaper on input ($3 vs $2.50/1M, where GPT-4o wins on input cost) but both are close in quality. GPT-4o wins on multimodal tasks (native image/audio); Claude Sonnet 4 wins on nuanced long-form writing and 200K vs 128K context.",
    tags: ['anthropic', 'openai', 'balanced'],
    updatedAt: U,
  },
  {
    slug: 'cheapest-ai-models',
    title: 'Cheapest AI Models in 2026',
    description:
      'Ranked list of the most affordable large language models available via API, with pricing, context windows, and quality notes.',
    modelSlugs: ['llama-3-1-8b', 'gemini-1-5-flash', 'gemini-2-0-flash', 'mistral-nemo', 'gpt-4o-mini', 'claude-haiku-4', 'mistral-small'],
    verdict:
      'Llama 3.1 8B is the cheapest hosted model at ~$0.05/1M input tokens. Gemini 1.5 Flash ($0.075) and Gemini 2.0 Flash ($0.10) are the cheapest with a 1M context window. For quality-per-dollar with broader ecosystem support, GPT-4o mini and Claude Haiku 4 are strong choices.',
    tags: ['budget', 'cost', 'all-providers'],
    updatedAt: U,
  },
  {
    slug: 'claude-opus-4-vs-gpt-o3',
    title: 'Claude Opus 4 vs OpenAI o3',
    description:
      'Compare the two most powerful AI models from Anthropic and OpenAI — Claude Opus 4 and OpenAI o3 — on price, reasoning, and real-world tasks.',
    modelSlugs: ['claude-opus-4', 'gpt-o3'],
    verdict:
      'Both are flagship-tier models. o3 has an edge on math/science benchmarks via chain-of-thought reasoning. Claude Opus 4 excels at nuanced writing, instruction-following, and longer context utilization. o3 input is cheaper ($10 vs $15/1M) but output costs less ($40 vs $75/1M).',
    winnerSlug: undefined,
    tags: ['flagship', 'reasoning', 'anthropic', 'openai'],
    updatedAt: U,
  },
  {
    slug: 'gemini-flash-vs-claude-haiku',
    title: 'Gemini Flash vs Claude Haiku 4',
    description:
      'Which fast, cheap AI model is best for production? Compare Google Gemini 2.0 Flash vs Anthropic Claude Haiku 4.',
    modelSlugs: ['gemini-2-0-flash', 'claude-haiku-4'],
    verdict:
      "Gemini 2.0 Flash is cheaper ($0.10 vs $0.25/1M input) and has a 1M context window vs Haiku's 200K. Claude Haiku is more instruction-consistent and has stronger Anthropic ecosystem support. For raw cost efficiency on large documents, Gemini Flash wins.",
    winnerSlug: 'gemini-2-0-flash',
    tags: ['fast', 'budget', 'google', 'anthropic'],
    updatedAt: U,
  },
  {
    slug: 'best-models-for-coding',
    title: 'Best AI Models for Coding in 2026',
    description:
      'Ranked comparison of the best large language models for code generation, debugging, and software development tasks.',
    modelSlugs: ['gpt-o3', 'claude-sonnet-4', 'deepseek-v3', 'gpt-4o', 'gemini-2-5-pro', 'codestral'],
    verdict:
      'For coding: o3 and Claude Sonnet 4 lead on most code benchmarks. o3 excels at hard algorithmic problems; Claude Sonnet 4 is better for long-context codebase understanding. DeepSeek V3 is the value pick at a fraction of the cost. Gemini 2.5 Pro shines when you need to process an entire codebase in one context, and Codestral is the cheapest code-specialized option.',
    tags: ['coding', 'development', 'all-providers'],
    updatedAt: U,
  },
  {
    slug: 'deepseek-v3-vs-gpt-4o',
    title: 'DeepSeek V3 vs GPT-4o',
    description:
      'The cost vs ecosystem comparison: DeepSeek V3 delivers GPT-4o-class quality on benchmarks at a fraction of the price. When does the cheap option win?',
    modelSlugs: ['deepseek-v3', 'gpt-4o'],
    verdict:
      'On pure cost per token, DeepSeek V3 wins by ~10×. On general English quality the gap is small. GPT-4o still wins on multimodal, broader ecosystem support, function-calling stability, and enterprise compliance. Use DeepSeek when cost is paramount and the workload is text-only and English/Chinese.',
    winnerSlug: 'deepseek-v3',
    tags: ['budget', 'open-source', 'deepseek', 'openai'],
    updatedAt: U,
  },
  {
    slug: 'open-source-vs-proprietary-llms',
    title: 'Open-Source vs Proprietary LLMs',
    description:
      'Llama 3.1 405B, DeepSeek V3, and Mistral Large vs the proprietary frontier (Claude Opus 4, GPT-4o, Gemini 2.5 Pro) — pricing, self-hosting, and quality trade-offs.',
    modelSlugs: ['llama-3-1-405b', 'deepseek-v3', 'mistral-large', 'claude-opus-4', 'gpt-4o', 'gemini-2-5-pro'],
    verdict:
      'Open-weight models close the quality gap further every quarter. For most production text tasks, Llama 3.1 405B and DeepSeek V3 deliver 80-95% of frontier quality at a fraction of the price — and crucially, with the option to self-host. Proprietary models still lead on multimodal, function calling reliability, and the very hardest reasoning.',
    tags: ['open-source', 'flagship', 'self-hosting'],
    updatedAt: U,
  },
  {
    slug: 'reasoning-models-compared',
    title: 'AI Reasoning Models Compared: o3 vs DeepSeek R1 vs o4-mini',
    description:
      'Compare the chain-of-thought reasoning models from OpenAI and DeepSeek — pricing, exposed reasoning, and which to pick for which problem.',
    modelSlugs: ['gpt-o3', 'deepseek-r1', 'o4-mini'],
    verdict:
      'o3 leads on the hardest reasoning benchmarks. DeepSeek R1 delivers near-o3 quality on many tasks at ~5× lower cost and exposes its chain-of-thought, which is invaluable for research. o4-mini is the cheapest OpenAI option when you need reasoning without the o3 bill.',
    winnerSlug: 'deepseek-r1',
    tags: ['reasoning', 'openai', 'deepseek'],
    updatedAt: U,
  },
  {
    slug: 'long-context-models-compared',
    title: 'Long-Context AI Models Compared',
    description:
      'Which model handles million-token inputs best? Gemini 2.5 Pro, Gemini 1.5 Pro (2M), and Claude Opus 4 on long-document recall and price.',
    modelSlugs: ['gemini-2-5-pro', 'gemini-1-5-pro', 'gemini-2-5-flash', 'claude-opus-4'],
    verdict:
      'For raw context size, Gemini 1.5 Pro (2M tokens) is unmatched. For best 1M-token recall and reasoning combined, Gemini 2.5 Pro wins. Claude Opus 4 maxes out at 200K but tends to use long context more reliably token-for-token. Gemini 2.5 Flash is the cost-effective long-context default.',
    tags: ['long-context', 'google', 'anthropic'],
    updatedAt: U,
  },
  {
    slug: 'llama-3-1-vs-gpt-4o',
    title: 'Llama 3.1 405B vs GPT-4o',
    description:
      'Can the open-weight frontier compete with proprietary? Llama 3.1 405B head-to-head with GPT-4o on price, quality, and deployment flexibility.',
    modelSlugs: ['llama-3-1-405b', 'gpt-4o'],
    verdict:
      'GPT-4o wins on multimodal and ecosystem maturity. Llama 3.1 405B wins on text quality per dollar (especially on hosted providers under $3/1M) and on the option of self-hosting. Pick GPT-4o for product polish, Llama for cost predictability and data sovereignty.',
    tags: ['open-source', 'meta', 'openai'],
    updatedAt: U,
  },
]

export function getComparisonBySlug(slug: string): ComparisonData | undefined {
  return ALL_COMPARISONS.find((c) => c.slug === slug)
}

export function getComparisonModels(comparison: ComparisonData): ModelData[] {
  return comparison.modelSlugs
    .map((slug) => getModelBySlug(slug))
    .filter((m): m is ModelData => m !== undefined)
}
