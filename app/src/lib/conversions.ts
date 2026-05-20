import type { InputMode, ModelPricing, CalculationResult } from './types'

export const CHARS_PER_TOKEN = 4

export function calculate(
  mode: InputMode,
  value: number,
  model: ModelPricing
): CalculationResult {
  if (mode === 'money') {
    const inputTokens =
      model.inputPricePerToken > 0 ? value / model.inputPricePerToken : 0
    const outputTokens =
      model.outputPricePerToken > 0 ? value / model.outputPricePerToken : 0
    return {
      mode,
      model,
      inputTokens,
      outputTokens,
      inputChars: inputTokens * CHARS_PER_TOKEN,
      outputChars: outputTokens * CHARS_PER_TOKEN,
    }
  }

  if (mode === 'tokens') {
    return {
      mode,
      model,
      characters: value * CHARS_PER_TOKEN,
      inputCost: value * model.inputPricePerToken,
      outputCost: value * model.outputPricePerToken,
    }
  }

  // characters
  const tokens = value / CHARS_PER_TOKEN
  return {
    mode,
    model,
    tokens,
    inputCost: tokens * model.inputPricePerToken,
    outputCost: tokens * model.outputPricePerToken,
  }
}

export function formatNumber(n: number): string {
  if (n === 0) return '0'
  if (n >= 1_000_000) {
    return (n / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M'
  }
  if (n >= 1_000) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function formatMoney(n: number): string {
  if (n === 0) return '$0.00'
  if (n >= 0.01) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }
  // Very small: show in scientific-style with enough precision
  return '$' + n.toExponential(3)
}

export function formatPricePerMillion(pricePerToken: number): string {
  const perMillion = pricePerToken * 1_000_000
  return '$' + perMillion.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
