// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'free'
}

async function downgradeByCustomerId(customerId: string, reason: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, plan')
    .eq('stripe_customer_id', customerId)
    .single()

  if (error || !profile) {
    console.error(`No profile found for customer ${customerId}:`, error?.message)
    return false
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ plan: 'free', stripe_subscription_id: null })
    .eq('id', profile.id)

  if (updateError) {
    console.error(`Failed to update profile ${profile.id}:`, updateError.message)
    return false
  }

  console.log(`Downgraded profile ${profile.id} → free | reason: ${reason}`)
  return true
}

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  // FIX: Reject ALL requests that fail signature verification — no fallback.
  // The old code fell back to JSON.parse(body) when sig failed, meaning anyone
  // could POST a fake event and manipulate user plans.
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing stripe-signature or STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    if (!userId) {
      console.error('Missing user_id in checkout metadata')
      return NextResponse.json({ received: true })
    }

    let plan = 'starter'
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      plan = getPlanFromPriceId(sub.items.data[0].price.id)
    } catch (e) {
      console.error('Could not retrieve subscription:', e)
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    }, { onConflict: 'id' })

    if (error) console.error('Upsert error:', error.message)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await downgradeByCustomerId(sub.customer as string, `subscription deleted`)
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    if (['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(sub.status)) {
      await downgradeByCustomerId(sub.customer as string, `status: ${sub.status}`)
    }
  }

  return NextResponse.json({ received: true })
}