import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_MODELS, PROVIDERS } from '@/lib/models'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'

export const metadata: Metadata = buildMetadata({
  title: 'AI Model Pricing Comparison — All LLMs Side-by-Side',
  description:
    'Complete directory of AI language model pricing. Compare input/output token costs, context windows, and capabilities across Claude, GPT, Gemini, Llama, DeepSeek, Mistral, Grok and more.',
  path: '/models',
})

function fmt(n: number) {
  return '$' + n.toFixed(n < 1 ? 3 : 2)
}

export default function ModelsIndex() {
  const sorted = [...ALL_MODELS].sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)
  const byProvider = PROVIDERS.map((p) => ({
    ...p,
    models: ALL_MODELS.filter((m) => m.providerSlug === p.slug).sort(
      (a, b) => a.inputPricePerMillion - b.inputPricePerMillion
    ),
  })).filter((p) => p.models.length > 0)

  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Models', url: 'https://tokenrate.dev/models' },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Models' }]} />

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Directory</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">AI Model Pricing Comparison</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed max-w-2xl">
            Every major large language model in one place. Prices are per 1 million tokens. Click any model for detailed
            cost examples, strengths, and use cases.
          </p>
        </div>

        {/* Full sortable table */}
        <section className="mb-14">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">All Models Ranked by Input Price</h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-left">Model</th>
                  <th className="px-4 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-left">Provider</th>
                  <th className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right">Input / 1M</th>
                  <th className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-400 text-right">Output / 1M</th>
                  <th className="px-4 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-right">Context</th>
                  <th className="px-4 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-left">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sorted.map((m, i) => {
                  const ctx =
                    m.contextWindow >= 1_000_000
                      ? `${(m.contextWindow / 1_000_000).toFixed(0)}M`
                      : `${(m.contextWindow / 1_000).toFixed(0)}K`
                  return (
                    <tr
                      key={m.slug}
                      className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'}
                    >
                      <td className="px-4 py-3 font-medium">
                        <Link
                          href={`/models/${m.slug}`}
                          className="text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          {m.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        <Link
                          href={`/providers/${m.providerSlug}`}
                          className="hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          {m.provider}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                        {fmt(m.inputPricePerMillion)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400">
                        {fmt(m.outputPricePerMillion)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-400 dark:text-zinc-500 text-xs">{ctx}</td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 capitalize text-xs">{m.tier}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Grouped by provider */}
        <section className="flex flex-col gap-10">
          {byProvider.map((p) => (
            <div key={p.slug}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{p.name}</h2>
                <Link
                  href={`/providers/${p.slug}`}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  See all {p.name} pricing →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {p.models.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/models/${m.slug}`}
                    className="flex flex-col gap-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{m.name}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">{m.tier}</span>
                    <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      {fmt(m.inputPricePerMillion)} in · {fmt(m.outputPricePerMillion)} out
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  )
}
