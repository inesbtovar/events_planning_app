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
      } catch (sigErr) {
        console.error('Signature verification failed, parsing raw body:', sigErr)
        event = JSON.parse(body) as Stripe.Event
      }
    } else {
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook parse error:', err)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  console.log('=== WEBHOOK RECEIVED:', event.type, '===')

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
      .from('profiles').select('id').eq('id', userId).single()

    if (!existing) {
      const { error } = await supabase.from('profiles').insert({
        id: userId, plan,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
      })
      if (error) console.error('Insert error:', error)
    } else {
      const { error } = await supabase.from('profiles').update({
        plan,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
      }).eq('id', userId)
      if (error) console.error('Update error:', error)
    }

    console.log(`✓ Upgraded user ${userId} to ${plan}`)
  }

  // ── Subscription cancelled ─────────────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    console.log('Cancellation - customer:', customerId, 'status:', subscription.status)

    const { data: profile, error: lookupError } = await supabase
      .from('profiles')
      .select('id, plan')
      .eq('stripe_customer_id', customerId)
      .single()

    if (lookupError || !profile) {
      console.error('No profile found for customer:', customerId, lookupError)
      return NextResponse.json({ received: true })
    }

    console.log('Found profile:', profile.id, 'current plan:', profile.plan)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ plan: 'free', stripe_subscription_id: null })
      .eq('id', profile.id)

    if (updateError) {
      console.error('Failed to downgrade:', updateError)
    } else {
      console.log(`✓ Downgraded user ${profile.id} from ${profile.plan} to free`)
    }
  }

  // ── Subscription updated (catches cancel-at-period-end becoming active cancel) ──
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const previousAttributes = (event.data as any).previous_attributes

    console.log('Subscription updated - status:', subscription.status, 'previous:', JSON.stringify(previousAttributes))

    // Only downgrade if status is now canceled, unpaid, or past_due
    if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      const customerId = subscription.customer as string

      const { data: profile, error: lookupError } = await supabase
        .from('profiles')
        .select('id, plan')
        .eq('stripe_customer_id', customerId)
        .single()

      if (lookupError || !profile) {
        console.error('No profile for customer on update:', customerId)
        return NextResponse.json({ received: true })
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', profile.id)

      if (updateError) {
        console.error('Failed to downgrade on update:', updateError)
      } else {
        console.log(`✓ Downgraded user ${profile.id} to free due to subscription status: ${subscription.status}`)
      }
    }
  }

  return NextResponse.json({ received: true })
}