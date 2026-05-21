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
}

export const ALL_COMPARISONS: ComparisonData[] = [
  {
    slug: 'gpt-4o-vs-claude-sonnet-4',
    title: 'GPT-4o vs Claude Sonnet 4',
    description:
      'Side-by-side comparison of GPT-4o and Claude Sonnet 4 on pricing, context length, strengths, and best use cases.',
    modelSlugs: ['gpt-4o', 'claude-sonnet-4'],
    verdict:
      'Claude Sonnet 4 is cheaper ($3 vs $2.50/1M input) but both are close in quality. GPT-4o wins on multimodal tasks (native image/audio); Claude Sonnet 4 wins on nuanced long-form writing and 200K vs 128K context.',
    tags: ['anthropic', 'openai', 'balanced'],
  },
  {
    slug: 'cheapest-ai-models-2025',
    title: 'Cheapest AI Models in 2025',
    description:
      'Ranked list of the most affordable large language models available via API in 2025, with pricing, context windows, and quality notes.',
    modelSlugs: ['gemini-1-5-flash', 'gemini-2-0-flash', 'gpt-4o-mini', 'claude-haiku-4', 'mistral-small'],
    verdict:
      'Gemini 1.5 Flash is the cheapest capable model at $0.075/1M input tokens, followed by Gemini 2.0 Flash. For quality-per-dollar, GPT-4o mini and Claude Haiku 4 are strong choices with broader ecosystem support.',
    tags: ['budget', 'cost', 'all-providers'],
  },
  {
    slug: 'claude-opus-4-vs-gpt-o3',
    title: 'Claude Opus 4 vs OpenAI o3',
    description:
      'Compare the two most powerful AI models from Anthropic and OpenAI — Claude Opus 4 and OpenAI o3 — on price, reasoning, and real-world tasks.',
    modelSlugs: ['claude-opus-4', 'gpt-o3'],
    verdict:
      'Both are flagship-tier models. o3 has an edge on math/science benchmarks via chain-of-thought reasoning. Claude Opus 4 excels at nuanced writing, instruction-following, and longer context utilization. o3 input is cheaper ($10 vs $15/1M) but output costs more ($40 vs $75/1M).',
    winnerSlug: undefined,
    tags: ['flagship', 'reasoning', 'anthropic', 'openai'],
  },
  {
    slug: 'gemini-flash-vs-claude-haiku',
    title: 'Gemini Flash vs Claude Haiku 4',
    description:
      'Which fast, cheap AI model is best for production? Compare Google Gemini 2.0 Flash vs Anthropic Claude Haiku 4.',
    modelSlugs: ['gemini-2-0-flash', 'claude-haiku-4'],
    verdict:
      'Gemini 2.0 Flash is cheaper ($0.10 vs $0.25/1M input) and has a 1M context window vs Haiku\'s 200K. Claude Haiku is more instruction-consistent and has stronger Anthropic ecosystem support. For raw cost efficiency on large documents, Gemini Flash wins.',
    winnerSlug: 'gemini-2-0-flash',
    tags: ['fast', 'budget', 'google', 'anthropic'],
  },
  {
    slug: 'best-models-for-coding',
    title: 'Best AI Models for Coding in 2025',
    description:
      'Ranked comparison of the best large language models for code generation, debugging, and software development tasks.',
    modelSlugs: ['gpt-o3', 'claude-sonnet-4', 'gpt-4o', 'gemini-2-5-pro'],
    verdict:
      'For coding: o3 and Claude Sonnet 4 lead on most code benchmarks. o3 excels at hard algorithmic problems; Claude Sonnet 4 is better for long-context codebase understanding. GPT-4o is a reliable all-rounder, and Gemini 2.5 Pro shines when you need to process an entire codebase in one context.',
    tags: ['coding', 'development', 'all-providers'],
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
