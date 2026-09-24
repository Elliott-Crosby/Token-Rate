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
  const comparisonCount = ALL_COMPARISONS.length

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">About TokenRate</h1>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-6">
        Model catalog built <time dateTime={MODELS_UPDATED_AT}>{MODELS_UPDATED_AT}</time>
      </p>

      <div className="flex flex-col gap-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p>
          <strong className="text-zinc-800 dark:text-zinc-200">TokenRate</strong> is a free, open
          token-and-pricing calculator for developers, product teams, and finance owners who run
          workloads on AI APIs. We answer two questions before you ship: <em>how much will this
          prompt cost?</em> and <em>how many words can my budget buy across models?</em>
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
            ). The site combines model price data with calculators and practical guides so
            readers can estimate the cost of their own workloads. Rates and billing rules change,
            so each guide links to provider documentation and the calculators show their
            limitations. If you find an error, <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline">send a correction</Link>.
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
            on tokenization and pricing. Every model has a dedicated page with input/output prices,
            context window, output limit, strengths, weaknesses, and cost examples.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Methodology</h2>
          <p>
            Live pricing for the calculator is pulled from the{' '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">OpenRouter API</a>,
            which publishes model and provider-route rates. Some calculator pages use a catalog
            generated at build time; pages with a live price lookup cache that lookup for up to an
            hour. The catalog build date does not prove that every provider SKU was individually verified that day.
          </p>
          <p className="mt-2">
            Individual model pages may combine catalog prices with a live OpenRouter lookup.
            A Live badge identifies a successful lookup; otherwise a reference price is shown.
            The displayed date is the catalog update date. Aggregator route prices can differ
            from a direct provider invoice.
          </p>
          <p className="mt-2">
            For mission-critical decisions, always confirm with the provider&rsquo;s official pricing page
            ({' '}
            <a href="https://platform.claude.com/docs/en/about-claude/pricing" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Anthropic</a>,{' '}
            <a href="https://developers.openai.com/api/docs/pricing" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">OpenAI</a>,{' '}
            <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Google</a>{' '}
            ). Check the exact model, service tier and billing category on your invoice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Token estimation</h2>
          <p>
            For English text, TokenRate uses the standard{' '}
            <strong className="text-zinc-800 dark:text-zinc-200">4 characters per token</strong>{' '}
            approximation for a quick planning estimate. Error varies by language, formatting,
            code, and model tokenizer. For exact counts on critical workloads, use provider tools:{' '}
            <a href="https://github.com/openai/tiktoken" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">tiktoken</a>{' '}
            for OpenAI,{' '}
            <a href="https://docs.anthropic.com/en/docs/build-with-claude/token-counting" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">the Anthropic SDK</a>{' '}
            for Claude, and{' '}
            <a href="https://ai.google.dev/gemini-api/docs/tokens" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Google&rsquo;s countTokens API</a>{' '}
            for Gemini.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">What we do not do</h2>
          <p>
            We do not take payment for placement on rankings or comparisons. We do not take
            commissions on model purchases or API signups. Rankings are derived from public
            pricing and benchmarks, and verdicts on comparison pages reflect our reading of
            published evaluations — not a vendor relationship.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Is TokenRate free?</h2>
          <p>
            Yes — no account, no sign-up, no credit card. The site may display advertising
            after approval; the calculators and guides remain free. See our{' '}
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
            Include the model ID and a link to the provider&rsquo;s price page when reporting a rate.
          </p>
        </section>
      </div>
    </div>
  )
}
