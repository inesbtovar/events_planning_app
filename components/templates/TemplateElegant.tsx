// components/templates/TemplateElegant.tsx
// Design: Luxury wedding — deep ivory, Cormorant Garamond, gold accents, candlelit warmth

type Event = {
  name: string
  date: string
  location: string
  description: string
  cover_image: string | null
  template_config: {
    headline?: string
    subtitle?: string
    accentColor?: string
    coupleNames?: string
  }
  slug: string
}

export default function TemplateElegant({ event }: { event: Event }) {
  const config = event.template_config || {}
  const gold = config.accentColor || '#C9A84C'
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
      background: '#FAF7F2',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      backgroundImage: `
        radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 50%)
      `,
    }}>

      {/* Hero */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 32px',
        position: 'relative',
        backgroundImage: event.cover_image
          ? `linear-gradient(rgba(10,8,5,0.55), rgba(10,8,5,0.65)), url(${event.cover_image})`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: event.cover_image ? undefined : '#1A1510',
      }}>

        {/* Decorative corner frames */}
        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
          const [v, h] = pos.split('-')
          return (
            <div key={pos} style={{
              position: 'absolute',
              [v]: '24px', [h]: '24px',
              width: '60px', height: '60px',
              borderTop: v === 'top' ? `1px solid ${gold}` : 'none',
              borderBottom: v === 'bottom' ? `1px solid ${gold}` : 'none',
              borderLeft: h === 'left' ? `1px solid ${gold}` : 'none',
              borderRight: h === 'right' ? `1px solid ${gold}` : 'none',
              opacity: 0.6,
            }} />
          )
        })}

        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>

          {/* Top ornament */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
            <div style={{ height: '1px', width: '48px', background: `linear-gradient(to right, transparent, ${gold})` }} />
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="2" fill={gold} opacity="0.8"/>
              <circle cx="8" cy="2" r="1" fill={gold} opacity="0.5"/>
              <circle cx="8" cy="14" r="1" fill={gold} opacity="0.5"/>
              <circle cx="2" cy="8" r="1" fill={gold} opacity="0.5"/>
              <circle cx="14" cy="8" r="1" fill={gold} opacity="0.5"/>
            </svg>
            <div style={{ height: '1px', width: '48px', background: `linear-gradient(to left, transparent, ${gold})` }} />
          </div>

          {config.coupleNames && (
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '20px', fontFamily: "'Georgia', serif" }}>
              {config.coupleNames}
            </p>
          )}

          <h1 style={{
            fontSize: 'clamp(42px, 8vw, 80px)',
            fontWeight: '300',
            color: '#FDF8EE',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
            marginBottom: '12px',
            fontStyle: 'italic',
          }}>
            {config.headline || event.name}
          </h1>

          {config.subtitle && (
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '16px', fontWeight: '300', marginBottom: '8px', fontStyle: 'italic' }}>
              {config.subtitle}
            </p>
          )}

          {/* Gold rule */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '28px 0' }}>
            <div style={{ height: '1px', width: '32px', background: gold, opacity: 0.7 }} />
            <div style={{ width: '4px', height: '4px', background: gold, transform: 'rotate(45deg)', opacity: 0.8 }} />
            <div style={{ height: '1px', width: '80px', background: gold, opacity: 0.7 }} />
            <div style={{ width: '4px', height: '4px', background: gold, transform: 'rotate(45deg)', opacity: 0.8 }} />
            <div style={{ height: '1px', width: '32px', background: gold, opacity: 0.7 }} />
          </div>

          {eventDate && (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', letterSpacing: '0.05em', marginBottom: eventTime ? '4px' : '0' }}>
              {eventDate}
            </p>
          )}
          {eventTime && eventTime !== '00:00' && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', letterSpacing: '0.1em' }}>
              às {eventTime}
            </p>
          )}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll</p>
          <div style={{ width: '1px', height: '32px', background: `linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)` }} />
        </div>
      </div>

      {/* Details section */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>

        {event.description && (
          <div style={{ marginBottom: '64px' }}>
            <p style={{
              fontSize: '18px', lineHeight: '1.9', color: '#5C4A32',
              fontStyle: 'italic', maxWidth: '540px', margin: '0 auto',
            }}>
              &ldquo;{event.description}&rdquo;
            </p>
          </div>
        )}

        {/* Details cards */}
        {(eventDate || event.location) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: eventDate && event.location ? '1fr 1fr' : '1fr',
            gap: '2px',
            border: `1px solid rgba(201,168,76,0.25)`,
            borderRadius: '2px',
            overflow: 'hidden',
            maxWidth: '480px',
            margin: '0 auto',
          }}>
            {eventDate && (
              <div style={{ padding: '32px 24px', background: 'rgba(201,168,76,0.04)' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
                  Data
                </p>
                <p style={{ color: '#2D2010', fontSize: '15px', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {eventDate}
                </p>
                {eventTime && eventTime !== '00:00' && (
                  <p style={{ color: '#8B6F47', fontSize: '13px', marginTop: '6px' }}>às {eventTime}</p>
                )}
              </div>
            )}
            {event.location && (
              <div style={{ padding: '32px 24px', background: 'rgba(201,168,76,0.02)', borderLeft: eventDate ? `1px solid rgba(201,168,76,0.2)` : 'none' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: gold, marginBottom: '12px' }}>
                  Local
                </p>
                <p style={{ color: '#2D2010', fontSize: '15px', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {event.location}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C8A882', opacity: 0.6 }}>
          EventsDock
        </p>
      </div>
    </div>
  )
}
