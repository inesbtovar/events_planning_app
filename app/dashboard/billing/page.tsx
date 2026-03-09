'use client'
// app/dashboard/settings/billing/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PLAN_LABELS: Record<string, { label: string; price: string; color: string }> = {
  free:    { label: 'Free',    price: '€0/month',  color: '#7A6652' },
  starter: { label: 'Starter', price: '€9/month',  color: '#E8A87C' },
  pro:     { label: 'Pro',     price: '€19/month', color: '#2D2016' },
}

const PLAN_LIMITS: Record<string, string[]> = {
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
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()
      if (data?.plan) setPlan(data.plan)
      setLoading(false)
    })
  }, [router])

  async function openBillingPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Could not open billing portal. Please try again.')
      }
    } catch {
      alert('Something went wrong.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDFAF6' }}>
        <p style={{ color: '#7A6652', fontFamily: 'system-ui, sans-serif' }}>Loading...</p>
      </div>
    )
  }

  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free
  const planFeatures = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF6', fontFamily: 'system-ui, sans-serif' }}>
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Back */}
        <Link href="/dashboard" style={{ color: '#7A6652', fontSize: '14px' }} className="hover:opacity-70 flex items-center gap-1 mb-8">
          ← Back to dashboard
        </Link>

        <h1 style={{ color: '#2D2016', fontSize: '28px', fontWeight: '700', fontFamily: "'Georgia', serif", marginBottom: '8px' }}>
          Billing & Plan
        </h1>
        <p style={{ color: '#7A6652', fontSize: '14px', marginBottom: '32px' }}>{email}</p>

        {/* Current Plan Card */}
        <div style={{
          background: 'white',
          border: '1px solid #EDE8E0',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '16px',
        }}>
          <div className="flex items-start justify-between">
            <div>
              <p style={{ color: '#7A6652', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Current plan
              </p>
              <div className="flex items-center gap-3">
                <span style={{
                  background: planInfo.color,
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: '99px',
                }}>
                  {planInfo.label}
                </span>
                <span style={{ color: '#2D2016', fontSize: '20px', fontWeight: '700' }}>
                  {planInfo.price}
                </span>
              </div>
            </div>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0 0' }} className="space-y-2">
            {planFeatures.map(f => (
              <li key={f} className="flex items-center gap-2" style={{ fontSize: '14px', color: '#4A3728' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8A87C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {plan === 'free' ? (
            <Link
              href="/pricing"
              style={{
                display: 'block',
                textAlign: 'center',
                background: '#2D2016',
                color: 'white',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '500',
              }}
              className="hover:opacity-80 transition-opacity"
            >
              Upgrade your plan
            </Link>
          ) : (
            <>
              <Link
                href="/pricing"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#2D2016',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
                className="hover:opacity-80 transition-opacity"
              >
                Change plan
              </Link>

              <button
                onClick={openBillingPortal}
                disabled={portalLoading}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  background: 'transparent',
                  color: '#7A6652',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: '1px solid #EDE8E0',
                  cursor: 'pointer',
                }}
                className="hover:bg-stone-50 transition-colors"
              >
                {portalLoading ? 'Opening...' : 'Manage billing / Cancel subscription'}
              </button>
            </>
          )}
        </div>

        <p style={{ color: '#B0A090', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}>
          Billing is securely managed by Stripe. Your card details are never stored on our servers.
        </p>
      </div>
    </div>
  )
}
