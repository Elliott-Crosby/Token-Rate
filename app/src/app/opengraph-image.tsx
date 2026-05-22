import { renderOGCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'TokenRate — AI Token Calculator & Pricing Comparison'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOGCard({
    eyebrow: 'AI Token Calculator',
    title: 'Compare AI model pricing in seconds.',
    subtitle: 'Live token costs for Claude, GPT-4o, Gemini, Llama, and more.',
    badges: ['Live pricing', 'Free, no sign-up', '30+ models'],
  })
}
