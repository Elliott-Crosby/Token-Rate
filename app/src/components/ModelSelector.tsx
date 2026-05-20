'use client'

import { useState } from 'react'
import type { ProviderGroup, ModelPricing } from '@/lib/types'
import { formatPricePerMillion } from '@/lib/conversions'

interface ModelSelectorProps {
  providerGroups: ProviderGroup[]
  selectedModelIds: Set<string>
  onToggle: (modelId: string) => void
  onToggleProvider: (provider: string, models: ModelPricing[], allSelected: boolean) => void
}

interface Tier {
  label: string
  className: string
}

function getTier(name: string): Tier | null {
  if (/opus/i.test(name))   return { label: 'Premium',  className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' }
  if (/sonnet/i.test(name)) return { label: 'Balanced', className: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400' }
  if (/haiku/i.test(name))  return { label: 'Fast',     className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' }
  return null
}

export default function ModelSelector({
  providerGroups,
  selectedModelIds,
  onToggle,
  onToggleProvider,
}: ModelSelectorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(providerGroups.map((g) => g.name))
  )

  function toggleExpanded(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Select Models to Compare
      </p>
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {providerGroups.map((group, gi) => {
          const isOpen = expanded.has(group.name)
          const allSelected = group.models.every((m) => selectedModelIds.has(m.id))
          const someSelected = group.models.some((m) => selectedModelIds.has(m.id))
          const selectedCount = group.models.filter((m) => selectedModelIds.has(m.id)).length

          return (
            <div key={group.name} className={gi > 0 ? 'border-t border-zinc-200 dark:border-zinc-700' : ''}>
              {/* Provider header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <button
                  onClick={() => onToggleProvider(group.name, group.models, allSelected)}
                  className="shrink-0"
                  aria-label={allSelected ? 'Deselect all' : 'Select all'}
                >
                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                    allSelected
                      ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500'
                      : someSelected
                      ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/40'
                      : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700'
                  }`}>
                    {allSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {!allSelected && someSelected && (
                      <div className="h-1.5 w-1.5 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
                    )}
                  </div>
                </button>

                <button onClick={() => toggleExpanded(group.name)} className="flex flex-1 items-center gap-2 text-left">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">{group.name}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{selectedCount}/{group.models.length} selected</span>
                </button>

                <button onClick={() => toggleExpanded(group.name)} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <path d="M2 5l5 4 5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Model list */}
              {isOpen && (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {group.models.map((model) => {
                    const isChecked = selectedModelIds.has(model.id)
                    const tier = getTier(model.name)

                    return (
                      <button
                        key={model.id}
                        onClick={() => onToggle(model.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                      >
                        <div className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500'
                            : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700'
                        }`}>
                          {isChecked && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        <span className={`flex-1 text-sm ${isChecked ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-500'}`}>
                          {model.name}
                        </span>

                        {tier && (
                          <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${tier.className}`}>
                            {tier.label}
                          </span>
                        )}

                        <div className="flex gap-1.5 shrink-0 items-center">
                          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                            {formatPricePerMillion(model.inputPricePerToken)}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-600 text-xs">/</span>
                          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                            {formatPricePerMillion(model.outputPricePerToken)}
                          </span>
                          <span className="text-xs text-zinc-300 dark:text-zinc-600">per 1M</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
