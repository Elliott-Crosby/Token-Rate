import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getModelBySlug } from './models'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

// ── Brand tokens ─────────────────────────────────────────────
// Mirrors the live site's Tailwind zinc / emerald / sky palette so the social
// card reads as the same product a visitor lands on.
const C = {
  bg: '#09090b', // zinc-950
  ink: '#fafafa', // zinc-50
  muted: '#a1a1aa', // zinc-400
  faint: '#8a8a93', // lifted zinc-500 for legibility on near-black
  line: 'rgba(255,255,255,0.10)',
  panel: 'rgba(255,255,255,0.035)',
  emerald: '#10b981', // emerald-500
  emeraldLt: '#34d399', // emerald-400
  emeraldTx: '#6ee7b7', // emerald-300
  sky: '#38bdf8', // sky-400
}

const SANS = 'Geist'
const MONO = 'Geist Mono'

// Full-bleed background glows (proven Satori-safe: plain layered background-image
// on a single root, no absolute layers).
const GLOWS =
  'radial-gradient(circle at 4% -8%, rgba(16,185,129,0.22) 0%, transparent 40%), radial-gradient(circle at 106% 112%, rgba(56,189,248,0.18) 0%, transparent 46%)'
const TOP_BAR = 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #38bdf8 100%)'

// ── Assets (fonts + real logo mark), read once and memoised ──
// Node runtime + `process.cwd()` is the Next-sanctioned way to load local OG
// assets; next.config traces `assets/fonts` + the icon for production.
type OGFont = {
  name: string
  data: Buffer
  weight: 400 | 500 | 600 | 700 | 900
  style: 'normal'
}

let assetsPromise: Promise<{ fonts: OGFont[]; iconSrc: string }> | null = null

async function readAssets() {
  const fonts = join(process.cwd(), 'assets', 'fonts')
  const [reg, bold, black, monoMed, monoSemi, icon] = await Promise.all([
    readFile(join(fonts, 'Geist-Regular.ttf')),
    readFile(join(fonts, 'Geist-Bold.ttf')),
    readFile(join(fonts, 'Geist-Black.ttf')),
    readFile(join(fonts, 'GeistMono-Medium.ttf')),
    readFile(join(fonts, 'GeistMono-SemiBold.ttf')),
    readFile(join(process.cwd(), 'src', 'app', 'icon.png')),
  ])
  return {
    fonts: [
      { name: SANS, data: reg, weight: 400, style: 'normal' },
      { name: SANS, data: bold, weight: 700, style: 'normal' },
      { name: SANS, data: black, weight: 900, style: 'normal' },
      { name: MONO, data: monoMed, weight: 500, style: 'normal' },
      { name: MONO, data: monoSemi, weight: 600, style: 'normal' },
    ] as OGFont[],
    iconSrc: `data:image/png;base64,${icon.toString('base64')}`,
  }
}

function getAssets() {
  if (!assetsPromise) {
    assetsPromise = readAssets().catch((err) => {
      // Never cache a failure — a transient miss shouldn't poison every card.
      assetsPromise = null
      throw err
    })
  }
  return assetsPromise
}

// ── Shared chrome (each helper returns ONE plain <div> — no fragments) ──
function header(iconSrc: string, live: boolean) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt=""
          width={52}
          height={52}
          style={{ borderRadius: 999, marginRight: 16, border: '1px solid rgba(255,255,255,0.10)' }}
        />
        {/* Satori inserts a fixed gap between adjacent text runs; pull the second
            color run back so the two-tone wordmark reads as one word "TokenRate". */}
        <span style={{ fontSize: 31, fontWeight: 900, color: C.emerald, letterSpacing: '-0.02em' }}>Token</span>
        <span style={{ fontSize: 31, fontWeight: 900, color: C.ink, letterSpacing: '-0.02em', marginLeft: -9 }}>
          Rate
        </span>
      </div>
      {live ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '9px 18px',
            borderRadius: 999,
            background: 'rgba(16,185,129,0.10)',
            border: '1px solid rgba(16,185,129,0.35)',
          }}
        >
          <div
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              marginRight: 11,
              background: C.emeraldLt,
              boxShadow: '0 0 0 4px rgba(16,185,129,0.22)',
            }}
          />
          <span style={{ fontSize: 20, fontWeight: 700, color: C.emeraldTx, letterSpacing: '0.01em' }}>
            Prices updated daily
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex' }} />
      )}
    </div>
  )
}

function footer(left: string) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 21, color: C.faint }}>{left}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 21, fontWeight: 700 }}>
        <span style={{ color: C.emerald }}>token</span>
        <span style={{ color: C.muted, marginLeft: -6 }}>rate.dev</span>
      </div>
    </div>
  )
}

// ── The generic content card (models / compare / providers / blog) ──
interface OGCardProps {
  title: string
  subtitle?: string
  eyebrow?: string
  badges?: string[]
  /** Show the "Prices updated daily" pill. Defaults on — it's the brand wedge. */
  live?: boolean
}

export async function renderOGCard({
  title,
  subtitle,
  eyebrow,
  badges,
  live = true,
}: OGCardProps): Promise<ImageResponse> {
  const { fonts, iconSrc } = await getAssets()

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: C.bg,
          backgroundImage: GLOWS,
          padding: '54px 64px 48px',
          fontFamily: SANS,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: OG_SIZE.width, height: 6, background: TOP_BAR }} />

        {header(iconSrc, live)}

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          {eyebrow ? (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.emeraldLt,
                fontWeight: 700,
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              fontSize: title.length > 46 ? 58 : 70,
              fontWeight: 900,
              color: C.ink,
              lineHeight: 1.05,
              marginTop: eyebrow ? 22 : 0,
              letterSpacing: '-0.025em',
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                display: 'flex',
                fontSize: 29,
                color: C.muted,
                marginTop: 26,
                lineHeight: 1.35,
              }}
            >
              {subtitle}
            </div>
          ) : null}

          {badges && badges.length > 0 ? (
            <div style={{ display: 'flex', marginTop: 34, flexWrap: 'wrap' }}>
              {badges.map((b) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginRight: 12,
                    marginBottom: 12,
                    padding: '9px 17px',
                    borderRadius: 11,
                    background: 'rgba(16,185,129,0.10)',
                    border: '1px solid rgba(16,185,129,0.30)',
                  }}
                >
                  <div
                    style={{ width: 7, height: 7, borderRadius: 999, marginRight: 9, background: C.emeraldLt }}
                  />
                  <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500, color: C.emeraldTx }}>{b}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {footer('AI token calculator · live pricing comparison')}
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}

// ── The homepage "site thumbnail": a live price board ────────
// Recognisable flagships spanning the price range, priced from the live-updated
// catalogue so the numbers on the card are the numbers on the site.
const BOARD_SLUGS = ['claude-sonnet-5', 'gpt-4o', 'gemini-2-5-pro', 'llama-4-maverick']

function fmtPrice(n: number): string {
  return '$' + n.toFixed(2)
}

export async function renderPriceBoardCard(): Promise<ImageResponse> {
  const { fonts, iconSrc } = await getAssets()

  const board = BOARD_SLUGS.map((slug) => getModelBySlug(slug)).filter(
    (m): m is NonNullable<typeof m> => Boolean(m),
  )

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: C.bg,
          backgroundImage: GLOWS,
          padding: '54px 64px 48px',
          fontFamily: SANS,
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: OG_SIZE.width, height: 6, background: TOP_BAR }} />

        {header(iconSrc, true)}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 21,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: C.emeraldLt,
                fontWeight: 700,
              }}
            >
              AI Token Calculator
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 54,
                fontWeight: 900,
                color: C.ink,
                lineHeight: 1.03,
                letterSpacing: '-0.03em',
                marginTop: 15,
                maxWidth: 820,
              }}
            >
              See what any AI model actually costs.
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 27,
                color: C.muted,
                marginTop: 17,
                lineHeight: 1.3,
                maxWidth: 820,
              }}
            >
              Convert money, tokens & characters across 200+ models.
            </div>
          </div>

          {/* price board */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 30,
              padding: '20px 30px 24px',
              borderRadius: 20,
              background: C.panel,
              border: `1px solid ${C.line}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 8, height: 8, borderRadius: 999, marginRight: 10, background: C.emeraldLt }} />
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 17,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  color: C.faint,
                }}
              >
                LIVE PRICE · $ PER 1M INPUT TOKENS
              </span>
            </div>

            <div style={{ display: 'flex' }}>
              {board.map((m, i) => (
                <div
                  key={m.slug}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    paddingLeft: i === 0 ? 0 : 28,
                    borderLeft: i === 0 ? 'none' : `1px solid ${C.line}`,
                  }}
                >
                  <span style={{ fontSize: 21, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>{m.name}</span>
                  <span
                    style={{ fontFamily: MONO, fontSize: 37, fontWeight: 600, color: C.emeraldLt, marginTop: 8 }}
                  >
                    {fmtPrice(m.inputPricePerMillion)}
                  </span>
                  <span style={{ fontSize: 18, color: C.faint, marginTop: 6 }}>{m.provider}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {footer('Money, tokens & characters · live data from OpenRouter')}
      </div>
    ),
    { ...OG_SIZE, fonts },
  )
}
