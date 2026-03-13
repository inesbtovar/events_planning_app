// app/dashboard/[eventId]/analytics/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getLimits } from '@/lib/plans'

type Props = { params: Promise<{ eventId: string }> }

export default async function AnalyticsPage({ params }: Props) {
  const { eventId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check plan — analytics is Starter+
  const { data: profile } = await supabase
    .from('profiles').select('plan').eq('id', user.id).single()
  const plan = profile?.plan ?? 'free'
  const limits = getLimits(plan)

  const { data: event } = await supabase
    .from('events').select('*').eq('id', eventId).eq('user_id', user.id).single()
  if (!event) notFound()

  const { data: guests } = await supabase
    .from('guests').select('*').eq('event_id', eventId)

  const all = guests ?? []
  const confirmed = all.filter(g => g.rsvp_status === 'confirmed')
  const declined  = all.filter(g => g.rsvp_status === 'declined')
  const pending   = all.filter(g => g.rsvp_status === 'pending')
  const responded = confirmed.length + declined.length
  const responseRate = all.length > 0 ? Math.round((responded / all.length) * 100) : 0
  const plusOnes  = confirmed.filter(g => g.plus_one).length
  const totalAttending = confirmed.length + plusOnes

  // Dietary breakdown
  const dietaryMap: Record<string, number> = {}
  all.forEach(g => {
    if (g.dietary?.trim()) {
      const key = g.dietary.trim().toLowerCase()
      dietaryMap[key] = (dietaryMap[key] ?? 0) + 1
    }
  })
  const dietaryList = Object.entries(dietaryMap).sort((a, b) => b[1] - a[1])

  // Response timeline — group by day responded
  const timelineMap: Record<string, number> = {}
  all.filter(g => g.responded_at).forEach(g => {
    const day = g.responded_at!.slice(0, 10)
    timelineMap[day] = (timelineMap[day] ?? 0) + 1
  })
  const timeline = Object.entries(timelineMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14) // last 14 days

  const maxTimeline = Math.max(...timeline.map(([, v]) => v), 1)

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF6', fontFamily: 'system-ui, sans-serif' }}>

      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #EDE8E0' }} className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link href={`/dashboard/${eventId}`} style={{ color: '#A08060', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {event.name}
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D0C4B4" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span style={{ color: '#2D2016', fontWeight: '600', fontSize: '14px' }}>Analytics</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Plan gate */}
        {!limits.analytics ? (
          <div style={{ textAlign: 'center', padding: '80px 32px', background: 'white', borderRadius: '20px', border: '1px solid #EDE8E0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#2D2016', marginBottom: '8px' }}>Analytics is a paid feature</h2>
            <p style={{ color: '#A08060', fontSize: '14px', marginBottom: '24px' }}>
              Upgrade to Starter or Pro to see response rates, dietary breakdowns, and timeline charts.
            </p>
            <Link href="/pricing" style={{ background: '#2D2016', color: 'white', padding: '12px 28px', borderRadius: '99px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
              View plans
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#2D2016', marginBottom: '4px' }}>{event.name}</h1>
              <p style={{ color: '#A08060', fontSize: '13px' }}>Analytics overview</p>
            </div>

            {all.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 32px', background: 'white', borderRadius: '20px', border: '1px dashed #EDE8E0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>👥</p>
                <p style={{ color: '#A08060', fontSize: '14px' }}>No guests yet. Add guests to see analytics.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Top stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  {[
                    { label: 'Total guests',     value: all.length,       sub: '100%',              color: '#2D2016', bg: 'white' },
                    { label: 'Confirmed',         value: confirmed.length, sub: `${Math.round(confirmed.length / all.length * 100)}%`, color: '#2E7D32', bg: '#F0FAF0' },
                    { label: 'Declined',          value: declined.length,  sub: `${Math.round(declined.length / all.length * 100)}%`,  color: '#C62828', bg: '#FFF5F5' },
                    { label: 'Pending',           value: pending.length,   sub: `${Math.round(pending.length / all.length * 100)}%`,   color: '#E65100', bg: '#FFFBF0' },
                    { label: 'Response rate',     value: `${responseRate}%`, sub: `${responded} of ${all.length}`, color: '#1565C0', bg: '#E3F2FD' },
                    { label: 'Total attending',   value: totalAttending,   sub: `incl. ${plusOnes} plus-one${plusOnes !== 1 ? 's' : ''}`, color: '#6A1B9A', bg: '#F3E5F5' },
                  ].map(stat => (
                    <div key={stat.label} style={{ background: stat.bg, border: '1px solid #EDE8E0', borderRadius: '16px', padding: '20px' }}>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: stat.color, lineHeight: 1 }}>{stat.value}</p>
                      <p style={{ fontSize: '12px', color: '#A08060', marginTop: '4px' }}>{stat.label}</p>
                      <p style={{ fontSize: '11px', color: '#C8A882', marginTop: '2px' }}>{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Response rate bar */}
                <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '24px' }}>
                  <h2 style={{ fontWeight: '600', color: '#2D2016', fontSize: '15px', marginBottom: '16px' }}>RSVP breakdown</h2>
                  <div style={{ display: 'flex', height: '20px', borderRadius: '99px', overflow: 'hidden', gap: '2px', marginBottom: '12px' }}>
                    {confirmed.length > 0 && (
                      <div style={{ flex: confirmed.length, background: '#4CAF50' }} title={`Confirmed: ${confirmed.length}`} />
                    )}
                    {declined.length > 0 && (
                      <div style={{ flex: declined.length, background: '#EF5350' }} title={`Declined: ${declined.length}`} />
                    )}
                    {pending.length > 0 && (
                      <div style={{ flex: pending.length, background: '#EDE8E0' }} title={`Pending: ${pending.length}`} />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#7A6652' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '99px', background: '#4CAF50', display: 'inline-block' }} />
                      Confirmed ({confirmed.length})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '99px', background: '#EF5350', display: 'inline-block' }} />
                      Declined ({declined.length})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '99px', background: '#EDE8E0', display: 'inline-block' }} />
                      Pending ({pending.length})
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                {timeline.length > 0 && (
                  <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '24px' }}>
                    <h2 style={{ fontWeight: '600', color: '#2D2016', fontSize: '15px', marginBottom: '20px' }}>Response timeline (last 14 days)</h2>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '100px' }}>
                      {timeline.map(([day, count]) => (
                        <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#A08060', fontWeight: '600' }}>{count}</span>
                          <div style={{
                            width: '100%', background: '#2D2016', borderRadius: '4px 4px 0 0',
                            height: `${Math.round((count / maxTimeline) * 72)}px`,
                            minHeight: '4px',
                          }} title={`${day}: ${count} response${count !== 1 ? 's' : ''}`} />
                          <span style={{ fontSize: '9px', color: '#C8A882', transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap', marginTop: '6px', marginLeft: '6px' }}>
                            {new Date(day + 'T12:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                  {/* Dietary breakdown */}
                  <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '24px' }}>
                    <h2 style={{ fontWeight: '600', color: '#2D2016', fontSize: '15px', marginBottom: '16px' }}>Dietary restrictions</h2>
                    {dietaryList.length === 0 ? (
                      <p style={{ color: '#A08060', fontSize: '13px' }}>No dietary info collected yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {dietaryList.map(([diet, count]) => (
                          <div key={diet}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '13px', color: '#2D2016', textTransform: 'capitalize' }}>{diet}</span>
                              <span style={{ fontSize: '13px', color: '#A08060', fontWeight: '600' }}>{count}</span>
                            </div>
                            <div style={{ height: '5px', background: '#F5F0E8', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: '#C47A3A', borderRadius: '99px', width: `${Math.round(count / all.length * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Plus ones */}
                  <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '24px' }}>
                    <h2 style={{ fontWeight: '600', color: '#2D2016', fontSize: '15px', marginBottom: '16px' }}>Plus ones</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#7A6652' }}>Guests with plus one</span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#2D2016' }}>{all.filter(g => g.plus_one).length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: '#7A6652' }}>Confirmed with plus one</span>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: '#2E7D32' }}>{plusOnes}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #F5F0E8' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#2D2016' }}>Total heads attending</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#2D2016' }}>{totalAttending}</span>
                      </div>
                    </div>

                    {/* Plus one names */}
                    {confirmed.filter(g => g.plus_one_name).length > 0 && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F5F0E8' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: '#A08060', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Names submitted</p>
                        {confirmed.filter(g => g.plus_one_name).map(g => (
                          <p key={g.id} style={{ fontSize: '13px', color: '#7A6652', marginBottom: '2px' }}>
                            {g.name} → <strong style={{ color: '#2D2016' }}>{g.plus_one_name}</strong>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Guest list summary */}
                <div style={{ background: 'white', border: '1px solid #EDE8E0', borderRadius: '20px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontWeight: '600', color: '#2D2016', fontSize: '15px' }}>Still waiting on</h2>
                    <span style={{ color: '#A08060', fontSize: '13px' }}>{pending.length} pending</span>
                  </div>
                  {pending.length === 0 ? (
                    <p style={{ color: '#A08060', fontSize: '13px' }}>🎉 All guests have responded!</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {pending.slice(0, 20).map(g => (
                        <span key={g.id} style={{ background: '#FFF8E1', border: '1px solid #F5E6C8', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', color: '#7A6652' }}>
                          {g.name}
                        </span>
                      ))}
                      {pending.length > 20 && (
                        <span style={{ background: '#F5F0E8', borderRadius: '99px', padding: '4px 12px', fontSize: '12px', color: '#A08060' }}>
                          +{pending.length - 20} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
