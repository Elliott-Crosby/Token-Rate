/**
 * Schema validation for blog posts. Used by both the generator (before
 * writing a new post to disk) and the catalog builder (before bundling).
 * Returns an array of human-readable error strings; empty = valid.
 */

// Mirror of CATEGORY_SLUGS in src/lib/categories.ts. Keep in sync.
const CATEGORY_SLUGS = ['fundamentals', 'comparisons', 'cost-optimization', 'providers', 'building']
const KINDS = ['article', 'guide']

export function validateBlogPost(filename, data) {
  const errors = []

  if (!data || typeof data !== 'object') {
    return ['post is not an object']
  }

  const required = ['slug', 'title', 'description', 'publishedAt', 'sections', 'faq', 'category']
  for (const field of required) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`missing field: ${field}`)
    }
  }

  if (typeof data.slug === 'string') {
    if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push(`invalid slug shape: "${data.slug}" (use lowercase letters, digits, hyphens only)`)
    }
    const expected = filename.replace(/\.json$/, '')
    if (data.slug !== expected) {
      errors.push(`slug "${data.slug}" does not match filename "${filename}"`)
    }
  }

  if (data.category !== undefined && !CATEGORY_SLUGS.includes(data.category)) {
    errors.push(`invalid category: "${data.category}" (must be one of: ${CATEGORY_SLUGS.join(', ')})`)
  }

  if (data.kind !== undefined && !KINDS.includes(data.kind)) {
    errors.push(`invalid kind: "${data.kind}" (must be one of: ${KINDS.join(', ')})`)
  }

  if (data.publishedAt && Number.isNaN(Date.parse(data.publishedAt))) {
    errors.push(`publishedAt is not a valid date: "${data.publishedAt}"`)
  }

  if (data.updatedAt && Number.isNaN(Date.parse(data.updatedAt))) {
    errors.push(`updatedAt is not a valid date: "${data.updatedAt}"`)
  }

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    errors.push('sections must be a non-empty array')
  } else {
    data.sections.forEach((s, i) => {
      if (!s || typeof s.heading !== 'string' || s.heading.length === 0) {
        errors.push(`section[${i}].heading missing`)
      }
      if (!s || typeof s.body !== 'string' || s.body.length === 0) {
        errors.push(`section[${i}].body missing`)
      }
    })
  }

  if (!Array.isArray(data.faq)) {
    errors.push('faq must be an array')
  } else {
    data.faq.forEach((q, i) => {
      if (!q || typeof q.question !== 'string' || typeof q.answer !== 'string') {
        errors.push(`faq[${i}] missing question/answer`)
      }
    })
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push('tags must be an array of strings')
  }

  if (data.sources !== undefined) {
    if (!Array.isArray(data.sources)) {
      errors.push('sources must be an array')
    } else {
      data.sources.forEach((s, i) => {
        if (!s || typeof s.label !== 'string' || typeof s.url !== 'string') {
          errors.push(`sources[${i}] missing label/url`)
        }
      })
    }
  }

  if (data.relatedSlugs !== undefined && !Array.isArray(data.relatedSlugs)) {
    errors.push('relatedSlugs must be an array of slug strings')
  }

  return errors
}
