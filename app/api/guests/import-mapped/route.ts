// app/api/guests/import-mapped/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'
import { rateLimit, getIP } from '@/lib/rate-limit'

// FIX: Hard cap on import size to prevent DoS via huge payloads.
// Old code had no limit — an attacker could send 100,000 guests and hang the server.
const MAX_IMPORT_SIZE = 500

function sanitizeString(val: unknown, maxLen: number): string | null {
  if (!val || typeof val !== 'string') return null
  return val.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim().slice(0, maxLen) || null
}

function isValidEmail(email: string | null): boolean {
  if (!email) return true // email is optional
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 imports per hour per IP
  const ip = getIP(request)
  const { allowed } = rateLimit(ip, 'import', { limit: 20, windowMs: 60 * 60 * 1000 })
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: any
    try { body = await request.json() } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { eventId, guests: rawGuests } = body

    if (typeof eventId !== 'string' || !eventId) {
      return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
    }
    if (!Array.isArray(rawGuests) || rawGuests.length === 0) {
      return NextResponse.json({ error: 'No guests provided' }, { status: 400 })
    }
    if (rawGuests.length > MAX_IMPORT_SIZE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMPORT_SIZE} guests per import` },
        { status: 400 }
      )
    }

    // Verify ownership — user must own this event
    const { data: event } = await supabase
      .from('events').select('id').eq('id', eventId).eq('user_id', user.id).single()
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const guests = rawGuests
      .filter((g: any) => typeof g.name === 'string' && g.name.trim())
      .map((g: any) => {
        const email = sanitizeString(g.email, 254)
        if (email && !isValidEmail(email)) return null // skip invalid emails
        return {
          event_id: eventId,
          name: sanitizeString(g.name, 200)!,
          email,
          phone: sanitizeString(g.phone, 30),
          dietary: sanitizeString(g.dietary, 200),
          plus_one: g.plusOne === true,
          rsvp_token: nanoid(12),
          rsvp_status: 'pending',
        }
      })
      .filter(Boolean)

    if (guests.length === 0) {
      return NextResponse.json({ error: 'No valid guests to import' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('guests').insert(guests).select()

    if (error) return NextResponse.json({ error: 'Import failed' }, { status: 500 })

    return NextResponse.json({ success: true, imported: data.length })

  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}