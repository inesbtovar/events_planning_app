'use client'
// app/contact/page.tsx
import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = encodeURIComponent(`Hi, my name is ${name}.\n\n${message}\n\nReply to: ${email}`)
    const subjectEncoded = encodeURIComponent(subject || 'EventsDock Support Request')
    window.location.href = `mailto:eventsdock2026@gmail.com?subject=${subjectEncoded}&body=${body}`
    setSent(true)
  }

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(10,191,188,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)', background: 'rgba(11,22,40,0.85)', position: 'sticky', top: 0, zIndex: 50 }}
        className="px-6 sm:px-12 py-4 flex items-center justify-between">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '10px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>EventsDock</span>
        </Link>
        <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: '14px', textDecoration: 'none' }} className="hover:text-white transition-colors">
          ← Back to home
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="animate-fade-up text-center mb-12">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'var(--teal-glow)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '12px' }}>
            How can we help?
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '300', lineHeight: '1.6' }}>
            Fill in the form and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Common topics */}
        <div className="animate-fade-up-1 grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
          {[
            { icon: '💳', label: 'Billing issue' },
            { icon: '🔑', label: 'Can\'t log in' },
            { icon: '📋', label: 'Guest import' },
            { icon: '📧', label: 'Email invites' },
            { icon: '🌐', label: 'Event page' },
            { icon: '❓', label: 'Other' },
          ].map(t => (
            <button
              key={t.label}
              onClick={() => setSubject(t.label)}
              style={{
                background: subject === t.label ? 'var(--teal-glow)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${subject === t.label ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: '10px', padding: '12px',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: '8px',
                color: subject === t.label ? 'var(--teal)' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: '500',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        {!sent ? (
          <div className="animate-fade-up-2 glass" style={{ borderRadius: '20px', padding: '36px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Your name *
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ana Silva"
                    required
                    className="input-dark"
                    style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Your email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="input-dark"
                    style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What can we help you with?"
                  className="input-dark"
                  style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your issue in as much detail as possible..."
                  required
                  rows={5}
                  className="input-dark"
                  style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px', resize: 'vertical', minHeight: '120px' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '10px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send message
              </button>

              <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>
                This will open your email app. We aim to reply within 24 hours.
              </p>
            </form>
          </div>
        ) : (
          <div className="animate-fade-up glass" style={{ borderRadius: '20px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
              Your email app should have opened
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '300', lineHeight: '1.6', marginBottom: '24px' }}>
              If it didn't open automatically, you can email us directly at{' '}
              <a href="mailto:eventsdock2026@gmail.com" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: '500' }}>
                eventsdock2026@gmail.com
              </a>
            </p>
            <button onClick={() => setSent(false)} className="btn-ghost" style={{ padding: '10px 24px', borderRadius: '9px', fontSize: '14px' }}>
              Send another message
            </button>
          </div>
        )}

        {/* Direct email fallback */}
        <div className="animate-fade-up-3 text-center mt-8">
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Or email us directly at{' '}
            <a href="mailto:eventsdock2026@gmail.com" style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: '500' }}>
              eventsdock2026@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
