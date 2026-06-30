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
      { href: '/models', label: 'All Models' },
      { href: '/models/claude-opus-4-8', label: 'Claude Opus 4.8' },
      { href: '/models/claude-sonnet-5', label: 'Claude Sonnet 5' },
      { href: '/models/gpt-5', label: 'GPT-5' },
      { href: '/models/gemini-2-5-pro', label: 'Gemini 2.5 Pro' },
      { href: '/models/deepseek-v3', label: 'DeepSeek V3' },
    ],
  },
  {
    label: 'Providers',
    links: [
      { href: '/providers/anthropic', label: 'Anthropic' },
      { href: '/providers/openai', label: 'OpenAI' },
      { href: '/providers/google', label: 'Google' },
      { href: '/providers/meta', label: 'Meta (Llama)' },
      { href: '/providers/deepseek', label: 'DeepSeek' },
      { href: '/providers/xai', label: 'xAI (Grok)' },
    ],
  },
  {
    label: 'Compare',
    links: [
      { href: '/compare/cheapest-ai-models', label: 'Cheapest AI Models' },
      { href: '/compare/claude-sonnet-5-vs-opus-4-8', label: 'Sonnet 5 vs Opus 4.8' },
      { href: '/compare/best-models-for-coding', label: 'Best for Coding' },
    ],
  },
  {
    label: 'Blog',
    links: [
      { href: '/blog', label: 'All posts' },
      { href: '/blog/fundamentals', label: 'Fundamentals' },
      { href: '/blog/comparisons', label: 'Model Comparisons' },
      { href: '/blog/cost-optimization', label: 'Cost Optimization' },
      { href: '/blog/building', label: 'Building with AI' },
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
