// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/utils'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('events')
    .select('*, guests(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // FIX #6: Log internally, return generic message to client
  if (error) {
    console.error('Events GET error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
  return NextResponse.json({ events: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { name, date, location, description } = body
  if (!name?.trim()) return NextResponse.json({ error: 'Event name is required' }, { status: 400 })

  // Validate date format if provided
  if (date && isNaN(Date.parse(date))) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      name: name.trim().slice(0, 200),
      slug: slugify(name),
      date: date || null,
      location: location?.trim().slice(0, 300) || null,
      description: description?.trim().slice(0, 2000) || null,
      template: 'elegant',
      template_config: {},
      is_published: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Events POST error:', error.message)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
  return NextResponse.json({ event: data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { id, ...updates } = body
  if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })

  const allowed = ['name', 'date', 'location', 'description', 'template', 'template_config', 'is_published', 'cover_image']
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowed.includes(key))
  )

  const { data, error } = await supabase
    .from('events')
    .update(sanitized)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Events PATCH error:', error.message)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
  return NextResponse.json({ event: data })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id || !UUID_REGEX.test(id)) return NextResponse.json({ error: 'Invalid event id' }, { status: 400 })

  const { error } = await supabase
    .from('events').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    console.error('Events DELETE error:', error.message)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}