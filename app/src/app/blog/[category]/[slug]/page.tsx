import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import { getAllBlogPosts, getBlogPost, getBlogPostsByCategory } from '@/lib/blog'
import { getCategory, isCategorySlug } from '@/lib/categories'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import JsonLd, { articleSchema, breadcrumbSchema } from '@/components/JsonLd'
import AdSlot from '@/components/AdSlot'

const IN_ARTICLE_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE
const ABOVE_CTA_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ABOVE_CTA

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ category: p.category, slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { category, slug } = await params
  const post = getBlogPost(slug)
  if (!post || post.category !== category) return {}
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${category}/${slug}`,
  })
}

function renderBody(body: string) {
  const parts = body.split(/(\[([^\]]+)\]\(([^)]+)\))/g)
  const elements: ReactNode[] = []
  let i = 0
  while (i < parts.length) {
    const part = parts[i]
    if (part?.match(/^\[([^\]]+)\]\(([^)]+)\)$/)) {
      const text = parts[i + 1] ?? ''
      const href = parts[i + 2] ?? ''
      elements.push(
        <Link
          key={i}
          href={href}
          className="text-emerald-600 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-500"
        >
          {text}
        </Link>
      )
      i += 3
    } else {
      if (part) {
        elements.push(
          ...part.split('\n\n').flatMap((para, j, arr) => {
            const nodes: ReactNode[] = [<span key={`${i}-${j}`}>{para}</span>]
            if (j < arr.length - 1) nodes.push(<br key={`br-${i}-${j}`} />, <br key={`br2-${i}-${j}`} />)
            return nodes
          })
        )
      }
      i++
    }
  }
  return elements
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params
  if (!isCategorySlug(category)) notFound()
  const post = getBlogPost(slug)
  if (!post) notFound()

  // If the URL category doesn't match the post's canonical category, 301
  // to the canonical URL. Keeps recategorizations safe.
  if (post.category !== category) {
    redirect(`/blog/${post.category}/${slug}`)
  }

  const cat = getCategory(category)
  const isGuide = post.kind === 'guide'
  const kindLabel = isGuide ? 'Guide' : 'Article'

  // Start from the post's explicit relatedSlugs. Slugs pointing at deleted
  // posts resolve to null via getBlogPost and are dropped by filter(Boolean),
  // so a pruned post never renders as a dead link.
  const MIN_RELATED = 3
  const MAX_RELATED = 4
  const relatedPosts = (post.relatedSlugs ?? [])
    .map((s) => getBlogPost(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p!.slug !== post.slug)

  // Backfill: most posts have no relatedSlugs, so top up from the same category
  // (then any recent post) to ~3-4 links so no post is left orphaned.
  if (relatedPosts.length < MIN_RELATED) {
    const chosen = new Set([post.slug, ...relatedPosts.map((p) => p.slug)])
    for (const p of [...getBlogPostsByCategory(post.category), ...getAllBlogPosts()]) {
      if (relatedPosts.length >= MAX_RELATED) break
      if (chosen.has(p.slug)) continue
      chosen.add(p.slug)
      relatedPosts.push(p)
    }
  }

  const relatedPages = relatedPosts.slice(0, MAX_RELATED).map((p) => ({
    href: `/blog/${p.category}/${p.slug}`,
    label: p.title,
    description: p.description,
  }))

  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Blog', url: 'https://tokenrate.dev/blog' },
    { name: cat?.label ?? category, url: `https://tokenrate.dev/blog/${category}` },
    { name: post.title, url: `https://tokenrate.dev/blog/${category}/${slug}` },
  ]

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: post.title,
          description: post.description,
          url: `https://tokenrate.dev/blog/${category}/${slug}`,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          imageUrl: `https://tokenrate.dev/blog/${category}/${slug}/opengraph-image`,
        })}
      />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {post.faq?.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }}
        />
      )}

      <div className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: cat?.label ?? category, href: `/blog/${category}` },
            { label: post.title },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
              {kindLabel} · {cat?.label ?? category}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto">{post.readTime}</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{post.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed mb-3">{post.description}</p>
          {post.publishedAt && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Published{' '}
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <>
                  {' · '}Updated{' '}
                  <time dateTime={post.updatedAt}>
                    {new Date(post.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </>
              )}
            </p>
          )}
        </div>

        {/* Guide-only: TL;DR */}
        {isGuide && post.tldr && (
          <section
            aria-label="Quick answer"
            className="mb-8 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
              TL;DR
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{post.tldr}</p>
          </section>
        )}

        {/* Comparison table — built in code from live pricing, never LLM-authored */}
        {post.comparison && post.comparison.rows.length > 0 && (
          <section className="mb-8 overflow-x-auto" aria-label={post.comparison.caption ?? 'Comparison table'}>
            {post.comparison.caption && (
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
                {post.comparison.caption}
              </p>
            )}
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-300 dark:border-zinc-700 text-left">
                  {post.comparison.columns.map((col, i) => (
                    <th
                      key={i}
                      className={`py-2 pr-4 font-semibold text-zinc-700 dark:text-zinc-300 ${i === 0 ? '' : 'text-right'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {post.comparison.rows.map((row, r) => (
                  <tr
                    key={r}
                    className={`border-b border-zinc-100 dark:border-zinc-800 ${
                      r === 0 ? 'bg-emerald-50/60 dark:bg-emerald-950/20 font-medium' : ''
                    }`}
                  >
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`py-2 pr-4 ${c === 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-right tabular-nums text-zinc-600 dark:text-zinc-400'}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Body sections — mid-article ad inserted after the 2nd section */}
        <article className="flex flex-col gap-8">
          {post.sections?.map((section, i) => (
            <Fragment key={i}>
              <section>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{section.heading}</h2>
                <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                  {renderBody(section.body)}
                </div>
              </section>
              {i === 1 && IN_ARTICLE_SLOT && (
                <AdSlot slot={IN_ARTICLE_SLOT} format="fluid" layout="in-article" />
              )}
            </Fragment>
          ))}
        </article>

        {/* Guide-only: Primary sources */}
        {isGuide && post.sources && post.sources.length > 0 && (
          <section className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
              Primary sources
            </h2>
            <ul className="flex flex-col gap-2">
              {post.sources.map((src) => (
                <li key={src.url} className="text-sm">
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {src.label}
                  </a>
                  {src.note && <span className="text-zinc-500 dark:text-zinc-400"> — {src.note}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* FAQ */}
        {post.faq?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-4">
              {post.faq.map((item, i) => (
                <div
                  key={i}
                  className="px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                >
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm mb-1.5">{item.question}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {ABOVE_CTA_SLOT && (
          <div className="mt-10">
            <AdSlot slot={ABOVE_CTA_SLOT} format="auto" />
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 flex flex-col gap-3">
          <p className="font-bold text-zinc-900 dark:text-zinc-50">Try the TokenRate Calculator</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {post.ctaText ??
              'Convert any budget, token count, or text length into live AI pricing — across Claude, GPT-4o, Gemini, and more.'}
          </p>
          <Link
            href="/"
            className="self-start px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            Open Calculator →
          </Link>
        </div>

        {/* Related */}
        {relatedPages.length > 0 && (
          <div className="mt-10">
            <RelatedPages pages={relatedPages} title="Related Reading" />
          </div>
        )}

        {/* Back links */}
        <div className="mt-8 flex flex-col gap-1.5">
          <Link
            href={`/blog/${category}`}
            className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            ← All {cat?.label ?? 'posts'} in this category
          </Link>
          <Link
            href="/blog"
            className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            ← All categories
          </Link>
        </div>
      </div>
    </>
  )
}
