import { NextResponse } from 'next/server'
import { ALL_MODELS, PROVIDERS } from '@/lib/models'
import { ALL_COMPARISONS } from '@/lib/comparisons'
import { ALL_GUIDES } from '@/lib/guides'
import { getAllBlogPosts } from '@/lib/blog'

const BASE = 'https://tokenrate.dev'
const INDEXNOW_HOST = 'tokenrate.dev'
const KEY_FILENAME = 'tokenrate-indexnow-key.txt'

function allUrls(): string[] {
  const staticUrls = [
    BASE,
    `${BASE}/models`,
    `${BASE}/compare`,
    `${BASE}/providers`,
    `${BASE}/guides`,
    `${BASE}/blog`,
    `${BASE}/about`,
    `${BASE}/tools/words-to-tokens`,
    `${BASE}/tools/token-to-usd`,
    `${BASE}/tools/api-cost-estimator`,
  ]
  const modelUrls = ALL_MODELS.map((m) => `${BASE}/models/${m.slug}`)
  const compareUrls = ALL_COMPARISONS.map((c) => `${BASE}/compare/${c.slug}`)
  const providerUrls = PROVIDERS.map((p) => `${BASE}/providers/${p.slug}`)
  const guideUrls = ALL_GUIDES.map((g) => `${BASE}/guides/${g.slug}`)
  const blogUrls = getAllBlogPosts().map((p) => `${BASE}/blog/${p.slug}`)
  return [...staticUrls, ...modelUrls, ...compareUrls, ...providerUrls, ...guideUrls, ...blogUrls]
}

export async function POST(req: Request) {
  const secret = process.env.INDEXNOW_PING_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'INDEXNOW_PING_SECRET not configured' }, { status: 500 })
  }
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.INDEXNOW_KEY
  if (!key) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 })
  }

  const urls = allUrls()

  const body = {
    host: INDEXNOW_HOST,
    key,
    keyLocation: `${BASE}/${KEY_FILENAME}`,
    urlList: urls,
  }

  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  })

  return NextResponse.json(
    { status: res.status, urlCount: urls.length, ok: res.ok },
    { status: res.ok ? 200 : 502 }
  )
}

export async function GET() {
  return NextResponse.json({
    description: 'POST with Authorization: Bearer <INDEXNOW_PING_SECRET> to submit all known URLs to IndexNow.',
    keyFile: `${BASE}/${KEY_FILENAME}`,
    urlCount: allUrls().length,
  })
}
