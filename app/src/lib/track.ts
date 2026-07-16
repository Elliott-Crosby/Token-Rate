// Safe wrapper around analytics so failures never break the UI. Every event is
// mirrored to BOTH PostHog and Google Analytics 4 (gtag), so calculator usage
// shows up as a GA4 event that can be marked as a Key event (conversion).
// Use this from any client component instead of importing posthog/gtag directly.

import posthog from 'posthog-js'

export type TrackProps = Record<string, string | number | boolean | string[] | number[] | null | undefined>

declare global {
  interface Window {
    // Defined globally by the GA init snippet in app/layout.tsx.
    gtag?: (command: 'event', eventName: string, params?: Record<string, unknown>) => void
  }
}

// GA4 event params must be scalars — arrays get dropped/mangled. Flatten arrays
// to comma-joined strings and strip null/undefined so events stay clean.
function forGa(props?: TrackProps): Record<string, string | number | boolean> | undefined {
  if (!props) return undefined
  const out: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined) continue
    out[key] = Array.isArray(value) ? value.join(',') : value
  }
  return out
}

export function track(event: string, props?: TrackProps): void {
  if (typeof window === 'undefined') return
  try {
    posthog.capture(event, props)
  } catch {
    // Swallow — never let an analytics failure surface to the user
  }
  try {
    window.gtag?.('event', event, forGa(props))
  } catch {
    // Swallow — GA must never break the UI either
  }
}
