import type { ModelPricing } from './types'

// Newest model first, keyed on OpenRouter's per-model `created` date.
// Ties (same release date): primary models above speed/preview/dated variants,
// then higher quality first. Models with no `created` sink to the bottom.
// Shared so the All Models list and the Compare pickers surface new drops the same way.
export function byNewest(a: ModelPricing, b: ModelPricing): number {
  const ac = a.created ?? 0, bc = b.created ?? 0
  if (ac !== bc) return bc - ac
  if (!!a.isVariant !== !!b.isVariant) return a.isVariant ? 1 : -1
  return (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1)
}
