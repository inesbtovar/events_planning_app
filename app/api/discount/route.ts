// app/api/discount/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, error: 'No code provided' })
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase env vars')
      return NextResponse.json({ valid: false, error: 'Server configuration error' })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .select('code, percent, active, max_uses, used_count, expires_at')
      .eq('code', code.toUpperCase().trim())
      .single()

    if (error) {
      console.error('Supabase error:', error.message, error.code)
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json({ valid: false, error: 'Discount codes not set up yet' })
      }
      return NextResponse.json({ valid: false, error: 'Invalid code' })
    }

    if (!data) return NextResponse.json({ valid: false, error: 'Invalid code' })
    if (!data.active) return NextResponse.json({ valid: false, error: 'This code is no longer active' })
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This code has expired' })
    }
    if (data.max_uses !== null && data.used_count >= data.max_uses) {
      return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' })
    }

    return NextResponse.json({ valid: true, percent: data.percent, code: data.code })

  } catch (err) {
    console.error('Validate route error:', err)
    return NextResponse.json({ valid: false, error: 'Invalid code' })
  }
}