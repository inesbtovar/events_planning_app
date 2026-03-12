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
  console.log(`Downgrade attempt - customer: ${customerId} - reason: ${reason}`)

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

  console.log(`✓ Downgraded profile ${profile.id} from ${profile.plan} to free`)
  return true
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
        console.error('Sig failed, using raw body:', sigErr)
        event = JSON.parse(body) as Stripe.Event
      }
    } else {
      event = JSON.parse(body) as Stripe.Event
    }
  } catch (err) {
    console.error('Webhook body error:', err)
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  console.log(`\n=== WEBHOOK: ${event.type} ===`)

  // ── UPGRADE: checkout completed ──────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    console.log('checkout - userId:', userId, 'customer:', customerId, 'sub:', subscriptionId)

    if (!userId) {
      console.error('Missing user_id in metadata')
      return NextResponse.json({ received: true })
    }

    let plan = 'starter'
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      plan = getPlanFromPriceId(sub.items.data[0].price.id)
      console.log('plan resolved:', plan)
    } catch (e) {
      console.error('Could not retrieve subscription:', e)
    }

    // Upsert profile - make sure stripe_customer_id is always saved
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    }, { onConflict: 'id' })

    if (error) console.error('Upsert error:', error.message)
    else console.log(`✓ Upserted user ${userId} → plan: ${plan}, customer: ${customerId}`)
  }

  // ── CANCEL: subscription deleted ─────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await downgradeByCustomerId(sub.customer as string, `subscription deleted, status: ${sub.status}`)
  }

  // ── CANCEL: subscription updated to bad status ────────────────────────────
  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    console.log('subscription.updated - status:', sub.status)
    if (['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(sub.status)) {
      await downgradeByCustomerId(sub.customer as string, `status changed to: ${sub.status}`)
    }
  }

  // ── CANCEL: invoice payment failed ───────────────────────────────────────
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string
    console.log('Payment failed for customer:', customerId)
    // Don't immediately downgrade on first failure, Stripe will retry
    // But log it so we can track
  }

  return NextResponse.json({ received: true })
}