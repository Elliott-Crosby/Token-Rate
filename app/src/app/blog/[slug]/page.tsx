import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { getAllBlogPosts, getBlogPost } from '@/lib/blog'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd, { articleSchema, breadcrumbSchema } from '@/components/JsonLd'

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return buildMetadata({ title: post.title, description: post.description, path: `/blog/${slug}` })
}

// Render inline links like [text](/path) in body text
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
            const nodes: React.ReactNode[] = [<span key={`${i}-${j}`}>{para}</span>]
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const breadcrumbs = [
    { name: 'TokenRate', url: 'https://tokenrate.dev' },
    { name: 'Blog', url: 'https://tokenrate.dev/blog' },
    { name: post.title, url: `https://tokenrate.dev/blog/${slug}` },
  ]

  return (
    <>
      <JsonLd
        data={articleSchema({ title: post.title, description: post.description, url: `https://tokenrate.dev/blog/${slug}` })}
      />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      {/* FAQ schema */}
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
          crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }, { label: post.title }]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            {post.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500"
              >
                {tag}
              </span>
            ))}
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto">{post.readTime}</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{post.title}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed mb-3">{post.description}</p>
          {post.publishedAt && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Published{' '}
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Body sections */}
        <article className="flex flex-col gap-8">
          {post.sections?.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{section.heading}</h2>
              <div className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                {renderBody(section.body)}
              </div>
            </section>
          ))}
        </article>

        {/* FAQ */}
        {post.faq?.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Frequently Asked Questions</h2>
            <div className="flex flex-col gap-4">
              {post.faq.map((item, i) => (
                <div key={i} className="px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm mb-1.5">{item.question}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 flex flex-col gap-3">
          <p className="font-bold text-zinc-900 dark:text-zinc-50">Try the TokenRate Calculator</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{post.ctaText}</p>
          <Link
            href="/"
            className="self-start px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
          >
            Open Calculator →
          </Link>
        </div>

        {/* Back to blog */}
        <div className="mt-8">
          <Link href="/blog" className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            ← All Articles
          </Link>
        </div>
      </div>
    </>
  )
}
