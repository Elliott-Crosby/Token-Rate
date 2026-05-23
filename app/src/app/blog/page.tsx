import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostsGroupedByCategory } from '@/lib/blog'
import { CATEGORIES } from '@/lib/categories'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = buildMetadata({
  title: 'AI Token & Pricing Blog',
  description:
    'Practical articles and guides on AI API pricing, token math, model comparisons, and cost optimization — organized by topic.',
  path: '/blog',
})

export default function BlogIndex() {
  const grouped = getPostsGroupedByCategory()

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Blog</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
          AI Token & Pricing Knowledge Base
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">
          Guides and articles for developers and teams building with LLMs, organized by topic.
        </p>
      </div>

      {/* Category cards — quick jump */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        {CATEGORIES.map((cat) => {
          const count = grouped[cat.slug]?.length ?? 0
          return (
            <Link
              key={cat.slug}
              href={`/blog/${cat.slug}`}
              className="group flex flex-col gap-1 px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cat.label}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {count} {count === 1 ? 'post' : 'posts'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{cat.description}</p>
            </Link>
          )
        })}
      </div>

      {/* Posts grouped by category */}
      <div className="flex flex-col gap-12">
        {CATEGORIES.map((cat) => {
          const posts = grouped[cat.slug] ?? []
          if (posts.length === 0) return null
          return (
            <section key={cat.slug} id={cat.slug}>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{cat.label}</h2>
                <Link
                  href={`/blog/${cat.slug}`}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View all →
                </Link>
              </div>
              <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.category}/${post.slug}`}
                    className="group flex items-start justify-between gap-4 px-5 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {post.title}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">
                        {post.kind === 'guide' ? 'Guide' : 'Article'} · {post.readTime}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap shrink-0 mt-0.5">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
