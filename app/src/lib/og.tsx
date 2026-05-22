import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

interface OGCardProps {
  title: string
  subtitle?: string
  eyebrow?: string
  badges?: string[]
}

export function renderOGCard({ title, subtitle, eyebrow, badges }: OGCardProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 0% 0%, rgba(16,185,129,0.18) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(56,189,248,0.14) 0%, transparent 50%)',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            height: 6,
            width: '100%',
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #38bdf8 100%)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 56, flex: 1 }}>
          {eyebrow ? (
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#10b981',
                fontWeight: 700,
              }}
            >
              {eyebrow}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              fontSize: title.length > 50 ? 60 : 72,
              fontWeight: 900,
              color: '#fafafa',
              lineHeight: 1.05,
              marginTop: eyebrow ? 24 : 0,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                display: 'flex',
                fontSize: 30,
                color: '#a1a1aa',
                marginTop: 28,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          ) : null}

          {badges && badges.length > 0 ? (
            <div style={{ display: 'flex', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
              {badges.map((b) => (
                <div
                  key={b}
                  style={{
                    display: 'flex',
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.35)',
                    color: '#6ee7b7',
                    fontSize: 22,
                    fontWeight: 600,
                  }}
                >
                  {b}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#10b981', letterSpacing: '-0.02em' }}>Token</span>
            <span style={{ fontSize: 32, fontWeight: 900, color: '#fafafa', letterSpacing: '-0.02em' }}>Rate</span>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: '#71717a' }}>tokenrate.dev</div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  )
}
