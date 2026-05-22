import type { Metadata } from 'next'

export const SITE_URL = 'https://tokenrate.dev'
export const SITE_NAME = 'TokenRate'
export const SITE_DESCRIPTION =
  'Free AI token calculator and pricing comparison. Convert between money, tokens, and characters across Claude, GPT-4o, Gemini, and more — with live pricing.'

export function buildMetadata({
  title,
  description,
  path = '',
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const url = `${SITE_URL}${path}`
  // Title goes through layout's `%s | TokenRate` template, so we omit the brand here.
  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex ? { index: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
