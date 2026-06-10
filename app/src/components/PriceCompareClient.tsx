'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import type { ProviderGroup, ModelPricing, InputMode } from '@/lib/types'
import { track } from '@/lib/track'
import { detectTier } from '@/lib/tier'

const TIER_COLORS: Record<string, string> = {
  flagship: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  balanced: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  fast: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  reasoning: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

function fmt(perToken: number): string {
  const pm = perToken * 1_000_000
  if (pm >= 1) return `$${pm.toFixed(2)}`
  if (pm >= 0.1) return `$${pm.toFixed(3)}`
  return `$${pm.toFixed(4)}`
}

function fmtCtx(n: number): string {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}M` : `${(n / 1_000).toFixed(0)}K`
}

// Match the formatters used in the All Models view so cost/token display is identical across tabs.
function fmtTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return Math.round(n).toLocaleString()
  return n.toFixed(0)
}
function fmtMoney(n: number): string {
  if (!isFinite(n) || n <= 0) return '$0'
  if (n >= 0.01) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
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

const CHARS_PER_TOKEN = 4

function QualityBadge({ score, source }: { score?: number; source?: string }) {
  if (score == null) return <span className="text-zinc-300 dark:text-zinc-600 font-mono text-xs">—</span>

  let color: string
  if (score >= 80) color = 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
  else if (score >= 65) color = 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
  else if (score >= 50) color = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
  else color = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${color}`}>
      {score}
      {source === 'arena' && (
        <span className="font-normal opacity-60 text-[9px]">elo</span>
      )}
    </span>
  )
}

// Value badge (quality per $1 of input cost) — identical math to the All Models view.
function ValueBadge({ quality, inputPricePerToken }: { quality?: number; inputPricePerToken: number }) {
  if (quality == null) return <span className="text-zinc-300 dark:text-zinc-600 font-mono text-xs">—</span>
  const pricePerMillion = inputPricePerToken * 1_000_000
  if (pricePerMillion <= 0) return <span className="text-zinc-300 dark:text-zinc-600 font-mono text-xs">—</span>
  const value = quality / pricePerMillion  // quality points per $1 of input cost
  let label: string
  if      (value >= 1000) label = (value / 1000).toFixed(1) + 'k'
  else if (value >= 100)  label = Math.round(value).toString()
  else if (value >= 10)   label = value.toFixed(0)
  else                    label = value.toFixed(1)
  let color: string
  if      (value >= 100) color = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
  else if (value >= 30)  color = 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
  else if (value >= 10)  color = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
  else                   color = 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
  return (
    <span
      title={`${quality} quality ÷ $${pricePerMillion.toFixed(2)}/1M = ${value.toFixed(1)} quality per $1`}
      className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded font-mono ${color}`}
    >
      {label}
    </span>
  )
}

export default function PriceCompareClient({
  providerGroups,
  mode = 'money',
  numericValue = 0,
}: {
  providerGroups: ProviderGroup[]
  mode?: InputMode
  numericValue?: number
}) {
  const [openProvider, setOpenProvider] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const showCalc = numericValue > 0
  const calcLabelIn = mode === 'money' ? 'Tokens In' : 'Cost In'
  const calcLabelOut = mode === 'money' ? 'Tokens Out' : 'Cost Out'

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenProvider(null)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const allModels = useMemo(() => providerGroups.flatMap((g) => g.models), [providerGroups])

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const clearProvider = (name: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev)
      providerGroups.find((g) => g.name === name)?.models.forEach((m) => next.delete(m.id))
      return next
    })

  const selectedModels = useMemo(() => allModels.filter((m) => selectedIds.has(m.id)), [allModels, selectedIds])

  // Fire model_compared once the user's selection settles (>=2 models, 1.5s idle).
  // This is the pair-frequency signal — what devs actually price out side-by-side.
  useEffect(() => {
    if (selectedModels.length < 2) return
    const ids = selectedModels.map((m) => m.id).sort()
    const providers = [...new Set(selectedModels.map((m) => m.provider))].sort()
    const id = setTimeout(() => {
      track('model_compared', {
        model_ids: ids,
        providers,
        count: selectedModels.length,
      })
    }, 1500)
    return () => clearTimeout(id)
  }, [selectedModels])

  const inputPrices = selectedModels.map((m) => m.inputPricePerToken)
  const minInput = selectedModels.length > 1 ? Math.min(...inputPrices) : null
  const maxInput = selectedModels.length > 1 ? Math.max(...inputPrices) : null

  return (
    <div className="flex flex-col gap-5">
      {/* Provider buttons + Reset */}
      <div className="flex items-start justify-between gap-3">
      <div ref={containerRef} className="flex flex-wrap gap-2">
        {providerGroups.map((group) => {
          const count = group.models.filter((m) => selectedIds.has(m.id)).length
          const isOpen = openProvider === group.name

          return (
            <div key={group.name} className="relative">
              <button
                onClick={() => setOpenProvider(isOpen ? null : group.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  count > 0
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : isOpen
                    ? 'border-zinc-400 dark:border-zinc-500 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {group.name}
                {count > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none shrink-0">
                    {count}
                  </span>
                )}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl min-w-[270px] flex flex-col max-h-80 overflow-hidden">
                  {/* Sticky header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {group.name}
                    </span>
                    {count > 0 && (
                      <button
                        onClick={() => clearProvider(group.name)}
                        className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {/* Scrollable model list */}
                  <div className="overflow-y-auto">
                    {group.models.map((model) => {
                      const checked = selectedIds.has(model.id)
                      return (
                        <label
                          key={model.id}
                          className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors ${
                            checked ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(model.id)}
                            className="accent-emerald-500 w-4 h-4 shrink-0"
                          />
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-tight">
                              {model.name}
                            </span>
                            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                              {fmt(model.inputPricePerToken)}/1M in &middot; {fmt(model.outputPricePerToken)}/1M out
                            </span>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Reset button */}
      {selectedIds.size > 0 && (
        <button
          onClick={() => setSelectedIds(new Set())}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-red-400 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400 transition-all"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Reset
        </button>
      )}
      </div>

      {/* Selected chips */}
      {selectedModels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold uppercase tracking-wider shrink-0">
            Comparing:
          </span>
          {selectedModels.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
            >
              <span className="text-zinc-400 dark:text-zinc-500 text-[10px]">{m.provider}</span>
              {m.name}
              <button
                onClick={() => toggle(m.id)}
                className="ml-0.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors font-bold"
                aria-label={`Remove ${m.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Table or empty state */}
      {selectedModels.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/20 py-12 text-center">
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            Select a provider above, then check the models you want to compare.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Model</th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Provider</th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Tier</th>
                <th className="px-4 py-3 text-right font-semibold text-purple-600 dark:text-purple-400 whitespace-nowrap">Quality</th>
                <th className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">Input / 1M</th>
                <th className="px-4 py-3 text-right font-semibold text-sky-700 dark:text-sky-400 whitespace-nowrap">Output / 1M</th>
                {showCalc && (
                  <>
                    <th className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{calcLabelIn}</th>
                    <th className="px-4 py-3 text-right font-semibold text-sky-700 dark:text-sky-400 whitespace-nowrap">{calcLabelOut}</th>
                  </>
                )}
                <th className="px-4 py-3 text-right font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Context</th>
                <th
                  className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap"
                  title="Quality points per $1 of input cost (quality ÷ $/1M input). Higher is better."
                >
                  Value
                </th>
                <th className="px-4 py-3 whitespace-nowrap" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {selectedModels.map((m, i) => {
                const tier = detectTier(m.name)
                const isCheapest = minInput !== null && m.inputPricePerToken === minInput
                const isMostExpensive = maxInput !== null && m.inputPricePerToken === maxInput
                return (
                  <tr key={m.id} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/40 dark:bg-zinc-800/20'}>
                    <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 max-w-[220px]">
                      <span className="block truncate">{m.name}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap">{m.provider}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[tier]}`}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <QualityBadge score={m.qualityIndex} source={m.qualitySource} />
                    </td>
                    <td className="px-4 py-3 text-right font-mono whitespace-nowrap">
                      <span className={isCheapest ? 'text-emerald-600 dark:text-emerald-400 font-bold' : isMostExpensive ? 'text-red-500 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-300'}>
                        {fmt(m.inputPricePerToken)}
                      </span>
                      {isCheapest && (
                        <span className="ml-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded">cheapest</span>
                      )}
                      {isMostExpensive && (
                        <span className="ml-1.5 text-[10px] font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1 py-0.5 rounded">priciest</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">{fmt(m.outputPricePerToken)}</td>
                    {showCalc && (() => {
                      let valIn: string
                      let valOut: string
                      if (mode === 'money') {
                        valIn = m.inputPricePerToken > 0 ? fmtTokens(numericValue / m.inputPricePerToken) : '—'
                        valOut = m.outputPricePerToken > 0 ? fmtTokens(numericValue / m.outputPricePerToken) : '—'
                      } else {
                        const tokens = mode === 'tokens' ? numericValue : numericValue / CHARS_PER_TOKEN
                        valIn = fmtMoney(tokens * m.inputPricePerToken)
                        valOut = fmtMoney(tokens * m.outputPricePerToken)
                      }
                      return (
                        <>
                          <td className="px-4 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{valIn}</td>
                          <td className="px-4 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">{valOut}</td>
                        </>
                      )
                    })()}
                    <td className="px-4 py-3 text-right font-mono text-zinc-400 dark:text-zinc-500 text-xs whitespace-nowrap">
                      {m.contextLength ? fmtCtx(m.contextLength) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <ValueBadge quality={m.qualityIndex} inputPricePerToken={m.inputPricePerToken} />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => toggle(m.id)}
                        className="text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors font-bold"
                        aria-label={`Remove ${m.name}`}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Prices per 1M tokens · Live via OpenRouter · Quality score from Arena AI leaderboard (Elo) or Artificial Analysis Intelligence Index · Confirm with provider before billing decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
