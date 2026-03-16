// components/templates/TemplateModern.tsx
// Design: Editorial/magazine — stark black & white, massive type, asymmetric, graphic impact

type Event = {
  name: string
  date: string
  location: string
  description: string
  cover_image: string | null
  template_config: any
  slug: string
}

export default function TemplateModern({ event }: { event: Event }) {
  const config = event.template_config || {}
  const accent = config.accentColor || '#FF3B00'

  const eventDate = event.date
    ? new Date(event.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })
    : null
  const eventDay = event.date
    ? new Date(event.date).toLocaleDateString('pt-PT', { weekday: 'long' })
    : null
  const eventTime = event.date
    ? new Date(event.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : null

  // Split event name for dramatic stagger
  const words = (config.headline || event.name).split(' ')

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif", color: '#F5F5F0' }}>

      {/* Top bar */}
      <div style={{ borderBottom: `2px solid ${accent}`, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.4)' }}>
          Invitation
        </span>
        {eventDate && (
          <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.4)' }}>
            {eventDate}
          </span>
        )}
      </div>

      {/* Hero — asymmetric split */}
      <div style={{ display: 'grid', gridTemplateColumns: event.cover_image ? '1fr 1fr' : '1fr', minHeight: 'calc(100vh - 45px)' }}>

        {/* Left: massive typography */}
        <div style={{ padding: 'clamp(40px, 6vw, 80px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: event.cover_image ? `1px solid rgba(255,255,255,0.08)` : 'none' }}>

          <div>
            {config.coupleNames && (
              <p style={{ fontSize: '11px', letterSpacing: '0.4em', textTransform: 'uppercase', color: accent, marginBottom: '32px' }}>
                {config.coupleNames}
              </p>
            )}

            {/* Staggered words */}
            <div style={{ marginBottom: '40px' }}>
              {words.map((word: string, i: number) => (
                <div key={i} style={{
                  fontSize: 'clamp(52px, 8vw, 96px)',
                  fontWeight: '900',
                  lineHeight: 0.9,
                  textTransform: 'uppercase',
                  letterSpacing: '-2px',
                  paddingLeft: i % 2 === 1 ? 'clamp(24px, 4vw, 48px)' : '0',
                  color: i === 0 ? '#F5F5F0' : i === 1 ? `rgba(245,245,240,0.7)` : `rgba(245,245,240,0.4)`,
                  marginBottom: '4px',
                }}>
                  {word}
                </div>
              ))}
            </div>

            {config.subtitle && (
              <p style={{ fontSize: '16px', color: 'rgba(245,245,240,0.5)', fontFamily: "'Helvetica Neue', sans-serif", fontWeight: '300', maxWidth: '380px', lineHeight: 1.6, marginBottom: '32px' }}>
                {config.subtitle}
              </p>
            )}
          </div>

          {/* Bottom details */}
          <div>
            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '32px' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
              {eventDay && eventDate && (
                <div>
                  <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: accent, marginBottom: '6px' }}>Quando</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{eventDay}</p>
                  <p style={{ fontSize: '13px', color: 'rgba(245,245,240,0.5)', fontFamily: "'Helvetica Neue', sans-serif", fontWeight: '300', marginTop: '2px' }}>{eventDate}</p>
                  {eventTime && eventTime !== '00:00' && (
                    <p style={{ fontSize: '12px', color: 'rgba(245,245,240,0.35)', fontFamily: "'Helvetica Neue', sans-serif", marginTop: '2px' }}>{eventTime}</p>
                  )}
                </div>
              )}
              {event.location && (
                <div>
                  <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: accent, marginBottom: '6px' }}>Onde</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', maxWidth: '200px', lineHeight: 1.3 }}>{event.location}</p>
                </div>
              )}
              {config.coupleNames && (
                <div>
                  <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: accent, marginBottom: '6px' }}>Anfitriões</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{config.coupleNames}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: cover image */}
        {event.cover_image && (
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img src={event.cover_image} alt={event.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) contrast(1.05)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.3), transparent)' }} />
          </div>
        )}
      </div>

      {/* Description section */}
      {event.description && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '64px 40px' }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ width: '3px', background: accent, flexShrink: 0, alignSelf: 'stretch', minHeight: '60px' }} />
              <p style={{ fontSize: '20px', lineHeight: 1.7, color: 'rgba(245,245,240,0.7)', fontFamily: "'Helvetica Neue', sans-serif", fontWeight: '300' }}>
                {event.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.2)' }}>EventsDock</span>
        <span style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.2)' }}>{event.name}</span>
      </div>
    </div>
  )
}
