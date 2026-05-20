'use client'

import { useState, useCallback } from 'react'
import type { InputMode, ProviderGroup, ModelPricing, CalculationResult } from '@/lib/types'
import { calculate } from '@/lib/conversions'
import InputPanel from './InputPanel'
import ModelSelector from './ModelSelector'
import ResultsTable from './ResultsTable'

interface ConverterClientProps {
  providerGroups: ProviderGroup[]
}

const EMPTY_VALUES: Record<InputMode, string> = {
  money: '',
  tokens: '',
  characters: '',
}

function parseInput(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, '')
  const n = parseFloat(cleaned)
  if (isNaN(n) || n < 0) return null
  return n
}

function getAllModels(groups: ProviderGroup[]): ModelPricing[] {
  return groups.flatMap((g) => g.models)
}

export default function ConverterClient({ providerGroups }: ConverterClientProps) {
  const [activeMode, setActiveMode] = useState<InputMode | null>(null)
  const [values, setValues] = useState<Record<InputMode, string>>(EMPTY_VALUES)
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(() => {
    const all = new Set<string>()
    providerGroups.forEach((g) => g.models.forEach((m) => all.add(m.id)))
    return all
  })
  const [results, setResults] = useState<CalculationResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleChange = useCallback((mode: InputMode, value: string) => {
    setValues((prev) => ({ ...prev, [mode]: value }))
    setActiveMode(value === '' ? null : mode)
    setResults(null)
    setError(null)
  }, [])

  const handleClear = useCallback(() => {
    setValues(EMPTY_VALUES)
    setActiveMode(null)
    setResults(null)
    setError(null)
  }, [])

  const handleToggleModel = useCallback((modelId: string) => {
    setSelectedModelIds((prev) => {
      const next = new Set(prev)
      if (next.has(modelId)) next.delete(modelId)
      else next.add(modelId)
      return next
    })
    setResults(null)
  }, [])

  const handleToggleProvider = useCallback(
    (provider: string, models: ModelPricing[], allSelected: boolean) => {
      setSelectedModelIds((prev) => {
        const next = new Set(prev)
        if (allSelected) {
          models.forEach((m) => next.delete(m.id))
        } else {
          models.forEach((m) => next.add(m.id))
        }
        return next
      })
      setResults(null)
    },
    []
  )

  const handleCalculate = useCallback(() => {
    setError(null)

    if (!activeMode) {
      setError('Enter a value in one of the fields above.')
      return
    }

    const rawValue = values[activeMode]
    const numericValue = parseInput(rawValue)

    if (numericValue === null || numericValue === 0) {
      setError('Enter a valid positive number.')
      return
    }

    if (selectedModelIds.size === 0) {
      setError('Select at least one model to compare.')
      return
    }

    const allModels = getAllModels(providerGroups)
    const selectedModels = allModels.filter((m) => selectedModelIds.has(m.id))
    const computed = selectedModels.map((model) => calculate(activeMode, numericValue, model))
    setResults(computed)
  }, [activeMode, values, selectedModelIds, providerGroups])

  const canCalculate =
    activeMode !== null &&
    parseInput(values[activeMode]) !== null &&
    parseInput(values[activeMode]) !== 0 &&
    selectedModelIds.size > 0

  const inputValue =
    activeMode !== null ? (parseInput(values[activeMode]) ?? 0) : 0

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col gap-6 shadow-sm">
        <InputPanel
          activeMode={activeMode}
          values={values}
          onChange={handleChange}
          onClear={handleClear}
        />

        <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

        <ModelSelector
          providerGroups={providerGroups}
          selectedModelIds={selectedModelIds}
          onToggle={handleToggleModel}
          onToggleProvider={handleToggleProvider}
        />

        <div className="flex items-center gap-4">
          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
              canCalculate
                ? 'bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white shadow-sm active:scale-95'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            Calculate
          </button>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </section>

      {results && activeMode && (
        <section>
          <ResultsTable
            results={results}
            mode={activeMode}
            inputValue={inputValue}
          />
        </section>
      )}
    </div>
  )
}
