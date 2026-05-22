import type { Metadata } from 'next'
import type { ProviderGroup, ModelPricing } from '@/lib/types'
import ConverterClient from '@/components/ConverterClient'
import FAQSection from '@/components/FAQSection'
import RelatedPages from '@/components/RelatedPages'
import JsonLd, { webAppSchema, faqSchema } from '@/components/JsonLd'
import { HOME_FAQS } from '@/lib/faqs'
import { ALL_MODELS, getCheapestModels } from '@/lib/models'
import { SITE_URL } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TokenRate — AI Token Calculator & Pricing Comparison',
  description:
    'Free AI token calculator with live pricing. Convert between money, tokens, and characters for Claude, GPT-4o, Gemini 2.5, and more. Compare costs across models instantly.',
  alternates: { canonical: SITE_URL },
}

interface OpenRouterModel {
  id: string
  name: string
  pricing?: { prompt?: string; completion?: string }
  context_length?: number
}

const PROVIDER_MAP: { prefix: string; label: string }[] = [
  { prefix: 'anthropic/', label: 'Anthropic' },
  { prefix: 'openai/', label: 'OpenAI' },
  { prefix: 'google/', label: 'Google' },
  { prefix: 'meta-llama/', label: 'Meta' },
  { prefix: 'deepseek/', label: 'DeepSeek' },
  { prefix: 'mistralai/', label: 'Mistral' },
  { prefix: 'x-ai/', label: 'xAI' },
]

async function fetchModels(): Promise<ProviderGroup[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`OpenRouter ${res.status}`)

    const json: { data: OpenRouterModel[] } = await res.json()

    const groups: Record<string, ModelPricing[]> = {}
    const seen: Record<string, Set<string>> = {}
    PROVIDER_MAP.forEach(({ label }) => { groups[label] = []; seen[label] = new Set() })

    for (const m of json.data) {
      const entry = PROVIDER_MAP.find(({ prefix }) => m.id.startsWith(prefix))
      if (!entry) continue

      if (!m.pricing?.prompt || !m.pricing?.completion) continue
      const input = parseFloat(m.pricing.prompt)
      const output = parseFloat(m.pricing.completion)
      if (input <= 0 || output <= 0) continue

      const name = m.name.replace(/^[^:]+:\s*/i, '')
      if (seen[entry.label].has(name)) continue
      seen[entry.label].add(name)

      groups[entry.label].push({
        id: m.id,
        name,
        provider: entry.label,
        inputPricePerToken: input,
        outputPricePerToken: output,
        contextLength: m.context_length,
      })
    }

    return PROVIDER_MAP
      .filter(({ label }) => groups[label].length > 0)
      .map(({ label }) => ({
        name: label,
        models: groups[label].sort((a, b) => b.inputPricePerToken - a.inputPricePerToken),
      }))
  } catch {
    return [
      {
        name: 'Anthropic',
        models: [
          { id: 'anthropic/claude-opus-4-5', name: 'Claude Opus 4', provider: 'Anthropic', inputPricePerToken: 0.000015, outputPricePerToken: 0.000075 },
          { id: 'anthropic/claude-sonnet-4-5', name: 'Claude Sonnet 4', provider: 'Anthropic', inputPricePerToken: 0.000003, outputPricePerToken: 0.000015 },
          { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4', provider: 'Anthropic', inputPricePerToken: 0.00000025, outputPricePerToken: 0.00000125 },
        ],
      },
    ]
  }
}

const cheapest = getCheapestModels(6)

const RELATED: { href: string; label: string; description: string }[] = [
  { href: '/tools/words-to-tokens', label: 'Words → Tokens Converter', description: 'Paste any text and see the token count instantly.' },
  { href: '/tools/token-to-usd', label: 'Token → USD Calculator', description: 'Convert a raw token count to dollars for any model.' },
  { href: '/compare/cheapest-ai-models', label: 'Cheapest AI Models 2026', description: 'Ranked list of the most affordable LLMs available via API.' },
  { href: '/guides/what-are-ai-tokens', label: 'What Are AI Tokens?', description: 'A clear explanation of how tokens work and why they matter.' },
]

export default async function Home() {
  const providerGroups = await fetchModels()

  return (
    <>
      <JsonLd data={webAppSchema()} />
      <JsonLd data={faqSchema(HOME_FAQS)} />

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-500">
            <span className="text-emerald-500">Token</span>
            <span className="text-zinc-700 dark:text-zinc-300">Rate</span>
            <span className="text-zinc-400 dark:text-zinc-500"> · tokenrate.dev</span>
          </p>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            AI Token Calculator &amp; Live Pricing Comparison
          </h1>
          <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-2xl">
            Free, instant cost estimates for every major AI model. Convert money, tokens, and characters across
            Claude, GPT-4o, Gemini, Llama, DeepSeek, Grok, and Mistral — with live pricing from OpenRouter.
          </p>
        </div>

        {/* Calculator */}
        <ConverterClient providerGroups={providerGroups} />

        {/* Quick stats */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {[
            { value: `${ALL_MODELS.length}+`, label: 'Models tracked' },
            { value: 'Live', label: 'Pricing data' },
            { value: 'Free', label: 'No sign-up' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-2xl font-black text-emerald-500">{stat.value}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Content sections */}
        <div className="mt-16 flex flex-col gap-14">

          {/* What are tokens */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">What Are AI Tokens?</h2>
            <div className="prose-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex flex-col gap-3 max-w-3xl">
              <p>
                A <strong className="text-zinc-800 dark:text-zinc-200">token</strong> is the basic unit that AI language models use to process text. Rather than reading word by word, models break text into token fragments — roughly 4 characters each for English. The word "hamburger" is 3 tokens; "hi" is 1 token.
              </p>
              <p>
                Every AI API — including Claude, GPT-4o, and Gemini — charges by the token. You pay for the text you <em>send</em> (input tokens) and the text the model <em>generates</em> (output tokens). Understanding tokens is the key to predicting and controlling your AI costs.
              </p>
              <p>
                <Link href="/guides/what-are-ai-tokens" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  Read the full guide →
                </Link>
              </p>
            </div>
          </section>

          {/* How pricing works */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">How AI Token Pricing Works</h2>
            <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed flex flex-col gap-3 max-w-3xl text-sm">
              <p>
                AI models are priced by the million tokens — written as <strong className="text-zinc-800 dark:text-zinc-200">$/1M tokens</strong>. The two numbers you always see are:
              </p>
              <ul className="flex flex-col gap-2 pl-4">
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">Input</span>
                  <span>The text you send — your prompt, system instructions, and conversation history.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-sky-500 font-bold shrink-0">Output</span>
                  <span>The text the model generates. Usually <strong className="text-zinc-800 dark:text-zinc-200">3–5× more expensive</strong> than input, because generating tokens requires more compute than reading them.</span>
                </li>
              </ul>
              <p>
                A typical 1,000-token request (about 750 words of prompt) with Claude Sonnet 4 costs $0.003 — less than a third of a cent. At scale, though, those fractions add up fast.
              </p>
              <p>
                <Link href="/guides/how-ai-api-pricing-works" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                  Read the full pricing guide →
                </Link>
              </p>
            </div>
          </section>

          {/* Cheapest models table */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Cheapest AI Models in 2026</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
              Ranked by input token price. All prices per 1 million tokens.
            </p>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto shadow-sm">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Model</th>
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300">Provider</th>
                    <th className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right">Input / 1M</th>
                    <th className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-400 text-right">Output / 1M</th>
                    <th className="px-4 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-right">Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {cheapest.map((m, i) => (
                    <tr key={m.slug} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'}>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/models/${m.slug}`} className="text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                          {m.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{m.provider}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                        ${m.inputPricePerMillion.toFixed(m.inputPricePerMillion < 1 ? 3 : 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400">
                        ${m.outputPricePerMillion.toFixed(m.outputPricePerMillion < 1 ? 3 : 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-400 dark:text-zinc-500 text-xs">
                        {m.contextWindow >= 1_000_000
                          ? `${(m.contextWindow / 1_000_000).toFixed(0)}M`
                          : `${(m.contextWindow / 1_000).toFixed(0)}K`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              Prices are approximate and may change.{' '}
              <Link href="/compare/cheapest-ai-models" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                See full comparison →
              </Link>
            </p>
          </section>

          {/* Token examples */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Token Calculation Examples</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: '1,000 words of English text', tokens: '~1,333 tokens', note: '~4 chars per token' },
                { label: 'A standard email (150 words)', tokens: '~200 tokens', note: 'under $0.001 on most models' },
                { label: 'A 10-page PDF (2,500 words)', tokens: '~3,333 tokens', note: '$0.01 with Claude Sonnet 4' },
                { label: 'An entire novel (80,000 words)', tokens: '~107K tokens', note: 'fits in most flagship models' },
                { label: 'A full codebase (100K lines)', tokens: '~300K+ tokens', note: 'needs 200K+ context window' },
                { label: '1 million tokens budget at $1', tokens: '~750K words', note: 'with Gemini 2.0 Flash' },
              ].map((ex) => (
                <div key={ex.label} className="flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">{ex.label}</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">{ex.tokens}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{ex.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Want more?{' '}
              <Link href="/guides/how-many-tokens-in-1000-words" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                See the full token reference guide →
              </Link>
            </p>
          </section>

          {/* Browse models */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Browse All AI Models</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
              Detailed pricing pages for every major model — with context windows, strengths, use cases, and cost examples.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ALL_MODELS.slice(0, 9).map((m) => (
                <Link
                  key={m.slug}
                  href={`/models/${m.slug}`}
                  className="flex flex-col gap-1 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug">{m.name}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{m.provider}</span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    ${m.inputPricePerMillion.toFixed(m.inputPricePerMillion < 1 ? 3 : 2)}/1M in
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <FAQSection faqs={HOME_FAQS} title="Frequently Asked Questions" />

          {/* Related tools */}
          <RelatedPages pages={RELATED} title="Related Tools & Guides" />
        </div>
      </div>
    </>
  )
}
