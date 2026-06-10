export type Tier = 'flagship' | 'balanced' | 'fast' | 'reasoning'

/** Classify a model into a coarse tier from its display name. Used by the
 *  calculator's "most popular" sort and the tier badges. Order matters:
 *  reasoning → fast → flagship → balanced (first match wins). */
export function detectTier(name: string): Tier {
  const n = name.toLowerCase()
  // Reasoning: o-series, DeepSeek R-series, QwQ, explicit reasoning/thinking tags.
  if (/\bo[1-9]\b|\bo[1-9][\s-]mini\b|deepseek[\s-]?r\d|\br1\b|\bqwq\b|reasoning|thinking/.test(n)) return 'reasoning'
  // Fast / small: flash, lite, nano, micro, small, haiku, and single-digit-B sizes.
  if (/haiku|\bflash\b|\blite\b|nano|micro|4o[\s-]mini|gpt[\s-]?4o[\s-]?mini|claude[\s-]haiku/.test(n)) return 'fast'
  if (/\bmini\b/.test(n) && !/\bo[1-9]/.test(n)) return 'fast'
  // Flagship / frontier. Includes current top families so newer models (Grok 4+,
  // Gemini 3+) aren't mistakenly ranked below older flagships in "popular".
  if (/opus|mistral[\s-]large|405b|\bgpt[\s-]?5\b(?![\s-]?mini|[\s-]?nano)|gpt[\s-]?4\.1\b|gemini[\s-]?2[\s-]?\.?5[\s-]pro|gemini[\s-]?[3-9]\b|grok[\s-]?[4-9]|claude[\s-]opus|\bultra\b|\bmax\b/.test(n)) return 'flagship'
  return 'balanced'
}
