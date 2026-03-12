// app/api/admin/discount-codes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'
import { rateLimit, getIP } from '@/lib/rate-limit'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret')
  const expected = process.env.ADMIN_SECRET
  if (!secret || !expected) return false
  try {
    const a = Buffer.from(secret.padEnd(64).slice(0, 64))
    const b = Buffer.from(expected.padEnd(64).slice(0, 64))
    return secret.length === expected.length && timingSafeEqual(a, b)
  } catch { return false }
}

function sanitizeCode(code: unknown): string | null {
  if (typeof code !== 'string') return null
  const cleaned = code.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '')
  return cleaned.length >= 3 && cleaned.length <= 50 ? cleaned : null
}

// FIX #4: Rate limit all admin endpoints — 10 attempts/hr/IP prevents brute force
function adminRateLimit(request: NextRequest): boolean {
  const ip = getIP(request)
  const { allowed } = rateLimit(ip, 'admin', { limit: 10, windowMs: 60 * 60 * 1000 })
  return allowed
}

export async function GET(request: NextRequest) {
  if (!adminRateLimit(request)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('discount_codes').select('*').order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ codes: data })
}

export async function POST(request: NextRequest) {
  if (!adminRateLimit(request)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const code = sanitizeCode(body.code)
  const percent = Number(body.percent)
  const maxUses = body.max_uses != null ? Number(body.max_uses) : null
  const expiresAt = body.expires_at ?? null

  if (!code) return NextResponse.json({ error: 'Invalid code format (3–50 alphanumeric chars)' }, { status: 400 })
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
    return NextResponse.json({ error: 'Percent must be an integer 1–100' }, { status: 400 })
  }
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    return NextResponse.json({ error: 'max_uses must be a positive integer' }, { status: 400 })
  }
  if (expiresAt && isNaN(Date.parse(expiresAt))) {
    return NextResponse.json({ error: 'Invalid expires_at date' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .insert({ code, percent, max_uses: maxUses, expires_at: expiresAt, active: true, used_count: 0 })
    .select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Code already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  return NextResponse.json({ code: data })
}

export async function PATCH(request: NextRequest) {
  if (!adminRateLimit(request)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, active } = body
  if (typeof id !== 'string' || typeof active !== 'boolean') {
    return NextResponse.json({ error: 'id (string) and active (boolean) required' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('discount_codes').update({ active }).eq('id', id)
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  if (!adminRateLimit(request)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkAuth(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id } = body
  if (typeof id !== 'string') return NextResponse.json({ error: 'id (string) required' }, { status: 400 })

  const { error } = await supabaseAdmin.from('discount_codes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Database error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}