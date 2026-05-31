import type { CSSProperties, ReactNode } from 'react'
import './NodeaBannerAd.css'

export const AD_HREF = 'https://nodea.ai'

/** Nodea logo lockup (icon + wordmark). Word colour adapts to the surface via CSS. */
export function AdLogo({ size = 22 }: { size?: number }) {
  return (
    <span className="nd-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/nodea-icon.png" alt="Nodea" width={size} height={size} style={{ display: 'block', width: size, height: size, flex: '0 0 auto' }} />
      <span className="nd-logo-word" style={{ fontSize: size }}>Nodea</span>
    </span>
  )
}

export function AdArrow({ s = 16 }: { s?: number }) {
  return (
    <svg className="nd-arrow" width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * AdFrame — shared 300×600 ad shell. Renders the "Advertisement" disclosure
 * caption and the clickable, rel="sponsored" outbound link around any banner
 * body, so every Nodea house ad carries identical (legally-compliant) labelling.
 */
export default function AdFrame({
  ariaLabel,
  surfaceClassName,
  innerStyle,
  className,
  style,
  children,
}: {
  ariaLabel: string
  /** e.g. "nd-paper nd-dotgrid" or "nd-night nd-dotgrid" */
  surfaceClassName: string
  innerStyle?: CSSProperties
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <figure className={`m-0 flex flex-col items-center gap-1.5 ${className ?? ''}`} style={style}>
      <figcaption className="nd-ad-label">Advertisement</figcaption>
      <a
        href={AD_HREF}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-label={ariaLabel}
        className={`nd-ad ${surfaceClassName} block rounded-2xl no-underline shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-xl`}
        style={{ width: 300, height: 600, display: 'flex', flexDirection: 'column', ...innerStyle }}
      >
        {children}
      </a>
    </figure>
  )
}
