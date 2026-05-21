import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import RelatedPages from '@/components/RelatedPages'
import WordsToTokensClient from './WordsToTokensClient'
import JsonLd, { webAppSchema } from '@/components/JsonLd'

export const metadata: Metadata = buildMetadata({
  title: 'Words to Tokens Converter — Estimate AI Token Count Free',
  description:
    'Paste any text to instantly estimate the AI token count. See how many tokens your text uses across GPT-4o, Claude, and Gemini models. Free, no login required.',
  path: '/tools/words-to-tokens',
})

const RELATED = [
  { href: '/tools/token-to-usd', label: 'Token → USD Calculator', description: 'Convert a token count into dollars for any AI model.' },
  { href: '/guides/what-are-ai-tokens', label: 'What Are AI Tokens?', description: 'Learn how tokens work and why they matter for AI costs.' },
  { href: '/guides/how-many-tokens-in-1000-words', label: 'Token Reference Guide', description: 'Quick reference: words, pages, and characters to tokens.' },
  { href: '/', label: 'Full Token Calculator', description: 'Convert money, tokens, and characters across all models.' },
]

export default function WordsToTokensPage() {
  return (
    <>
      <JsonLd data={webAppSchema()} />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Tools' }, { label: 'Words → Tokens' }]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Words to Tokens Converter
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Paste any text below to estimate the token count and see what it would cost across major AI models. Uses the standard 4 characters per token approximation.
          </p>
        </div>

        <WordsToTokensClient />

        {/* Reference table */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Word-to-Token Reference</h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-left">Content</th>
                  <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-right">Words</th>
                  <th className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right">~Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[
                  ['Short email', 100, 133],
                  ['Standard email', 250, 333],
                  ['Blog post', 1000, 1333],
                  ['Long article', 3000, 4000],
                  ['Short story', 7500, 10000],
                  ['Novella', 40000, 53333],
                  ['Full novel', 80000, 106666],
                ].map(([label, words, tokens], i) => (
                  <tr key={String(label)} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'}>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{label}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400">{Number(words).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400">~{Number(tokens).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-12">
          <RelatedPages pages={RELATED} title="Related Tools" />
        </div>
      </div>
    </>
  )
}
