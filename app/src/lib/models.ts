export interface ModelData {
  slug: string
  name: string
  provider: string
  providerSlug: string
  inputPricePerMillion: number
  outputPricePerMillion: number
  contextWindow: number
  outputLimit: number
  description: string
  strengths: string[]
  weaknesses: string[]
  useCases: string[]
  relatedSlugs: string[]
  tier: 'flagship' | 'balanced' | 'fast' | 'reasoning'
  openRouterIds?: string[]
}

export const ALL_MODELS: ModelData[] = [
  // ── Anthropic ─────────────────────────────────────────────
  {
    slug: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    inputPricePerMillion: 15,
    outputPricePerMillion: 75,
    contextWindow: 200000,
    outputLimit: 32000,
    tier: 'flagship',
    description:
      'Claude Opus 4 is Anthropic\'s most powerful model — built for complex reasoning, long-form analysis, and tasks that require deep context understanding. It excels at nuanced writing, research synthesis, and multi-step problem solving.',
    strengths: [
      'Best-in-class reasoning and analysis',
      'Excellent at nuanced, long-form writing',
      '200K context window handles entire codebases',
      'Highly instruction-following with minimal hallucination',
    ],
    weaknesses: [
      'Most expensive Anthropic model at $15/1M input tokens',
      'Slower response time than Sonnet or Haiku',
      'Overkill for simple tasks',
    ],
    useCases: [
      'Complex research and document analysis',
      'Advanced coding and architecture review',
      'Legal and financial document processing',
      'High-stakes content generation',
    ],
    relatedSlugs: ['claude-sonnet-4', 'claude-haiku-4', 'gpt-o3'],
    openRouterIds: ['anthropic/claude-opus-4-5'],
  },
  {
    slug: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    contextWindow: 200000,
    outputLimit: 16000,
    tier: 'balanced',
    description:
      'Claude Sonnet 4 is the sweet spot in Anthropic\'s lineup — fast, affordable, and capable enough for the vast majority of production workloads. It delivers near-Opus quality at a fraction of the cost.',
    strengths: [
      'Excellent quality-to-price ratio',
      'Fast response times suitable for production apps',
      '200K context window',
      'Strong at coding, writing, and analysis',
    ],
    weaknesses: [
      'Less capable than Opus on very complex multi-step tasks',
      'Output limit lower than Opus',
    ],
    useCases: [
      'Customer-facing AI applications',
      'Code generation and review',
      'Content creation at scale',
      'Chat and conversational interfaces',
    ],
    relatedSlugs: ['claude-opus-4', 'claude-haiku-4', 'gpt-4o'],
    openRouterIds: ['anthropic/claude-sonnet-4-5'],
  },
  {
    slug: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.25,
    contextWindow: 200000,
    outputLimit: 8192,
    tier: 'fast',
    description:
      'Claude Haiku 4 is Anthropic\'s fastest and most affordable model. Designed for high-throughput tasks where cost and latency matter more than maximum capability.',
    strengths: [
      'Cheapest Anthropic model at $0.25/1M input tokens',
      'Ultra-fast response times',
      'Great for classification, extraction, and simple Q&A',
      'Cost-effective at massive scale',
    ],
    weaknesses: [
      'Not suitable for complex reasoning tasks',
      'Lower output quality than Sonnet or Opus',
      'Smaller output limit',
    ],
    useCases: [
      'Real-time classification and tagging',
      'Simple chatbot responses',
      'Text extraction and summarization',
      'High-volume batch processing',
    ],
    relatedSlugs: ['claude-sonnet-4', 'gpt-4o-mini', 'gemini-2-0-flash'],
    openRouterIds: ['anthropic/claude-haiku-4-5'],
  },

  // ── OpenAI ────────────────────────────────────────────────
  {
    slug: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10,
    contextWindow: 128000,
    outputLimit: 16384,
    tier: 'balanced',
    description:
      'GPT-4o is OpenAI\'s flagship multimodal model — capable of processing text, images, and audio. It\'s the default choice for most production OpenAI workloads, balancing cost, speed, and capability.',
    strengths: [
      'Native multimodal: text, image, and audio',
      'Strong coding and reasoning performance',
      'Well-supported with extensive ecosystem',
      'Competitive pricing vs GPT-4 Turbo',
    ],
    weaknesses: [
      '128K context limit (vs 200K for Claude)',
      'Output quality can vary on highly complex tasks',
    ],
    useCases: [
      'Multimodal applications (image + text)',
      'Coding assistants',
      'Conversational AI products',
      'Document analysis and summarization',
    ],
    relatedSlugs: ['gpt-4o-mini', 'claude-sonnet-4', 'gemini-2-5-pro'],
    openRouterIds: ['openai/gpt-4o'],
  },
  {
    slug: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    contextWindow: 128000,
    outputLimit: 16384,
    tier: 'fast',
    description:
      'GPT-4o mini is OpenAI\'s most affordable model — a lightweight version of GPT-4o optimized for speed and cost. It\'s ideal for simple tasks that don\'t require the full capability of GPT-4o.',
    strengths: [
      'Very cheap: $0.15/1M input tokens',
      'Fast and low latency',
      'Good for structured tasks and simple completions',
    ],
    weaknesses: [
      'Significantly less capable than GPT-4o on complex tasks',
      'Not recommended for nuanced reasoning',
    ],
    useCases: [
      'Simple chatbots and FAQ answering',
      'Text classification and extraction',
      'High-volume, cost-sensitive workflows',
    ],
    relatedSlugs: ['gpt-4o', 'claude-haiku-4', 'gemini-2-0-flash'],
    openRouterIds: ['openai/gpt-4o-mini'],
  },
  {
    slug: 'gpt-o3',
    name: 'OpenAI o3',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 10,
    outputPricePerMillion: 40,
    contextWindow: 200000,
    outputLimit: 100000,
    tier: 'reasoning',
    description:
      'OpenAI o3 is a frontier reasoning model that thinks step-by-step before answering. It significantly outperforms previous models on math, science, and complex coding tasks — but at a higher cost due to extended chain-of-thought processing.',
    strengths: [
      'State-of-the-art on math, science, and coding benchmarks',
      'Extended chain-of-thought reasoning',
      '200K context window',
      'Exceptional accuracy on logic-heavy tasks',
    ],
    weaknesses: [
      'Expensive at $10/1M input tokens',
      'Slower than non-reasoning models',
      'Overkill for most everyday tasks',
    ],
    useCases: [
      'Advanced math and physics problems',
      'Complex code generation and debugging',
      'Scientific research assistance',
      'Multi-step logical reasoning',
    ],
    relatedSlugs: ['claude-opus-4', 'gpt-4o', 'o4-mini'],
    openRouterIds: ['openai/o3'],
  },
  {
    slug: 'o4-mini',
    name: 'OpenAI o4-mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 1.1,
    outputPricePerMillion: 4.4,
    contextWindow: 200000,
    outputLimit: 100000,
    tier: 'reasoning',
    description:
      'o4-mini brings OpenAI\'s chain-of-thought reasoning to a smaller, faster, and cheaper form factor. It offers strong performance on STEM tasks at a fraction of o3\'s cost.',
    strengths: [
      'Reasoning capabilities at a much lower price than o3',
      'Fast for a reasoning model',
      'Strong on coding and math',
    ],
    weaknesses: [
      'Less capable than o3 on hardest tasks',
      'Still more expensive than GPT-4o for standard tasks',
    ],
    useCases: [
      'Coding assistants with logic-heavy tasks',
      'Math tutoring applications',
      'Moderate-complexity reasoning workflows',
    ],
    relatedSlugs: ['gpt-o3', 'gpt-4o', 'claude-sonnet-4'],
    openRouterIds: ['openai/o4-mini'],
  },

  // ── Google ────────────────────────────────────────────────
  {
    slug: 'gemini-2-5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerSlug: 'google',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 10,
    contextWindow: 1000000,
    outputLimit: 65536,
    tier: 'flagship',
    description:
      'Gemini 2.5 Pro is Google\'s most capable model, featuring a massive 1M token context window — the largest of any major model. It\'s particularly strong on reasoning, code, and tasks requiring long document understanding.',
    strengths: [
      'Industry-leading 1M token context window',
      'Strong reasoning and coding performance',
      'Competitive input pricing',
      'Native multimodal (text, image, video, audio)',
    ],
    weaknesses: [
      'Output pricing is high at $10/1M tokens',
      'Slower than Flash models',
      'Less established ecosystem than OpenAI/Anthropic',
    ],
    useCases: [
      'Processing entire codebases or long documents',
      'Video and audio analysis',
      'Long-context summarization',
      'Complex multi-step reasoning',
    ],
    relatedSlugs: ['gemini-2-0-flash', 'gpt-4o', 'claude-opus-4'],
    openRouterIds: ['google/gemini-2.5-pro'],
  },
  {
    slug: 'gemini-2-0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    providerSlug: 'google',
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.4,
    contextWindow: 1000000,
    outputLimit: 8192,
    tier: 'fast',
    description:
      'Gemini 2.0 Flash is Google\'s speed-optimized model — extremely affordable with a 1M token context window. One of the best value options for high-throughput workloads.',
    strengths: [
      'Very cheap: $0.10/1M input tokens',
      'Massive 1M context window even at this price',
      'Fast response times',
      'Good general-purpose performance',
    ],
    weaknesses: [
      'Smaller output limit',
      'Less capable than Pro on complex reasoning',
    ],
    useCases: [
      'High-volume document processing',
      'Real-time applications',
      'Cost-sensitive production workloads',
      'Long-document summarization on a budget',
    ],
    relatedSlugs: ['gemini-2-5-pro', 'claude-haiku-4', 'gpt-4o-mini'],
    openRouterIds: ['google/gemini-2.0-flash'],
  },
  {
    slug: 'gemini-1-5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    providerSlug: 'google',
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.3,
    contextWindow: 1000000,
    outputLimit: 8192,
    tier: 'fast',
    description:
      'Gemini 1.5 Flash is one of the cheapest capable models available. With a 1M context window and ultra-low pricing, it\'s ideal for bulk document processing and cost-sensitive pipelines.',
    strengths: [
      'One of the cheapest models at $0.075/1M input tokens',
      '1M context window',
      'Good at extraction and summarization',
    ],
    weaknesses: [
      'Older generation than Gemini 2.x series',
      'Lower output quality on complex reasoning',
    ],
    useCases: [
      'Bulk data extraction',
      'Long-document summarization',
      'Cost-optimized RAG pipelines',
    ],
    relatedSlugs: ['gemini-2-0-flash', 'gpt-4o-mini', 'claude-haiku-4'],
    openRouterIds: ['google/gemini-flash-1.5'],
  },

  // ── Mistral ───────────────────────────────────────────────
  {
    slug: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral',
    providerSlug: 'mistral',
    inputPricePerMillion: 2,
    outputPricePerMillion: 6,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'balanced',
    description:
      'Mistral Large is Mistral AI\'s flagship model — a strong open-weight competitor that offers competitive performance at a lower price than GPT-4o. Particularly strong at coding and European languages.',
    strengths: [
      'Strong multilingual performance (especially European languages)',
      'Competitive coding benchmark scores',
      'Lower cost than OpenAI equivalents',
      'Function calling and JSON mode support',
    ],
    weaknesses: [
      'Smaller ecosystem and fewer integrations',
      'Lower output limit than frontier models',
    ],
    useCases: [
      'Multilingual applications',
      'Coding tools for European markets',
      'Cost-conscious enterprise applications',
    ],
    relatedSlugs: ['gpt-4o', 'claude-sonnet-4', 'mistral-small'],
    openRouterIds: ['mistralai/mistral-large'],
  },
  {
    slug: 'mistral-small',
    name: 'Mistral Small',
    provider: 'Mistral',
    providerSlug: 'mistral',
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.3,
    contextWindow: 32000,
    outputLimit: 4096,
    tier: 'fast',
    description:
      'Mistral Small is an ultra-affordable model for lightweight tasks. At $0.10/1M input tokens, it competes directly with Google Flash models on price while offering solid general-purpose performance.',
    strengths: [
      'Very affordable at $0.10/1M input tokens',
      'Good for simple tasks and structured outputs',
      'Low latency',
    ],
    weaknesses: [
      'Smaller context window (32K)',
      'Not suitable for complex reasoning or long documents',
    ],
    useCases: [
      'Simple classification and routing',
      'Quick summarization',
      'Lightweight chatbot responses',
    ],
    relatedSlugs: ['mistral-large', 'gpt-4o-mini', 'gemini-2-0-flash'],
    openRouterIds: ['mistralai/mistral-small'],
  },
]

export function getModelBySlug(slug: string): ModelData | undefined {
  return ALL_MODELS.find((m) => m.slug === slug)
}

export function getModelsByProvider(providerSlug: string): ModelData[] {
  return ALL_MODELS.filter((m) => m.providerSlug === providerSlug)
}

export function getRelatedModels(model: ModelData): ModelData[] {
  return model.relatedSlugs
    .map((slug) => getModelBySlug(slug))
    .filter((m): m is ModelData => m !== undefined)
}

export function getCheapestModels(n = 5): ModelData[] {
  return [...ALL_MODELS]
    .sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)
    .slice(0, n)
}

export const PROVIDERS = [
  { name: 'Anthropic', slug: 'anthropic' },
  { name: 'OpenAI', slug: 'openai' },
  { name: 'Google', slug: 'google' },
  { name: 'Mistral', slug: 'mistral' },
]
