export interface GuideData {
  slug: string
  title: string
  description: string
  /**
   * Answer-first ("BLUF") summary rendered above the first section heading.
   * 2–3 sentences that fully answer the guide's primary question with
   * extractable facts — what AI retrieval engines pull as citations.
   */
  tldr: string
  readTime: string
  content: GuideSection[]
  relatedSlugs: string[]
  /**
   * Primary-source citations for the factual claims in this guide.
   * Surfaced as a "Sources" block on the guide page and as link equity
   * back to the authoritative origin.
   */
  sources?: GuideSource[]
  publishedAt: string
  updatedAt: string
}

export interface GuideSection {
  heading: string
  body: string
}

export interface GuideSource {
  label: string
  url: string
  note?: string
}

export const ALL_GUIDES: GuideData[] = [
  {
    slug: 'what-are-ai-tokens',
    title: 'What Are AI Tokens?',
    description:
      'A clear, simple explanation of AI tokens — what they are, how models use them, and why token count matters for pricing and performance.',
    tldr: 'An AI token is the smallest unit of text that a large language model processes — roughly 4 characters or three-quarters of a word in English. The word "hamburger" tokenizes to 3 tokens ("ham", "bur", "ger"); "hi" is 1 token. AI APIs (Claude, GPT-4o, Gemini) bill by the token, charging separately for input tokens (text you send) and output tokens (text generated), with output typically priced 3–5× higher than input.',
    readTime: '4 min read',
    publishedAt: '2026-01-15',
    updatedAt: '2026-05-22',
    relatedSlugs: ['how-ai-api-pricing-works', 'how-many-tokens-in-1000-words'],
    sources: [
      { label: 'OpenAI — What are tokens and how to count them', url: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them' },
      { label: 'Anthropic — Glossary: Tokens', url: 'https://docs.anthropic.com/en/docs/resources/glossary' },
      { label: 'Google AI — Understand and count tokens', url: 'https://ai.google.dev/gemini-api/docs/tokens' },
      { label: 'Anthropic — Prompt caching', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', note: 'Caches can reduce input token costs by up to 90%.' },
    ],
    content: [
      {
        heading: 'The Basic Definition',
        body: 'A token is the smallest unit of text that an AI language model processes. Think of tokens as the "atoms" of language for AI systems — words, punctuation, and spaces are all broken into tokens before the model reads them.\n\nIn English, one token is roughly 4 characters or three-quarters of a word. Common short words like "the", "is", "a" are each one token. Longer or rarer words may be split into multiple tokens. The word "hamburger" is 3 tokens (ham, bur, ger); "hi" is 1 token.',
      },
      {
        heading: 'Why Tokens Matter',
        body: 'AI APIs charge by the token — not by the word, sentence, or request. Every time you call an API like Claude, GPT-4o, or Gemini, the provider counts:\n\n• Input tokens: everything you send (your prompt, system instructions, conversation history)\n• Output tokens: everything the model generates in response\n\nYou are billed for both. Output tokens are typically 3–5× more expensive than input tokens, because generating text requires more compute than reading it.',
      },
      {
        heading: 'Token Counting in Practice',
        body: 'Each AI provider uses a slightly different tokenizer, but the following rules of thumb hold across most English-language models:\n\n• 1 word ≈ 1.33 tokens\n• 1,000 words ≈ 1,333 tokens\n• 1 page of text (250 words) ≈ 333 tokens\n• 1 character ≈ 0.25 tokens\n\nNon-English text, code, and special characters often tokenize differently. Chinese and Japanese text, for example, may use 1–2 tokens per character.',
      },
      {
        heading: 'Context Windows',
        body: 'Every model has a "context window" — the maximum number of tokens it can process in a single call. This includes both input and output. A model with a 128K context window can process about 96,000 words total (input + output combined).\n\nLarger context windows allow you to:\n• Process entire documents or codebases at once\n• Maintain long conversation histories\n• Provide extensive examples without truncation\n\nModels like Gemini 2.5 Pro support 1 million tokens — enough to process an entire novel in one call.',
      },
      {
        heading: 'How to Reduce Token Usage',
        body: 'Since tokens directly equal cost, reducing unnecessary tokens saves money:\n\n• Be concise in your prompts — remove filler words\n• Use system prompts efficiently (they count toward every request)\n• Summarize long conversation histories instead of sending them in full\n• Choose structured output formats (JSON, bullet points) over verbose prose\n• Cache repeated content where your provider supports it (Anthropic prompt caching can reduce costs by up to 90%)',
      },
    ],
  },
  {
    slug: 'how-ai-api-pricing-works',
    title: 'How AI API Pricing Works',
    description:
      'A practical guide to understanding per-token pricing, input vs output costs, and how to estimate your AI API bill before it arrives.',
    tldr: 'AI APIs price by the token, quoted as $/1 million tokens. Input tokens (the text you send) and output tokens (the text the model generates) are billed separately, with output costing 3–5× more. As of May 2026, Claude Sonnet 4 charges $3/1M input and $15/1M output — meaning a 1,000-input/500-output request costs about $0.0105. Batch APIs (Anthropic, OpenAI) cut that 50%, and prompt caching cuts cached input tokens by ~90%.',
    readTime: '5 min read',
    publishedAt: '2026-01-20',
    updatedAt: '2026-05-22',
    relatedSlugs: ['what-are-ai-tokens', 'how-to-reduce-ai-api-costs'],
    sources: [
      { label: 'Anthropic — API pricing', url: 'https://www.anthropic.com/pricing', note: 'Source of Claude Sonnet 4 $3/$15 reference price.' },
      { label: 'OpenAI — API pricing', url: 'https://openai.com/api/pricing/' },
      { label: 'Google — Gemini API pricing', url: 'https://ai.google.dev/pricing' },
      { label: 'Anthropic — Batch API (50% discount)', url: 'https://docs.anthropic.com/en/docs/build-with-claude/batch-processing' },
      { label: 'OpenAI — Batch API (50% discount)', url: 'https://platform.openai.com/docs/guides/batch' },
    ],
    content: [
      {
        heading: 'The Per-Token Model',
        body: 'Almost every major AI provider prices their API by the token. The standard unit is "per 1 million tokens" — usually written as $/1M tokens or $/MTok.\n\nFor example, Claude Sonnet 4 costs:\n• $3.00 per 1M input tokens\n• $15.00 per 1M output tokens\n\nIf you send a 1,000-token prompt and receive a 500-token response, you pay: (1,000 × $3 / 1,000,000) + (500 × $15 / 1,000,000) = $0.003 + $0.0075 = $0.0105 — just over one cent.',
      },
      {
        heading: 'Input vs Output Pricing',
        body: 'Every model charges differently for input (text you send) and output (text the model generates). Output tokens are almost always more expensive — typically 3–5× the input price. This is because generating tokens is computationally more intensive than reading them.\n\nThis asymmetry matters for how you design prompts:\n• Long system prompts with detailed instructions → more input tokens\n• Asking for verbose, detailed answers → more output tokens\n• Caching repeated prompt sections → can dramatically cut input costs',
      },
      {
        heading: 'Context Window and Costs',
        body: 'The context window limits how much text a model can process at once — and it directly affects your bill. If you send a 100,000 token document plus a 500 token question, you pay for 100,500 input tokens. With Gemini 2.5 Pro at $1.25/1M, that\'s $0.13 per query.\n\nFor long-context tasks, model choice matters enormously. A cheaper model with a large context window can be dramatically more affordable than a premium model.',
      },
      {
        heading: 'Estimating Your Monthly Bill',
        body: 'To estimate costs:\n1. Estimate average tokens per request (input + output separately)\n2. Multiply by your expected request volume per month\n3. Apply the per-token rate\n\nExample: A chatbot that processes 500 input tokens and generates 300 output tokens per conversation, running 10,000 conversations/month with Claude Haiku 4:\n• Input: 500 × 10,000 × ($0.25/1M) = $1.25\n• Output: 300 × 10,000 × ($1.25/1M) = $3.75\n• Monthly total: ~$5.00\n\nUsing the TokenRate calculator, you can model this instantly for any model.',
      },
      {
        heading: 'Hidden Costs to Watch For',
        body: '• System prompts count toward every request — a 2,000-token system prompt on 1M requests is 2B extra tokens\n• Conversation history grows with each turn — consider summarizing or truncating\n• Retries and errors still consume tokens\n• Some providers charge for cached tokens at a discounted rate (Anthropic: 10% of base price)\n• Batch APIs (Anthropic, OpenAI) offer 50% discounts for non-real-time processing',
      },
    ],
  },
  {
    slug: 'how-many-tokens-in-1000-words',
    title: 'How Many Tokens in 1,000 Words?',
    description:
      'Quick reference guide for converting between words, characters, pages, and AI tokens for any major language model.',
    tldr: '1,000 words of English text is approximately 1,333 AI tokens — based on a ratio of ~1.33 tokens per word, or ~4 characters per token. A single page (250 words) is ~333 tokens, a 10-page document (2,500 words) is ~3,333 tokens, and a full novel (80,000 words) is ~106,667 tokens. The ratio varies less than 5% across the major tokenizers used by OpenAI (cl100k_base / o200k_base), Anthropic, and Google.',
    readTime: '3 min read',
    publishedAt: '2026-02-05',
    updatedAt: '2026-05-22',
    relatedSlugs: ['what-are-ai-tokens', 'how-ai-api-pricing-works'],
    sources: [
      { label: 'OpenAI tokenizer (cl100k_base / o200k_base)', url: 'https://platform.openai.com/tokenizer' },
      { label: 'Anthropic — Token counting', url: 'https://docs.anthropic.com/en/docs/build-with-claude/token-counting' },
      { label: 'Google — Count tokens with Gemini API', url: 'https://ai.google.dev/gemini-api/docs/tokens' },
      { label: 'tiktoken (OpenAI tokenizer library)', url: 'https://github.com/openai/tiktoken' },
    ],
    content: [
      {
        heading: 'The Quick Answer',
        body: '1,000 words of English text ≈ 1,333 tokens.\n\nThis is based on the widely-used estimate of 4 characters per token and an average English word length of ~5.3 characters including spaces. The exact number varies by text type: simple, common words tokenize more efficiently than technical jargon or code.',
      },
      {
        heading: 'Word-to-Token Reference Table',
        body: 'Here are common conversions for English prose:\n\n• 100 words → ~133 tokens\n• 250 words (1 page) → ~333 tokens\n• 500 words → ~667 tokens\n• 1,000 words → ~1,333 tokens\n• 2,000 words → ~2,667 tokens\n• 5,000 words (short story) → ~6,667 tokens\n• 10,000 words (long article) → ~13,333 tokens\n• 80,000 words (novel) → ~106,667 tokens',
      },
      {
        heading: 'Character-to-Token Conversion',
        body: 'For precise estimation: 1 token ≈ 4 characters (including spaces and punctuation).\n\n• 1,000 characters → ~250 tokens\n• 10,000 characters → ~2,500 tokens\n• 100,000 characters → ~25,000 tokens\n\nThis 4:1 ratio holds well for typical English text. Code, markdown, and other structured text often have slightly different ratios.',
      },
      {
        heading: 'Does the Model Affect Token Count?',
        body: 'Yes — each provider uses a different tokenizer, which means the same text may produce a slightly different token count across models:\n\n• OpenAI uses cl100k_base (GPT-4, GPT-3.5) or o200k_base (GPT-4o)\n• Anthropic uses a custom tokenizer optimized for Claude\n• Google\'s Gemini uses SentencePiece\n\nIn practice, the differences are small (typically <5%) for standard English text. Our 4 chars/token estimate works as a reliable approximation for all major models.',
      },
      {
        heading: 'Token Cost for 1,000 Words',
        body: 'How much does it cost to send 1,000 words to different models?\n\n• Claude Opus 4: 1,333 tokens × $15/1M = $0.020\n• Claude Sonnet 4: 1,333 tokens × $3/1M = $0.004\n• GPT-4o: 1,333 tokens × $2.50/1M = $0.003\n• Gemini 2.0 Flash: 1,333 tokens × $0.10/1M = $0.0001\n• Claude Haiku 4: 1,333 tokens × $0.25/1M = $0.0003\n\nUse the TokenRate calculator to compare these costs across all models instantly.',
      },
    ],
  },
  {
    slug: 'how-to-reduce-ai-api-costs',
    title: 'How to Reduce AI API Costs',
    description:
      'Practical strategies to cut your AI API spending without sacrificing quality — from prompt optimization to model routing and caching.',
    tldr: 'The largest cost-reduction lever is model routing — sending 80% of simple requests to a cheap model (Claude Haiku 4 at $0.25/1M, Gemini 2.0 Flash at $0.10/1M) and reserving flagship models for hard requests typically cuts costs 60–80%. Stack with prompt caching (90% discount on cached input tokens), Batch APIs (50% discount, 24-hour turnaround), output-length controls, and conversation-history summarization. Together these can cut an AI bill 5–10× without changing the user-facing product.',
    readTime: '6 min read',
    publishedAt: '2026-02-18',
    updatedAt: '2026-05-22',
    relatedSlugs: ['how-ai-api-pricing-works', 'what-are-ai-tokens'],
    sources: [
      { label: 'Anthropic — Prompt caching (90% discount on cached tokens)', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching' },
      { label: 'OpenAI — Prompt caching', url: 'https://platform.openai.com/docs/guides/prompt-caching' },
      { label: 'Anthropic — Batch API (50% discount)', url: 'https://docs.anthropic.com/en/docs/build-with-claude/batch-processing' },
      { label: 'OpenAI — Batch API (50% discount, 24-hour SLA)', url: 'https://platform.openai.com/docs/guides/batch' },
      { label: 'OpenAI — Pricing', url: 'https://openai.com/api/pricing/' },
    ],
    content: [
      {
        heading: 'Choose the Right Model for Each Task',
        body: 'The biggest lever for cost reduction is model selection. Most tasks don\'t need a frontier model. Consider a tiered approach:\n\n• Simple tasks (classification, extraction, FAQ): Claude Haiku 4, GPT-4o mini, Gemini Flash\n• Moderate tasks (summarization, drafting, code review): Claude Sonnet 4, GPT-4o\n• Complex tasks (research, complex reasoning, architecture): Claude Opus 4, o3\n\nRouting 80% of your requests to a cheap model while reserving expensive models for complex requests can cut costs by 60–80%.',
      },
      {
        heading: 'Optimize Your Prompts',
        body: 'Every token you send costs money. Audit your prompts for:\n\n• Verbose instructions that could be shortened\n• Repeated context that could be cached\n• Unnecessary examples (few-shot examples add tokens; sometimes zero-shot is enough)\n• Long preambles and filler phrases\n• Overly detailed system prompts that don\'t change per request\n\nA 30% reduction in prompt length equals a 30% reduction in input token costs.',
      },
      {
        heading: 'Use Prompt Caching',
        body: 'Anthropic and OpenAI both support prompt caching — a feature that caches the beginning of your prompt at a steep discount.\n\nAnthropic prompt caching: cached tokens cost 10% of the base input price. If your system prompt is 2,000 tokens and it\'s sent with every request, caching it saves 90% on those tokens across every call.\n\nThis is particularly powerful for:\n• Long system prompts\n• Reference documents included in every request\n• Few-shot examples that don\'t change',
      },
      {
        heading: 'Manage Conversation History',
        body: 'In multi-turn conversations, the full history is resent with every message. A 10-turn conversation where each turn adds 500 tokens means the 10th message includes 4,500 tokens of history.\n\nStrategies:\n• Summarize conversation history after N turns\n• Use a sliding window (only keep the last N messages)\n• Extract key facts and compress them\n• Use a cheap model for summarization before passing to the main model',
      },
      {
        heading: 'Use Batch APIs for Non-Real-Time Work',
        body: 'Both Anthropic and OpenAI offer Batch APIs that process requests asynchronously at 50% of the standard price. If you\'re running analysis pipelines, data processing, or any workload that doesn\'t need an immediate response, batch processing cuts your bill in half.\n\nTypical turnaround: 24 hours or less.',
      },
      {
        heading: 'Output Length Control',
        body: 'Output tokens are 3–5× more expensive than input tokens. Controlling output length is one of the easiest ways to reduce costs:\n\n• Set max_tokens to a realistic limit for your task\n• Instruct the model to be concise: "Answer in 2–3 sentences"\n• Use structured output (JSON) to avoid verbose prose\n• Request bullet points instead of paragraphs\n\nFor a model like Claude Opus 4, each 1,000 output tokens costs $0.075 — worth controlling carefully.',
      },
    ],
  },
]

export function getGuideBySlug(slug: string): GuideData | undefined {
  return ALL_GUIDES.find((g) => g.slug === slug)
}
