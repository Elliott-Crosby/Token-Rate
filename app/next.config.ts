import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // Year-stamped slug renamed to evergreen
      {
        source: '/compare/cheapest-ai-models-2025',
        destination: '/compare/cheapest-ai-models',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
