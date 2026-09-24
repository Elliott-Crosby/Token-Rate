import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import SideRailAds from '@/components/SideRailAds'
import TokenToUsdClient from './TokenToUsdClient'
import JsonLd, { webAppSchema, howToSchema, breadcrumbSchema } from '@/components/JsonLd'

export const metadata: Metadata = buildMetadata({
  title: 'Token to USD Calculator — Convert AI Tokens to Dollars',
  description:
    'Convert tokens to USD across AI models. Compare a single token count or enter input and output usage separately to estimate your total API cost.',
  path: '/tools/token-to-usd',
})

const RELATED = [
  { href: '/tools/words-to-tokens', label: 'Words → Tokens Converter', description: 'Paste text to estimate its token count.' },
  { href: '/', label: 'Full Token Calculator', description: 'Convert money, tokens, or characters across all models.' },
  { href: '/compare/cheapest-ai-models', label: 'Cheapest AI Models 2026', description: 'Ranked by input token price.' },
  { href: '/blog/fundamentals/how-ai-api-pricing-works', label: 'How AI Pricing Works', description: 'Understand the per-token billing model.' },
]

const HOW_TO_STEPS = [
  {
    name: 'Enter a token count',
    text: 'Type the number of tokens you want to price. The calculator starts at 1,000,000 tokens so you see live figures instantly.',
  },
  {
    name: 'Find your model',
    text: 'Search by name — like Sonnet, GPT-4o, or Gemini — or tap a provider to narrow the list. Sort by clicking any column header.',
  },
  {
    name: 'Read input and output cost',
    text: 'A single count shows separate input and output estimates. Switch to Input + output and enter both usage counts to see the combined total. Check the model rate date and additional billing categories.',
  },
]

export default function TokenToUsdPage() {
  return (
    <>
      <JsonLd data={webAppSchema()} />
      <JsonLd
        data={howToSchema({
          name: 'How to convert AI tokens to USD',
          description:
            'Estimate the USD cost of input and output tokens across AI models.',
          url: 'https://tokenrate.dev/tools/token-to-usd',
          totalTime: 'PT30S',
          steps: HOW_TO_STEPS,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'TokenRate', url: 'https://tokenrate.dev' },
          { name: 'Tools', url: 'https://tokenrate.dev/tools' },
          { name: 'Token to USD', url: 'https://tokenrate.dev/tools/token-to-usd' },
        ])}
      />

      {/* House ads — Nodea rails in the empty page margins (labelled advertising).
          Placed here because this is the site's #1 traffic page. */}
      <SideRailAds />

      <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: 'Tokens to USD' }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Token to USD Calculator
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Convert tokens to dollars, or calculate a complete request using separate input and output counts.
        </p>
      </div>

      <TokenToUsdClient />
      <section className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 text-sm leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">How the estimate works</h2>
        <p className="rounded-lg bg-zinc-50 p-3 font-mono text-xs dark:bg-zinc-950">USD = (input tokens × input rate + output tokens × output rate) ÷ 1,000,000</p>
        <p>For example, at illustrative rates of $3 per million input tokens and $15 per million output tokens, 2,000 input + 500 output tokens cost $0.006 + $0.0075 = <strong>$0.0135</strong>. Those are example rates, not a quote for a specific model.</p>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">What should I enter?</h3>
        <p>Use the usage counts returned by your API. Input includes the prompt, history, and other context sent to the model. Output can include billed reasoning tokens. If a provider reports reasoning as part of total output, do not add it a second time.</p>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Why might my invoice differ?</h3>
        <p>This is a standard text-token estimate using the catalogue rates shown. Cache reads and writes, batch discounts, service tiers, long-context rates, images, audio, web search, storage, taxes, and hosting fees are not included. OpenRouter rates can differ from the provider or route you actually use.</p>
        <p><Link href="/blog/fundamentals/tokens-to-dollars-conversion" className="font-semibold text-emerald-700 underline dark:text-emerald-400">Read the full worked example</Link> or <Link href="/tools/api-cost-estimator" className="font-semibold text-emerald-700 underline dark:text-emerald-400">estimate a monthly budget</Link>.</p>
      </section>

      {/* Funnel the site's #1 entry page into the fuller calculator. This page ranks
          because it's lean; the CTA converts that traffic to money/character input,
          quality scores, value ranking, and compare mode without bloating the tool. */}
      <Link
        href="/"
        className="group mt-8 flex items-center gap-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-sm transition-all"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Compare quality and value, not just cost
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            The full calculator adds dollar &amp; character input, quality scores, value-per-dollar
            ranking, and side-by-side model compare — across every tracked model.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          Open
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>

      <div className="mt-12">
        <RelatedPages pages={RELATED} title="Related Tools" />
      </div>
    </div>
    </>
  )
}
