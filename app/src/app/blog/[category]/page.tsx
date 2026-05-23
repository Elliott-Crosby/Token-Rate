import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPostsByCategory } from '@/lib/blog'
import { CATEGORIES, getCategory, isCategorySlug } from '@/lib/categories'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = getCategory(category)
  if (!cat) return {}
  return buildMetadata({
    title: `${cat.label} — TokenRate Blog`,
    description: cat.description,
    path: `/blog/${category}`,
  })
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  if (!isCategorySlug(category)) notFound()
  const cat = getCategory(category)!
  const posts = getBlogPostsByCategory(category)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
          { label: cat.label },
        ]}
      />

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-2">Category</p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{cat.label}</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">{cat.description}</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-400 dark:text-zinc-500 text-sm">No posts in this category yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.category}/${post.slug}`}
              className="group block px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {post.kind === 'guide' ? 'Guide' : 'Article'}
                </span>
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

      <div className="mt-10">
        <Link
          href="/blog"
          className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          ← All categories
        </Link>
      </div>
    </div>
  )
}
