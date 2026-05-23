import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import ApiCostClient from './ApiCostClient'
import JsonLd, { webAppSchema, howToSchema, breadcrumbSchema } from '@/components/JsonLd'

export const metadata: Metadata = buildMetadata({
  title: 'AI API Cost Estimator — Monthly Bill Calculator',
  description:
    'Estimate your monthly AI API bill. Enter average tokens per request, request volume, and choose a model to project your monthly costs across Claude, GPT-4o, Gemini, and more.',
  path: '/tools/api-cost-estimator',
})

const RELATED = [
  { href: '/tools/words-to-tokens', label: 'Words → Tokens', description: 'Estimate token count from pasted text.' },
  { href: '/tools/token-to-usd', label: 'Token → USD', description: 'Convert a token count to dollars.' },
  { href: '/blog/cost-optimization/how-to-reduce-ai-api-costs', label: 'Reduce API Costs', description: 'Practical strategies to cut your AI bill.' },
  { href: '/', label: 'Token Calculator', description: 'Full cross-model conversion tool.' },
]

const HOW_TO_STEPS = [
  {
    name: 'Set average tokens per request',
    text: 'Enter the typical input and output token counts for a single API call to your AI model.',
  },
  {
    name: 'Set monthly request volume',
    text: 'Estimate how many requests your application will make per month — start with current usage or a conservative projection.',
  },
  {
    name: 'Pick the models to compare',
    text: 'Select one or more AI models. The estimator projects a monthly bill for each, so you can compare costs before committing.',
  },
]

export default function ApiCostEstimatorPage() {
  return (
    <>
      <JsonLd data={webAppSchema()} />
      <JsonLd
        data={howToSchema({
          name: 'How to estimate a monthly AI API bill',
          description:
            'Project monthly AI API costs across Claude, GPT-4o, Gemini, and other models by entering your tokens-per-request and request volume.',
          url: 'https://tokenrate.dev/tools/api-cost-estimator',
          totalTime: 'PT1M',
          steps: HOW_TO_STEPS,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'TokenRate', url: 'https://tokenrate.dev' },
          { name: 'Tools', url: 'https://tokenrate.dev/tools/api-cost-estimator' },
          { name: 'API Cost Estimator', url: 'https://tokenrate.dev/tools/api-cost-estimator' },
        ])}
      />
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
    </>
  )
}
