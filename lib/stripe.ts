// lib/stripe.ts
import Stripe from 'stripe'
export { PLANS } from '@/lib/plans-config'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})