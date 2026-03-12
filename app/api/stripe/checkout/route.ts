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

// FIX: Whitelist valid plans — never trust a price ID from the client.
// Old code accepted any plan string and looked it up in PLANS,
// but if PLANS had undefined keys it could send undefined to Stripe.
const VALID_PLANS = ['starter', 'pro'] as const
type Plan = typeof VALID_PLANS[number]

const PLAN_PRICE_IDS: Record<Plan, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 checkout attempts per hour per IP
  const ip = getIP(request)
  const limit = rateLimit(ip, 'checkout', { limit: 10, windowMs: 60 * 60 * 1000 })
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

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

  // Validate plan is exactly one of the known values
  if (!VALID_PLANS.includes(plan as Plan)) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const priceId = PLAN_PRICE_IDS[plan as Plan]
  if (!priceId) {
    console.error(`Missing price ID env var for plan: ${plan}`)
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

  // Apply discount code if provided — re-validate server-side, never trust the client
  if (discountCode && typeof discountCode === 'string') {
    const cleanCode = discountCode.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '')

    if (cleanCode) {
      const { data: codeData } = await supabaseAdmin
        .from('discount_codes')
        .select('code, percent, active, max_uses, used_count, expires_at, stripe_coupon_id')
        .eq('code', cleanCode)
        .single()

      const isValid = codeData &&
        codeData.active &&
        (!codeData.expires_at || new Date(codeData.expires_at) > new Date()) &&
        (codeData.max_uses === null || codeData.used_count < codeData.max_uses)

      if (isValid) {
        let couponId = codeData.stripe_coupon_id

        if (!couponId) {
          const coupon = await stripe.coupons.create({
            percent_off: codeData.percent,
            duration: 'once',
            name: `EventsDock ${codeData.code}`,
          })
          couponId = coupon.id
          await supabaseAdmin
            .from('discount_codes')
            .update({ stripe_coupon_id: couponId })
            .eq('code', codeData.code)
        }

        sessionParams.discounts = [{ coupon: couponId }]

        // Increment usage count
        await supabaseAdmin
          .from('discount_codes')
          .update({ used_count: (codeData.used_count ?? 0) + 1 })
          .eq('code', codeData.code)
      }
    }
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe session creation failed:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}