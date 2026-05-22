import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from './ContactForm'

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Contact the TokenRate team with questions, pricing corrections, or feedback.',
  path: '/contact',
})

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Contact Us</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        Have a question, found a pricing error, or want to suggest a model we should add? Reach out below or email us directly at{' '}
        <a href="mailto:nodea.ai@gmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
          nodea.ai@gmail.com
        </a>
        .
      </p>

      <ContactForm />
    </div>
  )
}
