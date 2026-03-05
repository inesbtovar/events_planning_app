// app/pricing/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PLANS } from '@/lib/plans-config'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function checkout(plan: 'starter' | 'pro') {
    setLoading(plan)
    const priceId = plan === 'starter'
      ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setLoading(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF6', fontFamily: 'system-ui, sans-serif' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #EDE8E0', background: 'white' }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" style={{ color: '#2D2016', fontFamily: 'Georgia, serif', fontWeight: '600', fontSize: '18px', textDecoration: 'none' }}>
            EventsDock
          </Link>
          <Link href="/dashboard" style={{ color: '#7A6652', fontSize: '14px', textDecoration: 'none' }}>
            Back to dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '400', color: '#2D2016', fontFamily: 'Georgia, serif', marginBottom: '12px' }}>
            Simple, honest pricing
          </h1>
          <p style={{ color: '#7A6652', fontSize: '17px', lineHeight: '1.6' }}>
            Start free. Upgrade when your event grows.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>

          {/* Free */}
          <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '24px', padding: '32px' }}>
            <p style={{ color: '#A08060', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>FREE</p>
            <p style={{ fontSize: '42px', fontWeight: '700', color: '#2D2016', marginBottom: '4px' }}>€0</p>
            <p style={{ color: '#A08060', fontSize: '13px', marginBottom: '32px' }}>forever</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {PLANS.free.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px', color: '#7A6652' }}>
                  <span style={{ color: '#C47A3A' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/register" style={{
              display: 'block', textAlign: 'center',
              border: '1px solid #EDE8E0', color: '#7A6652',
              padding: '12px', borderRadius: '99px', fontSize: '14px',
              textDecoration: 'none', fontWeight: '500',
            }}>
              Get started free
            </Link>
          </div>

          {/* Starter — highlighted */}
          <div style={{ background: '#2D2016', borderRadius: '24px', padding: '32px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
              background: '#C47A3A', color: 'white', fontSize: '11px', fontWeight: '600',
              padding: '4px 14px', borderRadius: '99px', whiteSpace: 'nowrap',
            }}>
              MOST POPULAR
            </div>
            <p style={{ color: '#C8A882', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>STARTER</p>
            <p style={{ fontSize: '42px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>€9</p>
            <p style={{ color: '#A08060', fontSize: '13px', marginBottom: '32px' }}>/month</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {PLANS.starter.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px', color: '#C8A882' }}>
                  <span style={{ color: '#E8A87C' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => checkout('starter')} disabled={loading === 'starter'} style={{
              display: 'block', width: '100%',
              background: '#E8A87C', color: '#2D2016',
              border: 'none', padding: '12px', borderRadius: '99px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              {loading === 'starter' ? 'Loading...' : 'Get Starter →'}
            </button>
          </div>

          {/* Pro */}
          <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '24px', padding: '32px' }}>
            <p style={{ color: '#A08060', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>PRO</p>
            <p style={{ fontSize: '42px', fontWeight: '700', color: '#2D2016', marginBottom: '4px' }}>€19</p>
            <p style={{ color: '#A08060', fontSize: '13px', marginBottom: '32px' }}>/month</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
              {PLANS.pro.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px', color: '#7A6652' }}>
                  <span style={{ color: '#C47A3A' }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => checkout('pro')} disabled={loading === 'pro'} style={{
              display: 'block', width: '100%',
              background: '#2D2016', color: 'white',
              border: 'none', padding: '12px', borderRadius: '99px',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            }}>
              {loading === 'pro' ? 'Loading...' : 'Get Pro →'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '600px', margin: '80px auto 0' }}>
          <h2 style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontWeight: '400', color: '#2D2016', marginBottom: '40px', fontSize: '28px' }}>
            Common questions
          </h2>
          {[
            { q: 'Can I try before paying?', a: 'Yes — the free plan lets you create a real event with up to 20 guests, no credit card needed.' },
            { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel from your dashboard and you keep access until the end of your billing period.' },
            { q: 'What payment methods do you accept?', a: 'All major credit and debit cards via Stripe, including Visa, Mastercard, and Multibanco.' },
            { q: 'Is there a plan for venues or agencies?', a: 'The Pro plan works great for professionals managing multiple events. B2B plans coming soon.' },
          ].map(item => (
            <div key={item.q} style={{ borderBottom: '1px solid #EDE8E0', padding: '20px 0' }}>
              <p style={{ fontWeight: '600', color: '#2D2016', marginBottom: '6px' }}>{item.q}</p>
              <p style={{ color: '#7A6652', fontSize: '14px', lineHeight: '1.6' }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}