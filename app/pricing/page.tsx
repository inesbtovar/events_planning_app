'use client'
// app/pricing/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const PLANS = [
  {
    id: 'free',
    label: 'Free',
    price: '€0',
    description: 'Perfect for one-off events',
    features: ['1 active event', 'Up to 50 guests', 'RSVP tracking', 'Public event page', 'Email invitations'],
    cta: 'Get started free',
    ctaLoggedIn: 'Your current plan',
    highlighted: false,
    registerHref: '/register',
  },
  {
    id: 'starter',
    label: 'Starter',
    price: '€9',
    description: 'For growing event planners',
    features: ['5 active events', 'Up to 200 guests', 'RSVP tracking', 'Custom event pages', 'Email invitations', 'Guest import (CSV/Excel)', 'Analytics dashboard'],
    cta: 'Start with Starter',
    ctaLoggedIn: 'Upgrade to Starter',
    highlighted: true,
    registerHref: '/register?plan=starter',
  },
  {
    id: 'pro',
    label: 'Pro',
    price: '€19',
    description: 'For professional planners',
    features: ['Unlimited events', 'Unlimited guests', 'RSVP tracking', 'Custom event pages', 'Email invitations', 'Guest import (CSV/Excel)', 'Analytics dashboard', 'Priority support', 'Custom branding'],
    cta: 'Start with Pro',
    ctaLoggedIn: 'Upgrade to Pro',
    highlighted: false,
    registerHref: '/register?plan=pro',
  },
]

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8A87C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data?.plan) setCurrentPlan(data.plan)
          })
      }
      setAuthLoading(false)
    })
  }, [])

  async function handlePlanClick(planId: string) {
    if (planId === 'free') return

    if (!user) {
      router.push(`/register?plan=${planId}`)
      return
    }

    if (planId === currentPlan) return

    setLoadingPlan(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  function getButtonLabel(plan: typeof PLANS[0]) {
    if (authLoading) return '...'
    if (!user) return plan.cta
    if (plan.id === currentPlan) return '✓ Current plan'
    if (plan.id === 'free') return '✓ Included'
    return plan.ctaLoggedIn
  }

  function isCurrentPlan(planId: string) {
    return !!user && planId === currentPlan
  }

  function isDisabled(plan: typeof PLANS[0]) {
    if (authLoading || loadingPlan === plan.id) return true
    if (!user) return false
    if (plan.id === currentPlan) return true
    if (plan.id === 'free') return true
    return false
  }

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF6', fontFamily: "'Georgia', serif" }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #EDE8E0' }} className="px-6 sm:px-12 py-5 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div style={{ background: '#E8A87C', borderRadius: '10px' }} className="w-7 h-7 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span style={{ color: '#2D2016', fontSize: '18px', fontWeight: '600' }}>EventsDock</span>
        </Link>
        <div className="flex items-center gap-6">
          {!authLoading && (
            user ? (
              <Link href="/dashboard" style={{ color: '#7A6652', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }} className="hover:opacity-70 transition-opacity">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#7A6652', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }} className="hover:opacity-70 transition-opacity">
                  Sign in
                </Link>
                <Link href="/register" style={{
                  background: '#2D2016', color: 'white',
                  padding: '8px 20px', borderRadius: '8px',
                  fontSize: '14px', fontFamily: 'system-ui, sans-serif', fontWeight: '500',
                }} className="hover:opacity-80 transition-opacity">
                  Get started
                </Link>
              </>
            )
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="text-center px-6 pt-16 pb-12">
        <h1 style={{ color: '#2D2016', fontSize: '42px', fontWeight: '700', letterSpacing: '-0.5px' }}>
          Simple, honest pricing
        </h1>
        <p style={{ color: '#7A6652', fontSize: '18px', marginTop: '12px', fontFamily: 'system-ui, sans-serif' }}>
          {authLoading ? '' : user ? 'Upgrade your plan anytime — no hassle.' : 'Start free, upgrade when you need more.'}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.highlighted ? '#2D2016' : 'white',
                border: `1px solid ${isCurrentPlan(plan.id) ? '#4CAF50' : plan.highlighted ? '#2D2016' : '#EDE8E0'}`,
                borderRadius: '16px',
                padding: '32px',
                position: 'relative',
                boxShadow: isCurrentPlan(plan.id) ? '0 0 0 2px #4CAF5033' : 'none',
              }}
            >
              {plan.highlighted && !isCurrentPlan(plan.id) && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: '#E8A87C', color: 'white', fontSize: '11px',
                  fontFamily: 'system-ui, sans-serif', fontWeight: '600',
                  padding: '4px 12px', borderRadius: '99px',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>
                  Most popular
                </div>
              )}

              {isCurrentPlan(plan.id) && (
                <div style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: '#4CAF50', color: 'white', fontSize: '11px',
                  fontFamily: 'system-ui, sans-serif', fontWeight: '600',
                  padding: '4px 14px', borderRadius: '99px',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>
                  ✓ Your plan
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <p style={{
                  color: plan.highlighted ? '#C4A882' : '#7A6652',
                  fontSize: '13px', fontFamily: 'system-ui, sans-serif',
                  fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {plan.label}
                </p>
                <div className="flex items-end gap-1 mt-2">
                  <span style={{ color: plan.highlighted ? 'white' : '#2D2016', fontSize: '40px', fontWeight: '700' }}>
                    {plan.price}
                  </span>
                  <span style={{ color: plan.highlighted ? '#C4A882' : '#7A6652', fontSize: '14px', fontFamily: 'system-ui, sans-serif', marginBottom: '8px' }}>
                    /month
                  </span>
                </div>
                <p style={{ color: plan.highlighted ? '#C4A882' : '#7A6652', fontSize: '14px', fontFamily: 'system-ui, sans-serif', marginTop: '8px' }}>
                  {plan.description}
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0' }} className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2" style={{
                    fontFamily: 'system-ui, sans-serif', fontSize: '14px',
                    color: plan.highlighted ? '#F5EDE0' : '#4A3728',
                  }}>
                    {CHECK}
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan.id)}
                disabled={isDisabled(plan)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  padding: '11px',
                  borderRadius: '9px',
                  fontSize: '14px',
                  fontFamily: 'system-ui, sans-serif',
                  fontWeight: '500',
                  cursor: isDisabled(plan) ? 'default' : 'pointer',
                  transition: 'opacity 0.15s',
                  opacity: isDisabled(plan) && !loadingPlan ? 0.6 : 1,
                  ...(plan.highlighted
                    ? {
                        background: isCurrentPlan(plan.id) ? '#4a7c4a' : '#E8A87C',
                        color: 'white',
                        border: 'none',
                      }
                    : {
                        background: isCurrentPlan(plan.id) ? '#f5f5f5' : 'transparent',
                        color: isCurrentPlan(plan.id) ? '#4CAF50' : '#2D2016',
                        border: `1.5px solid ${isCurrentPlan(plan.id) ? '#4CAF50' : '#2D2016'}`,
                      }
                  ),
                }}
              >
                {loadingPlan === plan.id ? 'Redirecting to checkout...' : getButtonLabel(plan)}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 pb-24">
        <h2 style={{ color: '#2D2016', fontSize: '26px', fontWeight: '700', textAlign: 'center', marginBottom: '32px' }}>
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {[
            { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.' },
            { q: 'Do you offer refunds?', a: 'We offer a 14-day money-back guarantee on all paid plans. No questions asked.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards via Stripe. Your payment info is never stored on our servers.' },
            { q: 'Is there a free trial for paid plans?', a: 'The Free plan lets you explore EventsDock with no time limit. Paid plans include a 14-day refund window.' },
          ].map(({ q, a }) => (
            <div key={q} style={{ borderBottom: '1px solid #EDE8E0', paddingBottom: '20px' }}>
              <p style={{ color: '#2D2016', fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>{q}</p>
              <p style={{ color: '#7A6652', fontSize: '14px', fontFamily: 'system-ui, sans-serif', lineHeight: '1.6' }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
