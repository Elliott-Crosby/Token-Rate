import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy — TokenRate',
  description: 'TokenRate privacy policy. Learn how we handle analytics, advertising cookies, and pricing data.',
  path: '/privacy',
  noIndex: false,
})

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Privacy Policy</h1>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-8">Last updated: May 2026</p>

      <div className="flex flex-col gap-6 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Overview</h2>
          <p>
            TokenRate (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the website tokenrate.dev. We are committed to protecting your privacy. This policy explains what data we collect, how we use it, and how third-party advertising works on this site.
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
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Advertising & Google AdSense</h2>
          <p>
            TokenRate uses <strong className="text-zinc-800 dark:text-zinc-200">Google AdSense</strong> to display advertisements. Google AdSense is a third-party advertising service operated by Google LLC.
          </p>
          <p className="mt-2">
            Google and its partners use cookies to serve ads on our site based on your prior visits to this website or other websites. The use of advertising cookies enables Google and its partners to serve ads to you based on your visit to our site and/or other sites on the internet.
          </p>
          <p className="mt-2">
            You may opt out of personalized advertising by visiting{' '}
            <a
              href="https://adssettings.google.com"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>
            . You can also opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting{' '}
            <a
              href="https://www.aboutads.info"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.aboutads.info
            </a>
            .
          </p>
          <p className="mt-2">
            For more information on how Google uses data when you use our site, see{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              className="text-emerald-600 dark:text-emerald-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              How Google uses data when you use our partners&apos; sites or apps
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Cookies</h2>
          <p>
            TokenRate uses cookies in the following ways:
          </p>
          <ul className="mt-2 flex flex-col gap-1 pl-4 list-disc">
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Theme preference:</strong> We store your dark/light mode preference in <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">localStorage</code>. This data never leaves your device.
            </li>
            <li>
              <strong className="text-zinc-800 dark:text-zinc-200">Advertising cookies:</strong> Google AdSense sets cookies to serve personalized ads. See the Advertising section above for opt-out options.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Local Storage</h2>
          <p>
            In addition to cookies, TokenRate uses browser <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">localStorage</code> to store your theme preference. This data never leaves your device and is not accessible to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Third-Party Services</h2>
          <p>
            Pricing data is fetched from{' '}
            <a href="https://openrouter.ai" className="text-emerald-600 dark:text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">OpenRouter</a>{' '}
            on our server (not your browser) and cached for up to one hour. Your IP address is not shared with OpenRouter.
          </p>
          <p className="mt-2">
            The site is hosted on{' '}
            <a href="https://vercel.com" className="text-emerald-600 dark:text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">Vercel</a>,
            which may collect standard server access logs including IP addresses for security and infrastructure purposes, subject to their own privacy policy.
          </p>
          <p className="mt-2">
            Advertisements are served by{' '}
            <a href="https://policies.google.com/privacy" className="text-emerald-600 dark:text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">Google LLC</a>,
            subject to Google&apos;s privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Your Rights</h2>
          <p>
            Depending on your location, you may have rights under applicable privacy laws (including GDPR and CCPA) to access, correct, or delete personal data we hold about you. Since we do not collect personal data directly, most of these rights apply to data held by our third-party service providers (Google, Vercel). You may exercise your rights with those providers directly via the links in this policy.
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
            <a href="mailto:nodea.ai@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              nodea.ai@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
