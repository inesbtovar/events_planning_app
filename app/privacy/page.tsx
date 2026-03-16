// app/privacy/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — EventsDock',
  description: 'How EventsDock collects, uses, and protects your personal data.',
}

const LAST_UPDATED = 'March 2026'
const CONTACT_EMAIL = 'eventsdock2026@gmail.com'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', fontFamily: 'var(--font-body)' }}>

      {/* Nav */}
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
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '48px' }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="glass animate-fade-up-1" style={{ borderRadius: '20px', padding: '40px' }}>
          <Legal>

            <Section title="1. Who we are">
              EventsDock is an event management platform that allows users to create events, manage guest lists, send invitations, and collect RSVPs. EventsDock is operated as an independent service. For privacy-related questions, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a>.
            </Section>

            <Section title="2. What data we collect">
              <p>We collect the following categories of personal data:</p>
              <ul>
                <li><strong>Account data:</strong> your email address and password (stored securely via Supabase Auth) when you register.</li>
                <li><strong>Event data:</strong> event names, dates, locations, and descriptions you create.</li>
                <li><strong>Guest data:</strong> names, email addresses, phone numbers, and dietary restrictions of guests you add to your events. You are responsible for having a lawful basis to process your guests' data.</li>
                <li><strong>Payment data:</strong> billing information is handled entirely by Stripe. We do not store card numbers or payment details on our servers.</li>
                <li><strong>Usage data:</strong> basic analytics such as pages visited and actions taken, used to improve the service.</li>
              </ul>
            </Section>

            <Section title="3. How we use your data">
              <ul>
                <li>To provide and operate the EventsDock service.</li>
                <li>To process payments and manage your subscription via Stripe.</li>
                <li>To send transactional emails (RSVP confirmations, invitation links) via Resend.</li>
                <li>To respond to support requests.</li>
                <li>To improve the platform based on usage patterns.</li>
              </ul>
              <p>We do not sell your data to third parties. We do not use your data for advertising purposes.</p>
            </Section>

            <Section title="4. Legal basis for processing (GDPR)">
              <p>We process your personal data under the following legal bases:</p>
              <ul>
                <li><strong>Contract:</strong> processing necessary to provide the service you signed up for.</li>
                <li><strong>Legitimate interests:</strong> improving the platform and preventing abuse.</li>
                <li><strong>Legal obligation:</strong> where required by applicable law.</li>
              </ul>
              <p>For guest data you upload, you act as the data controller and we act as a data processor on your behalf. You are responsible for ensuring you have a lawful basis to process your guests' personal information.</p>
            </Section>

            <Section title="5. Data sharing and third parties">
              <p>We share data with the following service providers only to the extent necessary to operate EventsDock:</p>
              <ul>
                <li><strong>Supabase</strong> — database and authentication hosting (EU region).</li>
                <li><strong>Stripe</strong> — payment processing. Stripe's privacy policy applies to payment data.</li>
                <li><strong>Resend</strong> — transactional email delivery.</li>
                <li><strong>Vercel</strong> — application hosting and deployment.</li>
              </ul>
              <p>All providers are bound by data processing agreements and are GDPR-compliant.</p>
            </Section>

            <Section title="6. Data retention">
              <p>We retain your account and event data for as long as your account is active. If you delete your account, all associated data including events and guest lists is permanently deleted within 30 days.</p>
              <p>Stripe retains billing records as required by financial regulations, independently of your EventsDock account.</p>
            </Section>

            <Section title="7. Your rights (GDPR)">
              <p>If you are based in the European Economic Area, you have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> request a copy of the data we hold about you.</li>
                <li><strong>Rectification:</strong> correct inaccurate data.</li>
                <li><strong>Erasure:</strong> request deletion of your data.</li>
                <li><strong>Portability:</strong> receive your data in a machine-readable format.</li>
                <li><strong>Objection:</strong> object to certain types of processing.</li>
                <li><strong>Restriction:</strong> request that we limit processing in certain circumstances.</li>
              </ul>
              <p>To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a>. We will respond within 30 days.</p>
            </Section>

            <Section title="8. Cookies">
              <p>We use essential cookies for authentication (keeping you logged in) and session management. We do not use advertising or tracking cookies. See our <Link href="/cookies" style={{ color: 'var(--teal)' }}>Cookie Policy</Link> for details.</p>
            </Section>

            <Section title="9. Security">
              <p>We implement industry-standard security measures including encrypted connections (HTTPS/TLS), hashed passwords, row-level security on our database, and regular security reviews. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
            </Section>

            <Section title="10. Children's privacy">
              <p>EventsDock is not directed at children under 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.</p>
            </Section>

            <Section title="11. Changes to this policy">
              <p>We may update this Privacy Policy from time to time. We will notify registered users of material changes by email. Continued use of EventsDock after changes constitutes acceptance of the updated policy.</p>
            </Section>

            <Section title="12. Contact">
              <p>For privacy questions or to exercise your rights, contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a>.</p>
            </Section>

          </Legal>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
          <Link href="/terms" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Terms of Service</Link>
          <Link href="/cookies" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Cookie Policy</Link>
        </div>
      </main>
    </div>
  )
}

function Legal({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8',
      display: 'flex', flexDirection: 'column', gap: '32px',
    }}>
      {children}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </div>
  )
}
