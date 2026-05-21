import Link from 'next/link'

const FOOTER_COLS = [
  {
    label: 'Tools',
    links: [
      { href: '/', label: 'Token Calculator' },
      { href: '/tools/words-to-tokens', label: 'Words → Tokens' },
      { href: '/tools/token-to-usd', label: 'Token → USD' },
      { href: '/tools/api-cost-estimator', label: 'API Cost Estimator' },
    ],
  },
  {
    label: 'Models',
    links: [
      { href: '/models/claude-sonnet-4', label: 'Claude Sonnet 4' },
      { href: '/models/gpt-4o', label: 'GPT-4o' },
      { href: '/models/gemini-2-5-pro', label: 'Gemini 2.5 Pro' },
      { href: '/models/gemini-2-0-flash', label: 'Gemini 2.0 Flash' },
    ],
  },
  {
    label: 'Compare',
    links: [
      { href: '/compare/cheapest-ai-models-2025', label: 'Cheapest AI Models' },
      { href: '/compare/gpt-4o-vs-claude-sonnet-4', label: 'GPT-4o vs Claude' },
      { href: '/compare/best-models-for-coding', label: 'Best for Coding' },
    ],
  },
  {
    label: 'Guides',
    links: [
      { href: '/guides/what-are-ai-tokens', label: 'What Are AI Tokens?' },
      { href: '/guides/how-ai-api-pricing-works', label: 'How Pricing Works' },
      { href: '/guides/how-many-tokens-in-1000-words', label: 'Tokens in 1,000 Words' },
      { href: '/guides/how-to-reduce-ai-api-costs', label: 'Reduce API Costs' },
    ],
  },
  {
    label: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Use' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mt-16">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {FOOTER_COLS.map((col) => (
            <div key={col.label} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {col.label}
              </p>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Link href="/" className="font-black text-sm">
            <span className="text-emerald-500">Token</span>
            <span className="text-zinc-900 dark:text-zinc-50">Rate</span>
          </Link>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} TokenRate. Pricing data via OpenRouter. For informational use only.
          </p>
        </div>
      </div>
    </footer>
  )
}
