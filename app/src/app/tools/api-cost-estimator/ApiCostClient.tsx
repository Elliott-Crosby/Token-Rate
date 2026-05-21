'use client'

import { useState, useMemo } from 'react'
import { ALL_MODELS } from '@/lib/models'

function fmt(n: number): string {
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 0.01) return '$' + n.toFixed(2)
  return '$' + n.toFixed(4)
}

function Slider({ label, value, min, max, step, onChange, display }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; display: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
        <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{display}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-700 accent-emerald-500 cursor-pointer"
      />
    </div>
  )
}

export default function ApiCostClient() {
  const [inputTokens, setInputTokens] = useState(500)
  const [outputTokens, setOutputTokens] = useState(300)
  const [requestsPerDay, setRequestsPerDay] = useState(1000)

  const requestsPerMonth = requestsPerDay * 30

  const results = useMemo(() =>
    ALL_MODELS
      .map((m) => {
        const monthly =
          (requestsPerMonth * inputTokens * m.inputPricePerMillion) / 1_000_000 +
          (requestsPerMonth * outputTokens * m.outputPricePerMillion) / 1_000_000
        return { model: m, monthly }
      })
      .sort((a, b) => a.monthly - b.monthly),
    [inputTokens, outputTokens, requestsPerMonth]
  )

  return (
    <div className="flex flex-col gap-8">
      {/* Sliders */}
      <div className="flex flex-col gap-6 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <Slider
          label="Avg. input tokens per request"
          value={inputTokens}
          min={100} max={10000} step={100}
          onChange={setInputTokens}
          display={inputTokens.toLocaleString()}
        />
        <Slider
          label="Avg. output tokens per request"
          value={outputTokens}
          min={50} max={5000} step={50}
          onChange={setOutputTokens}
          display={outputTokens.toLocaleString()}
        />
        <Slider
          label="Requests per day"
          value={requestsPerDay}
          min={100} max={100000} step={100}
          onChange={setRequestsPerDay}
          display={requestsPerDay.toLocaleString()}
        />

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {[
            { label: 'Tokens/request', value: (inputTokens + outputTokens).toLocaleString() },
            { label: 'Requests/month', value: requestsPerMonth.toLocaleString() },
            { label: 'Total tokens/month', value: ((inputTokens + outputTokens) * requestsPerMonth / 1_000_000).toFixed(1) + 'M' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-base font-black font-mono text-zinc-800 dark:text-zinc-100">{s.value}</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Results table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-300 text-left">Model</th>
              <th className="px-4 py-3 font-semibold text-zinc-400 text-left hidden sm:table-cell">Provider</th>
              <th className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 text-right">Est. Monthly Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map(({ model, monthly }, i) => (
              <tr key={model.slug} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'}>
                <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200 whitespace-nowrap">{model.name}</td>
                <td className="px-4 py-3 text-zinc-400 dark:text-zinc-500 hidden sm:table-cell">{model.provider}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                  {fmt(monthly)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 -mt-4">
        Estimates based on static pricing data. Actual costs may vary. See{' '}
        <a href="/" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">the calculator</a> for live pricing.
      </p>
    </div>
  )
}
