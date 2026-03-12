// app/api/account/delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import Stripe from 'stripe'
import { rateLimit, getIP } from '@/lib/rate-limit'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(request: NextRequest) {
  // Rate limit: 5 attempts per hour per IP — deletion is destructive
  const ip = getIP(request)
  const { allowed } = rateLimit(ip, 'account:delete', { limit: 5, windowMs: 60 * 60 * 1000 })
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // FIX #3: Require password re-verification before deleting the account.
  // Without this, any stolen session cookie (XSS, network interception, shared
  // computer) could permanently delete the account with a single API call.
  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { password } = body
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password is required to delete your account' }, { status: 400 })
  }

  // Re-authenticate with current credentials — this will fail if password is wrong
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  })

  if (authError) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
  }

  // Cancel Stripe subscription if exists
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id)
    }
  } catch {
    // Don't block deletion if Stripe fails
  }

  // Delete profile row (cascades to events + guests)
  await supabaseAdmin.from('profiles').delete().eq('id', user.id)

  // Delete auth user
  await supabaseAdmin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ ok: true })
}