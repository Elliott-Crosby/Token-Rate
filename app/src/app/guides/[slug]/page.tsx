import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ALL_GUIDES, getGuideBySlug } from '@/lib/guides'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import JsonLd, { articleSchema, breadcrumbSchema } from '@/components/JsonLd'

export function generateStaticParams() {
  return ALL_GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}
  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${slug}`,
  })
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  const relatedGuides = guide.relatedSlugs
    .map((s) => getGuideBySlug(s))
    .filter(Boolean)
    .map((g) => ({
      href: `/guides/${g!.slug}`,
      label: g!.title,
      description: g!.description,
    }))

  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Guides', url: 'https://tokenrate.dev/guides/what-are-ai-tokens' },
    { name: guide.title, url: `https://tokenrate.dev/guides/${slug}` },
  ]

  return (
    <>
      <JsonLd data={articleSchema({ title: guide.title, description: guide.description, url: `https://tokenrate.dev/guides/${slug}` })} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Guides' },
            { label: guide.title },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Guide · {guide.readTime}</p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{guide.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">{guide.description}</p>
        </div>

        {/* Content */}
        <article className="flex flex-col gap-8">
          {guide.content.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{section.heading}</h2>
              <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                {section.body}
              </div>
            </section>
          ))}
        </article>

        {/* CTA */}
        <div className="mt-10 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 flex flex-col gap-3">
          <p className="font-bold text-zinc-900 dark:text-zinc-50">Try the TokenRate Calculator</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Convert any budget, token count, or text length into live AI pricing — across Claude, GPT-4o, Gemini, and more.
          </p>
          <Link href="/" className="self-start px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
            Open Calculator →
          </Link>
        </div>

        {/* Related guides */}
        {relatedGuides.length > 0 && (
          <div className="mt-10">
            <RelatedPages pages={relatedGuides} title="Related Guides" />
          </div>
        )}

        {/* All guides index */}
        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-3">All Guides</p>
          <div className="flex flex-col gap-2">
            {ALL_GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className={`flex justify-between items-center px-4 py-3 rounded-lg border text-sm transition-colors ${
                  g.slug === slug
                    ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-medium'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
              >
                <span>{g.title}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 ml-4">{g.readTime}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
