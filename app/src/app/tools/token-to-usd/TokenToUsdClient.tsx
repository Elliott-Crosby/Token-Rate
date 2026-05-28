'use client'

import { useState, useMemo } from 'react'
import { ALL_MODELS } from '@/lib/models'

function fmt(n: number): string {
  if (!isFinite(n) || n <= 0) return '$0.00'
  if (n >= 0.01) return '$' + n.toFixed(4)
  const magnitude = Math.floor(Math.log10(n))
  const decimals = Math.min(20, 2 - magnitude)
  let s = n.toFixed(decimals)
  if (s.includes('.')) {
    s = s.replace(/0+$/, '')
    if (s.endsWith('.')) s += '00'
    else {
      const [intPart, decPart] = s.split('.')
      if (decPart.length < 2) s = intPart + '.' + decPart.padEnd(2, '0')
    }
  }
  return '$' + s
}

export default function TokenToUsdClient() {
  const [tokens, setTokens] = useState('')
  const [sortBy, setSortBy] = useState<'input' | 'output'>('input')

  const count = useMemo(() => {
    const n = parseFloat(tokens.replace(/[,\s]/g, ''))
    return isNaN(n) || n < 0 ? 0 : n
  }, [tokens])

  const sorted = useMemo(() => {
    return [...ALL_MODELS].sort((a, b) =>
      sortBy === 'input'
        ? a.inputPricePerMillion - b.inputPricePerMillion
        : a.outputPricePerMillion - b.outputPricePerMillion
    )
  }, [sortBy])

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Token Count
        </label>
        <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <span className="flex items-center justify-center w-12 shrink-0 border-r border-zinc-200 dark:border-zinc-700 h-full py-3.5 text-sm font-mono text-zinc-400 dark:text-zinc-500">
            #
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            placeholder="e.g. 1000000"
            className="flex-1 bg-transparent px-4 py-3.5 text-base font-mono outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[1000, 10000, 100000, 1000000, 10000000].map((n) => (
            <button
              key={n}
              onClick={() => setTokens(n.toLocaleString())}
              className="text-xs px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {n >= 1_000_000 ? `${n / 1_000_000}M` : n >= 1_000 ? `${n / 1_000}K` : n}
            </button>
          ))}
        </div>
      </div>

      {/* Sort toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">Sort by:</span>
        <button
          onClick={() => setSortBy('input')}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${sortBy === 'input' ? 'bg-emerald-600 text-white' : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'}`}
        >
          Input cost
        </button>
        <button
          onClick={() => setSortBy('output')}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${sortBy === 'output' ? 'bg-sky-600 text-white' : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'}`}
        >
          Output cost
        </button>
      </div>

      {/* Results table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-left">Model</th>
              <th className="px-4 py-3 font-semibold text-zinc-400 text-left hidden sm:table-cell">Provider</th>
              <th className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right">Input Cost</th>
              <th className="px-4 py-3 font-semibold text-sky-700 dark:text-sky-400 text-right">Output Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sorted.map((m, i) => {
              const inputCost = count > 0 ? (count * m.inputPricePerMillion) / 1_000_000 : 0
              const outputCost = count > 0 ? (count * m.outputPricePerMillion) / 1_000_000 : 0
              return (
                <tr key={m.slug} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'}>
                  <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{m.name}</td>
                  <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 hidden sm:table-cell">{m.provider}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                    {count > 0 ? fmt(inputCost) : <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
                    {count > 0 ? fmt(outputCost) : <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Prices shown per {count > 0 ? count.toLocaleString() : '…'} tokens. Input and output priced separately.
      </p>
    </div>
  )
}
