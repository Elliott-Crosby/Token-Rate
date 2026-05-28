// Safe wrapper around posthog.capture so analytics failures never break the UI.
// Use this from any client component instead of importing posthog directly.

import posthog from 'posthog-js'

export type TrackProps = Record<string, string | number | boolean | string[] | number[] | null | undefined>

export function track(event: string, props?: TrackProps): void {
  if (typeof window === 'undefined') return
  try {
    posthog.capture(event, props)
  } catch {
    // Swallow — never let an analytics failure surface to the user
  }
}
