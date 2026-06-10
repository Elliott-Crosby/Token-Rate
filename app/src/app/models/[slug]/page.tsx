import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_MODELS, getModelBySlug, getRelatedModels } from '@/lib/models'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import FAQSection from '@/components/FAQSection'
import RelatedPages from '@/components/RelatedPages'
import JsonLd, { faqSchema, breadcrumbSchema, productSchema } from '@/components/JsonLd'
import { MODEL_FAQS } from '@/lib/faqs'
import { getLivePricing, resolveModelPricing } from '@/lib/pricing-live'
import { formatMoney } from '@/lib/conversions'

export function generateStaticParams() {
  return ALL_MODELS.map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const model = getModelBySlug(slug)
  if (!model) return {}
  // Variant pages (speed tiers, dated snapshots) duplicate a primary model — keep
  // them usable but out of the index so they don't dilute crawl budget.
  return buildMetadata({
    title: `${model.name} Pricing, Context Window & API Cost`,
    description: `${model.name} API pricing: $${model.inputPricePerMillion}/1M input, $${model.outputPricePerMillion}/1M output. ${model.contextWindow.toLocaleString()}-token context window. See cost examples, strengths, and model comparisons.`,
    path: `/models/${slug}`,
    noIndex: model.variant,
  })
}

function fmt(n: number) {
  return '$' + n.toFixed(n < 1 ? 3 : 2)
}

const TIER_LABELS: Record<string, string> = {
  flagship: 'Flagship',
  balanced: 'Balanced',
  fast: 'Fast',
  reasoning: 'Reasoning',
}

const TIER_COLORS: Record<string, string> = {
  flagship: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  balanced: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  fast: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  reasoning: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

const TOKEN_EXAMPLES = [
  { label: '1,000 word article', tokens: 1333 },
  { label: '10-page document (2,500 words)', tokens: 3333 },
  { label: '1,000 lines of code', tokens: 5000 },
  { label: '100K token document', tokens: 100000 },
]

function formatBlufDate(iso: string): string {
  const [y, m] = iso.split('-')
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[Number(m) - 1]} ${y}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const model = getModelBySlug(slug)
  if (!model) notFound()

  const live = await getLivePricing(model)
  const pricing = resolveModelPricing(model, live)
  const inputPrice = pricing.inputPricePerMillion
  const outputPrice = pricing.outputPricePerMillion
  const isLive = pricing.source === 'live'

  const related = getRelatedModels(model)
  const faqs = MODEL_FAQS(model.name, inputPrice, outputPrice)

  const ctxDisplay =
    model.contextWindow >= 1_000_000
      ? `${(model.contextWindow / 1_000_000).toFixed(0)}M tokens`
      : `${(model.contextWindow / 1_000).toFixed(0)}K tokens`

  const relatedPages = related.map((r) => ({
    href: `/models/${r.slug}`,
    label: r.name,
    description: `${r.provider} · $${r.inputPricePerMillion.toFixed(r.inputPricePerMillion < 1 ? 3 : 2)}/1M input`,
  }))

  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Models', url: 'https://tokenrate.dev/models' },
    { name: model.name, url: `https://tokenrate.dev/models/${slug}` },
  ]

  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={productSchema({
          name: model.name,
          description: model.description,
          url: `https://tokenrate.dev/models/${slug}`,
          brand: model.provider,
          inputPrice,
          outputPrice,
          updatedAt: model.updatedAt,
        })}
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Models', href: '/models' },
            { label: model.name },
          ]}
        />

        {/* Header */}
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{model.name} Pricing</h1>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${TIER_COLORS[model.tier]}`}>
              {TIER_LABELS[model.tier]}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {model.provider} · {ctxDisplay} context
          </p>
        </div>

        {/* Answer-first BLUF — single extractable paragraph */}
        <section
          aria-label="At-a-glance answer"
          className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-5"
        >
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <strong className="text-zinc-900 dark:text-zinc-50">{model.name}</strong> from{' '}
            {model.provider} costs{' '}
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              {fmt(inputPrice)}
            </span>{' '}
            per 1 million input tokens and{' '}
            <span className="font-mono text-sky-700 dark:text-sky-400 font-semibold">
              {fmt(outputPrice)}
            </span>{' '}
            per 1 million output tokens as of {formatBlufDate(model.updatedAt)}
            {isLive ? ' (live OpenRouter data)' : ''}. The model supports a{' '}
            <strong className="text-zinc-900 dark:text-zinc-50">{model.contextWindow.toLocaleString()}-token context window</strong>
            {' '}(approximately {Math.round(model.contextWindow * 0.75).toLocaleString()} words) with a{' '}
            {formatTokens(model.outputLimit)}-token maximum output. A typical 1,000-token request costs{' '}
            <span className="font-mono">${((inputPrice * 1000) / 1_000_000).toFixed(4)}</span> in input
            charges; a 10,000-token request costs{' '}
            <span className="font-mono">${((inputPrice * 10000) / 1_000_000).toFixed(4)}</span>.
          </p>
        </section>

        {/* Cost at a glance — extractable fact table */}
        <section aria-label="Cost at a glance" className="mb-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full text-sm">
              <caption className="sr-only">{model.name} pricing and capability summary</caption>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr className="bg-white dark:bg-zinc-900">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400 w-1/2">Input price</th>
                  <td className="px-4 py-2.5 font-mono text-emerald-700 dark:text-emerald-400">{fmt(inputPrice)} / 1M tokens</td>
                </tr>
                <tr className="bg-zinc-50/60 dark:bg-zinc-800/30">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">Output price</th>
                  <td className="px-4 py-2.5 font-mono text-sky-700 dark:text-sky-400">{fmt(outputPrice)} / 1M tokens</td>
                </tr>
                <tr className="bg-white dark:bg-zinc-900">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">Output / input ratio</th>
                  <td className="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-300">{(outputPrice / inputPrice).toFixed(1)}×</td>
                </tr>
                <tr className="bg-zinc-50/60 dark:bg-zinc-800/30">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">Context window</th>
                  <td className="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-300">{model.contextWindow.toLocaleString()} tokens (~{Math.round(model.contextWindow * 0.75).toLocaleString()} words)</td>
                </tr>
                <tr className="bg-white dark:bg-zinc-900">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">Maximum output</th>
                  <td className="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-300">{model.outputLimit.toLocaleString()} tokens</td>
                </tr>
                <tr className="bg-zinc-50/60 dark:bg-zinc-800/30">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">Cost per 1K tokens (input)</th>
                  <td className="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-300">${((inputPrice * 1000) / 1_000_000).toFixed(4)}</td>
                </tr>
                <tr className="bg-white dark:bg-zinc-900">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">Tier</th>
                  <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">{TIER_LABELS[model.tier]}</td>
                </tr>
                <tr className="bg-zinc-50/60 dark:bg-zinc-800/30">
                  <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-500 dark:text-zinc-400">Last verified</th>
                  <td className="px-4 py-2.5 font-mono text-zinc-700 dark:text-zinc-300">
                    <time dateTime={model.updatedAt}>{model.updatedAt}</time>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Description */}
        <div className="mb-6">
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl text-sm">
            {model.description}
          </p>
        </div>

        {/* Pricing freshness badge */}
        <div className="mb-4 flex items-center gap-2 text-xs">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live pricing from OpenRouter
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
              Reference pricing · updated {model.updatedAt}
            </span>
          )}
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="flex flex-col gap-1 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">Input Price</p>
            <p className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400">{fmt(inputPrice)}</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">per 1 million tokens</p>
          </div>
          <div className="flex flex-col gap-1 p-5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-500">Output Price</p>
            <p className="text-3xl font-black font-mono text-sky-700 dark:text-sky-400">{fmt(outputPrice)}</p>
            <p className="text-xs text-sky-600/70 dark:text-sky-500/70">per 1 million tokens</p>
          </div>
          <div className="flex flex-col gap-1 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Context Window</p>
            <p className="text-3xl font-black font-mono text-zinc-800 dark:text-zinc-100">{ctxDisplay}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">max {(model.outputLimit / 1000).toFixed(0)}K output</p>
          </div>
        </div>

        <div className="flex flex-col gap-12">
          {/* Cost examples */}
          <section>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Cost Examples</h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                    <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-left">Request Type</th>
                    <th className="px-4 py-3 font-semibold text-zinc-400 text-right">Tokens</th>
                    <th className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right">Input Cost</th>
                    <th className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-400 text-right">Output Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {TOKEN_EXAMPLES.map((ex, i) => {
                    const inputCost = (ex.tokens * inputPrice) / 1_000_000
                    const outputCost = (ex.tokens * 0.3 * outputPrice) / 1_000_000
                    return (
                      <tr key={ex.label} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'}>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{ex.label}</td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400">{ex.tokens.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                          {formatMoney(inputCost)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400">
                          {formatMoney(outputCost)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              Output cost estimated at 30% of input token count. Use the{' '}
              <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:underline">calculator</Link> for exact figures.
            </p>
          </section>

          {/* Strengths & weaknesses */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">Strengths</h2>
              <ul className="flex flex-col gap-2">
                {model.strengths.map((s) => (
                  <li key={s} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">Limitations</h2>
              <ul className="flex flex-col gap-2">
                {model.weaknesses.map((w) => (
                  <li key={w} className="flex gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="text-zinc-400 shrink-0 mt-0.5">–</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Use cases */}
          <section>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Best Use Cases</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {model.useCases.map((uc) => (
                <div key={uc} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300">
                  {uc}
                </div>
              ))}
            </div>
          </section>

          {/* CTA to calculator */}
          <section className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Calculate {model.name} Costs</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Use the TokenRate calculator to convert any budget, token count, or text into exact {model.name} costs — and compare across all models.
            </p>
            <Link
              href="/"
              className="self-start px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              Open Calculator →
            </Link>
          </section>

          {/* FAQ */}
          <FAQSection faqs={faqs} title={`${model.name} — FAQ`} />

          {/* Related models */}
          {relatedPages.length > 0 && (
            <RelatedPages pages={relatedPages} title="Related Models" />
          )}

          {/* Related guides */}
          <RelatedPages
            title="Related Guides"
            pages={[
              { href: '/blog/fundamentals/how-ai-api-pricing-works', label: 'How AI API Pricing Works', description: 'Understand input vs output costs and how to estimate your bill.' },
              { href: '/blog/cost-optimization/how-to-reduce-ai-api-costs', label: 'How to Reduce AI API Costs', description: 'Practical strategies to cut spending without sacrificing quality.' },
            ]}
          />
        </div>
      </div>
    </>
  )
}
