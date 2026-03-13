'use client'
// app/dashboard/new/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const name = form.get('name') as string
    const date = form.get('date') as string
    const location = form.get('location') as string
    const description = form.get('description') as string

    // Goes through the API so plan limits are enforced server-side
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date, location, description }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
      // If plan limit, give them a nudge to upgrade
      if (data.code === 'PLAN_LIMIT') {
        setTimeout(() => router.push('/pricing'), 3000)
      }
      return
    }

    router.push(`/dashboard/${data.event.id}`)
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6" style={{ background: 'var(--navy)' }}>
      <div className="glass animate-fade-up" style={{ borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '520px' }}>

        <div style={{ marginBottom: '28px' }}>
          <Link href="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', marginBottom: '16px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            New event
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '300' }}>
            Fill in the details to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Event name *
            </label>
            <input
              name="name"
              required
              placeholder="Ana & João's Wedding"
              className="input-dark"
              style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Date & time
              </label>
              <input
                name="date"
                type="datetime-local"
                className="input-dark"
                style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Location
              </label>
              <input
                name="location"
                placeholder="Quinta da Serra, Sintra"
                className="input-dark"
                style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Description / message
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Join us to celebrate..."
              className="input-dark"
              style={{ borderRadius: '9px', padding: '11px 14px', fontSize: '14px', resize: 'none', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '9px', padding: '12px 14px', fontSize: '13px', color: '#f87171',
            }}>
              {error}
              {error.includes('Upgrade') && (
                <Link href="/pricing" style={{ display: 'block', marginTop: '6px', color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
                  View upgrade options →
                </Link>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={() => router.back()}
              style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '12px', borderRadius: '9px', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ flex: 2, padding: '12px', borderRadius: '9px', fontSize: '14px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Creating...' : 'Create event →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
