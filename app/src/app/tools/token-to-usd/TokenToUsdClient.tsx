'use client'

import { useState, useMemo } from 'react'
import { ALL_MODELS, MODELS_UPDATED_AT } from '@/lib/models'

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

// Real models only — drop the noindex'd near-duplicate snapshots that add noise
// without adding a genuinely different price point.
const MODELS = ALL_MODELS.filter((m) => !m.variant)

// Brand-recognizable providers get their own pill; everything else is reachable
// via search. Order is deliberate, not by model count.
const PILL_PROVIDERS = ['Anthropic', 'OpenAI', 'Google', 'Meta', 'Mistral', 'DeepSeek', 'xAI'].filter(
  (name) => MODELS.some((m) => m.provider === name),
)

const PRESETS = [1000, 10000, 100000, 1000000, 10000000]

type SortKey = 'name' | 'provider' | 'input' | 'output'

export default function TokenToUsdClient() {
  const [tokens, setTokens] = useState('1,000,000')
  const [search, setSearch] = useState('')
  const [provider, setProvider] = useState('All')
  const [sortKey, setSortKey] = useState<SortKey>('input')
  const [sortAsc, setSortAsc] = useState(true)

  const count = useMemo(() => {
    const n = parseFloat(tokens.replace(/[,\s]/g, ''))
    return isNaN(n) || n < 0 ? 0 : n
  }, [tokens])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = MODELS
    if (provider !== 'All') list = list.filter((m) => m.provider === provider)
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q))

    const dir = sortAsc ? 1 : -1
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return dir * a.name.localeCompare(b.name)
        case 'provider':
          return dir * (a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name))
        case 'input':
          return dir * (a.inputPricePerMillion - b.inputPricePerMillion)
        case 'output':
          return dir * (a.outputPricePerMillion - b.outputPricePerMillion)
      }
    })
  }, [search, provider, sortKey, sortAsc])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v)
    } else {
      // First click on any column is ascending — A→Z for text, cheapest-first for
      // prices — matching the page's default and the second click flips it.
      setSortKey(key)
      setSortAsc(true)
    }
  }

  const caret = (key: SortKey) =>
    sortKey === key ? (
      <span className="ml-1 inline-block text-[9px] align-middle">{sortAsc ? '▲' : '▼'}</span>
    ) : (
      <span className="ml-1 inline-block text-[9px] align-middle opacity-0 group-hover:opacity-40">▼</span>
    )

  return (
    <div className="flex flex-col gap-5">
      {/* ── Input ── */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Token Count
        </label>
        <div className="relative flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <span className="flex items-center justify-center w-12 shrink-0 border-r border-zinc-200 dark:border-zinc-700 self-stretch text-sm font-mono text-zinc-400 dark:text-zinc-500">
            #
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            placeholder="e.g. 1,000,000"
            className="flex-1 bg-transparent px-4 py-4 text-xl font-mono outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
          />
          {tokens && (
            <button
              onClick={() => setTokens('')}
              className="mr-4 h-6 w-6 shrink-0 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              aria-label="Clear token count"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">Quick</span>
          {PRESETS.map((n) => {
            const active = count === n
            return (
              <button
                key={n}
                onClick={() => setTokens(n.toLocaleString())}
                className={`text-xs px-2.5 py-1 rounded-md border font-mono transition-colors ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                {n >= 1_000_000 ? `${n / 1_000_000}M` : n >= 1_000 ? `${n / 1_000}K` : n}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Search + provider filter ── */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          >
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a model — e.g. Sonnet, GPT-4o, Gemini…"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-9 pr-9 py-2.5 text-sm outline-none text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              aria-label="Clear search"
            >
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', ...PILL_PROVIDERS].map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                provider === p
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results table ── */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
        <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <th
                  onClick={() => toggleSort('name')}
                  className="group px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300 text-left text-xs uppercase tracking-wider cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Model{caret('name')}
                </th>
                <th
                  onClick={() => toggleSort('provider')}
                  className="group px-4 py-3 font-semibold text-zinc-500 dark:text-zinc-400 text-left text-xs uppercase tracking-wider cursor-pointer select-none hidden sm:table-cell hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  Provider{caret('provider')}
                </th>
                <th
                  onClick={() => toggleSort('input')}
                  className="group px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right text-xs uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-emerald-900 dark:hover:text-emerald-300"
                >
                  Input Cost{caret('input')}
                </th>
                <th
                  onClick={() => toggleSort('output')}
                  className="group px-4 py-3 font-semibold text-sky-700 dark:text-sky-400 text-right text-xs uppercase tracking-wider cursor-pointer select-none whitespace-nowrap hover:text-sky-900 dark:hover:text-sky-300"
                >
                  Output Cost{caret('output')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((m, i) => {
                const inputCost = count > 0 ? (count * m.inputPricePerMillion) / 1_000_000 : 0
                const outputCost = count > 0 ? (count * m.outputPricePerMillion) / 1_000_000 : 0
                return (
                  <tr
                    key={m.slug}
                    className={`${i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'} hover:bg-emerald-50/40 dark:hover:bg-emerald-950/10 transition-colors`}
                  >
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
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-zinc-400 dark:text-zinc-500">
                    No models match “{search}”.{' '}
                    <button
                      onClick={() => {
                        setSearch('')
                        setProvider('All')
                      }}
                      className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-zinc-400 dark:text-zinc-500">
        <span>
          Showing <span className="font-semibold text-zinc-600 dark:text-zinc-300">{rows.length}</span> models · cost
          for <span className="font-semibold text-zinc-600 dark:text-zinc-300">{count > 0 ? count.toLocaleString() : '—'}</span> tokens ·
          input and output priced separately.
        </span>
        <span>Live pricing · updated {MODELS_UPDATED_AT}</span>
      </div>
    </div>
  )
}
