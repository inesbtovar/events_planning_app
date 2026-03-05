// lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    guestLimit: 20,
    eventLimit: 1,
    features: ['1 event', 'Up to 20 guests', 'WhatsApp RSVP', 'Beautiful event page'],
  },
  starter: {
    name: 'Starter',
    price: 9,
    guestLimit: 100,
    eventLimit: 3,
    features: ['3 events', 'Up to 100 guests', 'Email invitations', 'Remove EventsDock branding', 'All templates'],
  },
  pro: {
    name: 'Pro',
    price: 19,
    guestLimit: 999999,
    eventLimit: 999999,
    features: ['Unlimited events', 'Unlimited guests', 'Email invitations', 'Priority support', 'Analytics dashboard'],
  },
}