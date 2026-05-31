'use client'

/**
 * NodeaBannerAd — a 300×600 half-page house ad ("A branching AI chat canvas").
 *
 * Faithful port of the `HP_Final` design from the Claude Design handoff bundle
 * (Nodea Banner Ads.html). It is a self-promotional / advertising unit, so it is
 * clearly labelled "Advertisement" and the outbound link is marked rel="sponsored"
 * for FTC / search-engine disclosure compliance.
 */

import { useEffect, useState, type CSSProperties } from 'react'
import './NodeaBannerAd.css'

const AD_HREF = 'https://nodea.ai'

/* Looping-once reveal timeline (mirrors the product's tree-build animation). */
function useSequence(count: number, step: number, start: number): number {
  const [n, setN] = useState(0)
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 0; i < count; i++) {
      timers.push(setTimeout(() => setN(i + 1), start + i * step))
    }
    return () => timers.forEach(clearTimeout)
  }, [count, step, start])
  return n
}

/* B's tree graphic — compact vertical spread so it sits high with room below. */
type TreeNode = { id: string; x: number; y: number; label: string; role: 'user' | 'ai'; active: boolean }
const LBL_V2: { w: number; h: number; nodes: TreeNode[]; edges: [string, string][] } = {
  w: 244,
  h: 188,
  nodes: [
    { id: 'q', x: 122, y: 15, label: 'Launch plan?', role: 'user', active: false },
    { id: 'a', x: 50, y: 74, label: 'Cautious', role: 'ai', active: false },
    { id: 'b', x: 182, y: 74, label: 'Bold', role: 'ai', active: true },
    { id: 'c', x: 116, y: 132, label: 'Viral hook', role: 'ai', active: true },
    { id: 'd', x: 210, y: 132, label: 'Steady', role: 'ai', active: false },
    { id: 'e', x: 116, y: 174, label: 'Ship it ✓', role: 'ai', active: true },
  ],
  edges: [['q', 'a'], ['q', 'b'], ['b', 'c'], ['b', 'd'], ['c', 'e']],
}

/* Light-theme palette for the labeled tree (the "paper" surface). */
const C = {
  edge: '#c7ccd5',
  edgeOn: '#7c3aed',
  userBg: '#ede9fe',
  userBd: '#a78bda',
  userTx: '#5b3da8',
  aiBg: '#ffffff',
  aiBd: '#aab0bb',
  aiTx: '#2a2f3a',
  onBg: '#efe7ff',
  onBd: '#7c3aed',
  onTx: '#6d28d9',
}

/* Labeled node tree — HTML pills over an SVG edge layer; reads as a real
   branching conversation that grows from a single question. */
function LabeledTree({ reveal, fs = 11 }: { reveal: number; fs?: number }) {
  const { w, h, nodes, edges } = LBL_V2
  const idx: Record<string, number> = {}
  nodes.forEach((nd, i) => (idx[nd.id] = i))

  return (
    <div style={{ position: 'relative', width: w, height: h, margin: '0 auto' }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', inset: 0, overflow: 'visible' }} aria-hidden="true">
        {edges.map(([a, b], k) => {
          const p = nodes[idx[a]], n = nodes[idx[b]]
          if (reveal <= Math.max(idx[a], idx[b])) return null
          const on = p.active && n.active
          const my = (p.y + n.y) / 2
          const d = `M ${p.x} ${p.y} C ${p.x} ${my} ${n.x} ${my} ${n.x} ${n.y}`
          return (
            <path
              key={k}
              d={d}
              fill="none"
              stroke={on ? C.edgeOn : C.edge}
              strokeWidth={on ? 2 : 1.5}
            />
          )
        })}
      </svg>
      {nodes.map((nd, i) => {
        if (i >= reveal) return null
        const bg = nd.active ? C.onBg : nd.role === 'user' ? C.userBg : C.aiBg
        const bd = nd.active ? C.onBd : nd.role === 'user' ? C.userBd : C.aiBd
        const tc = nd.active ? C.onTx : nd.role === 'user' ? C.userTx : C.aiTx
        const isLast = i === reveal - 1
        return (
          <div key={nd.id} style={{ position: 'absolute', left: nd.x, top: nd.y, transform: 'translate(-50%,-50%)' }}>
            <div
              className={nd.active && isLast ? 'nd-pill-live' : undefined}
              style={{
                padding: `${Math.round(fs * 0.42)}px ${Math.round(fs * 0.82)}px`,
                borderRadius: 999,
                whiteSpace: 'nowrap',
                lineHeight: 1,
                fontSize: fs,
                fontWeight: nd.active ? 700 : 600,
                background: bg,
                border: `${nd.active ? 1.6 : 1.2}px solid ${bd}`,
                color: tc,
                boxShadow: '0 1px 2px rgba(20,20,40,0.06)',
                ['--ring' as string]: C.onBd,
              }}
            >
              {nd.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Arrow({ s = 16 }: { s?: number }) {
  return (
    <svg className="nd-arrow" width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Chat bubble row — user aligns RIGHT, Claude (Nodea icon) aligns LEFT. */
function ChatRow({ role, who, text }: { role: 'user' | 'ai'; who?: string; text: string }) {
  const isUser = role === 'user'
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row', justifyContent: 'flex-start' }}>
      {isUser ? (
        <div
          style={{
            width: 19, height: 19, borderRadius: '50%', flex: '0 0 auto', display: 'grid', placeItems: 'center',
            fontSize: 8, fontWeight: 700, letterSpacing: '-0.02em', background: '#ede9fe', color: '#6d28d9',
          }}
        >
          {who}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/nodea-icon.png" alt="" width={19} height={19} style={{ width: 19, height: 19, flex: '0 0 auto', display: 'block' }} />
      )}
      <div
        style={{
          fontSize: 10.5, lineHeight: 1.4, padding: '6px 9px', borderRadius: 9, maxWidth: 184,
          background: isUser ? '#ede9fe' : '#ffffff',
          border: `1px solid ${isUser ? '#c4b5fd' : '#e2e5ea'}`,
          color: '#1a1d23',
        }}
      >
        {text}
      </div>
    </div>
  )
}

export default function NodeaBannerAd({ className, style }: { className?: string; style?: CSSProperties }) {
  const reveal = useSequence(LBL_V2.nodes.length, 400, 700)

  return (
    <figure className={`m-0 flex flex-col items-center gap-1.5 ${className ?? ''}`} style={style}>
      <figcaption className="nd-ad-label">Advertisement</figcaption>

      <a
        href={AD_HREF}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-label="Advertisement: Nodea — a branching AI chat canvas. Open a canvas, free. Opens in a new tab."
        className="nd-ad nd-paper nd-dotgrid block rounded-2xl no-underline shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-xl"
        style={{
          width: 300,
          height: 600,
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 0 1px var(--nd-border)',
        }}
      >
        {/* Logo + eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="nd-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nodea-icon.png" alt="Nodea" width={22} height={22} style={{ display: 'block', width: 22, height: 22, flex: '0 0 auto' }} />
            <span className="nd-logo-word" style={{ fontSize: 22 }}>Nodea</span>
          </span>
          <span className="nd-eyebrow" style={{ fontSize: 9, letterSpacing: '.14em', whiteSpace: 'nowrap' }}>
            Branching AI chat
          </span>
        </div>

        {/* Headline */}
        <h2 className="nd-h" style={{ fontSize: 29, marginTop: 12, color: 'var(--nd-ink)', lineHeight: 1.07 }}>
          A <em>branching</em>
          <br />
          AI chat canvas.
        </h2>

        {/* Chat exchange → branch prompt */}
        <div style={{ marginTop: 13, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <ChatRow role="user" who="JA" text="How should we launch?" />
          <ChatRow role="ai" text="A cautious plan — or a bolder one?" />
          <div
            style={{
              display: 'flex', gap: 6, margin: '1px 0 0 26px',
              fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em', color: 'var(--nd-accent)',
            }}
          >
            ↳ branch the reply
          </div>
        </div>

        {/* Branching tree */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'flex-start', marginTop: 8 }}>
          <div style={{ width: '100%', height: 188 }}>
            <LabeledTree reveal={reveal} fs={11} />
          </div>
        </div>

        {/* CTA + footer */}
        <span className="nd-cta nd-cta-solid nd-cta-pulse" style={{ padding: '13px 20px', fontSize: 15 }}>
          Open a canvas — free
          <Arrow s={16} />
        </span>
        <div className="nd-foot" style={{ fontSize: 11.5, marginTop: 10, textAlign: 'center' }}>
          Free during beta · No credit card · nodea.ai
        </div>
      </a>
    </figure>
  )
}
