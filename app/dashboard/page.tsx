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

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const firstName = user.email?.split('@')[0] ?? 'there'

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--navy)', fontFamily: 'var(--font-body)' }}>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)', background: 'rgba(11,22,40,0.9)', position: 'sticky', top: 0, zIndex: 50 }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--teal), var(--green))', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B1628" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>EventsDock</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }} className="hidden sm:block">{user.email}</span>
            <Link href="/dashboard/billing" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--teal-glow)', border: '1px solid var(--border)',
              borderRadius: '99px', padding: '4px 12px',
              fontSize: '12px', fontWeight: '600',
              color: 'var(--teal)', textDecoration: 'none',
              fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {plan}
            </Link>
            <Link href="/dashboard/billing" style={{ color: 'var(--text-secondary)', fontSize: '13px', textDecoration: 'none' }} className="hover:text-white transition-colors">
              Billing
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="animate-fade-up flex items-start justify-between mb-10">
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: '6px' }}>
              Hello, {firstName} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '300' }}>
              {events && events.length > 0
                ? `You have ${events.length} event${events.length === 1 ? '' : 's'}`
                : 'Create your first event to get started'}
            </p>
          </div>
          <Link href="/dashboard/new" className="btn-primary" style={{
            padding: '10px 20px', borderRadius: '9px', fontSize: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New event
          </Link>
        </div>

        {/* Events grid */}
        {events && events.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((event, i) => {
              const guestCount = (event.guests as any)?.[0]?.count ?? 0
              return (
                <Link key={event.id} href={`/dashboard/${event.id}`}
                  className={`glass animate-fade-up-delay-${Math.min(i + 1, 4)}`}
                  style={{
                    borderRadius: '16px', padding: '24px', display: 'block',
                    textDecoration: 'none', transition: 'border-color 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(10,191,188,0.35)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--text-primary)', fontSize: '17px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.name}
                      </h3>
                      {event.date && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '2px', fontWeight: '300' }}>
                          {new Date(event.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}
                      {event.location && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {event.location}
                        </p>
                      )}
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: '11px', padding: '4px 10px', borderRadius: '99px',
                      fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase',
                      background: event.is_published ? 'rgba(6,214,160,0.15)' : 'rgba(10,191,188,0.1)',
                      color: event.is_published ? 'var(--green)' : 'var(--teal)',
                      border: `1px solid ${event.is_published ? 'rgba(6,214,160,0.3)' : 'var(--border)'}`,
                    }}>
                      {event.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '16px', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      {guestCount} {guestCount === 1 ? 'guest' : 'guests'}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'capitalize' }}>
                      {event.template} template
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="animate-fade-up-delay-1" style={{
            border: '1px dashed var(--border)', borderRadius: '20px',
            padding: '64px 32px', textAlign: 'center',
          }}>
            <div style={{
              width: '56px', height: '56px', background: 'var(--teal-glow)',
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: '700', fontSize: '18px', marginBottom: '8px' }}>
              No events yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px', fontWeight: '300' }}>
              Create your first event and start inviting guests
            </p>
            <Link href="/dashboard/new" className="btn-primary" style={{
              padding: '12px 28px', borderRadius: '9px', fontSize: '14px',
              display: 'inline-block', textDecoration: 'none',
            }}>
              Create event
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
