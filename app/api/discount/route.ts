// app/api/discount/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const { code } = await request.json()

  if (!code?.trim()) {
    return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('code, percent, active, max_uses, used_count, expires_at')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (error || !data) {
    return NextResponse.json({ valid: false, error: 'Invalid code' })
  }

  if (!data.active) {
    return NextResponse.json({ valid: false, error: 'This code is no longer active' })
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'This code has expired' })
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' })
  }

  return NextResponse.json({ valid: true, percent: data.percent, code: data.code })
}
