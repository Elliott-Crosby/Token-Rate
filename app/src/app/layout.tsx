import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import JsonLd, { siteSchemas } from '@/components/JsonLd'
import { Analytics } from '@vercel/analytics/next'
import PostHogInit from '@/components/PostHogInit'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://tokenrate.dev'),
  title: {
    default: 'TokenRate — AI Token Calculator, Prices Updated Daily',
    template: '%s | TokenRate',
  },
  description:
    'Free AI token calculator with prices updated daily. Convert between money, tokens, and characters across Claude, GPT-5, Gemini, and 200+ models — and see exactly what your AI API calls cost. Always-current pricing, no sign-up.',
  keywords: [
    'AI token calculator',
    'AI pricing comparison',
    'AI pricing updated daily',
    'current LLM pricing',
    'Claude Opus 4.8 pricing',
    'GPT-5 pricing',
    'Gemini pricing',
    'tokens to dollars',
    'AI API cost',
    'LLM pricing',
    'tokens per dollar',
  ],
  authors: [{ name: 'Elliott Crosby', url: 'https://tokenrate.dev/about#author' }],
  creator: 'Elliott Crosby',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tokenrate.dev',
    siteName: 'TokenRate',
    title: 'AI Token Calculator — Prices Updated Daily | TokenRate',
    description:
      'Free AI token calculator with prices updated daily. Convert tokens to dollars and compare AI cost across Claude, GPT-5, Gemini, and 200+ models — instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Token Calculator — Prices Updated Daily | TokenRate',
    description: 'Free AI token calculator with prices updated daily. Convert tokens to dollars and compare AI cost across Claude, GPT-5, Gemini, and 200+ models.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://tokenrate.dev' },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply dark class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&p)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased bg-zinc-50 dark:bg-zinc-950 transition-colors">
        {siteSchemas().map((s, i) => (
          <JsonLd key={i} data={s} />
        ))}
        <ThemeProvider>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />
          <Nav />
          <main>{children}</main>
          <Footer />
          <Analytics />
          <PostHogInit />
        </ThemeProvider>

        {/* Google Analytics — afterInteractive: deferred until hydration */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZNFQWB6MV1"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-ZNFQWB6MV1');`}
        </Script>

        {/* Google AdSense — lazyOnload: deferred to browser idle */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8739160864788471"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  )
}
