import type { NextConfig } from 'next'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Build per-slug redirects from /blog/<slug> and /guides/<slug> to the new
 * canonical /blog/<category>/<slug> URL. The category is the source of
 * truth in each post JSON, so this stays in sync as posts get recategorized.
 */
function buildPostRedirects() {
  const blogDir = path.join(__dirname, 'content', 'blog')
  const redirects: { source: string; destination: string; permanent: boolean }[] = []

  if (!fs.existsSync(blogDir)) return redirects

  for (const filename of fs.readdirSync(blogDir)) {
    if (!filename.endsWith('.json')) continue
    try {
      const raw = fs.readFileSync(path.join(blogDir, filename), 'utf-8')
      const data = JSON.parse(raw) as { slug?: string; category?: string }
      if (!data.slug || !data.category) continue
      const dest = `/blog/${data.category}/${data.slug}`
      // Old flat blog URL
      redirects.push({ source: `/blog/${data.slug}`, destination: dest, permanent: true })
      // Old guides URL
      redirects.push({ source: `/guides/${data.slug}`, destination: dest, permanent: true })
    } catch {
      // Skip malformed file — catalog build will surface the error.
    }
  }
  return redirects
}

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/compare/cheapest-ai-models-2025',
        destination: '/compare/cheapest-ai-models',
        permanent: true,
      },
      // Guides index → unified blog hub
      { source: '/guides', destination: '/blog', permanent: true },
      ...buildPostRedirects(),
    ]
  },
}

export default nextConfig
