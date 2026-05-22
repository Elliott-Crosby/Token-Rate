export interface FAQ {
  question: string
  answer: string
}

export const HOME_FAQS: FAQ[] = [
  {
    question: 'What is an AI token?',
    answer:
      'A token is the basic unit that AI language models use to process text. Tokens roughly correspond to word fragments — in English, one token is approximately 4 characters or ¾ of a word. The word "hamburger" is 3 tokens, while "hi" is 1 token. AI APIs charge based on how many tokens are sent (input) and generated (output).',
  },
  {
    question: 'What is the difference between input and output tokens?',
    answer:
      'Input tokens are the text you send to the model — your prompt, system instructions, and any context. Output tokens are the text the model generates in response. Output tokens are typically 3–5× more expensive than input tokens because generating text requires more compute than reading it.',
  },
  {
    question: 'How many tokens is 1,000 words?',
    answer:
      'A 1,000-word piece of English text is approximately 1,333 tokens (using the standard 4 characters per token estimate). A more precise rule of thumb: 1 word ≈ 1.33 tokens. A standard novel page (~250 words) is roughly 333 tokens.',
  },
  {
    question: 'How many tokens is 1 page of text?',
    answer:
      'A standard page of English text (roughly 250–300 words) contains approximately 330–400 tokens. A full US Letter page at 500 words would be around 667 tokens.',
  },
  {
    question: 'Which AI model is the cheapest?',
    answer:
      'As of 2026, Llama 3.1 8B at ~$0.05/1M and Gemini 1.5 Flash at $0.075/1M are the cheapest mainstream models. GPT-4o mini ($0.15/1M) and Claude Haiku 4 ($0.25/1M) are also very affordable. For most simple tasks, any of these will deliver quality output at minimal cost.',
  },
  {
    question: 'What is "per million tokens" pricing?',
    answer:
      'AI APIs price their models by the million token. This means if a model costs $3 per 1M input tokens and you send a 10,000 token prompt, it costs $0.03. Most individual API calls cost fractions of a cent — but at scale (millions of requests) the costs add up quickly, which is why choosing the right model matters.',
  },
  {
    question: 'How does this calculator work?',
    answer:
      'Enter a budget (money), a token count, or a character count into the calculator. TokenRate uses live pricing from OpenRouter to show you exactly how many tokens or characters your budget buys — or how much your text will cost — across multiple AI models at once.',
  },
  {
    question: 'Is the pricing data real-time?',
    answer:
      'Yes. Pricing is pulled from the OpenRouter API and refreshed every hour via Next.js ISR (Incremental Static Regeneration). OpenRouter tracks live pricing from Anthropic, OpenAI, Google, and other providers.',
  },
]

export const MODEL_FAQS = (modelName: string, inputPrice: number, outputPrice: number): FAQ[] => [
  {
    question: `How much does ${modelName} cost?`,
    answer: `${modelName} costs $${inputPrice.toFixed(2)} per 1 million input tokens and $${outputPrice.toFixed(2)} per 1 million output tokens. For a typical 1,000-token request (about 750 words of prompt + response), that's roughly $${((inputPrice * 1000) / 1_000_000).toFixed(4)} in input costs.`,
  },
  {
    question: `How many tokens does ${modelName} support?`,
    answer: `The context window and limits are listed in the pricing table above. Most modern frontier models support at least 128K tokens, with some like Gemini 2.5 Pro supporting up to 1 million tokens.`,
  },
  {
    question: `Is ${modelName} good for coding?`,
    answer: `Frontier models like ${modelName} generally perform well on code generation, review, and debugging tasks. See the strengths section above for specific capabilities.`,
  },
]

export const COMPARISON_FAQS: FAQ[] = [
  {
    question: 'How do I choose between AI models?',
    answer:
      'Start with your use case. For complex reasoning or nuanced writing, use a flagship model (Claude Opus 4, GPT o3). For everyday production workloads, a balanced model (Claude Sonnet 4, GPT-4o) gives the best quality-to-cost ratio. For high-volume, cost-sensitive tasks, use a fast model (Claude Haiku 4, GPT-4o mini, Gemini Flash).',
  },
  {
    question: 'Is Claude better than GPT-4o?',
    answer:
      'Both are excellent — and performance varies by task. Claude Sonnet 4 tends to outperform GPT-4o on writing and nuanced reasoning, while GPT-4o has stronger multimodal capabilities (native image/audio input). For pure text tasks, the models are close enough that pricing and ecosystem fit often determine the choice.',
  },
  {
    question: 'What is the cheapest AI model I can use in production?',
    answer:
      'Gemini 2.0 Flash ($0.10/1M input) and Gemini 1.5 Flash ($0.075/1M input) are among the cheapest models with a large context window. Claude Haiku 4 ($0.25/1M) and GPT-4o mini ($0.15/1M) are also strong contenders for cost-efficient production use.',
  },
]
