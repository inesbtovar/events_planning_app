// components/templates/TemplateRustic.tsx
// Design: Warm countryside — cream paper, hand-drawn botanical SVGs, earthy palette, feels printed

type Event = {
  name: string
  date: string
  location: string
  description: string
  cover_image: string | null
  template_config: any
  slug: string
}

// Inline botanical SVG divider — hand-drawn feel
function BotanicalDivider({ color = '#7A6040' }: { color?: string }) {
  return (
    <svg width="280" height="32" viewBox="0 0 280 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
      {/* Central stem */}
      <path d="M60 16 Q140 14 220 16" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
      {/* Left leaves */}
      <path d="M100 16 Q95 8 88 10 Q94 12 100 16" stroke={color} strokeWidth="0.7" fill="none" opacity="0.5"/>
      <path d="M85 16 Q78 9 70 12 Q78 13 85 16" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4"/>
      <path d="M110 16 Q107 22 100 21 Q106 18 110 16" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4"/>
      {/* Right leaves */}
      <path d="M180 16 Q185 8 192 10 Q186 12 180 16" stroke={color} strokeWidth="0.7" fill="none" opacity="0.5"/>
      <path d="M195 16 Q202 9 210 12 Q202 13 195 16" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4"/>
      <path d="M170 16 Q173 22 180 21 Q174 18 170 16" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4"/>
      {/* Center diamond */}
      <rect x="137" y="13" width="6" height="6" transform="rotate(45 140 16)" stroke={color} strokeWidth="0.8" fill="none" opacity="0.7"/>
      {/* Small dots */}
      <circle cx="120" cy="16" r="1.5" fill={color} opacity="0.3"/>
      <circle cx="160" cy="16" r="1.5" fill={color} opacity="0.3"/>
    </svg>
  )
}

function LeafCorner({ color = '#7A6040', flip = false }: { color?: string, flip?: boolean }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M8 56 Q8 8 56 8" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.4"/>
      <path d="M8 40 Q20 30 28 20" stroke={color} strokeWidth="0.7" strokeLinecap="round" opacity="0.3"/>
      <path d="M20 8 Q28 18 38 24" stroke={color} strokeWidth="0.7" strokeLinecap="round" opacity="0.3"/>
      <path d="M16 48 Q12 38 18 30 Q20 40 16 48" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4"/>
      <path d="M40 14 Q48 18 46 26 Q42 20 40 14" stroke={color} strokeWidth="0.7" fill="none" opacity="0.4"/>
      <circle cx="14" cy="50" r="1.5" fill={color} opacity="0.3"/>
      <circle cx="50" cy="14" r="1.5" fill={color} opacity="0.3"/>
    </svg>
  )
}

export default function TemplateRustic({ event }: { event: Event }) {
  const config = event.template_config || {}
  const brown = '#5C4228'
  const muted = '#8B6F47'
  const accent = config.accentColor || '#8B5E3C'

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString('pt-PT', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    : null
  const eventTime = event.date
    ? new Date(event.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5EFE3',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      backgroundImage: `
        url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"),
        linear-gradient(160deg, #F8F2E6 0%, #F0E8D5 50%, #EDE0C8 100%)
      `,
    }}>

      {/* Outer border frame */}
      <div style={{ margin: '20px', border: `1px solid rgba(122,96,64,0.25)`, borderRadius: '2px', minHeight: 'calc(100vh - 40px)' }}>
        <div style={{ margin: '8px', border: `1px solid rgba(122,96,64,0.15)`, borderRadius: '1px', minHeight: 'calc(100vh - 56px)', padding: '48px 32px' }}>

          {/* Corner botanicals */}
          <div style={{ position: 'absolute', top: '28px', left: '28px', opacity: 0.7 }}><LeafCorner color={muted} /></div>
          <div style={{ position: 'absolute', top: '28px', right: '28px', opacity: 0.7 }}><LeafCorner color={muted} flip /></div>

          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>

            <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: muted, marginBottom: '20px', opacity: 0.8 }}>
              Com alegria anunciamos
            </p>

            <BotanicalDivider color={muted} />

            <div style={{ margin: '32px 0' }}>
              {config.coupleNames && (
                <p style={{ fontSize: '16px', color: muted, marginBottom: '8px', fontStyle: 'italic' }}>
                  {config.coupleNames}
                </p>
              )}
              <h1 style={{
                fontSize: 'clamp(40px, 7vw, 72px)',
                fontWeight: '400',
                color: brown,
                lineHeight: 1.1,
                fontStyle: 'italic',
                letterSpacing: '-0.5px',
                marginBottom: '8px',
              }}>
                {config.headline || event.name}
              </h1>
              {config.subtitle && (
                <p style={{ fontSize: '16px', color: muted, fontStyle: 'italic', marginTop: '8px' }}>
                  {config.subtitle}
                </p>
              )}
            </div>

            <BotanicalDivider color={muted} />
          </div>

          {/* Cover image */}
          {event.cover_image && (
            <div style={{ maxWidth: '520px', margin: '40px auto', position: 'relative' }}>
              <div style={{ border: `6px solid #F5EFE3`, boxShadow: `0 0 0 1px rgba(122,96,64,0.2), 0 8px 32px rgba(92,66,40,0.15)` }}>
                <img src={event.cover_image} alt={event.name} style={{ width: '100%', display: 'block', filter: 'sepia(10%) contrast(1.02)' }} />
              </div>
            </div>
          )}

          {/* Details */}
          <div style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center' }}>

            {event.description && (
              <p style={{ fontSize: '16px', lineHeight: 1.9, color: muted, fontStyle: 'italic', marginBottom: '40px' }}>
                &ldquo;{event.description}&rdquo;
              </p>
            )}

            {/* Date & location card */}
            {(eventDate || event.location) && (
              <div style={{
                border: `1px solid rgba(122,96,64,0.3)`,
                borderRadius: '2px',
                padding: '32px',
                background: 'rgba(255,255,255,0.45)',
                position: 'relative',
              }}>
                {/* Card corner accents */}
                {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h]) => (
                  <div key={`${v}${h}`} style={{
                    position: 'absolute', [v]: '-1px', [h]: '-1px',
                    width: '12px', height: '12px',
                    borderTop: v === 'top' ? `2px solid ${muted}` : 'none',
                    borderBottom: v === 'bottom' ? `2px solid ${muted}` : 'none',
                    borderLeft: h === 'left' ? `2px solid ${muted}` : 'none',
                    borderRight: h === 'right' ? `2px solid ${muted}` : 'none',
                    opacity: 0.5,
                  }} />
                ))}

                {eventDate && (
                  <div style={{ marginBottom: event.location ? '24px' : 0 }}>
                    <p style={{ fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>Data</p>
                    <p style={{ fontSize: '16px', color: brown, textTransform: 'capitalize', fontStyle: 'italic' }}>{eventDate}</p>
                    {eventTime && eventTime !== '00:00' && (
                      <p style={{ fontSize: '13px', color: muted, marginTop: '4px' }}>às {eventTime}</p>
                    )}
                  </div>
                )}

                {eventDate && event.location && (
                  <div style={{ width: '40px', height: '1px', background: `rgba(122,96,64,0.3)`, margin: '0 auto 24px' }} />
                )}

                {event.location && (
                  <div>
                    <p style={{ fontSize: '9px', letterSpacing: '0.35em', textTransform: 'uppercase', color: accent, marginBottom: '8px' }}>Local</p>
                    <p style={{ fontSize: '15px', color: brown, fontStyle: 'italic' }}>{event.location}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer botanical */}
          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <BotanicalDivider color={muted} />
            <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: muted, marginTop: '20px', opacity: 0.5 }}>
              EventsDock
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
