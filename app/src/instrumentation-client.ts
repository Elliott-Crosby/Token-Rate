// Client-side instrumentation hook (Next.js 15.3+ / 16).
// Runs once, after HTML loads and before React hydration.
// Keep total init under ~16ms to avoid Next.js dev warnings.
//
// Privacy posture:
//   - persistence: 'memory'         → no cookies, no localStorage → no cookie banner required in most jurisdictions
//   - disable_session_recording     → no DOM replay, no PII capture
//   - autocapture: false            → only the events we explicitly fire from /lib/track
//   - person_profiles: identified_only → anonymous events stay anonymous

import posthog from 'posthog-js'

try {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  if (token && typeof window !== 'undefined') {
    posthog.init(token, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      persistence: 'memory',
      disable_session_recording: true,
      autocapture: false,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      person_profiles: 'identified_only',
    })
  }
} catch (e) {
  // Analytics must never break the app
  // eslint-disable-next-line no-console
  console.warn('[posthog] init failed', e)
}
