// lib/plans.ts
import { createClient } from '@/lib/supabase/server'

export const PLAN_LIMITS = {
  free: {
    events: 1,
    guests: 50,
    guestImport: false,
    analytics: false,
    customBranding: false,
  },
  starter: {
    events: 5,
    guests: 200,
    guestImport: true,
    analytics: true,
    customBranding: false,
  },
  pro: {
    events: Infinity,
    guests: Infinity,
    guestImport: true,
    analytics: true,
    customBranding: true,
  },
}

export type Plan = keyof typeof PLAN_LIMITS

export function getLimits(plan: string) {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.free
}

// Async version: checks DB for current guest count and returns { allowed, reason }
export async function canAddGuest(eventId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, reason: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const limits = getLimits(plan)

  if (limits.guests === Infinity) return { allowed: true }

  const { count } = await supabase
    .from('guests')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if ((count ?? 0) >= limits.guests) {
    return {
      allowed: false,
      reason: `Your ${plan} plan allows up to ${limits.guests} guests per event. Upgrade to add more.`,
    }
  }

  return { allowed: true }
}

// Async version: checks DB for current event count and returns { allowed, reason }
export async function canAddEvent(): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, reason: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const limits = getLimits(plan)

  if (limits.events === Infinity) return { allowed: true }

  const { count } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= limits.events) {
    return {
      allowed: false,
      reason: `Your ${plan} plan allows up to ${limits.events} event${limits.events === 1 ? '' : 's'}. Upgrade to create more.`,
    }
  }

  return { allowed: true }
}