// app/api/guests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const eventId = request.nextUrl.searchParams.get('eventId')
  if (!eventId || !UUID_REGEX.test(eventId)) {
    return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
  }

  const { data: event } = await supabase
    .from('events').select('id').eq('id', eventId).eq('user_id', user.id).single()
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('guests').select('*').eq('event_id', eventId).order('name')

  if (error) {
    console.error('Guests GET error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 })
  }
  return NextResponse.json({ guests: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { eventId, name, email, phone, plusOne, dietary } = body

  if (!eventId || !UUID_REGEX.test(eventId)) {
    return NextResponse.json({ error: 'Invalid eventId' }, { status: 400 })
  }
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Guest name is required' }, { status: 400 })
  }

  const { data: event } = await supabase
    .from('events').select('id').eq('id', eventId).eq('user_id', user.id).single()
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('guests')
    .insert({
      event_id: eventId,
      name: name.trim().slice(0, 200),
      email: email?.trim().slice(0, 254) || null,
      phone: phone?.trim().slice(0, 30) || null,
      plus_one: plusOne ?? false,
      dietary: dietary?.trim().slice(0, 200) || null,
      // FIX #1: nanoid(21) for stronger token entropy
      rsvp_token: nanoid(21),
      rsvp_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Guests POST error:', error.message)
    return NextResponse.json({ error: 'Failed to add guest' }, { status: 500 })
  }
  return NextResponse.json({ guest: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { guestId, name, email, phone, plusOne, dietary } = body

  if (!guestId || !UUID_REGEX.test(guestId)) {
    return NextResponse.json({ error: 'Invalid guestId' }, { status: 400 })
  }

  const { data: guest } = await supabase
    .from('guests')
    .select('id, event_id, events(user_id)')
    .eq('id', guestId)
    .single()

  if (!guest || (guest.events as any)?.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('guests')
    .update({
      name: name?.trim().slice(0, 200),
      email: email?.trim().slice(0, 254) || null,
      phone: phone?.trim().slice(0, 30) || null,
      plus_one: plusOne ?? false,
      dietary: dietary?.trim().slice(0, 200) || null,
    })
    .eq('id', guestId)
    .select()
    .single()

  if (error) {
    console.error('Guests PATCH error:', error.message)
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 })
  }
  return NextResponse.json({ guest: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const guestId = request.nextUrl.searchParams.get('guestId')
  if (!guestId || !UUID_REGEX.test(guestId)) {
    return NextResponse.json({ error: 'Invalid guestId' }, { status: 400 })
  }

  const { data: guest } = await supabase
    .from('guests')
    .select('id, events(user_id)')
    .eq('id', guestId)
    .single()

  if (!guest || (guest.events as any)?.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase.from('guests').delete().eq('id', guestId)

  if (error) {
    console.error('Guests DELETE error:', error.message)
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}