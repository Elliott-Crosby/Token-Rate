export type InputMode = 'money' | 'tokens' | 'characters'

export interface ModelPricing {
  id: string
  name: string
  provider: string
  inputPricePerToken: number
  outputPricePerToken: number
  contextLength?: number
  qualityIndex?: number        // 0–100 composite score (AA Intelligence Index or Arena Elo normalised)
  qualitySource?: 'aa' | 'arena'
  isVariant?: boolean          // speed/preview tier or dated snapshot — deprioritised in "popular"
}

export interface ProviderGroup {
  name: string
  models: ModelPricing[]
}

export interface MoneyResult {
  mode: 'money'
  model: ModelPricing
  inputTokens: number
  outputTokens: number
  inputChars: number
  outputChars: number
}

export interface TokensResult {
  mode: 'tokens'
  model: ModelPricing
  characters: number
  inputCost: number
  outputCost: number
}

export interface CharsResult {
  mode: 'characters'
  model: ModelPricing
  tokens: number
  inputCost: number
  outputCost: number
}

export type CalculationResult = MoneyResult | TokensResult | CharsResult
