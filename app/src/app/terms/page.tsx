import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Use — TokenRate',
  description: 'Terms of use for TokenRate. Pricing data is for informational purposes only.',
  path: '/terms',
})

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Terms of Use' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Terms of Use</h1>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-8">Last updated: January 2025</p>

      <div className="flex flex-col gap-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Acceptance of Terms</h2>
          <p>
            By accessing tokenrate.dev, you agree to these Terms of Use. If you do not agree, please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Informational Use Only</h2>
          <p>
            All pricing information on TokenRate is provided for <strong className="text-zinc-800 dark:text-zinc-200">informational purposes only</strong>. Prices change frequently and may not reflect the current rates of any AI provider. Always verify pricing directly with the provider before making business or financial decisions.
          </p>
          <p className="mt-2">
            TokenRate makes no guarantees regarding the accuracy, completeness, or timeliness of any pricing data displayed on this site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Permitted Use</h2>
          <p>
            TokenRate is provided as a free tool for personal and commercial use. You may use the calculator, guides, and comparison pages for any lawful purpose. You may not scrape, reproduce, or redistribute our content in bulk without permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">No Warranty</h2>
          <p>
            TokenRate is provided &ldquo;as is&rdquo; without warranty of any kind, express or implied. We make no warranties regarding uptime, accuracy of pricing data, or fitness for any particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, TokenRate and its operators shall not be liable for any damages arising from your use of this site, including but not limited to reliance on pricing data that later proves inaccurate.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Third-Party Links</h2>
          <p>
            TokenRate links to external sites including AI providers and OpenRouter. We have no control over those sites and are not responsible for their content or practices.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Contact</h2>
          <p>
            Questions about these terms? Email{' '}
            <a href="mailto:hello@tokenrate.dev" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              hello@tokenrate.dev
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
