#!/usr/bin/env node
/**
 * Builds src/lib/blog-catalog.generated.ts from content/blog/*.json.
 *
 * Why this exists: blog.ts used to read posts off disk at runtime with
 * fs.readdirSync(process.cwd() + '/content/blog'). On Vercel the dynamic
 * path isn't reliably traced into the serverless bundle, so posts pushed
 * by the auto-generator could 404 even after a successful deploy. Static
 * ES imports are bundled deterministically — every post in content/blog/
 * is guaranteed to ship.
 *
 * Also doubles as the catalog/manifest: the generated file is committed,
 * so every push contains a visible list of currently published posts.
 *
 * Usage: node scripts/build-blog-catalog.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateBlogPost } from './_lib/validate-blog-post.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BLOG_DIR = path.join(__dirname, '..', 'content', 'blog')
const CATALOG_OUT = path.join(__dirname, '..', 'src', 'lib', 'blog-catalog.generated.ts')

function safeIdentifier(slug, index) {
  const cleaned = slug.replace(/[^a-zA-Z0-9]/g, '_')
  return `post_${index}_${cleaned}`
}

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error(`Blog dir does not exist: ${BLOG_DIR}`)
    process.exit(1)
  }

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()

  const entries = []
  let hasErrors = false

  for (const filename of files) {
    const fullPath = path.join(BLOG_DIR, filename)
    let raw
    try {
      raw = fs.readFileSync(fullPath, 'utf-8')
    } catch (e) {
      console.error(`x ${filename}: read failed — ${e.message}`)
      hasErrors = true
      continue
    }
    let data
    try {
      data = JSON.parse(raw)
    } catch (e) {
      console.error(`x ${filename}: invalid JSON — ${e.message}`)
      hasErrors = true
      continue
    }
    const errors = validateBlogPost(filename, data)
    if (errors.length > 0) {
      console.error(`x ${filename}: ${errors.join('; ')}`)
      hasErrors = true
      continue
    }
    entries.push({ slug: data.slug, filename, publishedAt: data.publishedAt })
    console.log(`ok ${filename} (${data.slug})`)
  }

  if (hasErrors) {
    console.error('\nCatalog build failed — fix the errors above before proceeding.')
    process.exit(1)
  }

  entries.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))

  const importLines = entries
    .map((e, i) => `import ${safeIdentifier(e.slug, i)} from '../../content/blog/${e.filename}'`)
    .join('\n')

  const arrayLines = entries.map((e, i) => `  ${safeIdentifier(e.slug, i)},`).join('\n')

  const banner =
    '// AUTO-GENERATED — do not edit by hand.\n' +
    '// Regenerate via `npm run build:blog-catalog`.\n' +
    '// Source: app/content/blog/*.json\n'

  const out = `${banner}
import type { BlogPost } from './blog-types'

${importLines}

export const ALL_BLOG_POSTS = [
${arrayLines}
] as unknown as readonly BlogPost[]
`

  fs.mkdirSync(path.dirname(CATALOG_OUT), { recursive: true })
  fs.writeFileSync(CATALOG_OUT, out)
  console.log(`\nCatalog written: ${CATALOG_OUT}`)
  console.log(`Posts in catalog: ${entries.length}`)
}

main()
