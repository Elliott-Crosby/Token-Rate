'use client'

// ── Mobile-only converter ────────────────────────────────────────────────────
// A faithful reimplementation of the "TokenRate Mobile" design handoff: the wide
// 7-column results table becomes tappable cards, the mode control + amount input
// stay sticky, and Sort / Filters / provider-compare move into bottom sheets.
// Rendered below `lg`; the desktop ConverterClient is untouched (hidden on mobile).

import { useState, useMemo, useEffect } from 'react'
import type { InputMode, ProviderGroup, ModelPricing } from '@/lib/types'
import { TIER_KEYS, type CostPreset, type QualityPreset } from './FilterPanel'
import { track } from '@/lib/track'
import { detectTier } from '@/lib/tier'

const TIER_LABEL: Record<string, string> = { flagship: 'Flagship', balanced: 'Balanced', fast: 'Fast', reasoning: 'Reasoning' }
const TIER_COLOR: Record<string, string> = {
  flagship: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  balanced: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  fast: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  reasoning: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
}

// ── Formatters ────────────────────────────────────────────────────────────────
const perM = (perToken: number) => perToken * 1_000_000
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
  const pm = perM(perToken)
  if (pm >= 1) return '$' + pm.toFixed(2)
  if (pm >= 0.01) return '$' + pm.toFixed(3)
  return '$' + pm.toFixed(4)
}
function fmtCtx(n?: number): string {
  if (!n) return '—'
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}M` : `${(n / 1_000).toFixed(0)}K`
}

const CHARS_PER_TOKEN = 4

interface Computed { kind: 'tokens' | 'money'; inLabel: string; outLabel: string; in: string; out: string }
function compute(mode: InputMode, value: number, m: ModelPricing): Computed | null {
  if (!value) return null
  if (mode === 'money') {
    return {
      kind: 'tokens', inLabel: 'Tokens in', outLabel: 'Tokens out',
      in: m.inputPricePerToken > 0 ? fmtTokens(value / m.inputPricePerToken) : '—',
      out: m.outputPricePerToken > 0 ? fmtTokens(value / m.outputPricePerToken) : '—',
    }
  }
  const tokens = mode === 'tokens' ? value : value / CHARS_PER_TOKEN
  return {
    kind: 'money', inLabel: 'Cost in', outLabel: 'Cost out',
    in: fmtMoney(tokens * m.inputPricePerToken),
    out: fmtMoney(tokens * m.outputPricePerToken),
  }
}

function valueScore(m: ModelPricing): number {
  if (m.qualityIndex == null || m.inputPricePerToken <= 0) return -1
  return m.qualityIndex / perM(m.inputPricePerToken)
}
function valueLabel(m: ModelPricing): string | null {
  const v = valueScore(m)
  if (v < 0) return null
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k'
  if (v >= 100) return Math.round(v).toString()
  if (v >= 10) return v.toFixed(0)
  return v.toFixed(1)
}

// ── Badges ────────────────────────────────────────────────────────────────────
function QualityBadge({ m }: { m: ModelPricing }) {
  if (m.qualityIndex == null) return <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">—</span>
  const q = m.qualityIndex
  let color: string
  if (q >= 80) color = 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
  else if (q >= 65) color = 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
  else color = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
  return (
    <span className={`inline-flex items-center gap-[3px] text-[10.5px] font-bold leading-tight px-1.5 py-0.5 rounded-[5px] font-mono ${color}`}>
      {q}{m.qualitySource === 'arena' && <span className="font-normal opacity-[.55] text-[8.5px]">elo</span>}
    </span>
  )
}
function ValueBadge({ m }: { m: ModelPricing }) {
  const label = valueLabel(m)
  if (label == null) return <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600">—</span>
  const v = valueScore(m)
  if (v >= 30) {
    const color = v >= 100
      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
      : 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
    return (
      <span
        title={`${m.qualityIndex} ÷ $${perM(m.inputPricePerToken).toFixed(2)}/1M = ${v.toFixed(1)} quality per $1`}
        className={`inline-flex items-center text-[10.5px] font-bold px-1.5 py-0.5 rounded-[5px] font-mono ${color}`}
      >{label}</span>
    )
  }
  const dim = v >= 10
    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
  return (
    <span title={`${v.toFixed(1)} quality per $1`} className={`inline-flex items-center text-[10.5px] font-bold px-1.5 py-0.5 rounded-[5px] font-mono ${dim}`}>{label}</span>
  )
}

// ── Segmented control (mode) ──────────────────────────────────────────────────
const MODE_OPTS: { value: InputMode; label: string; icon: string }[] = [
  { value: 'money', label: 'Dollars', icon: '$' },
  { value: 'tokens', label: 'Tokens', icon: '#' },
  { value: 'characters', label: 'Chars', icon: 'Aa' },
]
const MODE_PREFIX: Record<InputMode, string> = { money: '$', tokens: '#', characters: 'Aa' }
const MODE_PH: Record<InputMode, string> = { money: '1.00', tokens: '1,000,000', characters: '4,000,000' }
const PRESETS: Record<InputMode, { l: string; v: number }[]> = {
  money: [{ l: '$1', v: 1 }, { l: '$13', v: 13 }, { l: '$100', v: 100 }, { l: '$1k', v: 1000 }],
  tokens: [{ l: '1K', v: 1000 }, { l: '10K', v: 10000 }, { l: '100K', v: 100000 }, { l: '1M', v: 1000000 }],
  characters: [{ l: '4K', v: 4000 }, { l: '40K', v: 40000 }, { l: '400K', v: 400000 }, { l: '4M', v: 4000000 }],
}

type SortOption = 'popular' | 'value' | 'quality' | 'cheapest' | 'expensive' | 'name' | 'provider'
const SORTS: [SortOption, string][] = [
  ['popular', 'Most popular'], ['value', 'Best value'], ['quality', 'Highest quality'],
  ['cheapest', 'Cheapest first'], ['expensive', 'Most expensive'], ['name', 'Name'], ['provider', 'Provider'],
]
const SORT_SHORT: Record<SortOption, string> = {
  popular: 'popular', value: 'best value', quality: 'quality', cheapest: 'cheapest', expensive: 'priciest', name: 'name', provider: 'provider',
}
const COST_PRESETS: [CostPreset, string][] = [['all', 'All'], ['under1', 'Under $1'], ['1to10', '$1 – $10'], ['over10', 'Over $10']]
const QUAL_PRESETS: [QualityPreset, string][] = [['all', 'All'], ['top75', 'Top (75+)'], ['good50', 'Good (50+)'], ['rated', 'Rated only']]

function Segmented({ value, onChange }: { value: InputMode; onChange: (m: InputMode) => void }) {
  return (
    <div className="grid grid-cols-3 gap-[3px] p-[3px] rounded-[11px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
      {MODE_OPTS.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13.5px] font-semibold transition-transform active:scale-[.97] ${
              active
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'bg-transparent text-zinc-500'
            }`}
          >
            <span className="opacity-60 font-mono text-xs">{o.icon}</span>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Bottom sheet shell ────────────────────────────────────────────────────────
function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 10)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 dark:bg-black/60 transition-opacity duration-200"
        style={{ opacity: shown ? 1 : 0 }}
      />
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-t-[22px] border-t border-zinc-200 dark:border-zinc-800 shadow-[0_-12px_34px_rgba(0,0,0,.14)] dark:shadow-[0_-16px_40px_rgba(0,0,0,.6)] max-h-[78%] flex flex-col pb-8 transition-transform duration-300 [transition-timing-function:cubic-bezier(.2,.85,.25,1)]"
        style={{ transform: shown ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="flex justify-center pt-[9px]">
          <div className="w-[38px] h-[5px] rounded-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
        <div className="flex items-center justify-between px-[18px] pt-2 pb-3">
          <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</span>
          <button onClick={onClose} className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 transition-transform active:scale-95" aria-label="Close">
            <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-[18px] [scrollbar-width:none]">{children}</div>
        {footer && <div className="px-[18px] pt-3 border-t border-zinc-200 dark:border-zinc-800 mt-1">{footer}</div>}
      </div>
    </div>
  )
}

// ── Compare/filter pill ───────────────────────────────────────────────────────
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-[12.5px] font-semibold px-[13px] py-[7px] rounded-full whitespace-nowrap border transition-transform active:scale-[.97] ${
        active
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
          : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
      }`}
    >{children}</button>
  )
}

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCell({ label, value, tone }: { label: string; value: string; tone?: 'emerald' | 'sky' }) {
  const color = tone === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : tone === 'sky' ? 'text-sky-700 dark:text-sky-400' : 'text-zinc-900 dark:text-zinc-50'
  return (
    <div>
      <div className="text-[9.5px] font-bold tracking-[.07em] uppercase text-zinc-400 dark:text-zinc-600">{label}</div>
      <div className={`font-mono text-[19px] font-semibold mt-0.5 tracking-[-0.4px] ${color}`}>{value}</div>
    </div>
  )
}
function DetailRow({ k, v, tone }: { k: string; v: string; tone?: 'emerald' | 'sky' }) {
  const color = tone === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : tone === 'sky' ? 'text-sky-700 dark:text-sky-400' : 'text-zinc-600 dark:text-zinc-400'
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] text-zinc-500">{k}</span>
      <span className={`font-mono text-[12.5px] font-medium ${color}`}>{v}</span>
    </div>
  )
}
function ModelCard({ m, mode, value, selected, onToggleCompare }: {
  m: ModelPricing; mode: InputMode; value: number; selected: boolean; onToggleCompare: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const res = compute(mode, value, m)
  const tier = detectTier(m.name)
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-[14px] bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left block px-[13px] py-3 transition-transform active:scale-[.99]">
        {/* row 1: name + badges */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[14.5px] font-semibold text-zinc-900 dark:text-zinc-50 tracking-[-0.2px] truncate">{m.name}</div>
            <div className="flex items-center gap-1.5 mt-[3px]">
              <span className="text-[11.5px] text-zinc-500 font-medium">{m.provider}</span>
              <span className={`text-[10.5px] font-bold leading-tight px-1.5 py-0.5 rounded-[5px] ${TIER_COLOR[tier]}`}>{TIER_LABEL[tier]}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold tracking-[.06em] text-zinc-400 dark:text-zinc-600">Q</span><QualityBadge m={m} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-bold tracking-[.06em] text-emerald-700 dark:text-emerald-400">VALUE</span><ValueBadge m={m} />
            </div>
          </div>
        </div>
        {/* row 2: headline numbers */}
        <div className="grid grid-cols-2 gap-2 mt-[11px] border-t border-zinc-200 dark:border-zinc-800 pt-[11px]">
          <ResultCell label={res ? res.inLabel : 'Input / 1M'} tone="emerald" value={res ? res.in : fmtRate(m.inputPricePerToken)} />
          <ResultCell label={res ? res.outLabel : 'Output / 1M'} tone="sky" value={res ? res.out : fmtRate(m.outputPricePerToken)} />
        </div>
        {res && (
          <div className="font-mono mt-2 text-[11px] text-zinc-400 dark:text-zinc-600">
            {fmtRate(m.inputPricePerToken)} / {fmtRate(m.outputPricePerToken)} per 1M · {fmtCtx(m.contextLength)} ctx
          </div>
        )}
      </button>

      {open && (
        <div className="px-[13px] pb-[13px]">
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-[11px] flex flex-col gap-[9px]">
            <DetailRow k="Input rate" v={`${fmtRate(m.inputPricePerToken)} / 1M tokens`} tone="emerald" />
            <DetailRow k="Output rate" v={`${fmtRate(m.outputPricePerToken)} / 1M tokens`} tone="sky" />
            <DetailRow k="Context window" v={`${fmtCtx(m.contextLength)} tokens`} />
            <DetailRow k="Output / input ratio" v={`${(m.outputPricePerToken / m.inputPricePerToken).toFixed(1)}×`} />
            {m.qualityIndex != null && (
              <DetailRow k="Quality score" v={`${m.qualityIndex} / 100 ${m.qualitySource === 'arena' ? '· Arena Elo' : '· AA Index'}`} />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(m.id) }}
              className={`mt-[3px] h-[38px] rounded-[9px] border text-[13px] font-semibold flex items-center justify-center gap-[7px] transition-transform active:scale-[.98] ${
                selected
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="1" y="1" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.4" />
                <rect x="8" y="1" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              {selected ? 'Added to compare ✓' : 'Add to compare'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Compare view ──────────────────────────────────────────────────────────────
function CmpCell({ label, value, tone, big }: { label: string; value: string; tone?: 'emerald' | 'sky'; big?: boolean }) {
  const color = tone === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' : tone === 'sky' ? 'text-sky-700 dark:text-sky-400' : 'text-zinc-900 dark:text-zinc-50'
  return (
    <div className="bg-white dark:bg-zinc-900 px-[13px] py-[9px]">
      <div className="text-[9.5px] font-bold tracking-[.06em] uppercase text-zinc-400 dark:text-zinc-600">{label}</div>
      <div className={`font-mono mt-0.5 ${big ? 'text-base font-bold' : 'text-[14.5px] font-semibold'} ${color}`}>{value}</div>
    </div>
  )
}

function ProviderSheet({ group, selected, onToggle, onClose }: {
  group: ProviderGroup; selected: Set<string>; onToggle: (id: string) => void; onClose: () => void
}) {
  return (
    <Sheet title={group.name} onClose={onClose}>
      <div className="flex flex-col pb-1.5">
        {group.models.map((m) => {
          const on = selected.has(m.id)
          return (
            <button
              key={m.id}
              onClick={() => onToggle(m.id)}
              className="flex items-center gap-3 px-1 py-3 border-b border-zinc-200 dark:border-zinc-800 text-left transition-transform active:scale-[.99]"
            >
              <span className={`flex items-center justify-center w-[22px] h-[22px] rounded-md shrink-0 border-[1.5px] ${
                on ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300 dark:border-zinc-700'
              }`}>
                {on && <svg width="12" height="10" viewBox="0 0 14 12" fill="none"><path d="M1 6l4.5 4.5L13 1.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14.5px] font-semibold text-zinc-900 dark:text-zinc-50">{m.name}</span>
                <span className="font-mono text-[11.5px] text-zinc-400 dark:text-zinc-600">{fmtRate(m.inputPricePerToken)}/1M in · {fmtRate(m.outputPricePerToken)}/1M out</span>
              </span>
              <span className={`text-[10.5px] font-bold leading-tight px-1.5 py-0.5 rounded-[5px] ${TIER_COLOR[detectTier(m.name)]}`}>{TIER_LABEL[detectTier(m.name)]}</span>
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

function CompareView({ providerGroups, allModels, selected, setSelected, mode, value, openSheet }: {
  providerGroups: ProviderGroup[]; allModels: ModelPricing[]; selected: Set<string>
  setSelected: (s: Set<string>) => void; mode: InputMode; value: number; openSheet: (name: string) => void
}) {
  const models = allModels.filter((m) => selected.has(m.id))
  const inputs = models.map((m) => m.inputPricePerToken)
  const minIn = models.length > 1 ? Math.min(...inputs) : null
  const maxIn = models.length > 1 ? Math.max(...inputs) : null

  return (
    <div className="px-[14px] pt-[13px] pb-4 flex flex-col gap-[13px]">
      {/* provider tabs */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
        {providerGroups.map((g) => {
          const count = models.filter((m) => m.provider === g.name).length
          return (
            <button
              key={g.name}
              onClick={() => openSheet(g.name)}
              className={`shrink-0 flex items-center gap-[7px] px-[13px] py-2 rounded-[10px] text-[13px] font-semibold border transition-transform active:scale-[.97] ${
                count > 0
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {g.name}
              {count > 0 && <span className="bg-emerald-500 text-white text-[10px] font-bold rounded-full w-[17px] h-[17px] flex items-center justify-center">{count}</span>}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )
        })}
      </div>

      {models.length === 0 ? (
        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-[14px] py-[34px] px-5 text-center bg-zinc-100 dark:bg-zinc-800/40">
          <div className="text-3xl mb-2">⌗</div>
          <p className="text-[13.5px] text-zinc-500 leading-snug m-0">Tap a provider above, then pick the models you want to compare head-to-head.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[.08em] uppercase text-zinc-400 dark:text-zinc-600">Comparing {models.length}</span>
            <button onClick={() => setSelected(new Set())} className="text-[12.5px] font-semibold text-zinc-500">Reset</button>
          </div>
          {models.map((m) => {
            const res = compute(mode, value, m)
            const cheap = minIn !== null && m.inputPricePerToken === minIn
            const pricey = maxIn !== null && m.inputPricePerToken === maxIn && !cheap
            return (
              <div key={m.id} className={`border rounded-[14px] bg-white dark:bg-zinc-900 overflow-hidden shadow-sm ${cheap ? 'border-emerald-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <div className="flex items-center gap-2 px-[13px] py-[11px] border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-[7px]">
                      <span className="text-[14.5px] font-semibold text-zinc-900 dark:text-zinc-50 truncate">{m.name}</span>
                      {cheap && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">cheapest</span>}
                      {pricey && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[5px] bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">priciest</span>}
                    </div>
                    <span className="text-[11.5px] text-zinc-500">{m.provider}</span>
                  </div>
                  <QualityBadge m={m} />
                  <button
                    onClick={() => { const n = new Set(selected); n.delete(m.id); setSelected(n) }}
                    className="flex items-center justify-center w-[26px] h-[26px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 shrink-0 transition-transform active:scale-95"
                    aria-label={`Remove ${m.name}`}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800">
                  <CmpCell label="Input / 1M" value={fmtRate(m.inputPricePerToken)} tone="emerald" big={cheap} />
                  <CmpCell label="Output / 1M" value={fmtRate(m.outputPricePerToken)} tone="sky" />
                  {res && <CmpCell label={res.inLabel} value={res.in} tone="emerald" />}
                  {res && <CmpCell label={res.outLabel} value={res.out} tone="sky" />}
                  <CmpCell label="Context" value={fmtCtx(m.contextLength)} />
                  <CmpCell label="Value" value={valueLabel(m) || '—'} tone="emerald" />
                </div>
              </div>
            )
          })}
          <p className="text-[10.5px] text-zinc-400 dark:text-zinc-600 leading-snug m-0">
            Prices per 1M tokens · live via OpenRouter · quality from Arena Elo / Artificial Analysis index.
          </p>
        </>
      )}
    </div>
  )
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
function Toolbar({ count, onSort, onFilter, sortLabel, filterCount }: {
  count: number; onSort: () => void; onFilter: () => void; sortLabel: string; filterCount: number
}) {
  const tbBtn = (active: boolean) =>
    `flex items-center gap-1.5 text-xs font-semibold px-[11px] py-1.5 rounded-[9px] border transition-transform active:scale-[.97] ${
      active ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
    }`
  return (
    <div className="flex items-center justify-between gap-2.5 px-[14px] pt-[11px] pb-[9px]">
      <span className="text-[11.5px] text-zinc-500 font-medium">
        <b className="text-zinc-900 dark:text-zinc-50 font-bold">{count}</b> models
      </span>
      <div className="flex gap-2">
        <button onClick={onFilter} className={tbBtn(filterCount > 0)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M3 6h6M5 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          Filters
          {filterCount > 0 && <span className="bg-emerald-500 text-white text-[9px] font-bold rounded-full w-[15px] h-[15px] flex items-center justify-center">{filterCount}</span>}
        </button>
        <button onClick={onSort} className={tbBtn(false)}>
          <span className="text-zinc-400 dark:text-zinc-600 font-medium">Sort</span>
          <span className="text-zinc-600 dark:text-zinc-300 font-bold">{sortLabel}</span>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[9px]">
      <span className="text-[13px] font-semibold text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MobileConverter({ providerGroups }: { providerGroups: ProviderGroup[] }) {
  const [mode, setMode] = useState<InputMode>('money')
  const [raw, setRaw] = useState('')
  const [view, setView] = useState<'all' | 'compare'>('all')
  const [activeProvider, setActiveProvider] = useState('All')
  const [sort, setSort] = useState<SortOption>('popular')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sheet, setSheet] = useState<string | null>(null) // 'sort' | 'filter' | provider name
  const [filterTiers, setFilterTiers] = useState<Set<string>>(new Set(TIER_KEYS))
  const [costPreset, setCostPreset] = useState<CostPreset>('all')
  const [qualPreset, setQualPreset] = useState<QualityPreset>('all')

  const allModels = useMemo(() => providerGroups.flatMap((g) => g.models), [providerGroups])
  const providers = useMemo(() => ['All', ...providerGroups.map((g) => g.name)], [providerGroups])

  const numericValue = useMemo(() => {
    const n = parseFloat(raw.replace(/[$,\s]/g, ''))
    return isNaN(n) || n <= 0 ? 0 : n
  }, [raw])

  const activeFilterCount = (filterTiers.size < TIER_KEYS.length ? 1 : 0) + (costPreset !== 'all' ? 1 : 0) + (qualPreset !== 'all' ? 1 : 0)

  const filtered = useMemo(() => {
    const PROVIDER_ORDER = ['Anthropic', 'OpenAI', 'Google', 'Meta', 'DeepSeek', 'Mistral', 'xAI']
    let models = activeProvider === 'All' ? allModels : allModels.filter((m) => m.provider === activeProvider)

    if (costPreset === 'under1') models = models.filter((m) => perM(m.inputPricePerToken) < 1)
    else if (costPreset === '1to10') models = models.filter((m) => { const p = perM(m.inputPricePerToken); return p >= 1 && p <= 10 })
    else if (costPreset === 'over10') models = models.filter((m) => perM(m.inputPricePerToken) > 10)

    if (qualPreset === 'top75') models = models.filter((m) => m.qualityIndex != null && m.qualityIndex >= 75)
    else if (qualPreset === 'good50') models = models.filter((m) => m.qualityIndex != null && m.qualityIndex >= 50)
    else if (qualPreset === 'rated') models = models.filter((m) => m.qualityIndex != null)

    if (sort === 'popular') {
      const TIER_RANK: Record<string, number> = { flagship: 0, reasoning: 1, balanced: 2, fast: 3 }
      const byProvider: Record<string, ModelPricing[]> = {}
      for (const m of models) (byProvider[m.provider] ||= []).push(m)
      for (const p of Object.keys(byProvider)) {
        byProvider[p].sort((a, b) => {
          if (!!a.isVariant !== !!b.isVariant) return a.isVariant ? 1 : -1
          const aq = a.qualityIndex ?? -1, bq = b.qualityIndex ?? -1
          if (aq !== bq) return bq - aq
          const at = TIER_RANK[detectTier(a.name)] ?? 2, bt = TIER_RANK[detectTier(b.name)] ?? 2
          if (at !== bt) return at - bt
          return a.inputPricePerToken - b.inputPricePerToken
        })
      }
      const ordered = [
        ...PROVIDER_ORDER.filter((p) => byProvider[p]?.length),
        ...Object.keys(byProvider).filter((p) => !PROVIDER_ORDER.includes(p)),
      ]
      const out: ModelPricing[] = []
      let depth = 0, added = true
      while (added) {
        added = false
        for (const p of ordered) {
          if (byProvider[p][depth]) { out.push(byProvider[p][depth]); added = true }
        }
        depth++
      }
      return out
    }

    models = models.filter((m) => filterTiers.has(detectTier(m.name)))
    if (sort === 'cheapest') return [...models].sort((a, b) => a.inputPricePerToken - b.inputPricePerToken || (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1))
    if (sort === 'expensive') return [...models].sort((a, b) => b.inputPricePerToken - a.inputPricePerToken || (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1))
    if (sort === 'quality') return [...models].sort((a, b) => (b.qualityIndex ?? -1) - (a.qualityIndex ?? -1))
    if (sort === 'value') return [...models].sort((a, b) => valueScore(b) - valueScore(a))
    if (sort === 'name') return [...models].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'provider') return [...models].sort((a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name))
    return models
  }, [allModels, activeProvider, sort, filterTiers, costPreset, qualPreset])

  const toggleCompare = (id: string) => setSelected((prev) => {
    const n = new Set(prev)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  function handleMode(m: InputMode) { setMode(m); setRaw(''); track('mode_changed', { mode: m }) }

  useEffect(() => {
    if (numericValue === 0) return
    const id = setTimeout(() => track('value_entered', { mode, value: numericValue }), 1000)
    return () => clearTimeout(id)
  }, [numericValue, mode])

  const sortLabel = SORT_SHORT[sort]
  const providerGroup = providerGroups.find((g) => g.name === sheet)

  return (
    <div className="rounded-[18px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      {/* view tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {([['all', 'All Models', filtered.length], ['compare', 'Compare', selected.size]] as [typeof view, string, number][]).map(([v, label, n]) => {
          const on = view === v
          return (
            <button
              key={v}
              onClick={() => { setView(v); track('view_changed', { view: v === 'all' ? 'all_models' : 'compare_prices' }) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-[13px] text-[13.5px] font-semibold transition-colors ${
                on ? 'text-zinc-900 dark:text-zinc-50 border-b-2 border-emerald-500 -mb-px' : 'text-zinc-400 dark:text-zinc-600 border-b-2 border-transparent -mb-px'
              }`}
            >
              {label}{n > 0 && <span className="text-[11px] font-semibold opacity-60">· {n}</span>}
            </button>
          )
        })}
      </div>

      {/* sticky: mode + amount */}
      <div className="sticky top-14 z-30 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-[14px] py-3">
        <Segmented value={mode} onChange={handleMode} />
        <div className="flex items-center mt-2.5 rounded-[11px] border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <span className="font-mono w-11 shrink-0 self-stretch flex items-center justify-center text-sm text-zinc-400 dark:text-zinc-600 border-r border-zinc-200 dark:border-zinc-700">{MODE_PREFIX[mode]}</span>
          <input
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={MODE_PH[mode]}
            className="font-mono flex-1 min-w-0 bg-transparent border-none outline-none px-3 py-[13px] text-xl font-medium text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
          />
          {raw && (
            <button onClick={() => setRaw('')} className="mr-[11px] w-[22px] h-[22px] shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 flex items-center justify-center transition-transform active:scale-90" aria-label="Clear">
              <svg width="9" height="9" viewBox="0 0 10 10"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
        {/* presets */}
        <div className="flex gap-[7px] mt-2.5 overflow-x-auto [scrollbar-width:none]">
          <span className="text-[10px] font-bold tracking-[.08em] text-zinc-400 dark:text-zinc-600 self-center uppercase shrink-0">Quick</span>
          {PRESETS[mode].map((p) => {
            const on = numericValue === p.v
            return (
              <button
                key={p.l}
                onClick={() => { setRaw(String(p.v)); track('preset_used', { mode, preset_label: p.l, preset_value: p.v }) }}
                className={`font-mono shrink-0 text-xs font-semibold px-[11px] py-[5px] rounded-lg border transition-transform active:scale-[.97] ${
                  on ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
                }`}
              >{p.l}</button>
            )
          })}
        </div>
      </div>

      {view === 'all' ? (
        <>
          {/* provider rail */}
          <div className="flex gap-[7px] overflow-x-auto px-[14px] pt-[11px] pb-[3px] [scrollbar-width:none]">
            {providers.map((p) => (
              <Pill key={p} active={activeProvider === p} onClick={() => { setActiveProvider(p); track('provider_filter', { provider: p }) }}>{p}</Pill>
            ))}
          </div>
          <Toolbar count={filtered.length} sortLabel={sortLabel} filterCount={activeFilterCount} onSort={() => setSheet('sort')} onFilter={() => setSheet('filter')} />
          {/* result cards */}
          <div className="flex flex-col gap-[9px] px-3 pt-0.5 pb-[14px]">
            {numericValue === 0 && (
              <div className="flex items-center gap-2 px-3 py-[9px] rounded-[11px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 mb-0.5">
                <span className="text-[12.5px] text-emerald-700 dark:text-emerald-400 font-semibold">↑ Type any amount — results update live</span>
              </div>
            )}
            {filtered.map((m) => (
              <ModelCard key={m.id} m={m} mode={mode} value={numericValue} selected={selected.has(m.id)} onToggleCompare={toggleCompare} />
            ))}
          </div>
          <div className="px-[14px] pb-[14px]">
            <p className="text-[10.5px] text-zinc-400 dark:text-zinc-600 leading-snug m-0">
              ~4 chars ≈ 1 token · rates per 1M tokens · live via OpenRouter — confirm with provider before billing.
            </p>
          </div>
        </>
      ) : (
        <CompareView
          providerGroups={providerGroups} allModels={allModels} selected={selected} setSelected={setSelected}
          mode={mode} value={numericValue} openSheet={(name) => setSheet(name)}
        />
      )}

      {/* sheets */}
      {sheet === 'sort' && (
        <Sheet title="Sort by" onClose={() => setSheet(null)}>
          <div className="flex flex-col pb-1">
            {SORTS.map(([k, label]) => {
              const on = sort === k
              return (
                <button
                  key={k}
                  onClick={() => { setSort(k); setSheet(null); track('sort_changed', { sort: k }) }}
                  className={`flex items-center justify-between px-1 py-[13px] border-b border-zinc-200 dark:border-zinc-800 text-[15px] transition-transform active:scale-[.99] ${
                    on ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'font-medium text-zinc-900 dark:text-zinc-50'
                  }`}
                >
                  {label}
                  {on && <svg width="15" height="12" viewBox="0 0 15 12" fill="none"><path d="M1 6l4.5 4.5L14 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              )
            })}
          </div>
        </Sheet>
      )}
      {sheet === 'filter' && (
        <Sheet
          title="Filters"
          onClose={() => setSheet(null)}
          footer={
            <button onClick={() => setSheet(null)} className="w-full h-[46px] rounded-xl bg-emerald-500 text-white text-[15px] font-bold transition-transform active:scale-[.98]">
              Show {filtered.length} models
            </button>
          }
        >
          <div className="flex flex-col gap-[18px] pt-1 pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[.1em] uppercase text-zinc-400 dark:text-zinc-600">Refine the list</span>
              <button
                onClick={() => { setFilterTiers(new Set(TIER_KEYS)); setCostPreset('all'); setQualPreset('all') }}
                className="text-[12.5px] font-semibold text-zinc-500"
              >Reset</button>
            </div>
            <FilterGroup label="Tier">
              {TIER_KEYS.map((t) => {
                const on = filterTiers.has(t)
                return (
                  <button
                    key={t}
                    onClick={() => { const n = new Set(filterTiers); if (n.has(t)) n.delete(t); else n.add(t); setFilterTiers(n); track('filter_applied', { type: 'tier', tiers: [...n].sort() }) }}
                    className={`text-[13px] font-semibold px-[14px] py-2 rounded-full border transition-transform active:scale-[.97] ${
                      on ? `border-transparent ${TIER_COLOR[t]}` : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 opacity-80'
                    }`}
                  >{TIER_LABEL[t]}</button>
                )
              })}
            </FilterGroup>
            <FilterGroup label="Input cost / 1M tokens">
              {COST_PRESETS.map(([id, label]) => (
                <Pill key={id} active={costPreset === id} onClick={() => { setCostPreset(id); track('filter_applied', { type: 'cost', value: id }) }}>{label}</Pill>
              ))}
            </FilterGroup>
            <FilterGroup label="Quality score">
              {QUAL_PRESETS.map(([id, label]) => (
                <Pill key={id} active={qualPreset === id} onClick={() => { setQualPreset(id); track('filter_applied', { type: 'quality', value: id }) }}>{label}</Pill>
              ))}
            </FilterGroup>
          </div>
        </Sheet>
      )}
      {providerGroup && (
        <ProviderSheet group={providerGroup} selected={selected} onToggle={toggleCompare} onClose={() => setSheet(null)} />
      )}
    </div>
  )
}
