import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import ApiCostClient from './ApiCostClient'

export const metadata: Metadata = buildMetadata({
  title: 'AI API Cost Estimator — Monthly Bill Calculator',
  description:
    'Estimate your monthly AI API bill. Enter average tokens per request, request volume, and choose a model to project your monthly costs across Claude, GPT-4o, Gemini, and more.',
  path: '/tools/api-cost-estimator',
})

const RELATED = [
  { href: '/tools/words-to-tokens', label: 'Words → Tokens', description: 'Estimate token count from pasted text.' },
  { href: '/tools/token-to-usd', label: 'Token → USD', description: 'Convert a token count to dollars.' },
  { href: '/guides/how-to-reduce-ai-api-costs', label: 'Reduce API Costs', description: 'Practical strategies to cut your AI bill.' },
  { href: '/', label: 'Token Calculator', description: 'Full cross-model conversion tool.' },
]

export default function ApiCostEstimatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools' }, { label: 'API Cost Estimator' }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          AI API Cost Estimator
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Project your monthly AI API spend. Set your average tokens per request, expected volume, and select models to compare.
        </p>
      </div>

      <ApiCostClient />

      <div className="mt-12">
        <RelatedPages pages={RELATED} title="Related Tools" />
      </div>
    </div>
  )
}
