import { renderPriceBoardCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og'

export const alt = 'TokenRate — AI Token Calculator with live pricing for 200+ models'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderPriceBoardCard()
}
