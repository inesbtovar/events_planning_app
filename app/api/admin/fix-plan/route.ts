// app/api/admin/fix-plan/route.ts
// Temporary debug tool - remove after fixing the issue
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
})

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all profiles with their stripe data
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, plan, stripe_customer_id, stripe_subscription_id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // For each profile with a subscription, check its actual status in Stripe
  const results = await Promise.all((profiles ?? []).map(async (p) => {
    if (!p.stripe_subscription_id) return { ...p, stripe_status: null }
    try {
      const sub = await stripe.subscriptions.retrieve(p.stripe_subscription_id)
      return { ...p, stripe_status: sub.status }
    } catch (e: any) {
      return { ...p, stripe_status: 'error: ' + e.message }
    }
  }))

  return NextResponse.json({ profiles: results })
}

// POST to force-fix a specific user's plan based on their actual Stripe status
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { user_id } = await request.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan, stripe_customer_id, stripe_subscription_id')
    .eq('id', user_id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (!profile.stripe_subscription_id) {
    // No subscription - should be free
    await supabase.from('profiles').update({ plan: 'free' }).eq('id', user_id)
    return NextResponse.json({ fixed: true, plan: 'free', reason: 'no subscription id' })
  }

  try {
    const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
    if (['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(sub.status)) {
      await supabase.from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', user_id)
      return NextResponse.json({ fixed: true, plan: 'free', stripe_status: sub.status })
    }
    return NextResponse.json({ fixed: false, plan: profile.plan, stripe_status: sub.status, message: 'Subscription is active, no fix needed' })
  } catch (e: any) {
    // Subscription not found in Stripe = already deleted
    await supabase.from('profiles')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('id', user_id)
    return NextResponse.json({ fixed: true, plan: 'free', reason: 'subscription not found in Stripe: ' + e.message })
  }
}