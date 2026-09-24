// Pure calculation shared by the calculator and its arithmetic checks.
export function parseTokenCount(value) {
  const text = String(value).trim()
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(text)) return null
  const count = Number(text.replaceAll(',', ''))
  return Number.isSafeInteger(count) && count >= 0 ? count : null
}

export function tokenCost(inputTokens, outputTokens, inputRate, outputRate) {
  return (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000
}
