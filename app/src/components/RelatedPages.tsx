import Link from 'next/link'

interface RelatedPage {
  href: string
  label: string
  description: string
}

export default function RelatedPages({ pages, title = 'Related' }: { pages: RelatedPage[]; title?: string }) {
  if (pages.length === 0) return null
  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="flex flex-col gap-1 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all"
          >
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{page.label}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">{page.description}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
