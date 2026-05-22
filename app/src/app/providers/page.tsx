import type { Metadata } from 'next'
import Link from 'next/link'
import { PROVIDERS, ALL_MODELS } from '@/lib/models'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd, { breadcrumbSchema } from '@/components/JsonLd'

export const metadata: Metadata = buildMetadata({
  title: 'AI API Providers — Pricing by Vendor',
  description:
    'Compare AI language model APIs by vendor. Pricing pages for Anthropic, OpenAI, Google, Meta (Llama), DeepSeek, xAI (Grok), and Mistral.',
  path: '/providers',
})

export default function ProvidersIndex() {
  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Providers', url: 'https://tokenrate.dev/providers' },
  ]

  return (
    <>
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Providers' }]} />

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Providers</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">AI API Providers</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed max-w-2xl">
            Each major AI provider with its pricing, model lineup, and where it shines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROVIDERS.map((p) => {
            const count = ALL_MODELS.filter((m) => m.providerSlug === p.slug).length
            return (
              <Link
                key={p.slug}
                href={`/providers/${p.slug}`}
                className="group flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {p.name}
                  </h2>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">{count} models</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">{p.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
