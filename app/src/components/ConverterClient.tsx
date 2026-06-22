'use client'

import { useState, useMemo, useEffect } from 'react'
import type { InputMode, ProviderGroup, ModelPricing, CalculationResult } from '@/lib/types'
import { calculate } from '@/lib/conversions'
import type { MoneyResult, TokensResult, CharsResult } from '@/lib/types'
import PriceCompareClient from './PriceCompareClient'
import FilterPanel, { TIER_KEYS, type CostPreset, type QualityPreset } from './FilterPanel'
import { track } from '@/lib/track'

import { detectTier } from '@/lib/tier'

const TIER_LABEL: Record<string, string> = {
  flagship: 'Flagship',
  balanced: 'Balanced',
  fast: 'Fast',
  reasoning: 'Reasoning',
}
const TIER_COLOR: Record<string, string> = {
  flagship: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  balanced: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  fast: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  reasoning: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

// ── Quality badge ────────────────────────────────────────────────────────────
function QualityBadge({ score, source }: { score?: number; source?: string }) {
  if (score == null) return <span className="text-zinc-300 dark:text-zinc-600 font-mono text-xs">—</span>
  let color: string
  if (score >= 80)      color = 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
  else if (score >= 65) color = 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
  else if (score >= 50) color = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
  else                  color = 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded ${color}`}>
      {score}
      {source === 'arena' && <span className="font-normal opacity-60 text-[9px]">elo</span>}
    </span>
  )
}

// ── Value badge (quality per $1 of input cost) ──────────────────────────────
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

// ── Formatting ──────────────────────────────────────────────────────────────
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
function fmtRate(perToken: number): string {
  const pm = perToken * 1_000_000
  if (pm >= 1) return '$' + pm.toFixed(2)
  if (pm >= 0.01) return '$' + pm.toFixed(3)
  return '$' + pm.toFixed(4)
}

// ── Quick presets ───────────────────────────────────────────────────────────
const PRESETS: Record<InputMode, { label: string; value: number }[]> = {
  money: [
    { label: '$1', value: 1 },
    { label: '$13', value: 13 },
    { label: '$100', value: 100 },
    { label: '$1k', value: 1000 },
  ],
  tokens: [
    { label: '1K', value: 1_000 },
    { label: '10K', value: 10_000 },
    { label: '100K', value: 100_000 },
    { label: '1M', value: 1_000_000 },
  ],
  characters: [
    { label: '4K', value: 4_000 },
    { label: '40K', value: 40_000 },
    { label: '400K', value: 400_000 },
    { label: '4M', value: 4_000_000 },
  ],
}

const MODE_PREFIX: Record<InputMode, string> = { money: '$', tokens: '#', characters: 'Aa' }
const MODE_PLACEHOLDER: Record<InputMode, string> = { money: '1.00', tokens: '1,000,000', characters: '4,000,000' }

type SortOption = 'newest' | 'value' | 'quality' | 'cheapest' | 'expensive' | 'name' | 'provider'

// ── Main component ──────────────────────────────────────────────────────────
export default function ConverterClient({ providerGroups }: { providerGroups: ProviderGroup[] }) {
  const [mode, setMode] = useState<InputMode>('money')
  const [raw, setRaw] = useState('')
  const [activeProvider, setActiveProvider] = useState<string>('All')
  const [sort, setSort] = useState<SortOption>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  // Filter state (list mode only)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterTiers, setFilterTiers] = useState<Set<string>>(new Set(TIER_KEYS))
  const [costPreset, setCostPreset]     = useState<CostPreset>('all')
  const [qualityPreset, setQualityPreset] = useState<QualityPreset>('all')

  const allModels = useMemo(() => providerGroups.flatMap((g) => g.models), [providerGroups])
  const providers = useMemo(() => ['All', ...providerGroups.map((g) => g.name)], [providerGroups])
  const hasQualityData = useMemo(() => allModels.some(m => m.qualityIndex != null), [allModels])

  // Count active (non-default) filters for the badge
  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filterTiers.size < TIER_KEYS.length) n++
    if (costPreset !== 'all') n++
    if (qualityPreset !== 'all') n++
    return n
  }, [filterTiers, costPreset, qualityPreset])

  const resetFilters = () => {
    setFilterTiers(new Set(TIER_KEYS))
    setCostPreset('all')
    setQualityPreset('all')
  }

  const numericValue = useMemo(() => {
    const n = parseFloat(raw.replace(/[$,\s]/g, ''))
    return isNaN(n) || n <= 0 ? 0 : n
  }, [raw])

  const filteredSorted = useMemo(() => {
    let models = activeProvider === 'All' ? allModels : allModels.filter((m) => m.provider === activeProvider)

    // ── Cost filter ────────────────────────────────────────────────────────
    if (costPreset === 'under1') {
      models = models.filter(m => m.inputPricePerToken * 1_000_000 < 1)
    } else if (costPreset === '1to10') {
      models = models.filter(m => { const p = m.inputPricePerToken * 1_000_000; return p >= 1 && p <= 10 })
    } else if (costPreset === 'over10') {
      models = models.filter(m => m.inputPricePerToken * 1_000_000 > 10)
    }

    // ── Quality filter ─────────────────────────────────────────────────────
    if (qualityPreset === 'top75')  models = models.filter(m => m.qualityIndex != null && m.qualityIndex >= 75)
    else if (qualityPreset === 'good50') models = models.filter(m => m.qualityIndex != null && m.qualityIndex >= 50)
    else if (qualityPreset === 'rated')  models = models.filter(m => m.qualityIndex != null)

    // ── Tier filter ────────────────────────────────────────────────────────
    models = models.filter(m => filterTiers.has(detectTier(m.name)))

    // ── 'newest': most recently released model first (OpenRouter `created`) ──
    if (sort === 'newest') {
      return [...models].sort((a, b) => {
        const ac = a.created ?? 0, bc = b.created ?? 0
        if (ac !== bc) return bc - ac                          // newest release first
        // Same release date: primaries above dated/preview variants, then quality.
        if (!!a.isVariant !== !!b.isVariant) return a.isVariant ? 1 : -1
        return (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1)
      })
    }

    if (sort === 'cheapest') {
      return [...models].sort((a, b) => {
        if (a.inputPricePerToken !== b.inputPricePerToken) return a.inputPricePerToken - b.inputPricePerToken
        return (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1)  // tie-break: higher quality first
      })
    }
    if (sort === 'expensive') {
      return [...models].sort((a, b) => {
        if (a.inputPricePerToken !== b.inputPricePerToken) return b.inputPricePerToken - a.inputPricePerToken
        return (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1)  // tie-break: higher quality first
      })
    }
    if (sort === 'quality')   return [...models].sort((a, b) => (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1))
    if (sort === 'value') {
      const v = (m: ModelPricing) => (m.qualityIndex == null || m.inputPricePerToken <= 0)
        ? -1
        : m.qualityIndex / (m.inputPricePerToken * 1_000_000)
      return [...models].sort((a, b) => v(b) - v(a))
    }
    if (sort === 'name')      return [...models].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'provider')  return [...models].sort((a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name))
    return models
  }, [allModels, activeProvider, sort, filterTiers, costPreset, qualityPreset])

  const results: CalculationResult[] = useMemo(() => {
    if (!numericValue) return filteredSorted.map((m) => calculate(mode, 1, m))
    return filteredSorted.map((m) => calculate(mode, numericValue, m))
  }, [filteredSorted, mode, numericValue])

  function handleModeChange(m: InputMode) {
    setMode(m)
    setRaw('')
    track('mode_changed', { mode: m })
  }

  // Tracking wrappers — fire an event whenever the filter actually changes
  const handleTiersChange = (t: Set<string>) => {
    setFilterTiers(t)
    track('filter_applied', { type: 'tier', tiers: [...t].sort() })
  }
  const handleCostPreset = (p: CostPreset) => {
    setCostPreset(p)
    track('filter_applied', { type: 'cost', value: p })
  }
  const handleQualityPreset = (p: QualityPreset) => {
    setQualityPreset(p)
    track('filter_applied', { type: 'quality', value: p })
  }

  // Debounced — capture token-volume distribution, not every keystroke
  useEffect(() => {
    if (numericValue === 0) return
    const id = setTimeout(() => {
      track('value_entered', { mode, value: numericValue })
    }, 1000)
    return () => clearTimeout(id)
  }, [numericValue, mode])

  const SORT_LABELS: Record<SortOption, string> = {
    newest: 'newest first',
    value: 'best value',
    quality: 'highest quality',
    cheapest: 'cheapest first',
    expensive: 'most expensive',
    name: 'name',
    provider: 'provider',
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Stats row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold">
          {compareMode ? 'PICK MODELS · TYPE ANY AMOUNT — RESULTS UPDATE LIVE' : 'TYPE ANY AMOUNT — RESULTS UPDATE LIVE'}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
          <span className="font-bold text-zinc-600 dark:text-zinc-300">{allModels.length}</span> models ·{' '}
          <span className="font-bold text-zinc-600 dark:text-zinc-300">{providerGroups.length}</span> providers
        </p>
      </div>

      {/* Card */}
      <div className={`rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm ${compareMode ? 'overflow-visible' : 'overflow-hidden'}`}>

        {/* ── View tabs: All Models | Compare Prices ── */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => { setCompareMode(false); setSortOpen(false); track('view_changed', { view: 'all_models' }) }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
              !compareMode
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 border-emerald-500'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="opacity-70">
              <rect x="1" y="1" width="11" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="5.5" width="11" height="2" rx="1" fill="currentColor"/>
              <rect x="1" y="10" width="11" height="2" rx="1" fill="currentColor"/>
            </svg>
            All Models
            <span className="text-xs opacity-50 font-normal">· {filteredSorted.length}</span>
          </button>
          <button
            onClick={() => { setCompareMode(true); setSortOpen(false); track('view_changed', { view: 'compare_prices' }) }}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${
              compareMode
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 border-emerald-500'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="opacity-70">
              <rect x="1" y="1" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="8" y="1" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            Compare Prices
          </button>
        </div>

        {/* ── Input mode tabs (always visible across both views) ── */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {(['money', 'tokens', 'characters'] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                mode === m
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 border-emerald-500'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              <span className="font-mono text-xs opacity-70">{MODE_PREFIX[m]}</span>
              {m === 'money' ? 'Dollars' : m === 'tokens' ? 'Tokens' : 'Characters'}
            </button>
          ))}
        </div>

        {/* ── Input + quick presets (always visible across both views) ── */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <span className="w-12 shrink-0 flex items-center justify-center font-mono text-sm text-zinc-400 dark:text-zinc-500 border-r border-zinc-200 dark:border-zinc-700 h-full py-4">
              {MODE_PREFIX[mode]}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={MODE_PLACEHOLDER[mode]}
              className="flex-1 bg-transparent px-4 py-4 text-xl font-mono text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
            />
            {raw && (
              <button
                onClick={() => setRaw('')}
                className="mr-4 h-6 w-6 shrink-0 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
                aria-label="Clear"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Quick</span>
            {PRESETS[mode].map((p) => (
              <button
                key={p.label}
                onClick={() => { setRaw(String(p.value)); track('preset_used', { mode, preset_label: p.label, preset_value: p.value }) }}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors font-mono ${
                  numericValue === p.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── All Models content ── */}
        {!compareMode && (
          <>
            {/* Provider filter + sort + filter toggle */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
              {/* Provider pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {providers.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setActiveProvider(p); track('provider_filter', { provider: p }) }}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                      activeProvider === p
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                        : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Sort + Filters */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Filters toggle */}
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 border transition-all ${
                    filtersOpen || activeFilterCount > 0
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-emerald-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                  >
                    <span className="text-zinc-400 dark:text-zinc-500">Sort</span>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{SORT_LABELS[sort]}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden min-w-[160px]">
                      {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setSort(key); setSortOpen(false); track('sort_changed', { sort: key }) }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${
                            sort === key
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-semibold'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter panel */}
            {filtersOpen && (
              <FilterPanel
                filterTiers={filterTiers}
                onTiersChange={handleTiersChange}
                costPreset={costPreset}
                onCostPreset={handleCostPreset}
                qualityPreset={qualityPreset}
                onQualityPreset={handleQualityPreset}
                hasQualityData={hasQualityData}
                onReset={resetFilters}
              />
            )}

            {/* Results table */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                    <th className="px-4 py-2.5 text-left font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">Model</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-zinc-400 dark:text-zinc-500 text-xs uppercase tracking-wider">Tier</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-purple-600 dark:text-purple-400 text-xs uppercase tracking-wider" title="Quality score (0–100) from Arena AI Elo / Artificial Analysis intelligence index">Quality</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-zinc-400 dark:text-zinc-500 text-xs uppercase tracking-wider whitespace-nowrap">Rate in / out / 1M</th>
                    {mode === 'money' ? (
                      <>
                        <th className="px-3 py-2.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Tokens In</th>
                        <th className="px-3 py-2.5 text-right font-semibold text-sky-700 dark:text-sky-400 text-xs uppercase tracking-wider whitespace-nowrap">Tokens Out</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-2.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap">Cost In</th>
                        <th className="px-3 py-2.5 text-right font-semibold text-sky-700 dark:text-sky-400 text-xs uppercase tracking-wider whitespace-nowrap">Cost Out</th>
                      </>
                    )}
                    <th
                      className="px-3 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider whitespace-nowrap"
                      title="Quality points per $1 of input cost (quality ÷ $/1M input). Higher is better."
                    >
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {results.map((result, i) => {
                    const tier = detectTier(result.model.name)
                    return (
                      <tr key={result.model.id} className={`${i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/40 dark:bg-zinc-800/20'} hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors`}>
                        <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                          {result.model.name}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap ${TIER_COLOR[tier]}`}>
                            {TIER_LABEL[tier]}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <QualityBadge score={result.model.qualityIndex} source={result.model.qualitySource} />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                            {fmtRate(result.model.inputPricePerToken)} – {fmtRate(result.model.outputPricePerToken)}
                          </span>
                        </td>
                        {numericValue === 0 ? (
                          <>
                            <td className="px-3 py-3 text-right font-mono text-zinc-300 dark:text-zinc-600 whitespace-nowrap">—</td>
                            <td className="px-3 py-3 text-right font-mono text-zinc-300 dark:text-zinc-600 whitespace-nowrap">—</td>
                          </>
                        ) : mode === 'money' ? (() => {
                          const r = result as MoneyResult
                          return (
                            <>
                              <td className="px-3 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                {fmtTokens(r.inputTokens)}
                              </td>
                              <td className="px-3 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
                                {fmtTokens(r.outputTokens)}
                              </td>
                            </>
                          )
                        })() : mode === 'tokens' ? (() => {
                          const r = result as TokensResult
                          return (
                            <>
                              <td className="px-3 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                {fmtMoney(r.inputCost)}
                              </td>
                              <td className="px-3 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
                                {fmtMoney(r.outputCost)}
                              </td>
                            </>
                          )
                        })() : (() => {
                          const r = result as CharsResult
                          return (
                            <>
                              <td className="px-3 py-3 text-right font-mono text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                {fmtMoney(r.inputCost)}
                              </td>
                              <td className="px-3 py-3 text-right font-mono text-sky-700 dark:text-sky-400 whitespace-nowrap">
                                {fmtMoney(r.outputCost)}
                              </td>
                            </>
                          )
                        })()}
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <ValueBadge quality={result.model.qualityIndex} inputPricePerToken={result.model.inputPricePerToken} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer note */}
            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Approximation: ~4 chars / 1 token · Rates shown per 1M tokens · Pricing is live via OpenRouter — confirm with provider before billing decisions.
              </p>
            </div>
          </>
        )}

        {/* Compare panel — always mounted so selections survive toggling */}
        <div className={`px-5 pt-8 pb-5${compareMode ? '' : ' hidden'}`}>
          <PriceCompareClient providerGroups={providerGroups} mode={mode} numericValue={numericValue} />
        </div>

      </div>
    </div>
  )
}
