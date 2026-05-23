export interface FAQ {
  question: string
  answer: string
}

export const HOME_FAQS: FAQ[] = [
  {
    question: 'What is an AI token?',
    answer:
      'An AI token is the smallest unit of text that a large language model processes. In English, one token averages ~4 characters or three-quarters of a word — so "hamburger" tokenizes to 3 tokens ("ham", "bur", "ger") and "hi" is 1 token. AI APIs from Anthropic (Claude), OpenAI (GPT-4o), and Google (Gemini) bill by the token, charging separately for input (text you send) and output (text generated). This convention has held across every major provider since GPT-3 launched in 2020.',
  },
  {
    question: 'What is the difference between input and output tokens?',
    answer:
      'Input tokens are everything you send to the model — your prompt, system instructions, conversation history, and any retrieved context. Output tokens are what the model generates in response. As of May 2026, output tokens are 3–5× more expensive than input tokens across every major provider: Claude Sonnet 4 is $3/1M input vs $15/1M output (5×), GPT-4o is $2.50/1M input vs $10/1M output (4×), and Gemini 2.0 Flash is $0.10/1M input vs $0.40/1M output (4×). The reason: generating each output token requires a full forward pass through the model, while input tokens are processed in parallel during prefill.',
  },
  {
    question: 'How many tokens is 1,000 words?',
    answer:
      '1,000 words of English text is approximately 1,333 tokens, based on the standard ratio of ~1.33 tokens per English word (4 characters per token, ~5.3 characters per word including spaces). A 250-word page is ~333 tokens, a 2,500-word document is ~3,333 tokens, and an 80,000-word novel is ~106,667 tokens. Code, non-English languages, and structured data tokenize differently — Chinese and Japanese often run 1–2 tokens per character.',
  },
  {
    question: 'How many tokens is 1 page of text?',
    answer:
      'A standard single-spaced page of English text (250–300 words) contains ~330–400 tokens. A double-spaced manuscript page (~250 words) is also ~333 tokens. A densely packed US Letter page at 500 words is ~667 tokens. For reference, the entire works of Shakespeare (~835,000 words) come to roughly 1.1 million tokens — fitting comfortably inside a single Gemini 2.5 Pro request (1M context window).',
  },
  {
    question: 'Which AI model is the cheapest in 2026?',
    answer:
      'As of May 2026, Llama 3.1 8B is the cheapest hosted mainstream model at ~$0.05/1M input tokens, followed by Gemini 1.5 Flash at $0.075/1M, Gemini 2.0 Flash at $0.10/1M, Mistral Small at $0.10/1M, GPT-4o mini at $0.15/1M, and Claude Haiku 4 at $0.25/1M. For high-volume production workloads, Gemini 2.0 Flash usually wins on cost-per-quality because it pairs the $0.10/1M input price with a 1 million-token context window — far larger than the others at the same tier.',
  },
  {
    question: 'What does "per million tokens" mean?',
    answer:
      'AI APIs price by the million tokens (often written $/1M tokens or $/MTok). If a model lists "$3/1M input", a 1,000-token prompt costs $0.003 (1,000 ÷ 1,000,000 × $3). Most single API calls cost fractions of a cent — but at production scale (10M+ requests/month) the choice between $0.10/1M and $3/1M is the difference between a $30 bill and a $900 bill for the same workload.',
  },
  {
    question: 'How does the TokenRate calculator work?',
    answer:
      'Enter a budget (USD), a token count, or a character count into the calculator. TokenRate uses live pricing from the OpenRouter API — refreshed hourly via Next.js ISR — to compute the exact tokens-per-dollar or dollars-per-token for every tracked model in parallel. It uses the standard 4-characters-per-token approximation for English text; precise per-tokenizer counts require provider-specific libraries (tiktoken for OpenAI, the Anthropic SDK for Claude).',
  },
  {
    question: 'Is the pricing data real-time?',
    answer:
      'Live pricing is pulled from the OpenRouter API and refreshed every hour via Next.js Incremental Static Regeneration. OpenRouter aggregates real-time pricing from Anthropic, OpenAI, Google, Meta, DeepSeek, xAI, and Mistral. Reference pricing on individual model pages is reviewed on a rolling cadence (last full sweep: 2026-05-22). For mission-critical decisions, always confirm with the provider\'s own pricing page.',
  },
  {
    question: 'Can I reduce my AI API bill without changing model?',
    answer:
      'Yes. Three high-leverage moves: (1) Prompt caching cuts the cost of cached input tokens by ~90% on Anthropic and ~50% on OpenAI — ideal for long, static system prompts. (2) Batch APIs from Anthropic and OpenAI offer a 50% discount with a 24-hour turnaround for asynchronous workloads. (3) Output-length controls (setting max_tokens, requesting concise answers) directly reduce the expensive side of the bill. Combined, these can cut costs 5–10× without changing models.',
  },
]

export const MODEL_FAQS = (modelName: string, inputPrice: number, outputPrice: number): FAQ[] => {
  const ratio = (outputPrice / inputPrice).toFixed(1)
  const cost1kInput = ((inputPrice * 1000) / 1_000_000).toFixed(4)
  const cost10kInput = ((inputPrice * 10000) / 1_000_000).toFixed(4)
  return [
    {
      question: `How much does ${modelName} cost per token?`,
      answer: `As of May 2026, ${modelName} costs $${inputPrice.toFixed(inputPrice < 1 ? 3 : 2)} per 1 million input tokens and $${outputPrice.toFixed(outputPrice < 1 ? 3 : 2)} per 1 million output tokens — an output-to-input ratio of ${ratio}×. A 1,000-token input request costs $${cost1kInput}; a 10,000-token input request costs $${cost10kInput}. These prices are sourced from live OpenRouter data and verified against the provider's published pricing page.`,
    },
    {
      question: `How many tokens does ${modelName} support per request?`,
      answer: `${modelName}'s context window and per-request output cap are listed in the pricing table above. The context window is the maximum input + output combined; the output limit is how many tokens the model can generate in a single response. Most 2026 flagship models support at least 128,000-token context windows, with Gemini 2.5 Pro reaching 1 million tokens.`,
    },
    {
      question: `Is ${modelName} good for coding?`,
      answer: `${modelName}'s coding performance depends on its tier (see the badge above). Reasoning-tier models (OpenAI o3, DeepSeek R1) lead on hard algorithmic problems; balanced models like Claude Sonnet 4 and GPT-4o lead on long-context codebase work. For specifics, check the strengths section above and the /compare/best-models-for-coding ranking.`,
    },
    {
      question: `How does ${modelName} compare to other AI models?`,
      answer: `See the related models grid below this section for direct comparisons. ${modelName} is best understood relative to: (1) cheaper models in the same family (when speed matters more than capability), (2) competitor flagships at the same tier (for head-to-head decisions), and (3) reasoning models (when accuracy on hard problems outweighs cost).`,
    },
  ]
}

export const COMPARISON_FAQS: FAQ[] = [
  {
    question: 'How do I choose between AI models?',
    answer:
      'Match the model tier to the task complexity. As of May 2026: for hard reasoning use a reasoning-tier model (OpenAI o3, DeepSeek R1, Claude Opus 4 with extended thinking — $10–$15/1M input); for production workloads use a balanced model (Claude Sonnet 4 $3/1M, GPT-4o $2.50/1M, Gemini 2.5 Flash $0.30/1M); for high-volume classification or extraction use a fast model (Claude Haiku 4 $0.25/1M, GPT-4o mini $0.15/1M, Gemini 2.0 Flash $0.10/1M). Combined model routing — sending 80% of traffic to the cheap tier — usually cuts overall spend 60–80% without quality regressions on simple requests.',
  },
  {
    question: 'Is Claude better than GPT-4o?',
    answer:
      'They are close enough that the tiebreakers are usually pricing and integration fit. Claude Sonnet 4 wins on nuanced long-form writing, 200K vs 128K context window, and instruction-following on multi-step tasks. GPT-4o wins on native multimodal (image and audio input without external pipelines), a more mature function-calling ecosystem, and slightly lower input price ($2.50/1M vs $3/1M). Pure text? Largely a tie. Multimodal? GPT-4o. Long documents? Claude.',
  },
  {
    question: 'What is the cheapest AI model I can use in production?',
    answer:
      'As of May 2026, the budget tier in descending cost order: Llama 3.1 8B ($0.05/1M input), Gemini 1.5 Flash ($0.075/1M), Gemini 2.0 Flash ($0.10/1M), Mistral Small ($0.10/1M), Mistral Nemo ($0.15/1M, symmetric input/output), GPT-4o mini ($0.15/1M), and Claude Haiku 4 ($0.25/1M). For production reliability with broad ecosystem support, GPT-4o mini and Claude Haiku 4 are the safest cheap defaults; for cost-per-capability on long documents, Gemini 2.0 Flash wins outright thanks to its 1M-token context window.',
  },
  {
    question: 'When should I pay for a reasoning model?',
    answer:
      'Pay for reasoning (OpenAI o3, DeepSeek R1, o4-mini) when accuracy on hard logic, math, or multi-step coding is worth ~5–10× the per-token cost. As of May 2026, o3 costs $10/1M input vs GPT-4o\'s $2.50/1M — but on hard reasoning benchmarks o3 routinely closes failure modes that a non-reasoning model cannot solve at any prompt length. DeepSeek R1 ($0.55/1M input) is the cheapest reasoning model and exposes its chain-of-thought, useful for debugging.',
  },
]
