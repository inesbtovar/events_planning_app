// lib/plans.ts
import { createClient } from '@/lib/supabase/server'
import { PLANS } from '@/lib/plans-config'

export async function getUserPlan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { plan: 'free', limits: PLANS.free, userId: null }

  const { data: planRow } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const planName = (planRow?.plan as keyof typeof PLANS) || 'free'
  return {
    plan: planName,
    limits: PLANS[planName],
    userId: user.id,
    planRow,
  }
}

export async function canAddGuest(eventId: string): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, reason: 'Not authenticated' }

  const { plan, limits } = await getUserPlan()

  const { count } = await supabase
    .from('guests')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)

  if ((count ?? 0) >= limits.guestLimit) {
    return {
      allowed: false,
      reason: `Your ${plan} plan allows up to ${limits.guestLimit} guests. Upgrade to add more.`,
    }
  }

  return { allowed: true }
}