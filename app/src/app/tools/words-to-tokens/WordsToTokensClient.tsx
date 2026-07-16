'use client'

import { useState, useMemo, useEffect } from 'react'
import { ALL_MODELS } from '@/lib/models'
import { track } from '@/lib/track'

const CHARS_PER_TOKEN = 4

function estimateTokens(text: string): number {
  return Math.round(text.length / CHARS_PER_TOKEN)
}

const MODELS_TO_SHOW = ALL_MODELS.filter((m) =>
  ['claude-sonnet-4', 'claude-haiku-4', 'gpt-4o', 'gpt-4o-mini', 'gemini-2-5-pro', 'gemini-2-0-flash'].includes(m.slug)
)

export default function WordsToTokensClient() {
  const [text, setText] = useState('')

  const tokens = useMemo(() => estimateTokens(text), [text])
  const words = useMemo(() => (text.trim() ? text.trim().split(/\s+/).length : 0), [text])
  const chars = text.length

  // Debounced — one "calculation" event per settled paste, not per keystroke.
  useEffect(() => {
    if (tokens === 0) return
    const id = setTimeout(() => {
      track('value_entered', { tool: 'words_to_tokens', mode: 'characters', value: tokens })
    }, 1000)
    return () => clearTimeout(id)
  }, [tokens])

  return (
    <div className="flex flex-col gap-6">
      {/* Text area */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Paste your text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste any text here — emails, prompts, articles, code..."
          rows={8}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-y transition-all"
        />
        {text && (
          <button
            onClick={() => setText('')}
            className="self-end text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Characters', value: chars.toLocaleString(), color: 'text-zinc-700 dark:text-zinc-200' },
          { label: 'Words', value: words.toLocaleString(), color: 'text-zinc-700 dark:text-zinc-200' },
          { label: 'Tokens (est.)', value: tokens.toLocaleString(), color: 'text-emerald-600 dark:text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center">
            <span className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Cost table */}
      {tokens > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Estimated Input Cost ({tokens.toLocaleString()} tokens)
          </p>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-4 py-2.5 font-semibold text-zinc-700 dark:text-zinc-300 text-left">Model</th>
                  <th className="px-4 py-2.5 font-semibold text-emerald-700 dark:text-emerald-400 text-right">Input Cost</th>
                  <th className="px-4 py-2.5 font-semibold text-sky-700 dark:text-sky-400 text-right">Output Cost*</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {MODELS_TO_SHOW.map((m, i) => {
                  const inputCost = (tokens * m.inputPricePerMillion) / 1_000_000
                  const outputCost = (tokens * 0.5 * m.outputPricePerMillion) / 1_000_000
                  const fmt = (n: number) => {
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
                  return (
                    <tr key={m.slug} className={i % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50/60 dark:bg-zinc-800/30'}>
                      <td className="px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                        {m.name}
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-2">{m.provider}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400">{fmt(inputCost)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sky-700 dark:text-sky-400">{fmt(outputCost)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            *Output cost estimated at 50% of input token count. Actual output varies by prompt and model.
          </p>
        </div>
      )}
    </div>
  )
}
