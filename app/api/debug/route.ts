// app/api/debug/discount/route.ts
// TEMPORARY - delete after fixing the issue
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const checks: Record<string, any> = {}

  // Check env vars exist (don't log actual values)
  checks.has_supabase_url = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  checks.has_service_role = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  checks.supabase_url_prefix = process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...'

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing env vars', checks })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Test 1: can we connect at all?
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    checks.can_connect = !error
    checks.connect_error = error?.message ?? null
  } catch (e: any) {
    checks.can_connect = false
    checks.connect_error = e.message
  }

  // Test 2: does discount_codes table exist?
  try {
    const { data, error } = await supabase.from('discount_codes').select('count').limit(1)
    checks.table_exists = !error
    checks.table_error = error?.message ?? null
    checks.table_error_code = error?.code ?? null
  } catch (e: any) {
    checks.table_exists = false
    checks.table_error = e.message
  }

  // Test 3: how many codes exist?
  try {
    const { count, error } = await supabase
      .from('discount_codes')
      .select('*', { count: 'exact', head: true })
    checks.code_count = error ? null : count
  } catch (e: any) {
    checks.code_count = 'error: ' + e.message
  }

  return NextResponse.json(checks)
}