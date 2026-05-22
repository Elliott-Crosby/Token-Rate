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
}

export const MODELS_UPDATED_AT = '2026-05-22'

const U = MODELS_UPDATED_AT

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

export interface ProviderInfo {
  name: string
  slug: string
  description: string
  url?: string
}

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
]

export function getProviderBySlug(slug: string): ProviderInfo | undefined {
  return PROVIDERS.find((p) => p.slug === slug)
}
