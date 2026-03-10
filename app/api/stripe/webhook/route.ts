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

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (signature && process.env.STRIPE_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
      } catch {
        event = JSON.parse(body) as Stripe.Event
      }
    } else {
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook parse error:', err)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  console.log('Webhook event:', event.type)

  // ── Subscription purchased / upgraded ──────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id

    if (!userId) {
      console.error('No user_id in metadata')
      return NextResponse.json({ received: true })
    }

    const subscriptionId = session.subscription as string
    let plan = 'starter'

    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = sub.items.data[0].price.id
      plan = getPlanFromPriceId(priceId)
    } catch (err) {
      console.error('Could not fetch subscription:', err)
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existing) {
      await supabase.from('profiles').insert({
        id: userId,
        plan,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
      })
    } else {
      await supabase.from('profiles').update({
        plan,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
      }).eq('id', userId)
    }

    console.log(`Upgraded user ${userId} to ${plan}`)
  }

  // ── Subscription cancelled ─────────────────────────────────────────────────
  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as Stripe.Subscription

    // For updates, only act if status became cancelled/unpaid/past_due
    if (
      event.type === 'customer.subscription.updated' &&
      !['canceled', 'unpaid', 'past_due'].includes(subscription.status)
    ) {
      return NextResponse.json({ received: true })
    }

    const customerId = subscription.customer as string

    // Look up user by stripe_customer_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!profile) {
      console.error('No profile found for customer:', customerId)
      return NextResponse.json({ received: true })
    }

    await supabase.from('profiles').update({
      plan: 'free',
      stripe_subscription_id: null,
    }).eq('id', profile.id)

    console.log(`Downgraded user ${profile.id} to free (subscription ${subscription.status})`)
  }

  return NextResponse.json({ received: true })
}