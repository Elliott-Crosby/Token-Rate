import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_COMPARISONS, getComparisonModels } from '@/lib/comparisons'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'

export const metadata: Metadata = buildMetadata({
  title: 'AI Model Comparisons — Side-by-Side LLM Reviews',
  description:
    'In-depth side-by-side comparisons of leading AI language models. Pricing, context windows, strengths, and verdicts for Claude vs GPT, Gemini vs Claude, open-source vs proprietary, and more.',
  path: '/compare',
})

export default function CompareIndex() {
  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Compare', url: 'https://tokenrate.dev/compare' },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Compare' }]} />

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Compare</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">AI Model Comparisons</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed max-w-2xl">
            Head-to-head reviews of the most popular AI language models — pricing, performance, context, and a verdict
            for each.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_COMPARISONS.map((c) => {
            const models = getComparisonModels(c)
            return (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all"
              >
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {c.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">{c.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {models.slice(0, 4).map((m) => (
                    <span
                      key={m.slug}
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
