// app/api/discount/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getIP } from '@/lib/rate-limit'

// Single shared admin client — not recreated on every request
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  // Rate limit: 20 attempts per hour per IP
  const ip = getIP(request)
  const { allowed } = rateLimit(ip, 'discount:validate', { limit: 20, windowMs: 60 * 60 * 1000 })
  if (!allowed) return NextResponse.json({ valid: false, error: 'Too many requests' }, { status: 429 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 })
  }

  const raw = body?.code
  if (!raw || typeof raw !== 'string' || !raw.trim()) {
    return NextResponse.json({ valid: false, error: 'No code provided' })
  }

  // Sanitize: only allow alphanumeric + dash + underscore
  const code = raw.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '')
  if (!code) return NextResponse.json({ valid: false, error: 'Invalid code format' })

  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('code, percent, active, max_uses, used_count, expires_at')
    .eq('code', code)
    .single()

  if (error) {
    // Table doesn't exist yet
    if (error.code === '42P01') {
      console.error('discount_codes table missing — run discount-codes-sql.sql in Supabase')
      return NextResponse.json({ valid: false, error: 'Discount codes not available' })
    }
    // No row found (PGRST116 = single row not found)
    if (error.code === 'PGRST116') {
      return NextResponse.json({ valid: false, error: 'Invalid code' })
    }
    console.error('Discount validate DB error:', error.message)
    return NextResponse.json({ valid: false, error: 'Invalid code' })
  }

  if (!data) return NextResponse.json({ valid: false, error: 'Invalid code' })
  if (!data.active) return NextResponse.json({ valid: false, error: 'This code is no longer active' })
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'This code has expired' })
  }
  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return NextResponse.json({ valid: false, error: 'This code has reached its limit' })
  }

  return NextResponse.json({
    valid: true,
    percent: data.percent,
    code: data.code,
    message: `${data.percent}% off applied!`,
  })
}