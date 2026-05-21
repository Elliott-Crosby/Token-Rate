'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [form, setForm] = useState({ email: '', subject: '', message: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const endpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? ''
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('sent')
        setForm({ email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="p-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-sm text-emerald-700 dark:text-emerald-400">
        Message sent — we&apos;ll get back to you soon.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Your Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          value={form.subject}
          onChange={handleChange}
          placeholder="Pricing question, bug report, etc."
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={form.message}
          onChange={handleChange}
          placeholder="Your message..."
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600 resize-y"
        />
      </div>
      {status === 'error' && (
        <p className="text-xs text-red-500 dark:text-red-400">
          Something went wrong. Please email us directly at{' '}
          <a href="mailto:nodea.ai@gmail.com" className="underline">nodea.ai@gmail.com</a>.
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="self-start px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        {status === 'sending' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
