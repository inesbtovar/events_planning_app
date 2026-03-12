'use client'
// app/page.tsx
import Link from 'next/link'

const features = [
  {
    stroke: 'var(--teal)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    tag: 'Excel & CSV',
    title: 'Import your guest list',
    desc: 'Upload Excel or CSV in seconds. We handle column mapping automatically.',
  },
  {
    stroke: 'var(--green)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    tag: '3 templates',
    title: 'A website for your event',
    desc: 'Pick from beautiful templates and publish in minutes. Your guests will be impressed.',
  },
  {
    stroke: 'var(--teal)',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    tag: 'Zero friction',
    title: 'One link per guest',
    desc: 'Send via WhatsApp. Guests confirm with one tap — no account, no friction.',
  },
]

const steps = [
  { n: '01', label: 'Create your event', desc: 'Name, date, location' },
  { n: '02', label: 'Upload guest list', desc: 'Excel or CSV file' },
  { n: '03', label: 'Publish your site', desc: 'One click to go live' },
  { n: '04', label: 'Track RSVPs live', desc: 'Real-time dashboard' },
]

const stats = [
  { value: '2 min', label: 'to set up an event' },
  { value: '1 link', label: 'per guest to RSVP' },
  { value: '0 apps', label: 'guests need to install' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '600px', background: 'radial-gradient(ellipse, rgba(10,191,188,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(6,214,160,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)', background: 'rgba(11,22,40,0.85)', position: 'sticky', top: 0, zIndex: 50 }}
        className="px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>EventsDock</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/contact" style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '8px 14px', borderRadius: '8px' }} className="hover:text-white transition-colors">Help</Link>
          <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '8px 14px', borderRadius: '8px' }} className="hover:text-white transition-colors">Sign in</Link>
          <Link href="/register" className="btn-primary" style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '14px', marginLeft: '4px' }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-16 text-center" style={{ position: 'relative', zIndex: 1 }}>
        {/*<div className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--teal-glow)', border: '1px solid var(--border)', borderRadius: '99px', padding: '5px 16px 5px 8px', fontSize: '13px', color: 'var(--teal)', marginBottom: '40px' }}>
          <span style={{ background: 'var(--teal)', borderRadius: '99px', padding: '2px 8px', fontSize: '10px', fontWeight: '700', color: 'var(--navy)', letterSpacing: '0.05em' }}>NEW</span>
          Free during early access
        </div>*/}

        <h1 className="animate-fade-up-1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(44px, 7vw, 80px)', fontWeight: '800', lineHeight: '1.05', letterSpacing: '-2.5px', marginBottom: '28px' }}>
          Events that leave<br />
          <span className="gradient-text">a lasting impression.</span>
        </h1>

        <p className="animate-fade-up-2" style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: '300', lineHeight: '1.7', maxWidth: '500px', margin: '0 auto 44px' }}>
          Upload your guest list, build a stunning event page, and let guests RSVP with a single link. No friction for your guests — ever.
        </p>

        <div className="animate-fade-up-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="btn-primary" style={{ padding: '14px 32px', borderRadius: '10px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Create your first event
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/login" className="btn-ghost" style={{ padding: '14px 32px', borderRadius: '10px', fontSize: '15px' }}>
            Sign in
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-6 pb-20" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center animate-fade-up-${i + 2}`}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800' }} className="gradient-text">{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-28" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid sm:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="glass card-hover" style={{ borderRadius: '16px', padding: '28px' }}>
              <div style={{ background: 'var(--teal-glow)', borderRadius: '12px', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                {f.icon}
              </div>
              <div style={{ display: 'inline-block', background: 'rgba(10,191,188,0.08)', border: '1px solid var(--border)', borderRadius: '99px', padding: '2px 10px', fontSize: '11px', color: 'var(--teal)', fontWeight: '600', marginBottom: '12px', letterSpacing: '0.03em' }}>
                {f.tag}
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', fontWeight: '300' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(17,34,64,0.5)', position: 'relative', zIndex: 1 }} className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', letterSpacing: '-1px', marginBottom: '12px' }}>
            Up and running in minutes
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '300', marginBottom: '56px' }}>
            No learning curve. Just fill in the details and go.
          </p>
          <div className="grid sm:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: '700', color: 'var(--teal)', letterSpacing: '2px', marginBottom: '16px' }}>{s.n}</div>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: '600', marginBottom: '6px' }}>{s.label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-28 px-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(10,191,188,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '800', letterSpacing: '-1.5px', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Ready to plan something<br />
          <span className="gradient-text">unforgettable?</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '300', marginBottom: '36px' }}>
          Free to use. No credit card required.
        </p>
        <Link href="/register" className="btn-primary" style={{ padding: '16px 40px', borderRadius: '10px', fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          Create your event free
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', position: 'relative', zIndex: 1 }} className="py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '7px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>EventsDock</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            © {new Date().getFullYear()} EventsDock. Made for weddings, birthdays & everything in between.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/contact" style={{ color: 'var(--text-muted)', fontSize: '13px' }} className="hover:text-white transition-colors">Help</Link>
            <Link href="/pricing" style={{ color: 'var(--text-muted)', fontSize: '13px' }} className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '13px' }} className="hover:text-white transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
