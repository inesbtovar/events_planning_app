// app/cookies/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Cookie Policy — EventsDock',
  description: 'How EventsDock uses cookies and similar technologies.',
}

const LAST_UPDATED = 'March 2026'

export default function CookiesPage() {
  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', fontFamily: 'var(--font-body)' }}>

      <nav style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11,22,40,0.9)', backdropFilter: 'blur(20px)' }} className="px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '7px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>EventsDock</span>
          </Link>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }} className="hover:opacity-70 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="animate-fade-up">
          <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--teal)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Legal</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '8px' }}>
            Cookie Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '48px' }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="glass animate-fade-up-1" style={{ borderRadius: '20px', padding: '40px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '32px' }}>

            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>What are cookies?</h2>
              <p>Cookies are small text files stored on your device when you visit a website. They allow the site to remember your preferences and keep you logged in between visits.</p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>Cookies we use</h2>
              <p style={{ marginBottom: '16px' }}>EventsDock uses only essential cookies. We do not use advertising, tracking, or analytics cookies.</p>

              {/* Cookie table */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', background: 'rgba(255,255,255,0.04)', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cookie</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duration</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Purpose</span>
                </div>
                {[
                  { name: 'sb-access-token', duration: 'Session', purpose: 'Keeps you logged in to your EventsDock account (Supabase Auth).' },
                  { name: 'sb-refresh-token', duration: '1 year', purpose: 'Renews your login session automatically so you stay logged in.' },
                  { name: '__stripe_mid', duration: '1 year', purpose: 'Stripe fraud prevention. Set only on checkout pages.' },
                  { name: '__stripe_sid', duration: '30 min', purpose: 'Stripe session identifier. Set only on checkout pages.' },
                ].map((cookie, i) => (
                  <div key={cookie.name} style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 2fr',
                    padding: '14px 16px', fontSize: '13px',
                    borderBottom: i < 3 ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontWeight: '500', wordBreak: 'break-all' }}>{cookie.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{cookie.duration}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{cookie.purpose}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>What we don't do</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '0', listStyle: 'none' }}>
                {[
                  'We do not use Google Analytics or any third-party analytics cookies.',
                  'We do not use Facebook Pixel or any advertising tracking.',
                  'We do not sell or share cookie data with advertisers.',
                  'We do not use fingerprinting or other tracking technologies beyond the cookies listed above.',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Managing cookies</h2>
              <p>Since we only use essential cookies, disabling them will prevent EventsDock from working — you won't be able to stay logged in. You can manage cookies in your browser settings, but note that blocking essential cookies will break the service.</p>
              <p style={{ marginTop: '10px' }}>Most browsers allow you to view, delete, and block cookies. See your browser's help documentation for instructions.</p>
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>Contact</h2>
              <p>Questions about our use of cookies? Email <a href="mailto:privacy@eventsdock.com" style={{ color: 'var(--teal)' }}>privacy@eventsdock.com</a>.</p>
            </div>

          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Terms of Service</Link>
        </div>
      </main>
    </div>
  )
}
