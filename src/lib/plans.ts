// src/lib/plans.ts - How you make money and protect costs
export type PlanId = 'free' | 'basic' | 'pro'

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    maxFlows: 2,
    maxRunsPerMonth: 200,
    maxCopilotCalls: 5,
    maxVaultSecrets: 3,
  },
  basic: {
    name: 'Basic',
    price: 19,
    maxFlows: 5,              // <-- Stops them using all your flows
    maxRunsPerMonth: 1000,    // <-- Protects your Supabase + Queue costs
    maxCopilotCalls: 50,      // <-- Protects your OpenAI bill (~$1 cost for you)
    maxVaultSecrets: 10,
  },
  pro: {
    name: 'Pro',
    price: 49,
    maxFlows: 25,
    maxRunsPerMonth: 10000,
    maxCopilotCalls: 300,
    maxVaultSecrets: 100,
  },
} as const

export function getPlanLimits(planId: PlanId) {
  return PLANS[planId] || PLANS.free
}