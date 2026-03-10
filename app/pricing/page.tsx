'use client'
// app/pricing/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  {
    id: 'free', label: 'Free', price: 0, priceLabel: '€0',
    description: 'Perfect for one-off events',
    features: ['1 active event', 'Up to 50 guests', 'RSVP tracking', 'Public event page', 'Email invitations'],
    highlighted: false,
  },
  {
    id: 'starter', label: 'Starter', price: 9, priceLabel: '€9',
    description: 'For growing event planners',
    features: ['5 active events', 'Up to 200 guests', 'RSVP tracking', 'Custom event pages', 'Email invitations', 'Guest import (CSV/Excel)', 'Analytics dashboard'],
    highlighted: true,
  },
  {
    id: 'pro', label: 'Pro', price: 19, priceLabel: '€19',
    description: 'For professional planners',
    features: ['Unlimited events', 'Unlimited guests', 'RSVP tracking', 'Custom event pages', 'Email invitations', 'Guest import (CSV/Excel)', 'Analytics dashboard', 'Priority support', 'Custom branding'],
    highlighted: false,
  },
]

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
)

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [currentPlan, setCurrentPlan] = useState('free')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState<{ valid: boolean; percent: number; message: string } | null>(null)
  const [discountLoading, setDiscountLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('plan').eq('id', user.id).single()
        if (data?.plan) setCurrentPlan(data.plan)
      }
      setAuthLoading(false)
    })
  }, [])

  async function applyDiscount() {
    if (!discountCode.trim()) return
    setDiscountLoading(true)
    setDiscountResult(null)
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (data.valid) {
        setDiscountResult({ valid: true, percent: data.percent, message: `${data.percent}% off applied!` })
      } else {
        setDiscountResult({ valid: false, percent: 0, message: data.error || 'Invalid code' })
      }
    } catch {
      setDiscountResult({ valid: false, percent: 0, message: 'Something went wrong' })
    } finally {
      setDiscountLoading(false)
    }
  }

  function discountedPrice(plan: typeof PLANS[0]) {
    if (!discountResult?.valid || plan.price === 0) return null
    const d = plan.price * (1 - discountResult.percent / 100)
    return `€${d % 1 === 0 ? d : d.toFixed(2)}`
  }

  async function handlePlanClick(planId: string) {
    if (planId === 'free') return
    if (!user) { router.push(`/register?plan=${planId}`); return }
    if (planId === currentPlan) return
    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, discountCode: discountResult?.valid ? discountCode.trim().toUpperCase() : undefined }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Something went wrong. Please try again.')
    } catch { alert('Something went wrong.') }
    finally { setLoadingPlan(null) }
  }

  const isCurrent = (id: string) => !!user && id === currentPlan
  const isDisabled = (plan: typeof PLANS[0]) => authLoading || !!loadingPlan || isCurrent(plan.id) || plan.id === 'free'

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '500px', background: 'radial-gradient(ellipse, rgba(10,191,188,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)', background: 'rgba(11,22,40,0.85)', position: 'sticky', top: 0, zIndex: 50 }}
        className="px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>EventsDock</span>
        </Link>
        <div className="flex items-center gap-2">
          {!authLoading && (user ? (
            <Link href="/dashboard" className="btn-ghost" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}>Dashboard →</Link>
          ) : (
            <>
              <Link href="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '8px 14px' }} className="hover:text-white transition-colors">Sign in</Link>
              <Link href="/register" className="btn-primary" style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '14px' }}>Get started</Link>
            </>
          ))}
        </div>
      </nav>

      {/* Header */}
      <div className="text-center px-6 pt-20 pb-12" style={{ position: 'relative', zIndex: 1 }}>
        <h1 className="animate-fade-up" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: '700', letterSpacing: '-1.5px', marginBottom: '12px' }}>
          Simple, honest pricing
        </h1>
        <p className="animate-fade-up-1" style={{ color: 'var(--text-secondary)', fontSize: '17px', fontWeight: '300', marginBottom: '32px' }}>
          {authLoading ? '\u00A0' : user ? 'Upgrade your plan anytime.' : 'Start free, upgrade when you need more.'}
        </p>

        {/* Discount code */}
        <div className="animate-fade-up-2" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input
            type="text"
            value={discountCode}
            onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountResult(null) }}
            onKeyDown={e => e.key === 'Enter' && applyDiscount()}
            placeholder="HAVE A CODE?"
            className="input-dark"
            style={{ width: '180px', borderRadius: '9px', padding: '10px 14px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.06em' }}
          />
          <button
            onClick={applyDiscount}
            disabled={discountLoading || !discountCode.trim()}
            className="btn-ghost"
            style={{ padding: '10px 18px', borderRadius: '9px', fontSize: '13px', opacity: !discountCode.trim() ? 0.4 : 1 }}
          >
            {discountLoading ? '...' : 'Apply'}
          </button>
          {discountResult && (
            <span style={{
              fontSize: '13px', fontWeight: '600', padding: '6px 14px', borderRadius: '99px',
              background: discountResult.valid ? 'rgba(6,214,160,0.12)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${discountResult.valid ? 'rgba(6,214,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: discountResult.valid ? 'var(--green)' : '#f87171',
            }}>
              {discountResult.valid ? `✓ ${discountResult.message}` : `✗ ${discountResult.message}`}
            </span>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => {
            const dp = discountedPrice(plan)
            const current = isCurrent(plan.id)
            return (
              <div key={plan.id} className={`glass animate-fade-up-${i + 1}`} style={{
                borderRadius: '18px', padding: '32px', position: 'relative',
                border: current ? '1px solid rgba(6,214,160,0.4)' : plan.highlighted ? '1px solid rgba(10,191,188,0.35)' : undefined,
                background: plan.highlighted ? 'rgba(10,191,188,0.06)' : undefined,
              }}>
                {plan.highlighted && !current && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--teal), var(--green))', color: 'var(--navy)', fontSize: '10px', fontWeight: '800', padding: '4px 14px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                    Most popular
                  </div>
                )}
                {current && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--navy)', fontSize: '10px', fontWeight: '800', padding: '4px 14px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                    ✓ Your plan
                  </div>
                )}

                <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>{plan.label}</p>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '6px' }}>
                  {dp ? (
                    <>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{dp}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '18px', fontWeight: '500', textDecoration: 'line-through', marginBottom: '5px' }}>{plan.priceLabel}</span>
                    </>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '44px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{plan.priceLabel}</span>
                  )}
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '7px' }}>/mo</span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '300', marginBottom: '24px' }}>{plan.description}</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '300' }}>
                      <Check />{f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={isDisabled(plan)}
                  style={{
                    display: 'block', width: '100%', padding: '12px', borderRadius: '10px',
                    fontSize: '14px', fontWeight: '600', cursor: isDisabled(plan) ? 'default' : 'pointer',
                    transition: 'all 0.2s', textAlign: 'center',
                    ...(current
                      ? { background: 'rgba(6,214,160,0.1)', color: 'var(--green)', border: '1px solid rgba(6,214,160,0.3)' }
                      : plan.highlighted
                      ? { background: 'linear-gradient(135deg, var(--teal), var(--green))', color: 'var(--navy)', border: 'none', opacity: isDisabled(plan) ? 0.5 : 1 }
                      : { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', opacity: isDisabled(plan) ? 0.4 : 1 }
                    ),
                  }}
                >
                  {loadingPlan === plan.id ? 'Redirecting...' :
                   current ? '✓ Current plan' :
                   plan.id === 'free' ? (user ? '✓ Included' : 'Get started free') :
                   !user ? `Start with ${plan.label}` : `Upgrade to ${plan.label}`}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 pb-24" style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontSize: '26px', fontWeight: '700', textAlign: 'center', letterSpacing: '-0.5px', marginBottom: '36px' }}>
          Frequently asked questions
        </h2>
        {[
          { q: 'Can I switch plans later?', a: 'Yes, upgrade or downgrade at any time. Changes take effect immediately.' },
          { q: 'Do you offer refunds?', a: '14-day money-back guarantee on all paid plans. No questions asked.' },
          { q: 'What payment methods do you accept?', a: 'All major credit and debit cards via Stripe. Your payment info is never stored on our servers.' },
          { q: 'How do discount codes work?', a: 'Enter your code above to apply a percentage off your monthly price. The discount is applied at checkout.' },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid var(--border-subtle)', padding: '20px 0' }}>
            <p style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: '600', fontSize: '15px', marginBottom: '8px' }}>{q}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', fontWeight: '300' }}>{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
