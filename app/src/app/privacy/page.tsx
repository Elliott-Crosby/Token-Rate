import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy — TokenRate',
  description: 'TokenRate privacy policy. We do not collect personal data. Learn how we handle analytics and pricing data.',
  path: '/privacy',
  noIndex: false,
})

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Privacy Policy</h1>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-8">Last updated: January 2025</p>

      <div className="flex flex-col gap-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Overview</h2>
          <p>
            TokenRate (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website tokenrate.dev. We are committed to protecting your privacy. This policy explains what data we collect, if any, and how we use it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Data We Collect</h2>
          <p>
            <strong className="text-zinc-800 dark:text-zinc-200">We do not collect personal information.</strong> TokenRate does not require account creation, login, or any personally identifiable information to use.
          </p>
          <p className="mt-2">
            We may use privacy-respecting analytics tools to understand general site usage (e.g. page views, browser type, country). These tools do not track individuals across sites and do not collect personal data.
          </p>
          <p className="mt-2">
            Your calculator inputs (money, token, character values) are processed entirely in your browser and are never sent to our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Local Storage</h2>
          <p>
            TokenRate stores your dark/light mode preference in your browser&apos;s <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">localStorage</code>. This data never leaves your device.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Third-Party Services</h2>
          <p>
            Pricing data is fetched from <a href="https://openrouter.ai" className="text-emerald-600 dark:text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">OpenRouter</a> on our server (not your browser) and cached for up to one hour. Your IP address is not shared with OpenRouter.
          </p>
          <p className="mt-2">
            The site is hosted on <a href="https://vercel.com" className="text-emerald-600 dark:text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">Vercel</a>, which may collect standard server access logs including IP addresses for security and infrastructure purposes, subject to their own privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Cookies</h2>
          <p>
            TokenRate does not use tracking cookies. We only use browser localStorage for theme preference, which is not a cookie.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Changes</h2>
          <p>
            We may update this privacy policy from time to time. The &ldquo;last updated&rdquo; date at the top of this page will reflect any changes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Contact</h2>
          <p>
            Questions about this policy? Email us at{' '}
            <a href="mailto:hello@tokenrate.dev" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              hello@tokenrate.dev
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
