import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { Analytics } from '@vercel/analytics/next'

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
    default: 'TokenRate — AI Token Calculator & Pricing Comparison',
    template: '%s | TokenRate',
  },
  description:
    'Free AI token calculator and live pricing comparison. Convert between money, tokens, and characters for Claude, GPT-4o, Gemini, and more. See exactly what your AI API calls cost.',
  keywords: [
    'AI token calculator',
    'AI pricing comparison',
    'Claude pricing',
    'GPT-4o pricing',
    'Gemini pricing',
    'tokens to dollars',
    'AI API cost',
    'LLM pricing',
    'tokens per dollar',
  ],
  authors: [{ name: 'TokenRate' }],
  creator: 'TokenRate',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tokenrate.dev',
    siteName: 'TokenRate',
    title: 'TokenRate — AI Token Calculator & Pricing Comparison',
    description:
      'Free AI token calculator. Convert money, tokens, and characters across Claude, GPT-4o, Gemini, and more with live pricing.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TokenRate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TokenRate — AI Token Calculator & Pricing Comparison',
    description: 'Free AI token calculator with live pricing across Claude, GPT-4o, Gemini, and more.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://tokenrate.dev' },
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
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8739160864788471" crossOrigin="anonymous" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZNFQWB6MV1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-ZNFQWB6MV1');`,
          }}
        />
      </head>
      <body className="antialiased bg-zinc-50 dark:bg-zinc-950 transition-colors">
        <ThemeProvider>
          <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />
          <Nav />
          <main>{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
