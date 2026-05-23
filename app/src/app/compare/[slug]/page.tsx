import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_COMPARISONS, getComparisonBySlug, getComparisonModels } from '@/lib/comparisons'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import FAQSection from '@/components/FAQSection'
import RelatedPages from '@/components/RelatedPages'
import JsonLd, { faqSchema, breadcrumbSchema, datasetSchema, itemListSchema } from '@/components/JsonLd'
import { COMPARISON_FAQS } from '@/lib/faqs'

export function generateStaticParams() {
  return ALL_COMPARISONS.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const comp = getComparisonBySlug(slug)
  if (!comp) return {}
  return buildMetadata({
    title: comp.title,
    description: comp.description,
    path: `/compare/${slug}`,
  })
}

function fmt(n: number) {
  return '$' + n.toFixed(n < 1 ? 3 : 2)
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comp = getComparisonBySlug(slug)
  if (!comp) notFound()

  const models = getComparisonModels(comp)
  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Compare', url: 'https://tokenrate.dev/compare' },
    { name: comp.title, url: `https://tokenrate.dev/compare/${slug}` },
  ]

  return (
    <>
      <JsonLd data={faqSchema(COMPARISON_FAQS)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd
        data={datasetSchema({
          name: comp.title,
          description: comp.description,
          url: `https://tokenrate.dev/compare/${slug}`,
          dateModified: comp.updatedAt,
          keywords: comp.tags,
        })}
      />
      <JsonLd
        data={itemListSchema({
          name: comp.title,
          urls: models.map((m) => `https://tokenrate.dev/models/${m.slug}`),
        })}
      />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Compare', href: '/compare' },
            { label: comp.title },
          ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">{comp.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-2xl">{comp.description}</p>
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Comparing {models.length} models · Prices last verified{' '}
            <time dateTime={comp.updatedAt}>{comp.updatedAt}</time>
          </p>
        </div>

        {/* Answer-first verdict — extractable for AI citation */}
        <section
          aria-label="Quick verdict"
          className="mb-8 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
            Verdict
          </p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{comp.verdict}</p>
        </section>

        {/* Side-by-side pricing table */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Pricing Comparison</h2>
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
                {models.map((m, i) => {
                  const ctxDisplay = m.contextWindow >= 1_000_000
                    ? `${(m.contextWindow / 1_000_000).toFixed(0)}M`
                    : `${(m.contextWindow / 1_000).toFixed(0)}K`
                  const isWinner = comp.winnerSlug === m.slug
                  return (
                    <tr key={m.slug} className={`${i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'} ${isWinner ? 'ring-1 ring-inset ring-emerald-400 dark:ring-emerald-600' : ''}`}>
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/models/${m.slug}`} className="text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                          {m.name}
                          {isWinner && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">Best value</span>}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{m.provider}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">{fmt(m.inputPricePerMillion)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400">{fmt(m.outputPricePerMillion)}</td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-400 dark:text-zinc-500 text-xs">{ctxDisplay}</td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 capitalize">{m.tier}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed model cards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Model Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {models.map((m) => (
              <div key={m.slug} className="flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/models/${m.slug}`} className="font-bold text-zinc-800 dark:text-zinc-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {m.name}
                    </Link>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{m.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-mono text-emerald-700 dark:text-emerald-400 font-bold">{fmt(m.inputPricePerMillion)}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">per 1M input</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{m.description}</p>
                <div className="flex flex-col gap-1.5">
                  {m.strengths.slice(0, 2).map((s) => (
                    <div key={s} className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="text-emerald-500 shrink-0">✓</span>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Verdict */}
        <section className="mb-10 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">Our Verdict</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{comp.verdict}</p>
        </section>

        {/* FAQ */}
        <div className="mb-10">
          <FAQSection faqs={COMPARISON_FAQS} title="FAQ" />
        </div>

        {/* CTA */}
        <section className="mb-10 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Compare These Models Yourself</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use the TokenRate calculator to enter your budget or token count and see the exact cost for each model side by side.
          </p>
          <Link href="/" className="self-start px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
            Open Calculator →
          </Link>
        </section>

        {/* Related comparisons */}
        <RelatedPages
          title="More Comparisons"
          pages={ALL_COMPARISONS
            .filter((c) => c.slug !== slug)
            .slice(0, 4)
            .map((c) => ({
              href: `/compare/${c.slug}`,
              label: c.title,
              description: c.description.slice(0, 80) + '…',
            }))}
        />
      </div>
    </>
  )
}
