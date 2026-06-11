import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import { ALL_MODELS, MODELS_UPDATED_AT, PROVIDERS } from '@/lib/models'
import { ALL_COMPARISONS } from '@/lib/comparisons'
import { getAllBlogPosts } from '@/lib/blog'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'TokenRate is a free AI token calculator and pricing comparison tool. Learn about our methodology, where we source live pricing data, and how we keep it current.',
  path: '/about',
})

export default function AboutPage() {
  const modelCount = ALL_MODELS.length
  const providerCount = PROVIDERS.length
  const posts = getAllBlogPosts()
  const guideCount = posts.filter((p) => p.kind === 'guide').length
  const articleCount = posts.length - guideCount
  const comparisonCount = ALL_COMPARISONS.length

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">About TokenRate</h1>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6">
        Data last verified <time dateTime={MODELS_UPDATED_AT}>{MODELS_UPDATED_AT}</time>
      </p>

      <div className="flex flex-col gap-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p>
          <strong className="text-zinc-800 dark:text-zinc-200">TokenRate</strong> is a free, open
          token-and-pricing calculator for developers, product teams, and finance owners who run
          workloads on AI APIs. We answer two questions before you ship: <em>"how much will this
          prompt cost?"</em> and <em>"how many words can my budget buy across models?"</em>
        </p>

        <section id="author">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Who runs TokenRate</h2>
          <p>
            TokenRate is built and maintained by{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">Elliott Crosby</strong>{' '}
            (
            <a
              href="https://github.com/Elliott-Crosby"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              GitHub
            </a>
            ). I started TokenRate in 2026 after one too many surprise AI API bills: provider
            pricing pages each use their own units, quality leaderboards live somewhere else
            entirely, and nobody answers the only question that matters — what will{' '}
            <em>my</em> workload cost on <em>this</em> model? I write the guides, maintain the
            data pipeline that re-verifies prices daily, and review every number on this site.
            If you catch an error, <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline">tell me</Link> and
            I'll fix it within a day.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Coverage</h2>
          <p>
            As of {MODELS_UPDATED_AT}, TokenRate tracks{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{modelCount} AI models</strong>{' '}
            across <strong className="text-zinc-800 dark:text-zinc-200">{providerCount} providers</strong>{' '}
            (Anthropic, OpenAI, Google, Meta, DeepSeek, xAI, Mistral), publishes{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{comparisonCount} head-to-head
            comparisons</strong>, and maintains{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{guideCount} reference guides</strong>{' '}
            and <strong className="text-zinc-800 dark:text-zinc-200">{articleCount} articles</strong>{' '}
            on tokenization and pricing. Every model has a dedicated page with input/output prices,
            context window, output limit, strengths, weaknesses, and cost examples.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Methodology</h2>
          <p>
            Live pricing for the calculator is pulled from the{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">OpenRouter API</a>,
            which aggregates real-time pricing directly from provider APIs. Data is refreshed every
            hour via Next.js Incremental Static Regeneration — meaning every page on this site is
            served from the edge as a static HTML document, with prices revalidated against
            OpenRouter on a 60-minute cycle.
          </p>
          <p className="mt-2">
            Reference pricing on individual model pages, comparison rankings, and guide examples is
            maintained manually and re-stamped on a rolling cadence. Last full sweep:{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">{MODELS_UPDATED_AT}</strong>. When
            live OpenRouter data is available we surface it with a "Live" badge; otherwise the page
            shows the reference price and the date it was verified.
          </p>
          <p className="mt-2">
            For mission-critical decisions, always confirm with the provider's official pricing page
            ({' '}
            <a href="https://www.anthropic.com/pricing" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Anthropic</a>,{' '}
            <a href="https://openai.com/api/pricing/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">OpenAI</a>,{' '}
            <a href="https://ai.google.dev/pricing" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Google</a>{' '}
            ). Pricing changes are typically reflected in OpenRouter within hours of announcement.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Token estimation</h2>
          <p>
            For English text, TokenRate uses the standard{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">4 characters per token</strong>{' '}
            approximation — accurate within ~5% across the major tokenizers (OpenAI's cl100k_base
            and o200k_base, Anthropic's Claude tokenizer, and Google's SentencePiece). For exact
            per-tokenizer counts on critical workloads, use provider libraries:{' '}
            <a href="https://github.com/openai/tiktoken" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">tiktoken</a>{' '}
            for OpenAI,{' '}
            <a href="https://docs.anthropic.com/en/docs/build-with-claude/token-counting" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">the Anthropic SDK</a>{' '}
            for Claude, and{' '}
            <a href="https://ai.google.dev/gemini-api/docs/tokens" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Google's countTokens API</a>{' '}
            for Gemini.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">What we don't do</h2>
          <p>
            We don't take payment for placement on rankings or comparisons. We don't take
            commissions on model purchases or API signups. Rankings are derived from public
            pricing and benchmarks, and verdicts on comparison pages reflect our reading of
            published evaluations — not a vendor relationship.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Is TokenRate free?</h2>
          <p>
            Yes — no account, no sign-up, no credit card. Ads served by Google AdSense help cover
            hosting; the core calculator and all reference content stay free. See our{' '}
            <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline">privacy policy</Link>{' '}
            for details on how advertising cookies work.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Contact &amp; corrections</h2>
          <p>
            Pricing corrections, missing models, or feedback?{' '}
            <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline">Get in touch →</Link>{' '}
            or email{' '}
            <a href="mailto:nodea.ai@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">nodea.ai@gmail.com</a>.
            We aim to ship pricing corrections within 24 hours of confirmation.
          </p>
        </section>
      </div>
    </div>
  )
}
