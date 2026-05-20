'use client'

import type { InputMode } from '@/lib/types'

interface InputPanelProps {
  activeMode: InputMode | null
  values: Record<InputMode, string>
  onChange: (mode: InputMode, value: string) => void
  onClear: () => void
}

const INPUTS: { mode: InputMode; label: string; prefix: string; placeholder: string }[] = [
  { mode: 'money', label: 'Money', prefix: '$', placeholder: '1.00' },
  { mode: 'tokens', label: 'Tokens', prefix: '#', placeholder: '1,000,000' },
  { mode: 'characters', label: 'Characters', prefix: 'Aa', placeholder: '4,000,000' },
]

export default function InputPanel({ activeMode, values, onChange, onClear }: InputPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter a value in any one field — the others calculate automatically after you hit{' '}
          <span className="text-zinc-700 dark:text-zinc-300 font-medium">Calculate</span>.
        </p>
        {activeMode !== null && (
          <button
            onClick={onClear}
            className="text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors underline underline-offset-2 shrink-0 ml-4"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {INPUTS.map(({ mode, label, prefix, placeholder }) => {
          const isDisabled = activeMode !== null && activeMode !== mode
          const isActive = activeMode === mode

          return (
            <div
              key={mode}
              className={`flex flex-col gap-2 transition-opacity duration-150 ${
                isDisabled ? 'opacity-35 pointer-events-none select-none' : ''
              }`}
            >
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {label}
              </label>
              <div
                className={`relative flex items-center rounded-lg border transition-all duration-150 ${
                  isActive
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-zinc-800'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                } ${isDisabled ? 'bg-zinc-50 dark:bg-zinc-900' : ''}`}
              >
                <span
                  className={`flex items-center justify-center w-10 shrink-0 text-sm font-mono border-r h-full py-3 ${
                    isActive
                      ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {prefix}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={values[mode]}
                  disabled={isDisabled}
                  placeholder={placeholder}
                  onChange={(e) => onChange(mode, e.target.value)}
                  className={`flex-1 bg-transparent px-3 py-3 text-base font-mono outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-600 ${
                    isDisabled
                      ? 'cursor-not-allowed text-zinc-400 dark:text-zinc-600'
                      : 'text-zinc-800 dark:text-zinc-100'
                  }`}
                />
                {isActive && values[mode] && (
                  <button
                    onClick={onClear}
                    className="mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    aria-label="Clear"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1 1l8 8M9 1L1 9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
