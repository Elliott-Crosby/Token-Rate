import Link from 'next/link'
import { TOOLS } from '@/lib/tools'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>
    <nav aria-label="Calculators" className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-wrap gap-2 px-5 py-3 text-xs sm:text-sm">
        <Link href="/tools" className="rounded-md px-3 py-2 font-semibold text-zinc-600 dark:text-zinc-300">All tools</Link>
        {TOOLS.map(tool => <Link key={tool.href} href={tool.href} className={`rounded-md px-3 py-2 ${tool.href === '/tools/token-to-usd' ? 'bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}>{tool.label}</Link>)}
      </div>
    </nav>
    {children}
  </>
}
