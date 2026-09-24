import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { href: '/', label: 'Calculator' },
  { href: '/models', label: 'Models' },
  { href: '/compare', label: 'Compare' },
  { href: '/tools/token-to-usd', label: 'Tokens to USD' },
  { href: '/tools', label: 'Tools' },
  { href: '/blog', label: 'Blog' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl px-5 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-base font-black tracking-tight">
            <span className="text-emerald-500">Token</span>
            <span className="text-zinc-900 dark:text-zinc-50">Rate</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/tools/token-to-usd" className="lg:hidden rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Tokens to USD</Link>
          <ThemeToggle />
        </div>
      </div>
      <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto border-t border-zinc-200 px-3 py-1.5 dark:border-zinc-800 lg:hidden" aria-label="Mobile navigation">
        {NAV_LINKS.filter(link => link.href !== '/tools/token-to-usd').map(link => <Link key={link.href} href={link.href} className="shrink-0 rounded-md px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800">{link.label}</Link>)}
      </nav>
    </header>
  )
}
