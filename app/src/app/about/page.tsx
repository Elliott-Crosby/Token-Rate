import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

export const metadata: Metadata = buildMetadata({
  title: 'About TokenRate',
  description:
    'TokenRate is a free AI token calculator and pricing comparison tool. Learn about how we source pricing data and why we built this.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">About TokenRate</h1>

      <div className="flex flex-col gap-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p>
          <strong className="text-zinc-800 dark:text-zinc-200">TokenRate</strong> is a free tool for developers, product teams, and businesses that use AI APIs. We make it easy to understand and compare the cost of running AI models — before you get a bill.
        </p>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">What we do</h2>
          <p>
            We track live pricing from Anthropic, OpenAI, Google, Mistral, and other AI providers. Our calculator lets you convert between money, tokens, and characters — so you can see exactly what your AI usage will cost across different models, side by side.
          </p>
          <p className="mt-2">
            Beyond the calculator, TokenRate provides detailed model pages, comparison tables, cost estimation tools, and educational guides explaining how AI token pricing works.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Where our pricing data comes from</h2>
          <p>
            Live pricing data for the calculator is pulled from the <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">OpenRouter API</a>, which aggregates real-time pricing from AI providers. Data is refreshed every hour.
          </p>
          <p className="mt-2">
            Static pricing shown in model pages and comparison tables is maintained manually and may lag slightly behind official provider announcements. Always verify pricing with the official provider before making financial decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Is TokenRate free?</h2>
          <p>
            Yes. TokenRate is completely free to use — no account, no sign-up, no credit card. We may display ads in the future to support hosting costs, but the core tool will always be free.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Contact</h2>
          <p>
            Questions, suggestions, or pricing corrections? <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline">Get in touch →</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
