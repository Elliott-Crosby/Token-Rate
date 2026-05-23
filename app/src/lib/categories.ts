export type CategorySlug =
  | 'fundamentals'
  | 'comparisons'
  | 'cost-optimization'
  | 'providers'
  | 'building'

export interface Category {
  slug: CategorySlug
  label: string
  description: string
  order: number
}

export const CATEGORIES: Category[] = [
  {
    slug: 'fundamentals',
    label: 'Fundamentals',
    description:
      'Tokens, pricing models, context windows — the building blocks of every AI API bill.',
    order: 1,
  },
  {
    slug: 'comparisons',
    label: 'Model Comparisons',
    description:
      'Side-by-side cost analyses across Claude, GPT, Gemini, DeepSeek, and more.',
    order: 2,
  },
  {
    slug: 'cost-optimization',
    label: 'Cost Optimization',
    description:
      'Caching, batching, output controls, system prompts — practical tactics to cut your AI bill.',
    order: 3,
  },
  {
    slug: 'providers',
    label: 'Provider Deep-Dives',
    description:
      'Provider-specific pricing breakdowns and what they mean for your stack.',
    order: 4,
  },
  {
    slug: 'building',
    label: 'Building with AI',
    description:
      'Designing, budgeting, and shipping AI features without runaway costs.',
    order: 5,
  },
]

export const CATEGORY_SLUGS: CategorySlug[] = CATEGORIES.map((c) => c.slug)

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function isCategorySlug(slug: string): slug is CategorySlug {
  return CATEGORY_SLUGS.includes(slug as CategorySlug)
}
