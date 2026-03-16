'use client'
// components/dashboard/GuestTable.tsx
import { useState } from 'react'
import toast from 'react-hot-toast'

type Guest = {
  id: string
  name: string
  email: string | null
  phone: string | null
  rsvp_status: string
  rsvp_token: string
  plus_one: boolean
  plus_one_name: string | null
  dietary: string | null
  responded_at: string | null
}

type Props = {
  guests: Guest[]
  eventSlug: string
  appUrl: string
}

type Filter = 'all' | 'confirmed' | 'declined' | 'pending'

const STATUS: Record<string, { bg: string; color: string; label: string }> = {
  confirmed: { bg: '#E8F5E9', color: '#2E7D32', label: 'Confirmed' },
  declined:  { bg: '#FFEBEE', color: '#C62828', label: 'Declined' },
  pending:   { bg: '#FFF8E1', color: '#E65100', label: 'Pending' },
}

// ── Reusable input style ──────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #EDE8E0',
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '14px',
  color: '#2D2016',
  background: '#FDFAF6',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function GuestTable({ guests: initial, eventSlug, appUrl }: Props) {
  const [guests, setGuests]   = useState<Guest[]>(initial)
  const [filter, setFilter]   = useState<Filter>('all')
  const [copied, setCopied]   = useState<string | null>(null)

  // Edit modal
  const [editing, setEditing]         = useState<Guest | null>(null)
  const [editName, setEditName]       = useState('')
  const [editEmail, setEditEmail]     = useState('')
  const [editPhone, setEditPhone]     = useState('')
  const [editDietary, setEditDietary] = useState('')
  const [editPlus, setEditPlus]       = useState(false)
  const [saving, setSaving]           = useState(false)

  // Delete modal
  const [deleting, setDeleting]   = useState<Guest | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Helpers ────────────────────────────────────────────────────────
  function rsvpLink(token: string) {
    return `${appUrl}/event/${eventSlug}/rsvp/${token}`
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(rsvpLink(token))
    setCopied(token)
    toast.success('Link copied!')
    setTimeout(() => setCopied(null), 2000)
  }

  function whatsappLink(guest: Guest) {
    const link = rsvpLink(guest.rsvp_token)
    const msg = encodeURIComponent(`Hi ${guest.name}! You're invited. Please RSVP here: ${link}`)
    const num = guest.phone?.replace(/\D/g, '') ?? ''
    return num ? `https://wa.me/${num}?text=${msg}` : `https://wa.me/?text=${msg}`
  }

  // ── Edit ──────────────────────────────────────────────────────────
  function openEdit(g: Guest) {
    setEditing(g)
    setEditName(g.name)
    setEditEmail(g.email ?? '')
    setEditPhone(g.phone ?? '')
    setEditDietary(g.dietary ?? '')
    setEditPlus(g.plus_one)
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: editing.id,
          name: editName,
          email: editEmail,
          phone: editPhone,
          dietary: editDietary,
          plusOne: editPlus,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGuests(prev => prev.map(g => g.id === editing.id ? data.guest : g))
      toast.success('Guest updated')
      setEditing(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/guests?guestId=${deleting.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGuests(prev => prev.filter(g => g.id !== deleting.id))
      toast.success(`${deleting.name} removed`)
      setDeleting(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Filtered list ─────────────────────────────────────────────────
  const counts = {
    all:       guests.length,
    confirmed: guests.filter(g => g.rsvp_status === 'confirmed').length,
    declined:  guests.filter(g => g.rsvp_status === 'declined').length,
    pending:   guests.filter(g => g.rsvp_status === 'pending').length,
  }
  const filtered = filter === 'all' ? guests : guests.filter(g => g.rsvp_status === filter)

  // ── Empty state ───────────────────────────────────────────────────
  if (guests.length === 0) {
    return (
      <div style={{ padding: '52px 24px', textAlign: 'center' }}>
        <div style={{
          width: '52px', height: '52px', background: '#FDF0E6', borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C47A3A" strokeWidth="1.8" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <p style={{ fontWeight: '600', color: '#2D2016', fontSize: '15px', marginBottom: '6px' }}>
          No guests yet
        </p>
        <p style={{ color: '#A08060', fontSize: '13px' }}>
          Add guests one by one or import from Excel
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Filter tabs */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #F5F0E8', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {(['all', 'confirmed', 'declined', 'pending'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: '99px', fontSize: '12px',
            fontWeight: '500', border: 'none', cursor: 'pointer',
            background: filter === f ? '#2D2016' : '#F5F0E8',
            color: filter === f ? 'white' : '#7A6652',
            transition: 'all 0.15s',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}{' '}
            <span style={{ opacity: 0.6 }}>({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F5F0E8' }}>
              {['Guest', 'Contact', 'Status', 'Responded', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '10px 20px', textAlign: 'left', fontWeight: '500',
                  color: '#A08060', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(guest => {
              const s = STATUS[guest.rsvp_status] ?? STATUS.pending
              return (
                <tr key={guest.id} style={{ borderBottom: '1px solid #FAF7F4' }}
                  className="hover:bg-stone-50 transition-colors">

                  {/* Name */}
                  <td style={{ padding: '14px 20px' }}>
                    <p style={{ fontWeight: '500', color: '#2D2016', marginBottom: '2px' }}>{guest.name}</p>
                    {guest.plus_one && (
                      <p style={{ fontSize: '11px', color: '#A08060' }}>
                        +1{guest.plus_one_name ? `: ${guest.plus_one_name}` : ''}
                      </p>
                    )}
                    {guest.dietary && (
                      <p style={{ fontSize: '11px', color: '#B0A090', marginTop: '1px' }}>{guest.dietary}</p>
                    )}
                  </td>

                  {/* Contact */}
                  <td style={{ padding: '14px 20px', color: '#7A6652' }}>
                    {guest.email && <p style={{ marginBottom: '2px' }}>{guest.email}</p>}
                    {guest.phone && <p style={{ fontSize: '12px', color: '#A08060' }}>{guest.phone}</p>}
                    {!guest.email && !guest.phone && <span style={{ color: '#D0C4B4' }}>—</span>}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background: s.bg, color: s.color,
                      padding: '3px 10px', borderRadius: '99px',
                      fontSize: '11px', fontWeight: '600',
                    }}>
                      {s.label}
                    </span>
                  </td>

                  {/* Responded */}
                  <td style={{ padding: '14px 20px', color: '#B0A090', fontSize: '12px' }}>
                    {guest.responded_at
                      ? new Date(guest.responded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>

                      {/* Send invite row — the main action */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {guest.rsvp_status === 'pending' && (
                          <span style={{ fontSize: '11px', color: '#C47A3A', fontWeight: '500', marginRight: '2px' }}>
                            Send invite:
                          </span>
                        )}

                        {/* WhatsApp — primary if they have a phone */}
                        {guest.phone ? (
                          <a href={whatsappLink(guest)} target="_blank" rel="noopener noreferrer" style={{
                            background: '#2D2016', color: 'white',
                            padding: '6px 14px', borderRadius: '99px',
                            fontSize: '12px', fontWeight: '500', textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: '5px',
                          }} className="hover:opacity-80 transition-opacity">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Send via WhatsApp
                          </a>
                        ) : (
                          /* No phone — copy link is the primary action */
                          <button onClick={() => copyLink(guest.rsvp_token)} style={{
                            background: copied === guest.rsvp_token ? '#E8F5E9' : '#2D2016',
                            color: copied === guest.rsvp_token ? '#2E7D32' : 'white',
                            border: 'none', padding: '6px 14px', borderRadius: '99px',
                            fontSize: '12px', fontWeight: '500', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '5px',
                            transition: 'all 0.15s',
                          }}>
                            {copied === guest.rsvp_token
                              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            }
                            {copied === guest.rsvp_token ? 'Link copied!' : 'Copy invite link'}
                          </button>
                        )}

                        {/* If they have a phone, also show copy as secondary */}
                        {guest.phone && (
                          <button onClick={() => copyLink(guest.rsvp_token)} style={{
                            background: copied === guest.rsvp_token ? '#E8F5E9' : '#F5F0E8',
                            color: copied === guest.rsvp_token ? '#2E7D32' : '#7A6652',
                            border: 'none', padding: '6px 12px', borderRadius: '99px',
                            fontSize: '12px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '4px',
                            transition: 'all 0.15s',
                          }} title="Copy the RSVP link to send via any other app">
                            {copied === guest.rsvp_token
                              ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            }
                            {copied === guest.rsvp_token ? 'Copied!' : 'Copy link'}
                          </button>
                        )}
                      </div>

                      {/* Secondary actions row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => openEdit(guest)} style={{
                          background: 'none', color: '#A08060', border: 'none',
                          padding: '3px 0', fontSize: '12px', cursor: 'pointer',
                          textDecoration: 'underline', textDecorationColor: '#D0C4B4',
                        }} className="hover:opacity-70 transition-opacity">
                          Edit
                        </button>
                        <span style={{ color: '#D0C4B4', fontSize: '12px' }}>·</span>
                        <button onClick={() => setDeleting(guest)} style={{
                          background: 'none', color: '#C08080', border: 'none',
                          padding: '3px 0', fontSize: '12px', cursor: 'pointer',
                          textDecoration: 'underline', textDecorationColor: '#E0C4C4',
                        }} className="hover:opacity-70 transition-opacity">
                          Remove
                        </button>
                      </div>

                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Edit Modal ──────────────────────────────────────────────── */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setEditing(null) }}>
          <div style={{
            background: 'white', borderRadius: '24px',
            width: '100%', maxWidth: '440px',
            overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
          }}>
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: '600', color: '#2D2016', fontSize: '16px', margin: 0 }}>Edit guest</h3>
              <button onClick={() => setEditing(null)} style={{
                background: '#F5F0E8', border: 'none', borderRadius: '99px',
                width: '28px', height: '28px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7A6652',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={saveEdit} style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>
                    Full name <span style={{ color: '#C47A3A' }}>*</span>
                  </label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    required autoFocus style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#C47A3A'}
                    onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>Email</label>
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                      placeholder="email@example.com" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#C47A3A'}
                      onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>Phone</label>
                    <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                      placeholder="912 345 678" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#C47A3A'}
                      onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#7A6652', marginBottom: '5px' }}>Dietary restrictions</label>
                  <input value={editDietary} onChange={e => setEditDietary(e.target.value)}
                    placeholder="e.g. vegetarian, gluten-free..." style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#C47A3A'}
                    onBlur={e => e.target.style.borderColor = '#EDE8E0'} />
                </div>

                {/* Plus one toggle */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#FDFAF6', border: '1px solid #EDE8E0', borderRadius: '10px', padding: '10px 14px',
                }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#2D2016' }}>Plus one</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#A08060' }}>Guest may bring a companion</p>
                  </div>
                  <button type="button" onClick={() => setEditPlus(!editPlus)} style={{
                    width: '40px', height: '22px', borderRadius: '99px', border: 'none',
                    background: editPlus ? '#2D2016' : '#D0C4B4',
                    cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                    <div style={{
                      position: 'absolute', top: '2px',
                      left: editPlus ? '20px' : '2px',
                      width: '18px', height: '18px',
                      background: 'white', borderRadius: '99px',
                      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditing(null)} style={{
                  flex: 1, background: '#F5F0E8', color: '#7A6652',
                  border: 'none', padding: '11px', borderRadius: '99px', fontSize: '14px', cursor: 'pointer',
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{
                  flex: 2, background: '#2D2016', color: 'white',
                  border: 'none', padding: '11px', borderRadius: '99px',
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                }} className="hover:opacity-80 transition-opacity disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ───────────────────────────────── */}
      {deleting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }} onClick={e => { if (e.target === e.currentTarget) setDeleting(null) }}>
          <div style={{
            background: 'white', borderRadius: '24px',
            width: '100%', maxWidth: '360px', padding: '28px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.15)', textAlign: 'center',
          }}>
            <div style={{
              width: '48px', height: '48px', background: '#FFEBEE', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <h3 style={{ fontWeight: '600', color: '#2D2016', fontSize: '16px', marginBottom: '8px' }}>
              Remove {deleting.name}?
            </h3>
            <p style={{ color: '#A08060', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
              This will permanently delete this guest and their RSVP link. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setDeleting(null)} style={{
                flex: 1, background: '#F5F0E8', color: '#7A6652',
                border: 'none', padding: '11px', borderRadius: '99px', fontSize: '14px', cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={deleteLoading} style={{
                flex: 1, background: '#C62828', color: 'white',
                border: 'none', padding: '11px', borderRadius: '99px',
                fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              }} className="hover:opacity-80 transition-opacity disabled:opacity-50">
                {deleteLoading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
