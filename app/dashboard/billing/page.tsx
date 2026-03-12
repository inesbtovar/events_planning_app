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
  const [cancelDate, setCancelDate] = useState<string | null>(null)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    async function fetchPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? '')
      const { data } = await supabase
        .from('profiles')
        .select('plan, stripe_subscription_id')
        .eq('id', user.id)
        .single()
      if (data?.plan) setPlan(data.plan)

      // Check if subscription is set to cancel at period end
      if (data?.stripe_subscription_id) {
        try {
          const res = await fetch('/api/billing/status')
          const json = await res.json()
          if (json.cancel_at) setCancelDate(json.cancel_at)
        } catch {}
      }

      setLoading(false)
    }

    fetchPlan()
    window.addEventListener('focus', fetchPlan)
    return () => window.removeEventListener('focus', fetchPlan)
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

  async function handleDeleteAccount() {
    if (deleteInput !== email) {
      setDeleteError('Email does not match.')
      return
    }
    setDeleteLoading(true)
    setDeleteError('')
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (res.ok) {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/?deleted=1')
      } else {
        const data = await res.json()
        setDeleteError(data.error || 'Something went wrong.')
        setDeleteLoading(false)
      }
    } catch {
      setDeleteError('Something went wrong.')
      setDeleteLoading(false)
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

      <div className="max-w-2xl mx-auto px-6 py-12" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Current plan */}
        <div className="animate-fade-up glass" style={{ borderRadius: '16px', padding: '28px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Current plan
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: cancelDate ? '12px' : '20px' }}>
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

          {cancelDate && (
            <div style={{
              background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)',
              borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style={{ color: '#fb923c', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                Your plan is cancelled and will revert to <strong>Free</strong> on <strong>{new Date(cancelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. You keep full access until then.
              </p>
            </div>
          )}

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {features.map(f => (
              <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '300' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                {f}
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plan === 'free' ? (
              <Link href="/pricing" className="btn-primary" style={{ padding: '13px', borderRadius: '10px', fontSize: '14px', textAlign: 'center' }}>
                Upgrade your plan
              </Link>
            ) : (
              <>
                <Link href="/pricing" className="btn-primary" style={{ padding: '13px', borderRadius: '10px', fontSize: '14px', textAlign: 'center' }}>
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

          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '14px', textAlign: 'center' }}>
            Billing is securely managed by Stripe.
          </p>
        </div>

        {/* Account email */}
        <div className="animate-fade-up-1 glass" style={{ borderRadius: '16px', padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Account</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{email}</p>
        </div>

        {/* Delete account */}
        <div className="animate-fade-up-2 glass" style={{ borderRadius: '16px', padding: '24px', borderColor: showDeleteConfirm ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p style={{ color: '#f87171', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Danger zone</p>
          </div>

          {!showDeleteConfirm ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>Delete account</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '300' }}>Permanently delete your account and all events. This cannot be undone.</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                style={{ flexShrink: 0, padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)', background: 'transparent', color: '#f87171', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
              >
                Delete account
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px 16px' }}>
                <p style={{ color: '#f87171', fontSize: '13px', lineHeight: '1.6' }}>
                  This will permanently delete your account, all your events, and all guest data. Your subscription will be cancelled immediately. <strong>This cannot be undone.</strong>
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Type <strong style={{ color: 'var(--text-primary)' }}>{email}</strong> to confirm
                </label>
                <input
                  type="email"
                  value={deleteInput}
                  onChange={e => { setDeleteInput(e.target.value); setDeleteError('') }}
                  placeholder={email}
                  className="input-dark"
                  style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px', borderColor: deleteError ? 'rgba(239,68,68,0.5)' : undefined }}
                />
                {deleteError && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px' }}>{deleteError}</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteInput !== email}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '9px', border: 'none',
                    background: deleteInput === email ? 'rgba(239,68,68,0.85)' : 'rgba(239,68,68,0.2)',
                    color: deleteInput === email ? 'white' : '#f87171',
                    fontSize: '14px', fontWeight: '600', cursor: deleteInput === email ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                    opacity: deleteLoading ? 0.6 : 1,
                  }}
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteError('') }}
                  className="btn-ghost"
                  style={{ padding: '12px 20px', borderRadius: '9px', fontSize: '14px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
