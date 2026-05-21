import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-500 mb-3">404</p>
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">Page not found</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          Back to Calculator
        </Link>
        <Link
          href="/guides/what-are-ai-tokens"
          className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Read the Guides
        </Link>
      </div>
    </div>
  )
}
