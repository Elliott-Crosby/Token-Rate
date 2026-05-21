import Link from 'next/link'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { href: '/', label: 'Calculator' },
  { href: '/models/claude-sonnet-4', label: 'Models' },
  { href: '/compare/cheapest-ai-models-2025', label: 'Compare' },
  { href: '/guides', label: 'Guides' },
  { href: '/tools/words-to-tokens', label: 'Tools' },
]

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="text-base font-black tracking-tight">
            <span className="text-emerald-500">Token</span>
            <span className="text-zinc-900 dark:text-zinc-50">Rate</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
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

        <ThemeToggle />
      </div>
    </header>
  )
}
