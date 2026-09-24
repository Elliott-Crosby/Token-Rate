import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { TOOLS } from '@/lib/tools'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata = buildMetadata({
  title: 'AI Cost Tools — Tokens to USD, Token Counts & Monthly Budgets',
  description: 'Choose the right free AI cost calculator. Convert tokens to USD, estimate tokens from text, compare model prices, or plan a monthly API budget.',
  path: '/tools',
})

export default function ToolsPage() {
  const [primary, ...others] = TOOLS
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools' }]} />
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Free AI calculators</p>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">What do you want to calculate?</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">Start with the numbers you have. No account needed.</p>
      <Link href={primary.href} className="mt-8 block rounded-2xl border border-emerald-300 bg-emerald-50 p-6 transition-colors hover:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/30 sm:p-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Most used tool</span>
        <h2 className="mt-3 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{primary.label} <span aria-hidden="true">→</span></h2>
        <p className="mt-2 max-w-xl text-zinc-700 dark:text-zinc-300">{primary.description} Compare a single token count, or enter separate input and output counts to estimate the total.</p>
        <p className="mt-5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">Open Tokens to USD →</p>
      </Link>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {others.map(tool => <Link key={tool.href} href={tool.href} className="rounded-xl border border-zinc-200 bg-white p-5 hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-50">{tool.label} <span aria-hidden="true">→</span></h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{tool.description}</p>
          <p className="mt-4 text-xs text-zinc-500">{tool.detail}</p>
        </Link>)}
      </div>
      <section className="mt-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">A quick way to check your API cost</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          <li>Find input and output token counts in your API response or usage dashboard. A total token count alone cannot identify the split.</li>
          <li>Open <Link href={primary.href} className="text-emerald-700 underline dark:text-emerald-400">Tokens to USD</Link>, choose “Input + output,” and enter both counts.</li>
          <li>Find your model and check its rate date. Caching, reasoning, tools, and other billing categories can change the final invoice.</li>
        </ol>
        <Link href="/blog/fundamentals/tokens-to-dollars-conversion" className="mt-5 inline-block text-sm font-semibold text-emerald-700 underline dark:text-emerald-400">See the formula and a worked example →</Link>
      </section>
    </div>
  )
}
