'use client'

import type { InputMode, CalculationResult, MoneyResult, TokensResult, CharsResult } from '@/lib/types'
import { formatNumber, formatMoney, formatPricePerMillion } from '@/lib/conversions'

interface ResultsTableProps {
  results: CalculationResult[]
  mode: InputMode
  inputValue: number
}

// Returns a subtle background-gradient style showing value proportion vs max
function barStyle(value: number, max: number, color: string): React.CSSProperties {
  if (max === 0) return {}
  const pct = Math.max(4, (value / max) * 100).toFixed(1)
  return {
    backgroundImage: `linear-gradient(to right, ${color}, transparent)`,
    backgroundSize: `${pct}% 100%`,
    backgroundRepeat: 'no-repeat',
  }
}

export default function ResultsTable({ results, mode, inputValue }: ResultsTableProps) {
  if (results.length === 0) return null

  // Precompute max values for bar scaling
  const maxInputTokens = mode === 'money'
    ? Math.max(...results.map((r) => (r as MoneyResult).inputTokens))
    : 0
  const maxInputCost = mode !== 'money'
    ? Math.max(...results.map((r) => (r as TokensResult | CharsResult).inputCost))
    : 0

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Results</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          {mode === 'money' && `for ${formatMoney(inputValue)}`}
          {mode === 'tokens' && `for ${formatNumber(inputValue)} tokens`}
          {mode === 'characters' && `for ${formatNumber(inputValue)} characters`}
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Model</th>
              <th className="px-3 py-3 font-semibold text-zinc-400 dark:text-zinc-500 text-xs whitespace-nowrap">per 1M in / out</th>

              {mode === 'money' && <>
                <th className="px-3 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-xs whitespace-nowrap text-right">Input Tokens</th>
                <th className="px-3 py-3 font-semibold text-emerald-600/70 dark:text-emerald-500/60 text-xs whitespace-nowrap text-right">Chars</th>
                <th className="px-3 py-3 font-semibold text-sky-700 dark:text-sky-400 text-xs whitespace-nowrap text-right">Output Tokens</th>
                <th className="px-3 py-3 font-semibold text-sky-600/70 dark:text-sky-500/60 text-xs whitespace-nowrap text-right">Chars</th>
              </>}

              {mode === 'tokens' && <>
                <th className="px-3 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap text-right">Characters</th>
                <th className="px-3 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-xs whitespace-nowrap text-right">Input Cost</th>
                <th className="px-3 py-3 font-semibold text-sky-700 dark:text-sky-400 text-xs whitespace-nowrap text-right">Output Cost</th>
              </>}

              {mode === 'characters' && <>
                <th className="px-3 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap text-right">Tokens</th>
                <th className="px-3 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-xs whitespace-nowrap text-right">Input Cost</th>
                <th className="px-3 py-3 font-semibold text-sky-700 dark:text-sky-400 text-xs whitespace-nowrap text-right">Output Cost</th>
              </>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map((result, i) => (
              <ResultRow
                key={result.model.id}
                result={result}
                mode={mode}
                index={i}
                maxInputTokens={maxInputTokens}
                maxInputCost={maxInputCost}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        ~4 chars/token (English average). Bar width shows relative value across selected models.
      </p>
    </div>
  )
}

function ResultRow({
  result,
  mode,
  index,
  maxInputTokens,
  maxInputCost,
}: {
  result: CalculationResult
  mode: InputMode
  index: number
  maxInputTokens: number
  maxInputCost: number
}) {
  const rowBg = index % 2 === 0
    ? 'bg-white dark:bg-zinc-900'
    : 'bg-zinc-50/60 dark:bg-zinc-800/30'

  return (
    <tr className={`${rowBg} hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors`}>
      <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
        {result.model.name}
      </td>

      <td className="px-3 py-3 whitespace-nowrap">
        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
          {formatPricePerMillion(result.model.inputPricePerToken)} / {formatPricePerMillion(result.model.outputPricePerToken)}
        </span>
      </td>

      {mode === 'money' && (() => {
        const r = result as MoneyResult
        return (
          <>
            <td
              className="px-3 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap"
              style={barStyle(r.inputTokens, maxInputTokens, 'rgba(16,185,129,0.08)')}
            >
              {formatNumber(r.inputTokens)}
            </td>
            <td className="px-3 py-3 text-right font-mono text-emerald-600/60 dark:text-emerald-500/50 whitespace-nowrap text-xs">
              {formatNumber(r.inputChars)}
            </td>
            <td className="px-3 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
              {formatNumber(r.outputTokens)}
            </td>
            <td className="px-3 py-3 text-right font-mono text-sky-600/60 dark:text-sky-500/50 whitespace-nowrap text-xs">
              {formatNumber(r.outputChars)}
            </td>
          </>
        )
      })()}

      {mode === 'tokens' && (() => {
        const r = result as TokensResult
        return (
          <>
            <td className="px-3 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
              {formatNumber(r.characters)}
            </td>
            <td
              className="px-3 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap"
              style={barStyle(maxInputCost - r.inputCost + r.inputCost * 0.05, maxInputCost, 'rgba(16,185,129,0.08)')}
            >
              {formatMoney(r.inputCost)}
            </td>
            <td className="px-3 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
              {formatMoney(r.outputCost)}
            </td>
          </>
        )
      })()}

      {mode === 'characters' && (() => {
        const r = result as CharsResult
        return (
          <>
            <td className="px-3 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
              {formatNumber(r.tokens)}
            </td>
            <td
              className="px-3 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap"
              style={barStyle(maxInputCost - r.inputCost + r.inputCost * 0.05, maxInputCost, 'rgba(16,185,129,0.08)')}
            >
              {formatMoney(r.inputCost)}
            </td>
            <td className="px-3 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
              {formatMoney(r.outputCost)}
            </td>
          </>
        )
      })()}
    </tr>
  )
}
