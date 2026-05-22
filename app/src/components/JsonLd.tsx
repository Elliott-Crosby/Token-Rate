interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

const SITE_URL = 'https://tokenrate.dev'
const SITE_NAME = 'TokenRate'

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function webAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Free AI token calculator and pricing comparison. Convert between money, tokens, and characters across Claude, GPT-4o, Gemini, and more.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png`, width: 512, height: 512 },
    sameAs: [],
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function siteSchemas() {
  return [organizationSchema(), websiteSchema()]
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

export function articleSchema({
  title,
  description,
  url,
  datePublished,
  dateModified,
  imageUrl,
  authorName = SITE_NAME,
}: {
  title: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  imageUrl?: string
  authorName?: string
}) {
  const published = datePublished ?? '2026-01-01'
  const modified = dateModified ?? published
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: published,
    dateModified: modified,
    image: imageUrl ? [imageUrl] : undefined,
    author: { '@type': 'Organization', name: authorName, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` },
    },
  }
}

export function productSchema({
  name,
  description,
  url,
  brand,
  inputPrice,
  outputPrice,
}: {
  name: string
  description: string
  url: string
  brand: string
  inputPrice: number
  outputPrice: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${name} API`,
    description,
    url,
    brand: { '@type': 'Brand', name: brand },
    category: 'AI Language Model API',
    offers: [
      {
        '@type': 'Offer',
        url,
        priceCurrency: 'USD',
        price: inputPrice.toString(),
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: inputPrice,
          priceCurrency: 'USD',
          unitText: 'per 1,000,000 input tokens',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1000000, unitText: 'input tokens' },
        },
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        url,
        priceCurrency: 'USD',
        price: outputPrice.toString(),
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: outputPrice,
          priceCurrency: 'USD',
          unitText: 'per 1,000,000 output tokens',
          referenceQuantity: { '@type': 'QuantitativeValue', value: 1000000, unitText: 'output tokens' },
        },
        availability: 'https://schema.org/InStock',
      },
    ],
  }
}

export function itemListSchema({ name, urls }: { name: string; urls: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: urls.map((url, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url,
    })),
  }
}
