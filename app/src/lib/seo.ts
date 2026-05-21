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
  const fullTitle = path === '' ? `${SITE_NAME} — ${title}` : `${title} | ${SITE_NAME}`

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex ? { index: false } : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [`${SITE_URL}/og-image.png`],
    },
  }
}
