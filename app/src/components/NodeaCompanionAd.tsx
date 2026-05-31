'use client'

/**
 * NodeaCompanionAd — a 300×600 dark "Midnight" house ad ("Why settle for one
 * answer?"). Faithful port of `HP_Companion` from the Claude Design handoff
 * bundle: a single prompt forks into two answer cards weighed side by side,
 * with the winner checked. Bookends the light NodeaBannerAd on the opposite rail.
 */

import { useEffect, useState, type CSSProperties } from 'react'
import AdFrame, { AdLogo, AdArrow } from './AdFrame'

function AnswerCard({
  tag,
  title,
  lines,
  win = false,
  show = true,
  delay = 0,
}: {
  tag: string
  title: string
  lines: string[]
  win?: boolean
  show?: boolean
  delay?: number
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 12,
        padding: '13px 13px 15px',
        background: win ? 'rgba(196,181,253,0.16)' : 'rgba(255,255,255,0.05)',
        border: `1.4px solid ${win ? '#c4b5fd' : 'rgba(255,255,255,0.14)'}`,
        boxShadow: win ? '0 0 0 4px rgba(196,181,253,0.10)' : 'none',
        position: 'relative',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity .45s ease ${delay}ms, transform .45s ease ${delay}ms`,
      }}
    >
      {win && (
        <span
          style={{
            position: 'absolute', top: -9, right: -8, width: 21, height: 21, borderRadius: '50%',
            background: '#c4b5fd', color: '#1c1033', display: 'grid', placeItems: 'center',
            fontSize: 11, fontWeight: 800, boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
          }}
        >
          ✓
        </span>
      )}
      <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: win ? '#c4b5fd' : 'rgba(255,255,255,0.45)' }}>
        {tag}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.02em', color: '#fff', marginTop: 5 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 11 }}>
        {lines.map((w, i) => (
          <span key={i} style={{ height: 5, width: w, borderRadius: 4, background: win ? 'rgba(196,181,253,0.55)' : 'rgba(255,255,255,0.16)' }} />
        ))}
      </div>
    </div>
  )
}

export default function NodeaCompanionAd({ className, style }: { className?: string; style?: CSSProperties }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const ts = [
      setTimeout(() => setStep(1), 400), // prompt
      setTimeout(() => setStep(2), 900), // both cards fork in
      setTimeout(() => setStep(3), 1700), // winner chosen
    ]
    return () => ts.forEach(clearTimeout)
  }, [])

  return (
    <AdFrame
      ariaLabel="Advertisement: Nodea — why settle for one answer? Branch the reply and explore every option, then keep the best. Open a canvas, free. Opens in a new tab."
      surfaceClassName="nd-night nd-dotgrid"
      innerStyle={{ padding: '26px 24px' }}
      className={className}
      style={style}
    >
      {/* Logo + eyebrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <AdLogo size={22} />
        <span className="nd-eyebrow" style={{ fontSize: 9, letterSpacing: '.14em', whiteSpace: 'nowrap' }}>
          Branching AI chat
        </span>
      </div>

      {/* headline + sub + diagram travel together as one group, anchored toward the top */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', marginTop: 20 }}>
        <h2 className="nd-h" style={{ fontSize: 31, lineHeight: 1.04 }}>
          Why settle for
          <br />
          one <em>answer?</em>
        </h2>
        <p className="nd-sub" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 11 }}>
          Ask once. Branch the reply and explore every option in parallel — then keep the best.
        </p>

        {/* fork visual: one prompt → two answer cards weighed side by side */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                fontSize: 11.5, fontWeight: 700, color: '#fff', padding: '8px 15px', borderRadius: 999,
                background: 'rgba(196,181,253,0.16)', border: '1.4px solid rgba(196,181,253,0.5)',
                opacity: step >= 1 ? 1 : 0, transition: 'opacity .4s ease',
              }}
            >
              “Draft our launch”
            </div>
          </div>

          <svg width="100%" height="46" viewBox="0 0 252 46" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
            <path d="M126 2 C126 28 62 16 62 44" fill="none" stroke={step >= 2 ? '#c4b5fd' : 'rgba(255,255,255,0.18)'} strokeWidth="1.6" style={{ transition: 'stroke .4s ease' }} />
            <path d="M126 2 C126 28 190 16 190 44" fill="none" stroke={step >= 2 ? '#c4b5fd' : 'rgba(255,255,255,0.18)'} strokeWidth="1.6" style={{ transition: 'stroke .4s ease' }} />
          </svg>

          <div style={{ display: 'flex', gap: 13, alignItems: 'stretch' }}>
            <AnswerCard tag="Path A" title="Cautious" lines={['100%', '76%', '88%', '64%']} show={step >= 2} delay={0} />
            <AnswerCard tag="Path B" title="Bold" lines={['100%', '84%', '70%', '90%']} win={step >= 3} show={step >= 2} delay={120} />
          </div>
        </div>
      </div>

      {/* CTA + footer */}
      <span className="nd-cta nd-cta-lav nd-cta-pulse" style={{ padding: '13px 20px', fontSize: 15 }}>
        Open a canvas — free
        <AdArrow s={16} />
      </span>
      <div className="nd-foot" style={{ fontSize: 11.5, marginTop: 11, textAlign: 'center' }}>
        Free during beta · No credit card · nodea.ai
      </div>
    </AdFrame>
  )
}
