import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { PROVIDERS, ALL_MODELS, getProviderBySlug, getModelsByProvider } from '@/lib/models'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import JsonLd, { breadcrumbSchema, itemListSchema } from '@/components/JsonLd'

export function generateStaticParams() {
  return PROVIDERS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const provider = getProviderBySlug(slug)
  if (!provider) return {}
  const models = getModelsByProvider(slug)
  const cheapest = [...models].sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)[0]
  return buildMetadata({
    title: `${provider.name} API Pricing — All Models Compared`,
    description: `Full ${provider.name} model lineup with API pricing. ${models.length} models from $${cheapest?.inputPricePerMillion ?? 0}/1M input tokens. Context windows, output limits, and use cases.`,
    path: `/providers/${slug}`,
  })
}

function fmt(n: number) {
  return '$' + n.toFixed(n < 1 ? 3 : 2)
}

export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const provider = getProviderBySlug(slug)
  if (!provider) notFound()

  const models = getModelsByProvider(slug).sort((a, b) => a.inputPricePerMillion - b.inputPricePerMillion)
  if (models.length === 0) notFound()

  const cheapest = models[0]
  const flagship = models.find((m) => m.tier === 'flagship') ?? models[models.length - 1]

  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Providers', url: 'https://tokenrate.dev/providers' },
    { name: provider.name, url: `https://tokenrate.dev/providers/${slug}` },
  ]

  const itemList = itemListSchema({
    name: `${provider.name} models`,
    urls: models.map((m) => `https://tokenrate.dev/models/${m.slug}`),
  })

  const otherProviders = PROVIDERS.filter((p) => p.slug !== slug).map((p) => ({
    href: `/providers/${p.slug}`,
    label: `${p.name} pricing`,
    description: `${ALL_MODELS.filter((m) => m.providerSlug === p.slug).length} ${p.name} models with full pricing.`,
  }))

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <JsonLd data={itemList} />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Providers', href: '/providers' },
            { label: provider.name },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{provider.name} API Pricing</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed max-w-3xl">{provider.description}</p>
          {provider.url ? (
            <p className="mt-3 text-sm">
              <a
                href={provider.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Official site: {provider.url.replace(/^https?:\/\//, '')} →
              </a>
            </p>
          ) : null}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="flex flex-col gap-1 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-500">
              Cheapest
            </p>
            <Link
              href={`/models/${cheapest.slug}`}
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {cheapest.name}
            </Link>
            <p className="text-sm font-mono text-emerald-700 dark:text-emerald-400">
              {fmt(cheapest.inputPricePerMillion)}/1M in
            </p>
          </div>
          <div className="flex flex-col gap-1 p-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">Flagship</p>
            <Link
              href={`/models/${flagship.slug}`}
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {flagship.name}
            </Link>
            <p className="text-sm font-mono text-amber-700 dark:text-amber-400">
              {fmt(flagship.inputPricePerMillion)}/1M in
            </p>
          </div>
          <div className="flex flex-col gap-1 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Models</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{models.length} tracked</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">All tiers, latest pricing.</p>
          </div>
        </div>

        {/* Models table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">All {provider.name} Models</h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-left">Model</th>
                  <th className="px-4 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-left">Tier</th>
                  <th className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right">Input / 1M</th>
                  <th className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-400 text-right">Output / 1M</th>
                  <th className="px-4 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-right">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {models.map((m, i) => {
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
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 capitalize text-xs">{m.tier}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                        {fmt(m.inputPricePerMillion)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400">
                        {fmt(m.outputPricePerMillion)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-400 dark:text-zinc-500 text-xs">{ctx}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Model cards with descriptions */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Model Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {models.map((m) => (
              <Link
                key={m.slug}
                href={`/models/${m.slug}`}
                className="group flex flex-col gap-2 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {m.name}
                  </h3>
                  <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                    {fmt(m.inputPricePerMillion)} in
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">{m.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-10 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-6 flex flex-col gap-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Calculate {provider.name} API Costs
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use the TokenRate calculator to estimate exactly what {provider.name} models will cost for your workload.
          </p>
          <Link
            href="/"
            className="self-start px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            Open Calculator →
          </Link>
        </section>

        {/* Other providers */}
        <RelatedPages pages={otherProviders} title="Other Providers" />
      </div>
    </>
  )
}
