import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blog'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = buildMetadata({
  title: 'AI Token & Pricing Blog',
  description:
    'Practical articles on AI API pricing, token math, model comparisons, and cost optimization — updated regularly.',
  path: '/blog',
})

export default function BlogIndex() {
  const posts = getAllBlogPosts()

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Blog</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">AI Token & Pricing Articles</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">
          Practical guides on AI API costs, token math, and model comparisons — for developers and teams building with
          LLMs.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">No posts published yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                {post.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto">{post.readTime}</span>
              </div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
                {post.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                {post.description}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
