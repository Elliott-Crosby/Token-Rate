interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
}

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
    name: 'TokenRate',
    url: 'https://tokenrate.dev',
    description:
      'Free AI token calculator and pricing comparison. Convert between money, tokens, and characters across Claude, GPT-4o, Gemini, and more.',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
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
  datePublished = '2025-01-01',
}: {
  title: string
  description: string
  url: string
  datePublished?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished,
    publisher: {
      '@type': 'Organization',
      name: 'TokenRate',
      url: 'https://tokenrate.dev',
    },
  }
}
