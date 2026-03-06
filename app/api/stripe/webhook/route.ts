// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover' as any,
})

// Use service role key here — webhook runs outside user session
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Map Stripe price IDs to plan names
function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'free'
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('Webhook event:', event.type)

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const userId = session.metadata?.user_id
      if (!userId) {
        console.error('No user_id in session metadata')
        break
      }

      // Get the subscription to find the price
      const subscriptionId = session.subscription as string
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const priceId = subscription.items.data[0].price.id
      const plan = getPlanFromPriceId(priceId)

      const { error } = await supabase
        .from('profiles')
        .update({
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', userId)

      if (error) {
        console.error('Failed to update user plan:', error)
      } else {
        console.log(`Updated user ${userId} to plan: ${plan}`)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription

      // Find user by stripe_subscription_id
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (fetchError || !userData) {
        console.error('Could not find user for subscription:', subscription.id)
        break
      }

      const priceId = subscription.items.data[0].price.id
      const plan = getPlanFromPriceId(priceId)

      const { error } = await supabase
        .from('profiles')
        .update({ plan })
        .eq('id', userData.id)

      if (error) {
        console.error('Failed to update plan on subscription update:', error)
      } else {
        console.log(`Updated user ${userData.id} to plan: ${plan}`)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (fetchError || !userData) {
        console.error('Could not find user for subscription:', subscription.id)
        break
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          plan: 'free',
          stripe_subscription_id: null,
        })
        .eq('id', userData.id)

      if (error) {
        console.error('Failed to downgrade user to free:', error)
      } else {
        console.log(`Downgraded user ${userData.id} to free`)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.log('Payment failed for customer:', invoice.customer)
      // Optionally: send an email, flag the account, etc.
      break
    }
  }

  return NextResponse.json({ received: true })
}