import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import TokenToUsdClient from './TokenToUsdClient'

export const metadata: Metadata = buildMetadata({
  title: 'Token to USD Calculator — Convert AI Tokens to Dollars',
  description:
    'Enter any token count and see the exact USD cost for Claude, GPT-4o, Gemini, and more. Free AI token to dollar converter with live pricing.',
  path: '/tools/token-to-usd',
})

const RELATED = [
  { href: '/tools/words-to-tokens', label: 'Words → Tokens Converter', description: 'Paste text to estimate its token count.' },
  { href: '/', label: 'Full Token Calculator', description: 'Convert money, tokens, or characters across all models.' },
  { href: '/compare/cheapest-ai-models-2025', label: 'Cheapest AI Models 2025', description: 'Ranked by input token price.' },
  { href: '/guides/how-ai-api-pricing-works', label: 'How AI Pricing Works', description: 'Understand the per-token billing model.' },
]

export default function TokenToUsdPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools' }, { label: 'Token → USD' }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Token to USD Calculator
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Enter a token count to see the exact dollar cost across major AI models — for both input and output pricing.
        </p>
      </div>

      <TokenToUsdClient />

      <div className="mt-12">
        <RelatedPages pages={RELATED} title="Related Tools" />
      </div>
    </div>
  )
}
