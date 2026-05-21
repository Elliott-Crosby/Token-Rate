'use client'

import { useState } from 'react'
import type { FAQ } from '@/lib/faqs'

export default function FAQSection({ faqs, title = 'Frequently Asked Questions' }: { faqs: FAQ[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h2>
      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              aria-expanded={open === i}
            >
              <span className="font-medium text-zinc-800 dark:text-zinc-200 text-sm leading-snug">
                {faq.question}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              >
                <path d="M3 6l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
