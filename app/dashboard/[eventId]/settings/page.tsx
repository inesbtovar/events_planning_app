'use client'
// app/dashboard/[eventId]/settings/page.tsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const params = useParams()
  const eventId = params.eventId as string
  const router = useRouter()
  const supabase = createClient()

  const [event, setEvent]           = useState<any>(null)
  const [name, setName]             = useState('')
  const [date, setDate]             = useState('')
  const [location, setLocation]     = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!eventId) return
    supabase.from('events').select('*').eq('id', eventId).single()
      .then(({ data }) => {
        if (data) {
          setEvent(data)
          setName(data.name || '')
          setDate(data.date ? data.date.slice(0, 16) : '')
          setLocation(data.location || '')
          setDescription(data.description || '')
        }
      })
  }, [eventId])

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase.from('events')
      .update({ name, date: date || null, location: location || null, description: description || null })
      .eq('id', eventId)
    if (error) toast.error(error.message)
    else toast.success('Settings saved!')
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) { toast.error(error.message); setDeleting(false); return }
    toast.success('Event deleted')
    router.push('/dashboard')
  }

  async function handleTogglePublish() {
    const newState = !event.is_published
    const { error } = await supabase.from('events').update({ is_published: newState }).eq('id', eventId)
    if (error) toast.error(error.message)
    else { setEvent({ ...event, is_published: newState }); toast.success(newState ? 'Event published! 🎉' : 'Event unpublished') }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid var(--border)', borderRadius: '9px',
    padding: '10px 14px', fontSize: '14px', color: 'var(--text-primary)',
    background: 'rgba(255,255,255,0.04)', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'var(--font-body)',
  }

  if (!event) return (
    <div className="min-h-screen grid-bg flex items-center justify-center" style={{ background: 'var(--navy)' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--teal)', borderRadius: '99px' }} className="animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', fontFamily: 'var(--font-body)' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(11,22,40,0.9)', backdropFilter: 'blur(20px)' }} className="px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href={`/dashboard/${eventId}`} style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            className="hover:opacity-70 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {event.name}
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '14px' }}>Settings</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Event details */}
        <div className="glass animate-fade-up" style={{ borderRadius: '16px', padding: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-primary)', fontSize: '17px', marginBottom: '20px' }}>
            Event details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Event name
              </label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-dark" style={{ borderRadius: '9px', padding: '10px 14px', fontSize: '14px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Date & time
                </label>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)}
                  className="input-dark" style={{ borderRadius: '9px', padding: '10px 14px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Location
                </label>
                <input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="Venue name or address" className="input-dark"
                  style={{ borderRadius: '9px', padding: '10px 14px', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
                Description
              </label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} placeholder="A message for your guests..."
                className="input-dark" style={{ borderRadius: '9px', padding: '10px 14px', fontSize: '14px', resize: 'none', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary"
              style={{ padding: '11px', borderRadius: '9px', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {/* Publish toggle */}
        <div className="glass animate-fade-up-1" style={{ borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-primary)', fontSize: '17px', marginBottom: '4px' }}>
                Visibility
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '300' }}>
                {event.is_published
                  ? 'Your event is live. Guests can view it and RSVP.'
                  : 'Your event is a draft. Only you can see it.'}
              </p>
            </div>
            <button onClick={handleTogglePublish} style={{
              flexShrink: 0, padding: '9px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: '600',
              border: 'none', cursor: 'pointer',
              background: event.is_published ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, var(--teal), var(--green))',
              color: event.is_published ? 'var(--text-secondary)' : '#0B1628',
            }}>
              {event.is_published ? 'Unpublish' : 'Publish event'}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="animate-fade-up-2" style={{ borderRadius: '16px', padding: '24px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.04)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: '#f87171', fontSize: '17px', marginBottom: '6px' }}>
            Danger zone
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: '300' }}>
            Deleting this event removes all guests and data permanently. This cannot be undone.
          </p>
          {confirmDelete && (
            <p style={{ fontSize: '13px', color: '#f87171', fontWeight: '500', marginBottom: '12px', background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ Click again to confirm — this is permanent.
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleDelete} disabled={deleting} style={{
              background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
              padding: '9px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}>
              {deleting ? 'Deleting...' : confirmDelete ? 'Yes, delete forever' : 'Delete event'}
            </button>
            {confirmDelete && (
              <button onClick={() => setConfirmDelete(false)} style={{ background: 'none', border: 'none', fontSize: '13px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
