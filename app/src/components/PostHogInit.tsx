'use client'

// Client-side PostHog initializer. Renders nothing; runs once on mount.
// We use this instead of Next 16's instrumentation-client.ts because Vercel's
// build wasn't reliably picking that file up — the SDK was bundled but never
// initialized, so no events fired in production.
//
// Privacy posture:
//   - persistence: 'memory'         → no cookies, no localStorage → no banner needed in most jurisdictions
//   - disable_session_recording     → no DOM replay
//   - autocapture: false            → only the events we explicitly fire from /lib/track
//   - person_profiles: 'identified_only' → anonymous unless someone calls posthog.identify()

import { useEffect } from 'react'
import posthog from 'posthog-js'

export default function PostHogInit() {
  useEffect(() => {
    try {
      const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
      if (!token) return
      // Guard against React strict-mode double invocation
      if ((posthog as unknown as { __loaded?: boolean }).__loaded) return
      posthog.init(token, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        persistence: 'memory',
        disable_session_recording: true,
        autocapture: false,
        capture_pageview: 'history_change',
        capture_pageleave: true,
        person_profiles: 'identified_only',
      })
    } catch (e) {
      // Never let analytics break the app
      // eslint-disable-next-line no-console
      console.warn('[posthog] init failed', e)
    }
  }, [])

  return null
}
