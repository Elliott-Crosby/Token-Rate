import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = buildMetadata({
  title: 'Contact TokenRate',
  description: 'Contact the TokenRate team with questions, pricing corrections, or feedback.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Contact Us</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Have a question, found a pricing error, or want to suggest a model we should add? Reach out below.
      </p>

      <div className="flex flex-col gap-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Your Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Subject</label>
          <input
            type="text"
            placeholder="Pricing question, bug report, etc."
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Message</label>
          <textarea
            rows={5}
            placeholder="Your message..."
            className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600 resize-y"
          />
        </div>
        <button className="self-start px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
          Send Message
        </button>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Note: This form is a placeholder. You can also email us directly at{' '}
          <a href="mailto:hello@tokenrate.dev" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            hello@tokenrate.dev
          </a>
        </p>
      </div>
    </div>
  )
}
