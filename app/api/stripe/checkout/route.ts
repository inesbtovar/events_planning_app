// app/api/stripe/checkout/route.ts
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

const VALID_PLANS = ['starter', 'pro'] as const
type Plan = typeof VALID_PLANS[number]

const PLAN_PRICE_IDS: Record<Plan, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
}

export async function POST(request: NextRequest) {
  const ip = getIP(request)
  const { allowed } = rateLimit(ip, 'checkout', { limit: 10, windowMs: 60 * 60 * 1000 })
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { plan, discountCode } = body

  if (!VALID_PLANS.includes(plan as Plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const priceId = PLAN_PRICE_IDS[plan as Plan]
  if (!priceId) {
    console.error(`Missing price ID for plan: ${plan}`)
    return NextResponse.json({ error: 'Plan not configured' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: user.id },
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
  }

  // FIX #2: Use atomic RPC to prevent race condition on discount codes.
  // Old code did read → check → update in 3 separate calls.
  // Now a single Postgres function locks the row and increments atomically.
  if (discountCode && typeof discountCode === 'string') {
    const cleanCode = discountCode.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '')

    if (cleanCode) {
      type RedemptionResult = {
        code: string
        percent: number
        stripe_coupon_id: string | null
        is_valid: boolean
        failure_reason: string | null
      }
      const { data: redemption, error: rpcError } = (await supabaseAdmin
        .rpc('redeem_discount_code', { p_code: cleanCode })
        .single()) as unknown as { data: RedemptionResult | null, error: any }

      if (rpcError) {
        console.error('Discount RPC error:', rpcError.message)
        // Don't block checkout if discount fails — just skip it
      } else if (redemption?.is_valid) {
        let couponId = redemption.stripe_coupon_id

        // Create Stripe coupon on first use if not cached
        if (!couponId) {
          const coupon = await stripe.coupons.create({
            percent_off: redemption.percent,
            duration: 'once',
            name: `EventsDock ${redemption.code}`,
          })
          couponId = coupon.id
          await supabaseAdmin
            .from('discount_codes')
            .update({ stripe_coupon_id: couponId })
            .eq('code', redemption.code)
        }

        sessionParams.discounts = [{ coupon: couponId }]
      }
    }
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe session error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}