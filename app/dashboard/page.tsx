'use client'
// app/dashboard/billing/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PLAN_INFO: Record<string, { label: string; price: string; color: string }> = {
  free:    { label: 'Free',    price: '€0/month',  color: 'var(--text-secondary)' },
  starter: { label: 'Starter', price: '€9/month',  color: 'var(--teal)' },
  pro:     { label: 'Pro',     price: '€19/month', color: 'var(--green)' },
}

const PLAN_FEATURES: Record<string, string[]> = {
  free:    ['1 active event', 'Up to 50 guests', 'RSVP tracking', 'Email invitations'],
  starter: ['5 active events', 'Up to 200 guests', 'Guest import', 'Analytics dashboard'],
  pro:     ['Unlimited events', 'Unlimited guests', 'Guest import', 'Analytics', 'Custom branding', 'Priority support'],
}

export default function BillingPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<string>('free')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
      if (data?.plan) setPlan(data.plan)
      setLoading(false)
    })
  }, [router])

  async function openBillingPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Could not open billing portal. Please try again.')
    } catch {
      alert('Something went wrong.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center" style={{ background: 'var(--navy)' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>Loading...</p>
      </div>
    )
  }

  const info = PLAN_INFO[plan] ?? PLAN_INFO.free
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES.free

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', fontFamily: 'var(--font-body)' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)', background: 'rgba(11,22,40,0.9)', position: 'sticky', top: 0, zIndex: 50 }} className="px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>EventsDock</span>
          </Link>
          <Link href="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none' }} className="hover:text-white transition-colors">
            ← Back to dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="animate-fade-up">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Billing & Plan
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px', fontWeight: '300' }}>{email}</p>

          {/* Current plan card */}
          <div className="glass" style={{ borderRadius: '16px', padding: '28px', marginBottom: '16px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Current plan
            </p>
            <div className="flex items-center gap-3 mb-6">
              <span style={{
                background: 'var(--teal-glow)', border: '1px solid var(--border)',
                borderRadius: '99px', padding: '4px 14px',
                fontSize: '13px', fontWeight: '600', color: info.color,
                fontFamily: 'var(--font-display)',
              }}>
                {info.label}
              </span>
              <span style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: '700', fontFamily: 'var(--font-display)' }}>
                {info.price}
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '300' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plan === 'free' ? (
              <Link href="/pricing" className="btn-primary" style={{ padding: '13px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                Upgrade your plan
              </Link>
            ) : (
              <>
                <Link href="/pricing" className="btn-primary" style={{ padding: '13px', borderRadius: '10px', fontSize: '14px', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                  Change plan
                </Link>
                <button
                  onClick={openBillingPortal}
                  disabled={portalLoading}
                  className="btn-ghost"
                  style={{ padding: '13px', borderRadius: '10px', fontSize: '14px', width: '100%', opacity: portalLoading ? 0.6 : 1 }}
                >
                  {portalLoading ? 'Opening...' : 'Manage billing / Cancel subscription'}
                </button>
              </>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}>
            Billing is securely managed by Stripe. Your card details are never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  )
}
