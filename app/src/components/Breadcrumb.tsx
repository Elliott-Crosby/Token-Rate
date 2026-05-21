import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 mb-6 flex-wrap">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">/</span>}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-zinc-600 dark:text-zinc-300">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
