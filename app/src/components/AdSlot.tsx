'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const CLIENT_ID = 'ca-pub-8739160864788471'

type Format = 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'

type AdSlotProps = {
  slot: string | undefined
  format?: Format
  responsive?: boolean
  layout?: string
  className?: string
  style?: React.CSSProperties
}

export default function AdSlot({
  slot,
  format = 'auto',
  responsive = true,
  layout,
  className,
  style,
}: AdSlotProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (!slot || pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // adsbygoogle script not loaded yet or blocked — silently no-op
    }
  }, [slot])

  if (!slot) return null

  return (
    <ins
      className={`adsbygoogle block ${className ?? ''}`}
      style={{ display: 'block', ...style }}
      data-ad-client={CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  )
}
