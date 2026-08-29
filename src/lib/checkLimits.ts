// src/lib/checkLimits.ts
import { supabase } from './supabaseClient' 
import { getPlanLimits, PlanId } from './plans'

export async function canCreateFlow(userId: string, plan: PlanId) {
  const limits = getPlanLimits(plan)
  const { count, error } = await supabase
    .from('workflows')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  
  if (error) return { allowed: false, reason: error.message }
  if ((count || 0) >= limits.maxFlows) {
    return { 
      allowed: false, 
      reason: `Limit reached: ${limits.maxFlows} flows on ${limits.name} plan. Upgrade to create more.`,
      current: count,
      limit: limits.maxFlows
    }
  }
  return { allowed: true, current: count, limit: limits.maxFlows }
}

export async function canUseCopilot(userId: string, plan: PlanId) {
  const limits = getPlanLimits(plan)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  
  const { count } = await supabase
    .from('copilot_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth)

  if ((count || 0) >= limits.maxCopilotCalls) {
    return {
      allowed: false,
      reason: `You used ${count}/${limits.maxCopilotCalls} AI calls this month on ${limits.name}. Upgrade for more.`,
      current: count,
      limit: limits.maxCopilotCalls
    }
  }
  return { allowed: true, current: count, limit: limits.maxCopilotCalls }
}   