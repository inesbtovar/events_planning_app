// app/api/guests/import-mapped/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getLimits } from '@/lib/plans'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { eventId, guests: rawGuests } = body

    if (!eventId || !rawGuests?.length) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 })
    }

    // Verify ownership
    const { data: event } = await supabase
      .from('events').select('id').eq('id', eventId).eq('user_id', user.id).single()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // ── Enforce plan guest limit ────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', user.id).single()
    const plan = profile?.plan ?? 'free'
    const limits = getLimits(plan)

    // Check guest import feature flag
    if (!limits.guestImport) {
      return NextResponse.json({
        error: 'Guest import is not available on your current plan. Upgrade to Starter or Pro.',
        code: 'PLAN_LIMIT',
      }, { status: 403 })
    }

    if (limits.guests !== Infinity) {
      const { count: existing } = await supabase
        .from('guests')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId)

      const currentCount = existing ?? 0
      const incoming = rawGuests.filter((g: any) => g.name?.trim()).length
      const wouldExceed = currentCount + incoming > limits.guests

      if (wouldExceed) {
        const remaining = Math.max(0, limits.guests - currentCount)
        return NextResponse.json({
          error: `This import would exceed your ${limits.guests}-guest limit. You can add ${remaining} more guest${remaining === 1 ? '' : 's'}. Upgrade to import more.`,
          code: 'PLAN_LIMIT',
        }, { status: 403 })
      }
    }
    // ───────────────────────────────────────────────────────────────────

    const guests = rawGuests
      .filter((g: any) => g.name?.trim())
      .map((g: any) => ({
        event_id: eventId,
        name: g.name.trim(),
        email: g.email?.trim() || null,
        phone: g.phone?.trim() || null,
        dietary: g.dietary?.trim() || null,
        plus_one: g.plusOne ?? false,
        rsvp_token: nanoid(21),
        rsvp_status: 'pending',
      }))

    if (guests.length === 0) {
      return NextResponse.json({ error: 'No valid guests to import' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('guests').insert(guests).select()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, imported: data.length })

  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}