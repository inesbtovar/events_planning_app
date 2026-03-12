// app/api/rsvp/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getIP } from '@/lib/rate-limit'
import { nanoid } from 'nanoid'

type Params = { params: Promise<{ token: string }> }

const INVALID_LINK = { error: 'Invalid invitation link' }

function sanitize(value: unknown, maxLength = 500): string | null {
  if (!value || typeof value !== 'string') return null
  return value.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim().substring(0, maxLength) || null
}

// FIX #1: Token is now 21 chars (nanoid default — 10^30 combinations vs 10^21 before)
// FIX #7: isValidToken now matches 21 chars
function isValidToken(token: string): boolean {
  return /^[A-Za-z0-9_-]{21}$/.test(token)
}

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = await params
  const ip = getIP(request)
  const limit = rateLimit(ip, 'rsvp:get', { limit: 60, windowMs: 60 * 60 * 1000 })
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  if (!isValidToken(token)) {
    return NextResponse.json(INVALID_LINK, { status: 404 })
  }

  const admin = createAdminClient()
  const { data: guest, error } = await admin
    .from('guests')
    .select(`
      id, name, rsvp_status, plus_one, plus_one_name, dietary, responded_at, event_id,
      events ( id, name, slug, date, location, description, template, template_config, cover_image, is_published )
    `)
    .eq('rsvp_token', token)
    .single()

  if (error || !guest) {
    return NextResponse.json(INVALID_LINK, { status: 404 })
  }

  const event = guest.events as any

  // FIX #7: Return identical error for unpublished events — don't reveal token exists
  if (!event?.is_published && guest.rsvp_status === 'pending') {
    return NextResponse.json(INVALID_LINK, { status: 404 })
  }

  return NextResponse.json({ guest })
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params
  const ip = getIP(request)
  const limit = rateLimit(ip, 'rsvp:post', { limit: 10, windowMs: 60 * 60 * 1000 })
  if (!limit.allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  if (!isValidToken(token)) {
    return NextResponse.json(INVALID_LINK, { status: 404 })
  }

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { status, plusOneName, dietary, notes } = body
  if (!['confirmed', 'declined'].includes(status)) {
    return NextResponse.json({ error: 'Status must be "confirmed" or "declined"' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('guests').select('id').eq('rsvp_token', token).single()

  if (!existing) return NextResponse.json(INVALID_LINK, { status: 404 })

  const { data, error } = await admin
    .from('guests')
    .update({
      rsvp_status: status,
      plus_one_name: sanitize(plusOneName, 100),
      dietary: sanitize(dietary, 200),
      notes: sanitize(notes, 500),
      responded_at: new Date().toISOString(),
    })
    .eq('rsvp_token', token)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
  return NextResponse.json({ success: true, guest: data })
}

// Export for use when creating guests
export { nanoid }