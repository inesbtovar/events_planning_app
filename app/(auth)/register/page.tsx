'use client'
// app/(auth)/register/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="animate-fade-up glass" style={{ borderRadius: '20px', padding: '48px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📬</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '12px' }}>Check your email</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-body)', lineHeight: '1.6', fontWeight: '300' }}>
            We sent a confirmation link to <span style={{ color: 'var(--teal)', fontWeight: '500' }}>{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login" style={{ display: 'inline-block', marginTop: '28px', color: 'var(--teal)', fontSize: '14px', fontFamily: 'var(--font-body)', fontWeight: '500', textDecoration: 'none' }}>
            Back to sign in →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(6,214,160,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>EventsDock</span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-body)', marginTop: '12px', fontWeight: '300' }}>
            Create your free account
          </p>
        </div>

        <div className="glass" style={{ borderRadius: '20px', padding: '36px' }}>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'EMAIL', type: 'email', value: email, onChange: setEmail, placeholder: 'you@example.com', autoComplete: 'email' },
              { label: 'PASSWORD', type: 'password', value: password, onChange: setPassword, placeholder: 'At least 6 characters', autoComplete: 'new-password' },
              { label: 'CONFIRM PASSWORD', type: 'password', value: confirmPassword, onChange: setConfirmPassword, placeholder: 'Repeat your password', autoComplete: 'new-password' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ display: 'block', fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.02em' }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  required
                  autoComplete={f.autoComplete}
                  className="input-dark"
                  style={{ width: '100%', borderRadius: '10px', padding: '12px 16px', fontSize: '15px' }}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ color: '#f87171', fontSize: '13px', fontFamily: 'var(--font-body)' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '14px', borderRadius: '10px', fontSize: '15px', marginTop: '4px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Creating account...' : 'Get started free'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px', fontFamily: 'var(--font-body)' }}>
            By registering you agree to our terms of service.
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', marginTop: '24px', fontWeight: '300' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--teal)', fontWeight: '500', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
