import { EXTRA_MODELS, LIVE_PRICING, LIVE_UPDATED_AT } from './models.generated'

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
  updatedAt: string
  openRouterIds?: string[]
  // Auto-generated from the live OpenRouter feed (vs hand-curated editorial).
  auto?: boolean
  // A near-duplicate variant (speed/preview tier or dated snapshot) — noindex'd
  // and excluded from the sitemap to protect crawl budget.
  variant?: boolean
  // Quality score (0–100) from the daily leaderboard fetch; drives sorting.
  qualityIndex?: number
  qualitySource?: 'arena' | 'aa'
}

// Reference date for the hand-curated editorial entries below. Live pricing and
// the public MODELS_UPDATED_AT come from the daily-regenerated models.generated.ts.
const U = '2026-06-10'

// Hand-curated models with rich editorial copy. These own their slugs (referenced
// by comparison pages) and get fresh pricing applied from the live feed at load.
// Everything else in the catalogue is auto-added daily from OpenRouter — see the
// merge step after this array.
const CURATED_MODELS: ModelData[] = [
  // ── Anthropic ─────────────────────────────────────────────
  {
    slug: 'claude-sonnet-5',
    name: 'Claude Sonnet 5',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    // Standard rate ($3/$15). Launch promo of $2/$10 runs through Aug 31, 2026;
    // the live feed overlays the real current price when OpenRouter lists it.
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    contextWindow: 1000000,
    outputLimit: 128000,
    tier: 'balanced',
    updatedAt: '2026-06-30',
    description:
      "Claude Sonnet 5 is Anthropic's most agentic Sonnet model yet (released June 30, 2026) — it plans, uses tools like browsers and terminals, and runs multi-step tasks autonomously, even checking its own output. It matches Opus 4.8 on knowledge work and lands just behind it on agentic coding, at a fraction of the cost. Launch pricing is $2/$10 per million tokens through Aug 31, 2026, then the standard $3/$15.",
    strengths: [
      'Near-Opus-4.8 quality on knowledge work at a fraction of the price',
      'Most agentic Sonnet yet — strong tool use, planning, and self-checking',
      '1M-token context window',
      'Default model for Claude Free and Pro',
    ],
    weaknesses: [
      'Trails Opus 4.8 on the hardest agentic coding (63.2% vs 69.2%)',
      'Behind Opus 4.8 on some alignment/safety metrics',
      'Launch promo pricing expires Aug 31, 2026',
    ],
    useCases: [
      'Production coding and software-engineering agents',
      'Tool-using autonomous agents (browsers, terminals)',
      'Long-context RAG and document analysis',
      'High-volume customer-facing apps',
    ],
    relatedSlugs: ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-fable-5'],
    openRouterIds: ['anthropic/claude-sonnet-5'],
  },
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
    updatedAt: U,
    description:
      "Claude Opus 4 is Anthropic's most powerful model — built for complex reasoning, long-form analysis, and tasks that require deep context understanding. It excels at nuanced writing, research synthesis, and multi-step problem solving.",
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
    openRouterIds: ['anthropic/claude-opus-4'],
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
    updatedAt: U,
    description:
      "Claude Sonnet 4 is the sweet spot in Anthropic's lineup — fast, affordable, and capable enough for the vast majority of production workloads. It delivers near-Opus quality at a fraction of the cost.",
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
    openRouterIds: ['anthropic/claude-sonnet-4'],
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
    updatedAt: U,
    description:
      "Claude Haiku 4 is Anthropic's fastest and most affordable model. Designed for high-throughput tasks where cost and latency matter more than maximum capability.",
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
  {
    slug: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    contextWindow: 200000,
    outputLimit: 8192,
    tier: 'balanced',
    updatedAt: U,
    description:
      'Claude 3.5 Sonnet was the workhorse of the Claude 3 family — widely adopted for coding, writing, and chat. Still a strong baseline, though Claude Sonnet 4 supersedes it for most new projects.',
    strengths: [
      'Battle-tested in production at scale',
      'Excellent coding and reasoning',
      '200K context window',
      'Broad library and tool support',
    ],
    weaknesses: ['Superseded by Claude Sonnet 4 on most tasks', 'Lower output limit than newer models'],
    useCases: ['Legacy applications still pinned to 3.5', 'Coding assistants', 'Content workflows'],
    relatedSlugs: ['claude-sonnet-4', 'claude-3-haiku', 'gpt-4o'],
    openRouterIds: ['anthropic/claude-3.5-sonnet'],
  },
  {
    slug: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    inputPricePerMillion: 0.25,
    outputPricePerMillion: 1.25,
    contextWindow: 200000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      'Claude 3 Haiku is the previous-generation small model from Anthropic — cheap, fast, and reliable for simple tasks. Largely replaced by Claude Haiku 4 at the same price point.',
    strengths: ['Same price as Haiku 4 with proven track record', 'Low latency', 'Solid extraction and routing'],
    weaknesses: ['Older generation than Haiku 4', 'Lower output quality on nuanced tasks'],
    useCases: ['Legacy pipelines', 'Cheap classification', 'Lightweight chat'],
    relatedSlugs: ['claude-haiku-4', 'claude-3-5-sonnet', 'gpt-4o-mini'],
    openRouterIds: ['anthropic/claude-3-haiku'],
  },
  {
    slug: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    contextWindow: 200000,
    outputLimit: 128000,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Claude 3.7 Sonnet is Anthropic's first hybrid reasoning model — it can think step-by-step for hard problems or respond instantly for simple ones, all at Sonnet-level pricing. The 128K output limit makes it uniquely capable for long-form generation.",
    strengths: [
      'Hybrid: instant or extended chain-of-thought on demand',
      'Largest output window of any Claude Sonnet at 128K tokens',
      'Strong coding and multi-step reasoning',
      'Sonnet-tier pricing despite reasoning capability',
    ],
    weaknesses: ['Extended thinking adds latency', 'Thinking tokens billed as output tokens'],
    useCases: ['Agentic coding workflows', 'Complex analysis requiring transparent reasoning', 'Long-document drafting'],
    relatedSlugs: ['claude-sonnet-4', 'claude-opus-4', 'o4-mini'],
    openRouterIds: ['anthropic/claude-3.7-sonnet'],
  },
  {
    slug: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    providerSlug: 'anthropic',
    inputPricePerMillion: 0.8,
    outputPricePerMillion: 4,
    contextWindow: 200000,
    outputLimit: 8192,
    tier: 'fast',
    updatedAt: U,
    description:
      "Claude 3.5 Haiku is a step up from Claude 3 Haiku in quality while staying firmly in the budget tier. It punches above its price class on coding and instruction-following tasks.",
    strengths: ['Stronger than Claude 3 Haiku at a modest price increase', 'Fast and low latency', '200K context window'],
    weaknesses: ['Pricier than Claude 3 Haiku', 'Below Sonnet quality on complex tasks'],
    useCases: ['Budget-conscious production apps', 'Real-time chat', 'Code completion'],
    relatedSlugs: ['claude-haiku-4', 'claude-3-5-sonnet', 'gpt-4o-mini'],
    openRouterIds: ['anthropic/claude-3.5-haiku'],
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
    updatedAt: U,
    description:
      "GPT-4o is OpenAI's flagship multimodal model — capable of processing text, images, and audio. It's the default choice for most production OpenAI workloads, balancing cost, speed, and capability.",
    strengths: [
      'Native multimodal: text, image, and audio',
      'Strong coding and reasoning performance',
      'Well-supported with extensive ecosystem',
      'Competitive pricing vs GPT-4 Turbo',
    ],
    weaknesses: ['128K context limit (vs 200K for Claude)', 'Output quality can vary on highly complex tasks'],
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
    updatedAt: U,
    description:
      "GPT-4o mini is OpenAI's most affordable mainstream model — a lightweight version of GPT-4o optimized for speed and cost. It's ideal for simple tasks that don't require the full capability of GPT-4o.",
    strengths: ['Very cheap: $0.15/1M input tokens', 'Fast and low latency', 'Good for structured tasks and simple completions'],
    weaknesses: ['Significantly less capable than GPT-4o on complex tasks', 'Not recommended for nuanced reasoning'],
    useCases: ['Simple chatbots and FAQ answering', 'Text classification and extraction', 'High-volume, cost-sensitive workflows'],
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
    updatedAt: U,
    description:
      'OpenAI o3 is a frontier reasoning model that thinks step-by-step before answering. It significantly outperforms previous models on math, science, and complex coding tasks — but at a higher cost due to extended chain-of-thought processing.',
    strengths: [
      'State-of-the-art on math, science, and coding benchmarks',
      'Extended chain-of-thought reasoning',
      '200K context window',
      'Exceptional accuracy on logic-heavy tasks',
    ],
    weaknesses: ['Expensive at $10/1M input tokens', 'Slower than non-reasoning models', 'Overkill for most everyday tasks'],
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
    updatedAt: U,
    description:
      "o4-mini brings OpenAI's chain-of-thought reasoning to a smaller, faster, and cheaper form factor. It offers strong performance on STEM tasks at a fraction of o3's cost.",
    strengths: ['Reasoning capabilities at a much lower price than o3', 'Fast for a reasoning model', 'Strong on coding and math'],
    weaknesses: ['Less capable than o3 on hardest tasks', 'Still more expensive than GPT-4o for standard tasks'],
    useCases: ['Coding assistants with logic-heavy tasks', 'Math tutoring applications', 'Moderate-complexity reasoning workflows'],
    relatedSlugs: ['gpt-o3', 'gpt-4o', 'claude-sonnet-4'],
    openRouterIds: ['openai/o4-mini'],
  },
  {
    slug: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 10,
    outputPricePerMillion: 30,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'flagship',
    updatedAt: U,
    description:
      'GPT-4 Turbo is the predecessor to GPT-4o — still widely deployed, especially in enterprise stacks pinned to it. Largely superseded by GPT-4o on both price and multimodal capability.',
    strengths: ['Proven enterprise track record', '128K context window', 'Strong coding and reasoning'],
    weaknesses: ['Much more expensive than GPT-4o', 'No native multimodal', '4K output limit'],
    useCases: ['Legacy enterprise apps', 'Workflows pinned to GPT-4 quality'],
    relatedSlugs: ['gpt-4o', 'gpt-o3', 'claude-3-5-sonnet'],
    openRouterIds: ['openai/gpt-4-turbo'],
  },
  {
    slug: 'gpt-3-5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 1.5,
    contextWindow: 16385,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      'GPT-3.5 Turbo is the previous workhorse model from OpenAI. Cheap and fast, but generally outclassed by GPT-4o mini at similar or lower price points. Still common in legacy integrations.',
    strengths: ['Very low cost', 'Fast response time', 'Huge ecosystem of tooling and prompts'],
    weaknesses: ['Outperformed by GPT-4o mini at lower cost', 'Small 16K context', 'Weaker reasoning'],
    useCases: ['Legacy chatbots', 'Simple completion tasks', 'Comparison benchmarks'],
    relatedSlugs: ['gpt-4o-mini', 'claude-3-haiku', 'mistral-small'],
    openRouterIds: ['openai/gpt-3.5-turbo'],
  },
  {
    slug: 'gpt-4-1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 2,
    outputPricePerMillion: 8,
    contextWindow: 1000000,
    outputLimit: 32768,
    tier: 'flagship',
    updatedAt: U,
    description:
      "GPT-4.1 is OpenAI's 2025 flagship text model — more capable than GPT-4o with a massive 1M token context window. It hits a strong balance between quality and cost for production workloads.",
    strengths: [
      '1M token context window',
      'Stronger instruction-following than GPT-4o',
      'Competitive pricing vs GPT-4o',
      'Improved coding and analysis',
    ],
    weaknesses: ['Superseded on reasoning tasks by o-series models', 'No native audio support'],
    useCases: ['Long-document Q&A and RAG', 'Coding assistants', 'Enterprise chat', 'Content workflows'],
    relatedSlugs: ['gpt-4o', 'gpt-4-1-mini', 'claude-sonnet-4'],
    openRouterIds: ['openai/gpt-4.1'],
  },
  {
    slug: 'gpt-4-1-mini',
    name: 'GPT-4.1 mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 0.4,
    outputPricePerMillion: 1.6,
    contextWindow: 1000000,
    outputLimit: 32768,
    tier: 'balanced',
    updatedAt: U,
    description:
      "GPT-4.1 mini brings GPT-4.1-class quality to a budget price point — with the same 1M context window at a fraction of the cost. A strong replacement for GPT-4o mini in most pipelines.",
    strengths: ['1M context at sub-$0.50 input pricing', 'Better quality than GPT-4o mini', 'Low latency'],
    weaknesses: ['Below GPT-4.1 quality on complex tasks', 'No reasoning capability'],
    useCases: ['Cost-sensitive production pipelines', 'Long-document extraction', 'Simple chat'],
    relatedSlugs: ['gpt-4-1', 'gpt-4o-mini', 'gpt-4-1-nano'],
    openRouterIds: ['openai/gpt-4.1-mini'],
  },
  {
    slug: 'gpt-4-1-nano',
    name: 'GPT-4.1 nano',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.4,
    contextWindow: 1000000,
    outputLimit: 32768,
    tier: 'fast',
    updatedAt: U,
    description:
      "GPT-4.1 nano is OpenAI's ultra-cheap model — matching Gemini Flash pricing while packing a 1M context window. Ideal for high-volume classification and extraction at minimal cost.",
    strengths: ['Ultra-cheap at $0.10/1M input', '1M context window for this price class', 'Fast'],
    weaknesses: ['Limited capability on nuanced tasks', 'Smallest of the 4.1 family'],
    useCases: ['Bulk classification', 'High-volume extraction', 'Simple Q&A at scale'],
    relatedSlugs: ['gpt-4-1-mini', 'gpt-4o-mini', 'gemini-2-0-flash'],
    openRouterIds: ['openai/gpt-4.1-nano'],
  },
  {
    slug: 'o1',
    name: 'OpenAI o1',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 15,
    outputPricePerMillion: 60,
    contextWindow: 200000,
    outputLimit: 100000,
    tier: 'reasoning',
    updatedAt: U,
    description:
      "OpenAI o1 is the original frontier reasoning model — extended chain-of-thought processing for maximum accuracy on math, science, and complex coding. Pricier than o3/o4-mini but benchmarked at the top of its generation.",
    strengths: ['Top-tier accuracy on hard STEM problems', '200K context, 100K output limit', 'Established benchmark leader at release'],
    weaknesses: ['Most expensive OpenAI model at $15/$60 per million', 'Slower than o4-mini', 'Superseded by o3 on most tasks'],
    useCases: ['High-stakes scientific computation', 'Complex proof verification', 'Advanced code generation'],
    relatedSlugs: ['gpt-o3', 'o4-mini', 'o1-mini'],
    openRouterIds: ['openai/o1'],
  },
  {
    slug: 'o1-mini',
    name: 'OpenAI o1-mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 1.1,
    outputPricePerMillion: 4.4,
    contextWindow: 128000,
    outputLimit: 65536,
    tier: 'reasoning',
    updatedAt: U,
    description:
      "OpenAI o1-mini is the budget version of o1 — chain-of-thought reasoning at a fraction of the cost, optimized for STEM tasks. Largely succeeded by o4-mini but still widely deployed.",
    strengths: ['Reasoning at o4-mini price point', 'Strong STEM and coding performance', 'Faster than full o1'],
    weaknesses: ['128K context (smaller than o1/o3)', 'Succeeded by o3-mini and o4-mini'],
    useCases: ['Budget reasoning workflows', 'Coding with logic-heavy tasks', 'Math tutoring'],
    relatedSlugs: ['o4-mini', 'o3-mini', 'gpt-o3'],
    openRouterIds: ['openai/o1-mini'],
  },
  {
    slug: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    providerSlug: 'openai',
    inputPricePerMillion: 1.1,
    outputPricePerMillion: 4.4,
    contextWindow: 200000,
    outputLimit: 100000,
    tier: 'reasoning',
    updatedAt: U,
    description:
      "OpenAI o3-mini delivers o3-class reasoning at o4-mini pricing — the sweet spot for teams that need reliable step-by-step reasoning without paying for full o3. Strong on coding and math.",
    strengths: ['200K context + 100K output', 'Better reasoning than o1-mini', 'Competitive pricing'],
    weaknesses: ['Superseded by o4-mini on most tasks', 'Still slower than non-reasoning models'],
    useCases: ['Coding assistants with reasoning', 'Moderate-complexity math', 'Logic-heavy analysis pipelines'],
    relatedSlugs: ['o4-mini', 'gpt-o3', 'claude-3-7-sonnet'],
    openRouterIds: ['openai/o3-mini'],
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
    updatedAt: U,
    description:
      "Gemini 2.5 Pro is Google's most capable model, featuring a massive 1M token context window — the largest of any major model. It's particularly strong on reasoning, code, and tasks requiring long document understanding.",
    strengths: [
      'Industry-leading 1M token context window',
      'Strong reasoning and coding performance',
      'Competitive input pricing',
      'Native multimodal (text, image, video, audio)',
    ],
    weaknesses: ['Output pricing is high at $10/1M tokens', 'Slower than Flash models', 'Less established ecosystem than OpenAI/Anthropic'],
    useCases: ['Processing entire codebases or long documents', 'Video and audio analysis', 'Long-context summarization', 'Complex multi-step reasoning'],
    relatedSlugs: ['gemini-2-5-flash', 'gemini-2-0-flash', 'gpt-4o', 'claude-opus-4'],
    openRouterIds: ['google/gemini-2.5-pro'],
  },
  {
    slug: 'gemini-2-5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    providerSlug: 'google',
    inputPricePerMillion: 0.3,
    outputPricePerMillion: 2.5,
    contextWindow: 1000000,
    outputLimit: 65536,
    tier: 'balanced',
    updatedAt: U,
    description:
      'Gemini 2.5 Flash is the mid-tier 2.5-generation model — markedly faster than Pro while keeping the full 1M context window. The default choice when you want long context cheaply.',
    strengths: ['1M context window at sub-$1 input price', 'Fast for a flagship-class model', 'Multimodal'],
    weaknesses: ['Output price still higher than budget Flash 2.0', 'Not as strong as Pro on reasoning'],
    useCases: ['Long-document RAG', 'Production chat with retrieval', 'Multimodal pipelines on a budget'],
    relatedSlugs: ['gemini-2-5-pro', 'gemini-2-0-flash', 'claude-sonnet-4'],
    openRouterIds: ['google/gemini-2.5-flash'],
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
    updatedAt: U,
    description:
      "Gemini 2.0 Flash is Google's speed-optimized model — extremely affordable with a 1M token context window. One of the best value options for high-throughput workloads.",
    strengths: ['Very cheap: $0.10/1M input tokens', 'Massive 1M context window even at this price', 'Fast response times', 'Good general-purpose performance'],
    weaknesses: ['Smaller output limit', 'Less capable than Pro on complex reasoning'],
    useCases: ['High-volume document processing', 'Real-time applications', 'Cost-sensitive production workloads', 'Long-document summarization on a budget'],
    relatedSlugs: ['gemini-2-5-flash', 'claude-haiku-4', 'gpt-4o-mini'],
    openRouterIds: ['google/gemini-2.0-flash'],
  },
  {
    slug: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    providerSlug: 'google',
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5,
    contextWindow: 2000000,
    outputLimit: 8192,
    tier: 'flagship',
    updatedAt: U,
    description:
      'Gemini 1.5 Pro is the previous-generation Google flagship — famous for its 2M token context window. Still useful for extreme long-context jobs but outclassed by 2.5 Pro on most benchmarks.',
    strengths: ['2M context window — largest of any model', 'Strong long-document recall', 'Multimodal'],
    weaknesses: ['Older generation', 'Slower than 2.x Flash', '8K output limit'],
    useCases: ['Extreme long-context retrieval', 'Comparison baselines', 'Legacy Vertex AI deployments'],
    relatedSlugs: ['gemini-2-5-pro', 'gemini-1-5-flash', 'claude-opus-4'],
    openRouterIds: ['google/gemini-pro-1.5'],
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
    updatedAt: U,
    description:
      "Gemini 1.5 Flash is one of the cheapest capable models available. With a 1M context window and ultra-low pricing, it's ideal for bulk document processing and cost-sensitive pipelines.",
    strengths: ['One of the cheapest models at $0.075/1M input tokens', '1M context window', 'Good at extraction and summarization'],
    weaknesses: ['Older generation than Gemini 2.x series', 'Lower output quality on complex reasoning'],
    useCases: ['Bulk data extraction', 'Long-document summarization', 'Cost-optimized RAG pipelines'],
    relatedSlugs: ['gemini-2-0-flash', 'gpt-4o-mini', 'claude-haiku-4'],
    openRouterIds: ['google/gemini-flash-1.5'],
  },
  {
    slug: 'gemini-2-0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'Google',
    providerSlug: 'google',
    inputPricePerMillion: 0.075,
    outputPricePerMillion: 0.3,
    contextWindow: 1000000,
    outputLimit: 8192,
    tier: 'fast',
    updatedAt: U,
    description:
      "Gemini 2.0 Flash Lite is Google's cheapest capable model — matching Gemini 1.5 Flash pricing while running on the newer 2.0 architecture. The best entry point for cost-optimized 1M-context workloads.",
    strengths: ['1M context at $0.075/1M input — one of the cheapest', 'Newer architecture than 1.5 Flash', 'Fast'],
    weaknesses: ['Smallest output limit in the Gemini 2.x family', 'Not for complex reasoning'],
    useCases: ['Ultra-cheap bulk document processing', 'Simple extraction at scale', 'Cost floor for 1M-context pipelines'],
    relatedSlugs: ['gemini-2-0-flash', 'gemini-1-5-flash', 'gpt-4-1-nano'],
    openRouterIds: ['google/gemini-2.0-flash-lite'],
  },

  // ── Meta (Llama) ──────────────────────────────────────────
  {
    slug: 'llama-3-1-405b',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 2.7,
    outputPricePerMillion: 2.7,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'flagship',
    updatedAt: U,
    description:
      "Llama 3.1 405B is Meta's largest open-weight model — competitive with GPT-4-class models on many benchmarks and uniquely available for self-hosting. Symmetric input/output pricing is common across hosted providers.",
    strengths: ['Open-weight: can be self-hosted', 'Frontier-class quality on many tasks', 'Symmetric in/out pricing simplifies cost modeling'],
    weaknesses: ['Slower than smaller Llama variants', 'No native multimodal', '128K context (matches GPT-4o but trails Gemini)'],
    useCases: ['On-prem and air-gapped deployments', 'Fine-tuning for domain models', 'Avoiding vendor lock-in'],
    relatedSlugs: ['llama-3-1-70b', 'llama-3-1-8b', 'gpt-4o'],
    openRouterIds: ['meta-llama/llama-3.1-405b-instruct'],
  },
  {
    slug: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.59,
    outputPricePerMillion: 0.79,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'balanced',
    updatedAt: U,
    description:
      'Llama 3.1 70B is the mid-size open-weight model in the 3.1 family — a popular sweet spot for production workloads that need GPT-4o-mini-class quality at open-weight prices.',
    strengths: ['Affordable hosted pricing under $1/1M', 'Strong general-purpose quality', 'Open weights'],
    weaknesses: ['Below frontier on hardest tasks', 'Quality varies by host'],
    useCases: ['Production chat at scale', 'Self-hosted inference on a single H100 node', 'Fine-tuning base'],
    relatedSlugs: ['llama-3-1-405b', 'llama-3-1-8b', 'claude-sonnet-4'],
    openRouterIds: ['meta-llama/llama-3.1-70b-instruct'],
  },
  {
    slug: 'llama-3-1-8b',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.05,
    outputPricePerMillion: 0.08,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      'Llama 3.1 8B is the smallest open-weight Llama 3.1 model — extremely cheap to host or call, and good enough for classification, extraction, and basic chat.',
    strengths: ['Among the cheapest hosted LLMs', 'Easy to self-host (fits on a single consumer GPU)', '128K context'],
    weaknesses: ['Limited reasoning', 'Not for complex generation'],
    useCases: ['Edge inference', 'Classification', 'Bulk extraction'],
    relatedSlugs: ['llama-3-1-70b', 'gpt-4o-mini', 'gemini-1-5-flash'],
    openRouterIds: ['meta-llama/llama-3.1-8b-instruct'],
  },
  {
    slug: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.59,
    outputPricePerMillion: 0.79,
    contextWindow: 128000,
    outputLimit: 8192,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Llama 3.3 70B improves on Llama 3.1 70B with better instruction-following and reasoning, at the same price point. The recommended Llama 70B for new projects — same hosting cost, meaningfully better quality.",
    strengths: ['Better than 3.1 70B on most benchmarks', 'Same affordable hosted pricing', 'Open weights'],
    weaknesses: ['128K context', 'Still outclassed by frontier models on hardest tasks'],
    useCases: ['Production chat at scale', 'Self-hosted general workloads', 'Fine-tuning base'],
    relatedSlugs: ['llama-3-1-70b', 'llama-4-scout', 'gpt-4o-mini'],
    openRouterIds: ['meta-llama/llama-3.3-70b-instruct'],
  },
  {
    slug: 'llama-3-2-3b',
    name: 'Llama 3.2 3B',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.06,
    outputPricePerMillion: 0.06,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      "Llama 3.2 3B is a tiny but surprisingly capable open-weight model — one of the cheapest LLMs available from any provider. Fits on edge hardware and consumer GPUs with room to spare.",
    strengths: ['Extremely cheap to host and call', 'Fits on consumer hardware (single GPU)', '128K context for the size'],
    weaknesses: ['Limited reasoning and generation quality', 'Not suitable for complex tasks'],
    useCases: ['On-device inference', 'Simple extraction', 'Prototype chatbots'],
    relatedSlugs: ['llama-3-2-1b', 'llama-3-1-8b', 'phi-4'],
    openRouterIds: ['meta-llama/llama-3.2-3b-instruct'],
  },
  {
    slug: 'llama-3-2-1b',
    name: 'Llama 3.2 1B',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.04,
    outputPricePerMillion: 0.04,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      "Llama 3.2 1B is one of the smallest capable LLMs — sub-$0.05 per million tokens and runs on CPUs. Useful for classification and routing at extreme scale or very constrained hardware.",
    strengths: ['Cheapest capable model — $0.04/1M', 'Runs on CPU / mobile', 'Open weights'],
    weaknesses: ['Very limited generation quality', 'Only suitable for simplest tasks'],
    useCases: ['Intent classification', 'On-device routing', 'Edge inference'],
    relatedSlugs: ['llama-3-2-3b', 'llama-3-1-8b', 'phi-4'],
    openRouterIds: ['meta-llama/llama-3.2-1b-instruct'],
  },
  {
    slug: 'llama-3-2-11b',
    name: 'Llama 3.2 11B Vision',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.16,
    outputPricePerMillion: 0.16,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      "Llama 3.2 11B Vision is Meta's small open-weight multimodal model — capable of understanding images at a fraction of GPT-4o's cost. The go-to for budget image + text pipelines.",
    strengths: ['Multimodal (image + text) at $0.16/1M', 'Open weights — self-hostable', 'Fast'],
    weaknesses: ['Below GPT-4o Vision on complex visual reasoning', 'Small output limit'],
    useCases: ['Image classification', 'Visual Q&A on a budget', 'Document OCR pipelines'],
    relatedSlugs: ['llama-3-2-90b', 'gpt-4o', 'gemini-2-0-flash'],
    openRouterIds: ['meta-llama/llama-3.2-11b-vision-instruct'],
  },
  {
    slug: 'llama-3-2-90b',
    name: 'Llama 3.2 90B Vision',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.9,
    outputPricePerMillion: 0.9,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Llama 3.2 90B Vision is Meta's large open-weight multimodal model — strong on image understanding and visual reasoning while remaining self-hostable. Best open multimodal option before Llama 4.",
    strengths: ['Best open-weight multimodal before Llama 4', 'Self-hostable', 'Competitive visual reasoning'],
    weaknesses: ['Hosting requires significant GPU resources', 'Symmetric pricing model'],
    useCases: ['Production vision pipelines', 'On-prem multimodal apps', 'Visual document analysis'],
    relatedSlugs: ['llama-3-2-11b', 'llama-4-maverick', 'gpt-4o'],
    openRouterIds: ['meta-llama/llama-3.2-90b-vision-instruct'],
  },
  {
    slug: 'llama-4-scout',
    name: 'Llama 4 Scout',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.17,
    outputPricePerMillion: 0.17,
    contextWindow: 10000000,
    outputLimit: 16384,
    tier: 'fast',
    updatedAt: U,
    description:
      "Llama 4 Scout is Meta's latest MoE model with an industry-leading 10M token context window at an affordable price. Remarkable context-to-cost ratio — suitable for entire-codebase and very long document tasks.",
    strengths: [
      '10M token context window — largest available',
      'Very cheap at $0.17/1M symmetric',
      'MoE architecture for efficient inference',
      'Open weights',
    ],
    weaknesses: ['Very long contexts require specialist infrastructure', 'MoE quality varies by host'],
    useCases: ['Entire-codebase analysis', 'Ultra-long document processing', 'Long-running agent tasks'],
    relatedSlugs: ['llama-4-maverick', 'llama-3-3-70b', 'gemini-2-5-pro'],
    openRouterIds: ['meta-llama/llama-4-scout'],
  },
  {
    slug: 'llama-4-maverick',
    name: 'Llama 4 Maverick',
    provider: 'Meta',
    providerSlug: 'meta',
    inputPricePerMillion: 0.4,
    outputPricePerMillion: 0.4,
    contextWindow: 1000000,
    outputLimit: 16384,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Llama 4 Maverick is Meta's flagship open-weight model in the Llama 4 generation — multimodal, 1M context, and competitive with GPT-4o at a fraction of the API cost.",
    strengths: ['Frontier-quality open-weight model', 'Native multimodal', '1M context at $0.40/1M', 'Self-hostable'],
    weaknesses: ['Hosting large MoE at scale requires careful infrastructure planning'],
    useCases: ['Production multimodal apps', 'On-prem frontier replacement', 'Long-context chat'],
    relatedSlugs: ['llama-4-scout', 'gpt-4o', 'claude-sonnet-4'],
    openRouterIds: ['meta-llama/llama-4-maverick'],
  },

  // ── DeepSeek ──────────────────────────────────────────────
  {
    slug: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    providerSlug: 'deepseek',
    inputPricePerMillion: 0.27,
    outputPricePerMillion: 1.1,
    contextWindow: 64000,
    outputLimit: 8000,
    tier: 'balanced',
    updatedAt: U,
    description:
      "DeepSeek V3 is the general-purpose DeepSeek model — surprisingly strong on coding and math at a fraction of GPT-4o's price. Open-weight, with growing third-party host support.",
    strengths: ['Excellent quality-per-dollar', 'Strong coding benchmarks', 'Open weights'],
    weaknesses: ['Smaller context window than US-led models', 'Less mature ecosystem outside China'],
    useCases: ['Coding tools on a budget', 'Self-hosted general chat', 'Cost benchmarking'],
    relatedSlugs: ['deepseek-r1', 'llama-3-1-70b', 'gpt-4o'],
    openRouterIds: ['deepseek/deepseek-chat'],
  },
  {
    slug: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    providerSlug: 'deepseek',
    inputPricePerMillion: 0.55,
    outputPricePerMillion: 2.19,
    contextWindow: 64000,
    outputLimit: 8000,
    tier: 'reasoning',
    updatedAt: U,
    description:
      'DeepSeek R1 is the open-weight reasoning model that disrupted the reasoning-model market by matching o1-class performance at a tiny fraction of the cost. Chain-of-thought is exposed by default.',
    strengths: ['Reasoning capability rivaling o-series at much lower cost', 'Open weights enable self-hosting', 'Exposed chain-of-thought'],
    weaknesses: ['Smaller context', 'Reasoning tokens count toward output cost'],
    useCases: ['Cost-conscious reasoning workloads', 'Open-weight reasoning research', 'Self-hosted o-series alternative'],
    relatedSlugs: ['deepseek-v3', 'gpt-o3', 'o4-mini'],
    openRouterIds: ['deepseek/deepseek-r1'],
  },
  {
    slug: 'deepseek-v3-0324',
    name: 'DeepSeek V3 0324',
    provider: 'DeepSeek',
    providerSlug: 'deepseek',
    inputPricePerMillion: 0.27,
    outputPricePerMillion: 1.1,
    contextWindow: 128000,
    outputLimit: 8000,
    tier: 'balanced',
    updatedAt: U,
    description:
      "DeepSeek V3 0324 is an updated drop-in replacement for DeepSeek V3 — same pricing, noticeably improved coding and instruction-following. The recommended V3 variant for new projects.",
    strengths: ['Better coding and reasoning than original V3', 'Same affordable pricing', 'Open weights'],
    weaknesses: ['Still a smaller context than US-led models', 'Less mature host support than V3'],
    useCases: ['Coding tools on a budget', 'Self-hosted improved general chat', 'Migration from DeepSeek V3'],
    relatedSlugs: ['deepseek-v3', 'deepseek-r1', 'llama-4-maverick'],
    openRouterIds: ['deepseek/deepseek-chat-v3-0324'],
  },

  // ── xAI ───────────────────────────────────────────────────
  {
    slug: 'grok-2',
    name: 'Grok 2',
    provider: 'xAI',
    providerSlug: 'xai',
    inputPricePerMillion: 2,
    outputPricePerMillion: 10,
    contextWindow: 131072,
    outputLimit: 4096,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Grok 2 is xAI's general-purpose model with built-in real-time context from X (Twitter). Competitive on text reasoning and uniquely positioned for social/news-aware applications.",
    strengths: ['Built-in real-time knowledge via X integration', 'Competitive general-purpose quality', '128K context'],
    weaknesses: ['Pricing matches frontier models without the ecosystem', 'Limited multimodal'],
    useCases: ['Social media analysis', 'News-aware chatbots', 'X-platform integrations'],
    relatedSlugs: ['grok-3', 'gpt-4o', 'claude-sonnet-4'],
    openRouterIds: ['x-ai/grok-2'],
  },
  {
    slug: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    providerSlug: 'xai',
    inputPricePerMillion: 3,
    outputPricePerMillion: 15,
    contextWindow: 131072,
    outputLimit: 8192,
    tier: 'flagship',
    updatedAt: U,
    description:
      "Grok 3 is xAI's flagship — a step up from Grok 2 on reasoning and coding benchmarks with the same X-platform real-time context.",
    strengths: ['Frontier-class reasoning', 'Real-time X data integration', 'Larger output limit than Grok 2'],
    weaknesses: ['More expensive than Grok 2', 'Smaller ecosystem than OpenAI/Anthropic'],
    useCases: ['Real-time analytics', 'Coding assistants with current info', 'Research with live data'],
    relatedSlugs: ['grok-2', 'gpt-o3', 'claude-opus-4'],
    openRouterIds: ['x-ai/grok-3'],
  },
  {
    slug: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xAI',
    providerSlug: 'xai',
    inputPricePerMillion: 0.3,
    outputPricePerMillion: 0.5,
    contextWindow: 131072,
    outputLimit: 8192,
    tier: 'fast',
    updatedAt: U,
    description:
      "Grok 3 Mini is xAI's budget model — lightweight reasoning at very low cost with the same real-time X (Twitter) data access as its bigger siblings.",
    strengths: ['Very cheap at $0.30/1M input', 'Real-time X data integration', 'Solid reasoning for the price'],
    weaknesses: ['Less capable than Grok 3 on complex tasks', 'Smaller output limit'],
    useCases: ['Social media signal parsing', 'Budget chatbots with real-time data', 'High-volume classification'],
    relatedSlugs: ['grok-3', 'grok-2', 'gpt-4o-mini'],
    openRouterIds: ['x-ai/grok-3-mini'],
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
    updatedAt: U,
    description:
      "Mistral Large is Mistral AI's flagship model — a strong open-weight competitor that offers competitive performance at a lower price than GPT-4o. Particularly strong at coding and European languages.",
    strengths: ['Strong multilingual performance (especially European languages)', 'Competitive coding benchmark scores', 'Lower cost than OpenAI equivalents', 'Function calling and JSON mode support'],
    weaknesses: ['Smaller ecosystem and fewer integrations', 'Lower output limit than frontier models'],
    useCases: ['Multilingual applications', 'Coding tools for European markets', 'Cost-conscious enterprise applications'],
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
    updatedAt: U,
    description:
      'Mistral Small is an ultra-affordable model for lightweight tasks. At $0.10/1M input tokens, it competes directly with Google Flash models on price while offering solid general-purpose performance.',
    strengths: ['Very affordable at $0.10/1M input tokens', 'Good for simple tasks and structured outputs', 'Low latency'],
    weaknesses: ['Smaller context window (32K)', 'Not suitable for complex reasoning or long documents'],
    useCases: ['Simple classification and routing', 'Quick summarization', 'Lightweight chatbot responses'],
    relatedSlugs: ['mistral-large', 'gpt-4o-mini', 'gemini-2-0-flash'],
    openRouterIds: ['mistralai/mistral-small'],
  },
  {
    slug: 'mistral-nemo',
    name: 'Mistral Nemo',
    provider: 'Mistral',
    providerSlug: 'mistral',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.15,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      'Mistral Nemo is a 12B open-weight model co-developed with NVIDIA. Cheap, multilingual, and notable for symmetric input/output pricing across most hosts.',
    strengths: ['Symmetric in/out price simplifies cost modeling', '128K context for a small model', 'Open weights'],
    weaknesses: ['12B parameter ceiling limits hardest tasks', 'Newer — less battle-tested'],
    useCases: ['Multilingual extraction', 'Edge inference', 'Self-hosted small chatbots'],
    relatedSlugs: ['mistral-small', 'llama-3-1-8b', 'gemini-1-5-flash'],
    openRouterIds: ['mistralai/mistral-nemo'],
  },
  {
    slug: 'codestral',
    name: 'Codestral',
    provider: 'Mistral',
    providerSlug: 'mistral',
    inputPricePerMillion: 0.3,
    outputPricePerMillion: 0.9,
    contextWindow: 32000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      "Codestral is Mistral's code-specialized model — purpose-built for code generation, completion, and refactoring. Outperforms general-purpose models of similar size on coding benchmarks.",
    strengths: ['Code-specialized training', 'Cheap for a code model', 'Fill-in-the-middle support'],
    weaknesses: ['Not for non-code tasks', '32K context window'],
    useCases: ['Code completion (IDE integration)', 'Bulk code generation', 'Refactor tooling'],
    relatedSlugs: ['mistral-large', 'gpt-4o', 'claude-sonnet-4'],
    openRouterIds: ['mistralai/codestral'],
  },
  {
    slug: 'mistral-medium-3',
    name: 'Mistral Medium 3',
    provider: 'Mistral',
    providerSlug: 'mistral',
    inputPricePerMillion: 0.4,
    outputPricePerMillion: 2,
    contextWindow: 128000,
    outputLimit: 8192,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Mistral Medium 3 slots between Small and Large — better quality than Small on complex tasks at a fraction of Large's price. Strong multilingual and coding performance in a mid-tier form factor.",
    strengths: ['Strong quality-per-dollar in the mid tier', 'Multilingual performance', 'Good function calling support'],
    weaknesses: ['Less capable than Mistral Large on hardest tasks', 'Smaller ecosystem than OpenAI'],
    useCases: ['Production apps needing more than Small', 'Multilingual workflows', 'Function-calling pipelines'],
    relatedSlugs: ['mistral-large', 'mistral-small', 'gpt-4o-mini'],
    openRouterIds: ['mistralai/mistral-medium-3'],
  },
  {
    slug: 'pixtral-12b',
    name: 'Pixtral 12B',
    provider: 'Mistral',
    providerSlug: 'mistral',
    inputPricePerMillion: 0.1,
    outputPricePerMillion: 0.1,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      "Pixtral 12B is Mistral's multimodal model — a 12B vision-language model designed for image understanding at a very low price. Self-hostable and capable of document and image analysis tasks.",
    strengths: ['Multimodal at $0.10/1M — extremely cheap for vision', 'Open weights', 'Good document and chart understanding'],
    weaknesses: ['Not for complex visual reasoning', 'Smaller than GPT-4o Vision'],
    useCases: ['Budget image classification', 'Document OCR', 'Visual data extraction'],
    relatedSlugs: ['mistral-large', 'llama-3-2-11b', 'gemini-2-0-flash'],
    openRouterIds: ['mistralai/pixtral-12b'],
  },

  // ── Qwen (Alibaba) ────────────────────────────────────────
  {
    slug: 'qwen-2-5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Qwen',
    providerSlug: 'qwen',
    inputPricePerMillion: 0.35,
    outputPricePerMillion: 0.4,
    contextWindow: 128000,
    outputLimit: 8192,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Qwen 2.5 72B is Alibaba's flagship open-weight model — surprisingly strong on coding and math benchmarks, competitive with GPT-4o class models at a fraction of the cost. A top choice for self-hosted general workloads.",
    strengths: [
      'Excellent coding and math benchmark scores',
      'Open weights — self-hostable',
      'Cheap at $0.35/1M input',
      'Strong multilingual support (Chinese, Japanese, etc.)',
    ],
    weaknesses: ['Less mature Western ecosystem', 'Below frontier on non-STEM tasks'],
    useCases: ['Coding assistants on a budget', 'APAC multilingual apps', 'Self-hosted high-quality chat'],
    relatedSlugs: ['qwq-32b', 'llama-3-3-70b', 'gpt-4o'],
    openRouterIds: ['qwen/qwen-2.5-72b-instruct'],
  },
  {
    slug: 'qwq-32b',
    name: 'QwQ 32B',
    provider: 'Qwen',
    providerSlug: 'qwen',
    inputPricePerMillion: 0.15,
    outputPricePerMillion: 0.6,
    contextWindow: 131072,
    outputLimit: 32768,
    tier: 'reasoning',
    updatedAt: U,
    description:
      "QwQ 32B is Qwen's open-weight reasoning model — chain-of-thought capabilities rivaling much larger models at a remarkably low price. One of the best value reasoning models available.",
    strengths: [
      'Reasoning quality comparable to o1-mini at much lower cost',
      'Open weights — can be self-hosted',
      '$0.15/1M input — cheapest reasoning model class',
    ],
    weaknesses: ['Chain-of-thought can be verbose', 'Less capable than o3 on hardest problems'],
    useCases: ['Budget reasoning pipelines', 'Open-weight o-series alternative', 'STEM education tools'],
    relatedSlugs: ['qwen-2-5-72b', 'deepseek-r1', 'o3-mini'],
    openRouterIds: ['qwen/qwq-32b'],
  },

  // ── Cohere ────────────────────────────────────────────────
  {
    slug: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    providerSlug: 'cohere',
    inputPricePerMillion: 2.5,
    outputPricePerMillion: 10,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'flagship',
    updatedAt: U,
    description:
      "Command R+ is Cohere's flagship model, purpose-built for enterprise RAG and tool use. Its grounded generation reduces hallucination in retrieval pipelines, making it a leading choice for document Q&A applications.",
    strengths: ['Purpose-built for RAG with grounded generation', 'Strong tool use and function calling', 'Multilingual support'],
    weaknesses: ['Not as strong as GPT-4o on general tasks', 'Smaller output limit'],
    useCases: ['Enterprise document Q&A', 'RAG pipelines', 'Tool-use agents', 'Multilingual enterprise apps'],
    relatedSlugs: ['command-r', 'gpt-4o', 'claude-sonnet-4'],
    openRouterIds: ['cohere/command-r-plus'],
  },
  {
    slug: 'command-r',
    name: 'Command R',
    provider: 'Cohere',
    providerSlug: 'cohere',
    inputPricePerMillion: 0.5,
    outputPricePerMillion: 1.5,
    contextWindow: 128000,
    outputLimit: 4096,
    tier: 'balanced',
    updatedAt: U,
    description:
      "Command R is Cohere's mid-tier RAG-optimized model — same grounded generation as Command R+ at a significantly lower price. The best Cohere option for cost-sensitive retrieval workloads.",
    strengths: ['RAG-optimized grounded generation', 'Much cheaper than Command R+', 'Solid multilingual support'],
    weaknesses: ['Less capable than Command R+ on complex instructions'],
    useCases: ['Cost-sensitive document Q&A', 'Production RAG pipelines', 'Multilingual search'],
    relatedSlugs: ['command-r-plus', 'gpt-4o-mini', 'mistral-medium-3'],
    openRouterIds: ['cohere/command-r'],
  },

  // ── Amazon ────────────────────────────────────────────────
  {
    slug: 'nova-pro',
    name: 'Amazon Nova Pro',
    provider: 'Amazon',
    providerSlug: 'amazon',
    inputPricePerMillion: 0.8,
    outputPricePerMillion: 3.2,
    contextWindow: 300000,
    outputLimit: 5120,
    tier: 'flagship',
    updatedAt: U,
    description:
      "Amazon Nova Pro is AWS's flagship generative AI model — multimodal, 300K context, and deeply integrated with the AWS ecosystem. The natural choice for teams already on AWS Bedrock.",
    strengths: [
      'Native AWS Bedrock integration',
      '300K context window',
      'Multimodal (text, image, video)',
      'Competitive pricing for AWS workloads',
    ],
    weaknesses: ['Best-supported on AWS only', 'Below frontier quality vs GPT-4o/Claude Sonnet'],
    useCases: ['AWS-native AI applications', 'Enterprise document processing on Bedrock', 'Multimodal AWS pipelines'],
    relatedSlugs: ['nova-lite', 'claude-sonnet-4', 'gpt-4o'],
    openRouterIds: ['amazon/nova-pro-v1'],
  },
  {
    slug: 'nova-lite',
    name: 'Amazon Nova Lite',
    provider: 'Amazon',
    providerSlug: 'amazon',
    inputPricePerMillion: 0.06,
    outputPricePerMillion: 0.24,
    contextWindow: 300000,
    outputLimit: 5120,
    tier: 'fast',
    updatedAt: U,
    description:
      "Amazon Nova Lite is a very cheap multimodal model from AWS — $0.06/1M input with a 300K context window and image understanding. Excellent for AWS-native high-volume pipelines.",
    strengths: ['Very cheap at $0.06/1M input', '300K context', 'Multimodal', 'AWS Bedrock native'],
    weaknesses: ['Weaker than Nova Pro on complex tasks', 'AWS-centric'],
    useCases: ['High-volume AWS pipelines', 'Budget multimodal on Bedrock', 'Document extraction at scale'],
    relatedSlugs: ['nova-pro', 'nova-micro', 'gemini-2-0-flash'],
    openRouterIds: ['amazon/nova-lite-v1'],
  },
  {
    slug: 'nova-micro',
    name: 'Amazon Nova Micro',
    provider: 'Amazon',
    providerSlug: 'amazon',
    inputPricePerMillion: 0.035,
    outputPricePerMillion: 0.14,
    contextWindow: 128000,
    outputLimit: 5120,
    tier: 'fast',
    updatedAt: U,
    description:
      "Amazon Nova Micro is AWS's text-only budget model — the cheapest offering in the Nova family at $0.035/1M input. Optimized for high-throughput, low-latency tasks within the AWS ecosystem.",
    strengths: ['Cheapest Nova model at $0.035/1M', 'Low latency', 'AWS Bedrock native'],
    weaknesses: ['Text-only, no multimodal', '128K context (smallest of the Nova family)'],
    useCases: ['High-volume text classification on AWS', 'Simple Q&A pipelines', 'Cost floor for Bedrock workloads'],
    relatedSlugs: ['nova-lite', 'nova-pro', 'gpt-4-1-nano'],
    openRouterIds: ['amazon/nova-micro-v1'],
  },

  // ── Microsoft ─────────────────────────────────────────────
  {
    slug: 'phi-4',
    name: 'Phi-4',
    provider: 'Microsoft',
    providerSlug: 'microsoft',
    inputPricePerMillion: 0.07,
    outputPricePerMillion: 0.14,
    contextWindow: 16384,
    outputLimit: 4096,
    tier: 'fast',
    updatedAt: U,
    description:
      "Phi-4 is Microsoft's small language model — a 14B parameter model that punches above its weight class on reasoning and math benchmarks. Designed for on-device and edge inference where quality-per-parameter matters.",
    strengths: [
      'Best reasoning quality at this parameter count',
      'Very cheap — $0.07/1M input',
      'Efficient: great for edge and on-device deployment',
      'Strong on STEM tasks relative to size',
    ],
    weaknesses: ['16K context limit — much smaller than competitors', 'Not for long-document tasks'],
    useCases: ['Edge and on-device reasoning', 'STEM tutoring apps', 'Budget math/coding assistance'],
    relatedSlugs: ['llama-3-2-3b', 'mistral-small', 'gpt-4-1-nano'],
    openRouterIds: ['microsoft/phi-4'],
  },
]

// ── Merge curated editorial with the daily live feed ────────────────────────
// 1. Refresh each curated entry's pricing/context from the live feed (keyed by
//    its openRouterIds), so prices stay current without touching this file.
for (const m of CURATED_MODELS) {
  for (const id of m.openRouterIds ?? []) {
    const lp = LIVE_PRICING[id]
    if (lp) {
      m.inputPricePerMillion = lp.input
      m.outputPricePerMillion = lp.output
      if (lp.context) m.contextWindow = lp.context
      m.updatedAt = LIVE_UPDATED_AT
      break
    }
  }
}

// 2. Append every live model that a curated entry doesn't already cover (matched
//    by slug or by OpenRouter id), so new model ships appear automatically.
const curatedSlugs = new Set(CURATED_MODELS.map((m) => m.slug))
const curatedIds = new Set(CURATED_MODELS.flatMap((m) => m.openRouterIds ?? []))
const liveExtras = EXTRA_MODELS.filter(
  (m) => !curatedSlugs.has(m.slug) && !(m.openRouterIds ?? []).some((id) => curatedIds.has(id)),
)

export const ALL_MODELS: ModelData[] = [...CURATED_MODELS, ...liveExtras]

// Public "last updated" date — the day the live feed was last regenerated.
export const MODELS_UPDATED_AT = LIVE_UPDATED_AT || U

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

export interface ProviderInfo {
  name: string
  slug: string
  description: string
  url?: string
}

// Single source of truth for OpenRouter id-prefix → provider mapping. The live
// calculator (homepage) and the compare-prices tool both derive their PROVIDER_MAP
// from this so they can never drift out of sync. The daily catalog generator
// (scripts/build-models.mjs) mirrors this list — it's a standalone Node script that
// can't import this module at generate-time, so keep the two in step when editing.
export const PROVIDER_PREFIXES: { prefix: string; slug: string; name: string }[] = [
  { prefix: 'anthropic/', slug: 'anthropic', name: 'Anthropic' },
  { prefix: 'openai/', slug: 'openai', name: 'OpenAI' },
  { prefix: 'google/', slug: 'google', name: 'Google' },
  { prefix: 'meta-llama/', slug: 'meta', name: 'Meta' },
  { prefix: 'deepseek/', slug: 'deepseek', name: 'DeepSeek' },
  { prefix: 'mistralai/', slug: 'mistral', name: 'Mistral' },
  { prefix: 'x-ai/', slug: 'xai', name: 'xAI' },
  { prefix: 'qwen/', slug: 'qwen', name: 'Qwen' },
  { prefix: 'cohere/', slug: 'cohere', name: 'Cohere' },
  { prefix: 'amazon/', slug: 'amazon', name: 'Amazon' },
  { prefix: 'microsoft/', slug: 'microsoft', name: 'Microsoft' },
  // ── Expanded provider coverage ──────────────────────────────────────────
  { prefix: 'z-ai/', slug: 'zhipu', name: 'Zhipu AI' },
  { prefix: 'moonshotai/', slug: 'moonshot', name: 'Moonshot AI' },
  { prefix: 'nvidia/', slug: 'nvidia', name: 'NVIDIA' },
  { prefix: 'minimax/', slug: 'minimax', name: 'MiniMax' },
  { prefix: 'perplexity/', slug: 'perplexity', name: 'Perplexity' },
  { prefix: 'nousresearch/', slug: 'nous', name: 'Nous Research' },
  // ByteDance ships under two OpenRouter prefixes — both map to one provider.
  { prefix: 'bytedance-seed/', slug: 'bytedance', name: 'ByteDance' },
  { prefix: 'bytedance/', slug: 'bytedance', name: 'ByteDance' },
  { prefix: 'arcee-ai/', slug: 'arcee', name: 'Arcee AI' },
  { prefix: 'ai21/', slug: 'ai21', name: 'AI21 Labs' },
  { prefix: 'rekaai/', slug: 'reka', name: 'Reka AI' },
  { prefix: 'ibm-granite/', slug: 'ibm', name: 'IBM' },
  { prefix: 'tencent/', slug: 'tencent', name: 'Tencent' },
  { prefix: 'inflection/', slug: 'inflection', name: 'Inflection AI' },
  { prefix: 'liquid/', slug: 'liquid', name: 'Liquid AI' },
  { prefix: 'allenai/', slug: 'allenai', name: 'Allen Institute for AI' },
  { prefix: 'baidu/', slug: 'baidu', name: 'Baidu' },
  { prefix: 'writer/', slug: 'writer', name: 'Writer' },
  { prefix: 'upstage/', slug: 'upstage', name: 'Upstage' },
]

export const PROVIDERS: ProviderInfo[] = [
  {
    name: 'Anthropic',
    slug: 'anthropic',
    description:
      'Anthropic builds the Claude family of language models — known for strong reasoning, long context, and a safety-first design philosophy. Models are available via the Anthropic API and aggregators like AWS Bedrock and Google Vertex.',
    url: 'https://www.anthropic.com',
  },
  {
    name: 'OpenAI',
    slug: 'openai',
    description:
      'OpenAI created GPT and the modern LLM ecosystem. The GPT-4o and o-series models power ChatGPT, the OpenAI API, and Microsoft Azure OpenAI.',
    url: 'https://openai.com',
  },
  {
    name: 'Google',
    slug: 'google',
    description:
      "Google's Gemini family pushes the long-context frontier with 1M+ token windows, native multimodality, and aggressive pricing on the Flash tier. Available via Google AI Studio and Vertex AI.",
    url: 'https://ai.google',
  },
  {
    name: 'Meta',
    slug: 'meta',
    description:
      'Meta publishes the Llama family of open-weight models. Llama 3.1 ranges from a tiny 8B variant to a 405B frontier model, and is hosted by every major inference provider.',
    url: 'https://llama.meta.com',
  },
  {
    name: 'DeepSeek',
    slug: 'deepseek',
    description:
      'DeepSeek is a Chinese AI lab whose open-weight V3 and R1 models redefined the cost frontier for reasoning and general capability.',
    url: 'https://www.deepseek.com',
  },
  {
    name: 'xAI',
    slug: 'xai',
    description:
      "xAI builds the Grok family of models, integrated with real-time X (Twitter) data. Available through the xAI API and X's premium tier.",
    url: 'https://x.ai',
  },
  {
    name: 'Mistral',
    slug: 'mistral',
    description:
      'Mistral AI is a French AI lab building open and proprietary models with a focus on European languages, function calling, and code-specialized variants.',
    url: 'https://mistral.ai',
  },
  {
    name: 'Qwen',
    slug: 'qwen',
    description:
      "Qwen is Alibaba's family of open-weight language and multimodal models. The Qwen 2.5 and QwQ series consistently top open-source benchmarks for coding and math, with strong multilingual support across Asian languages.",
    url: 'https://qwenlm.github.io',
  },
  {
    name: 'Cohere',
    slug: 'cohere',
    description:
      'Cohere builds enterprise-focused LLMs optimized for retrieval-augmented generation (RAG) and tool use. The Command R series is purpose-built for grounded, citation-accurate answers in document Q&A pipelines.',
    url: 'https://cohere.com',
  },
  {
    name: 'Amazon',
    slug: 'amazon',
    description:
      "Amazon's Nova family of generative AI models is natively integrated with AWS Bedrock, offering text, image, and video understanding across Pro, Lite, and Micro tiers — optimized for enterprise AWS workloads.",
    url: 'https://aws.amazon.com/bedrock',
  },
  {
    name: 'Microsoft',
    slug: 'microsoft',
    description:
      "Microsoft's Phi family of small language models (SLMs) is designed for edge and on-device inference. Phi-4 delivers frontier-class reasoning within a 14B parameter footprint, optimized for STEM and coding tasks.",
    url: 'https://azure.microsoft.com/en-us/products/phi',
  },
]

export function getProviderBySlug(slug: string): ProviderInfo | undefined {
  return PROVIDERS.find((p) => p.slug === slug)
}
