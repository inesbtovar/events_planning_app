'use client'
// app/admin/discount-codes/page.tsx
// Access is fully blocked by middleware — this page only renders if the
// correct ADMIN_SECRET was provided in the URL query param
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type Code = {
  id: string
  code: string
  percent: number
  active: boolean
  max_uses: number | null
  used_count: number
  expires_at: string | null
  created_at: string
}

function AdminDiscountCodesInner() {
  const searchParams = useSearchParams()
  // Secret comes from URL: /admin/discount-codes?key=YOUR_SECRET
  // Never stored in NEXT_PUBLIC_ env vars — only validated server-side
  const secret = searchParams.get('key') || ''

  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [manualSecret, setManualSecret] = useState('')

  const [form, setForm] = useState({ code: '', percent: '', max_uses: '', expires_at: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const fetchCodes = useCallback(async (s: string) => {
    setLoading(true)
    const res = await fetch('/api/admin/discount-codes', {
      headers: { 'x-admin-secret': s },
    })
    if (res.ok) {
      const data = await res.json()
      setCodes(data.codes)
      setAuthed(true)
      setAuthError('')
    } else {
      setAuthed(false)
      setAuthError('Incorrect password.')
    }
    setLoading(false)
  }, [])

  // Auto-auth if key is in URL
  useEffect(() => {
    if (secret) fetchCodes(secret)
    else setLoading(false)
  }, [secret, fetchCodes])

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!manualSecret.trim()) return
    fetchCodes(manualSecret)
  }

  const activeSecret = authed ? (secret || manualSecret) : ''

  async function createCode(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    const res = await fetch('/api/admin/discount-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': activeSecret },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        percent: Number(form.percent),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        expires_at: form.expires_at || null,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setSaveMsg('✓ Code created!')
      setForm({ code: '', percent: '', max_uses: '', expires_at: '' })
      fetchCodes(activeSecret)
    } else {
      setSaveMsg(data.error || 'Failed to create code')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  async function toggleActive(code: Code) {
    await fetch('/api/admin/discount-codes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': activeSecret },
      body: JSON.stringify({ id: code.id, active: !code.active }),
    })
    fetchCodes(activeSecret)
  }

  async function deleteCode(id: string) {
    if (!confirm('Delete this code? This cannot be undone.')) return
    await fetch('/api/admin/discount-codes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': activeSecret },
      body: JSON.stringify({ id }),
    })
    fetchCodes(activeSecret)
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6" style={{ background: 'var(--navy)' }}>
      <div className="glass animate-fade-up" style={{ borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '360px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>Admin access</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', fontWeight: '300' }}>Discount code manager</p>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="password"
            value={manualSecret}
            onChange={e => setManualSecret(e.target.value)}
            placeholder="Admin password"
            className="input-dark"
            style={{ borderRadius: '9px', padding: '12px 14px', fontSize: '14px' }}
            autoFocus
          />
          {authError && <p style={{ color: '#f87171', fontSize: '13px', margin: 0 }}>{authError}</p>}
          <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: '9px', fontSize: '14px', width: '100%' }}>
            {loading ? 'Checking...' : 'Access'}
          </button>
        </form>
      </div>
    </div>
  )

  // ── Admin dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', fontFamily: 'var(--font-body)' }}>
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11,22,40,0.9)', backdropFilter: 'blur(20px)' }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>EventsDock</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>/ Admin / Discount codes</span>
          </div>
          <span style={{ background: 'var(--teal-glow)', border: '1px solid var(--border)', color: 'var(--teal)', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '99px', letterSpacing: '0.08em' }}>ADMIN</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Create form */}
        <div className="glass animate-fade-up" style={{ borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Create discount code
          </h2>
          <form onSubmit={createCode}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Code *', key: 'code', type: 'text', placeholder: 'SUMMER20', style: { fontWeight: '600', letterSpacing: '0.05em' } },
                { label: '% Off *', key: 'percent', type: 'number', placeholder: '20', min: 1, max: 100 },
                { label: 'Max uses', key: 'max_uses', type: 'number', placeholder: 'Unlimited', min: 1 },
                { label: 'Expires', key: 'expires_at', type: 'date', placeholder: '' },
              ].map(({ label, key, type, placeholder, ...rest }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' as any, marginBottom: '6px' }}>{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: key === 'code' ? e.target.value.toUpperCase() : e.target.value }))}
                    placeholder={placeholder}
                    required={label.includes('*')}
                    className="input-dark"
                    style={{ borderRadius: '8px', padding: '10px 12px', fontSize: '14px' }}
                    {...rest}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px', fontSize: '14px', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Creating...' : 'Create code'}
              </button>
              {saveMsg && (
                <span style={{
                  fontSize: '13px', fontWeight: '600', padding: '5px 12px', borderRadius: '99px',
                  background: saveMsg.startsWith('✓') ? 'rgba(6,214,160,0.12)' : 'rgba(239,68,68,0.1)',
                  color: saveMsg.startsWith('✓') ? 'var(--green)' : '#f87171',
                  border: `1px solid ${saveMsg.startsWith('✓') ? 'rgba(6,214,160,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                  {saveMsg}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Codes table */}
        <div className="glass animate-fade-up-1" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>All codes</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{codes.length} total</span>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : codes.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No codes yet. Create your first one above.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Code', '% Off', 'Uses', 'Expires', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {codes.map(code => {
                    const expired = code.expires_at ? new Date(code.expires_at) < new Date() : false
                    const exhausted = code.max_uses !== null && code.used_count >= code.max_uses
                    const status = !code.active ? 'inactive' : expired ? 'expired' : exhausted ? 'exhausted' : 'active'
                    const sc = {
                      active:    { bg: 'rgba(6,214,160,0.1)',  color: 'var(--green)',      border: 'rgba(6,214,160,0.3)' },
                      inactive:  { bg: 'rgba(74,99,128,0.2)',  color: 'var(--text-muted)', border: 'transparent' },
                      expired:   { bg: 'rgba(239,68,68,0.1)',  color: '#f87171',           border: 'rgba(239,68,68,0.3)' },
                      exhausted: { bg: 'rgba(251,146,60,0.1)', color: '#fb923c',           border: 'rgba(251,146,60,0.3)' },
                    }[status]
                    return (
                      <tr key={code.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>{code.code}</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px' }}>{code.percent}%</span>
                        </td>
                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                          {code.used_count}{code.max_uses !== null ? ` / ${code.max_uses}` : ' / ∞'}
                        </td>
                        <td style={{ padding: '14px 20px', color: expired ? '#f87171' : 'var(--text-secondary)', fontSize: '13px' }}>
                          {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : <span style={{ color: 'var(--text-muted)' }}>Never</span>}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: '99px', padding: '3px 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => toggleActive(code)} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                              {code.active ? 'Disable' : 'Enable'}
                            </button>
                            <button onClick={() => deleteCode(code.id)} style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#f87171', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDiscountCodesPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--navy)', minHeight: '100vh' }} />}>
      <AdminDiscountCodesInner />
    </Suspense>
  )
}
