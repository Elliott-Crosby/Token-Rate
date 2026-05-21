import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import { ALL_GUIDES } from '@/lib/guides'
import { getAllBlogPosts } from '@/lib/blog'

export const metadata: Metadata = buildMetadata({
  title: 'Guides & Articles — TokenRate',
  description: 'Practical guides on AI token pricing, model comparisons, and cost optimization — plus all published blog articles.',
  path: '/guides',
})

export default function GuidesIndex() {
  const posts = getAllBlogPosts()

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Guides' }]} />

      {/* Core guides */}
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Guides</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">Learn AI Token Pricing</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed mb-8">
          Core explainers on how tokens work, how pricing is calculated, and how to keep your AI costs under control.
        </p>

        <div className="flex flex-col gap-3">
          {ALL_GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group flex items-start justify-between gap-4 px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
            >
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                  {guide.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                  {guide.description}
                </p>
              </div>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap shrink-0 mt-0.5">
                {guide.readTime}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Blog articles */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Blog</p>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">All Articles</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed mb-6">
          Every published article, newest first.
        </p>

        {posts.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">No articles published yet — check back soon.</p>
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex items-start justify-between gap-4 px-5 py-3.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {post.title}
                  </p>
                  {post.tags?.length > 0 && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-1">
                      {post.tags.slice(0, 2).join(' · ')}
                    </p>
                  )}
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
        )}
      </div>
    </div>
  )
}
