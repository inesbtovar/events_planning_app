// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/dashboard/SignOutButton'


export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('events')
    .select('*, guests(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const firstName = user.email?.split('@')[0] ?? 'there'

  return (
    <div className="min-h-screen" style={{ background: '#FDFAF6', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #EDE8E0' }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div style={{ background: '#E8A87C', borderRadius: '8px' }} className="w-6 h-6 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span style={{ color: '#2D2016', fontWeight: '600', fontSize: '16px' }}>EventsDock</span>
          </div>
          <div className="flex items-center gap-5">
  <span style={{ color: '#A08060', fontSize: '13px' }} className="hidden sm:block">{user.email}</span>
  <div className="flex items-center gap-4">
    <Link href="/pricing" style={{
      fontSize: '13px',
      color: '#C47A3A',
      fontWeight: '500',
      border: '1px solid #F0D5B8',
      background: '#FDF0E6',
      padding: '6px 14px',
      borderRadius: '99px',
    }} className="hover:opacity-80 transition-opacity">
      ✦ Upgrade
    </Link>
    <SignOutButton />
  </div>
</div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '400', color: '#2D2016', fontFamily: "'Georgia', serif", marginBottom: '6px' }}>
              Hello, {firstName} 👋
            </h1>
            <p style={{ color: '#A08060', fontSize: '14px' }}>
              {events && events.length > 0
                ? `You have ${events.length} event${events.length === 1 ? '' : 's'}`
                : 'Create your first event to get started'}
            </p>
          </div>
          <Link href="/dashboard/new" style={{
            background: '#2D2016',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '99px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }} className="hover:opacity-80 transition-opacity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New event
          </Link>
        </div>

        {/* Events grid */}
        {events && events.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event) => {
              const guestCount = (event.guests as any)?.[0]?.count ?? 0
              return (
                <Link key={event.id} href={`/dashboard/${event.id}`}
                  style={{
                    background: 'white',
                    border: '1px solid #EDE8E0',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'block',
                    transition: 'all 0.15s',
                  }}
                  className="hover:shadow-md hover:border-stone-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 style={{ fontWeight: '600', color: '#2D2016', fontSize: '16px', marginBottom: '6px' }} className="truncate">
                        {event.name}
                      </h3>
                      {event.date && (
                        <p style={{ color: '#7A6652', fontSize: '13px', marginBottom: '2px' }}>
                          {new Date(event.date).toLocaleDateString('pt-PT', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </p>
                      )}
                      {event.location && (
                        <p style={{ color: '#B0A090', fontSize: '13px' }} className="truncate">
                          {event.location}
                        </p>
                      )}
                    </div>
                    <span style={{
                      flexShrink: 0,
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

                  <div style={{ borderTop: '1px solid #F5F0E8', marginTop: '16px', paddingTop: '16px' }}
                    className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5" style={{ color: '#A08060', fontSize: '13px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                    </div>
                    <span style={{ color: '#C8A882', fontSize: '12px', textTransform: 'capitalize' }}>
                      {event.template} template
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{
            background: 'white',
            border: '2px dashed #EDE8E0',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: '#FDF0E6',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C47A3A" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 style={{ color: '#2D2016', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
              No events yet
            </h3>
            <p style={{ color: '#A08060', fontSize: '14px', marginBottom: '24px' }}>
              Create your first event and start inviting guests
            </p>
            <Link href="/dashboard/new" style={{
              background: '#2D2016',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '99px',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
            }} className="hover:opacity-80 transition-opacity">
              Create event
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
