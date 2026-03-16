// app/terms/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — EventsDock',
  description: 'The terms and conditions governing your use of EventsDock.',
}

const LAST_UPDATED = 'March 2026'
const CONTACT_EMAIL = 'eventsdock2026@gmail.com'

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '48px' }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="glass animate-fade-up-1" style={{ borderRadius: '20px', padding: '40px' }}>
          <Legal>

            <Section title="1. Acceptance of terms">
              By creating an account or using EventsDock, you agree to be bound by these Terms of Service. If you do not agree, do not use the service. These terms apply to all users including free and paid accounts.
            </Section>

            <Section title="2. Description of service">
              EventsDock provides an online platform for creating and managing events, inviting guests, collecting RSVPs, and tracking attendance. Features vary by subscription plan as described on the pricing page. We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.
            </Section>

            <Section title="3. Account registration">
              <ul>
                <li>You must provide accurate information when registering.</li>
                <li>You are responsible for maintaining the security of your account credentials.</li>
                <li>You must be at least 16 years old to use EventsDock.</li>
                <li>One person may not maintain multiple free accounts.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
              </ul>
            </Section>

            <Section title="4. Acceptable use">
              <p>You agree not to use EventsDock to:</p>
              <ul>
                <li>Upload or share illegal, harmful, or offensive content.</li>
                <li>Send unsolicited communications (spam) to guests.</li>
                <li>Impersonate any person or organisation.</li>
                <li>Attempt to gain unauthorised access to the platform or other users' data.</li>
                <li>Use automated tools to scrape or extract data from the service.</li>
                <li>Violate any applicable laws or regulations.</li>
              </ul>
              <p>We reserve the right to suspend or terminate accounts that violate these rules without prior notice.</p>
            </Section>

            <Section title="5. Subscription and payments">
              <ul>
                <li>Paid plans are billed monthly through Stripe. Prices are shown in Euros (€) and include applicable taxes.</li>
                <li>Subscriptions renew automatically unless cancelled before the next billing date.</li>
                <li>You can cancel your subscription at any time from your billing settings. Cancellation takes effect at the end of the current billing period — you retain access to paid features until then.</li>
                <li><strong>Refunds:</strong> we do not offer refunds for the current billing period. If you believe you were charged in error, contact us within 7 days at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a>.</li>
                <li>We reserve the right to change pricing with 30 days' notice. Existing subscribers will be notified by email before any price change takes effect.</li>
                <li>Discount codes are one-time use per account and cannot be combined with other offers.</li>
              </ul>
            </Section>

            <Section title="6. Your content and data">
              <p>You retain ownership of all content you upload to EventsDock including event information and guest data. By using the service, you grant us a limited licence to store and process your content solely to provide the service.</p>
              <p>You are solely responsible for the content you create and the guest data you upload. You warrant that you have the right to process your guests' personal data and that doing so complies with applicable privacy laws.</p>
            </Section>

            <Section title="7. Data and privacy">
              Our collection and use of personal data is governed by our <Link href="/privacy" style={{ color: 'var(--teal)' }}>Privacy Policy</Link>, which forms part of these terms. By using EventsDock, you consent to our data practices as described there.
            </Section>

            <Section title="8. Service availability">
              We aim to keep EventsDock available and reliable, but we do not guarantee uninterrupted access. The service is provided on an "as is" and "as available" basis. We are not liable for any losses caused by downtime, data loss, or service interruptions beyond our reasonable control.
            </Section>

            <Section title="9. Limitation of liability">
              <p>To the maximum extent permitted by law, EventsDock shall not be liable for:</p>
              <ul>
                <li>Any indirect, incidental, or consequential damages arising from your use of the service.</li>
                <li>Loss of data, revenue, or profits.</li>
                <li>Any damages exceeding the amount you paid to us in the 3 months preceding the claim.</li>
              </ul>
              <p>Nothing in these terms limits liability for death, personal injury, or fraud caused by our negligence.</p>
            </Section>

            <Section title="10. Termination">
              <p>You may delete your account at any time from account settings. Upon deletion, all your data is permanently removed.</p>
              <p>We may suspend or terminate your account if you breach these terms, if required by law, or if we discontinue the service. In the event of termination by us without cause, we will provide a prorated refund for unused paid subscription time.</p>
            </Section>

            <Section title="11. Governing law">
              These terms are governed by the laws of Portugal. Any disputes arising from these terms or your use of EventsDock shall be subject to the exclusive jurisdiction of the courts of Portugal. If you are a consumer in the EU, you may also have rights under the consumer protection laws of your country of residence.
            </Section>

            <Section title="12. Changes to these terms">
              We may update these terms from time to time. We will notify you of material changes by email at least 14 days before they take effect. Continued use of EventsDock after changes constitutes acceptance of the new terms.
            </Section>

            <Section title="13. Contact">
              For questions about these terms, email <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--teal)' }}>{CONTACT_EMAIL}</a>.
            </Section>

          </Legal>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Privacy Policy</Link>
          <Link href="/cookies" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Cookie Policy</Link>
        </div>
      </main>
    </div>
  )
}

function Legal({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
