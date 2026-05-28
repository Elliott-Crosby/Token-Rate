'use client'

// ── Tier config (exported so ConverterClient can import TIER_KEYS) ─────────
export const TIER_KEYS = ['flagship', 'balanced', 'fast', 'reasoning'] as const
export type TierKey = typeof TIER_KEYS[number]

const TIER_LABELS: Record<TierKey, string> = {
  flagship: 'Flagship', balanced: 'Balanced', fast: 'Fast', reasoning: 'Reasoning',
}
const TIER_ACTIVE: Record<TierKey, string> = {
  flagship: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700',
  balanced: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-700',
  fast: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
  reasoning: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
}
const INACTIVE = 'bg-transparent text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 opacity-60 hover:opacity-100'

// ── Preset option arrays ──────────────────────────────────────────────────────
export const COST_PRESETS = [
  { id: 'all',    label: 'All' },
  { id: 'under1', label: 'Under $1' },
  { id: '1to10',  label: '$1 – $10' },
  { id: 'over10', label: 'Over $10' },
] as const
export type CostPreset = typeof COST_PRESETS[number]['id']

export const QUALITY_PRESETS = [
  { id: 'all',    label: 'All' },
  { id: 'top75',  label: 'Top (75+)' },
  { id: 'good50', label: 'Good (50+)' },
  { id: 'rated',  label: 'Rated only' },
] as const
export type QualityPreset = typeof QUALITY_PRESETS[number]['id']

// ── Component ─────────────────────────────────────────────────────────────────
export interface FilterPanelProps {
  filterTiers: Set<string>
  onTiersChange: (t: Set<string>) => void
  costPreset: CostPreset
  onCostPreset: (p: CostPreset) => void
  qualityPreset: QualityPreset
  onQualityPreset: (p: QualityPreset) => void
  hasQualityData: boolean
  onReset: () => void
}

export default function FilterPanel({
  filterTiers, onTiersChange,
  costPreset, onCostPreset,
  qualityPreset, onQualityPreset,
  hasQualityData,
  onReset,
}: FilterPanelProps) {
  const toggleTier = (t: string) => {
    const next = new Set(filterTiers)
    next.has(t) ? next.delete(t) : next.add(t)
    onTiersChange(next)
  }

  return (
    <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/20 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Filters</span>
        <button
          onClick={onReset}
          className="text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Tier */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Tier</span>
        <div className="flex flex-wrap gap-1.5">
          {TIER_KEYS.map(t => (
            <button
              key={t}
              onClick={() => toggleTier(t)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                filterTiers.has(t) ? TIER_ACTIVE[t] : INACTIVE
              }`}
            >
              {TIER_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Cost */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Input cost / 1M tokens</span>
        <div className="flex flex-wrap gap-1.5">
          {COST_PRESETS.map(o => (
            <button
              key={o.id}
              onClick={() => onCostPreset(o.id)}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                costPreset === o.id
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                  : INACTIVE
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      {hasQualityData && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Quality score</span>
          <div className="flex flex-wrap gap-1.5">
            {QUALITY_PRESETS.map(o => (
              <button
                key={o.id}
                onClick={() => onQualityPreset(o.id)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${
                  qualityPreset === o.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                    : INACTIVE
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
