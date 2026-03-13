// app/dashboard/[eventId]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import GuestTable from '@/components/dashboard/GuestTable'
import GuestImport from '@/components/dashboard/GuestImport'

type Props = { params: Promise<{ eventId: string }> }

export default async function EventPage({ params }: Props) {
  const { eventId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('user_id', user.id)
    .single()

  if (!event) notFound()

  const { data: guests } = await supabase
    .from('guests')
    .select('*')
    .eq('event_id', eventId)
    .order('name')

  const confirmed = guests?.filter(g => g.rsvp_status === 'confirmed').length ?? 0
  const declined  = guests?.filter(g => g.rsvp_status === 'declined').length ?? 0
  const pending   = guests?.filter(g => g.rsvp_status === 'pending').length ?? 0
  const total     = guests?.length ?? 0

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const publicUrl = `${appUrl}/event/${event.slug}`

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF6', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #EDE8E0' }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/dashboard" style={{ color: '#A08060', fontSize: '14px' }} className="hover:opacity-70 transition-opacity flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Dashboard
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D0C4B4" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: '#2D2016', fontWeight: '600', fontSize: '14px' }}>{event.name}</span>
          <div className="ml-auto flex items-center gap-3">
            <span style={{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '99px',
              fontWeight: '500',
              background: event.is_published ? '#E8F5E9' : '#F5F0E8',
              color: event.is_published ? '#2E7D32' : '#8B6F47',
            }}>
              {event.is_published ? 'Live' : 'Draft'}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Event info + actions */}
        <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#2D2016', fontFamily: "'Georgia', serif", marginBottom: '4px' }}>
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3" style={{ color: '#A08060', fontSize: '13px' }}>
              {event.date && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {new Date(event.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {event.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              style={{ border: '1px solid #EDE8E0', background: 'white', color: '#7A6652', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className="hover:border-stone-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              View site
            </a>
            <Link href={`/dashboard/${event.id}/website`}
              style={{ border: '1px solid #EDE8E0', background: 'white', color: '#7A6652', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className="hover:border-stone-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="13.5" cy="6.5" r="0.5"/><circle cx="17.5" cy="10.5" r="0.5"/><circle cx="8.5" cy="7.5" r="0.5"/>
                <circle cx="6.5" cy="12.5" r="0.5"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
              Edit template
            </Link>
            <Link href={`/dashboard/${event.id}/settings`}
              style={{ border: '1px solid #EDE8E0', background: 'white', color: '#7A6652', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className="hover:border-stone-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Settings
            </Link>
            <Link href={`/dashboard/${event.id}/analytics`}
              style={{ border: '1px solid #EDE8E0', background: 'white', color: '#7A6652', padding: '8px 16px', borderRadius: '99px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              className="hover:border-stone-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Analytics
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: total, bg: 'white', accent: '#2D2016' },
            { label: 'Confirmed', value: confirmed, bg: '#F0FAF0', accent: '#2E7D32' },
            { label: 'Declined', value: declined, bg: '#FFF5F5', accent: '#C62828' },
            { label: 'Pending', value: pending, bg: '#FFFBF0', accent: '#E65100' },
          ].map(stat => (
            <div key={stat.label} style={{ background: stat.bg, border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px' }}>
              <p style={{ fontSize: '30px', fontWeight: '700', color: stat.accent, lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: '13px', color: '#A08060', marginTop: '4px' }}>{stat.label}</p>
              {total > 0 && stat.label !== 'Total' && (
                <p style={{ fontSize: '11px', color: '#C8A882', marginTop: '2px' }}>
                  {Math.round((stat.value / total) * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Guest list */}
        <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F5F0E8' }} className="flex items-center justify-between">
            <div>
              <h2 style={{ fontWeight: '600', color: '#2D2016', fontSize: '16px' }}>Guest List</h2>
              <p style={{ color: '#A08060', fontSize: '12px', marginTop: '2px' }}>
                Add your guests, then send each person their personal RSVP link via WhatsApp or copy it manually
              </p>
            </div>
            <GuestImport eventId={event.id} />
          </div>
          <GuestTable guests={guests ?? []} eventSlug={event.slug} appUrl={appUrl} />
        </div>

      </main>
    </div>
  )
}
