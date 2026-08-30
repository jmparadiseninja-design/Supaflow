// SupaFlow V3.0 - Membership Plans & Limits - $0 infra
export type PlanId = 'free' | 'starter' | 'pro' | 'agency';

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceAnnual: number;
  limits: {
    flows: number;
    executions: number;
    websites: number;
    teamSeats: number;
    allow3D: boolean;
    allowCustomDomain: boolean;
    allowWhiteLabel: boolean;
  };
  features: string[];
  stripePriceId?: string; // add your Stripe price IDs later, leave empty for now
  popular?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceAnnual: 0,
    limits: { flows: 3, executions: 500, websites: 1, teamSeats: 1, allow3D: false, allowCustomDomain: false, allowWhiteLabel: false },
    features: ['3 Flows', '500 runs / mo', '1 Website', 'SupaFlow branding', 'Community support']
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 19,
    priceAnnual: 190,
    limits: { flows: 15, executions: 10000, websites: 5, teamSeats: 1, allow3D: false, allowCustomDomain: true, allowWhiteLabel: false },
    features: ['15 Flows', '10k runs / mo', '5 Websites', 'Custom Domain', 'Remove branding', 'Email support'],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_ID
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 49,
    priceAnnual: 490,
    popular: true,
    limits: { flows: -1, executions: 100000, websites: 25, teamSeats: 1, allow3D: true, allowCustomDomain: true, allowWhiteLabel: false },
    features: ['Unlimited Flows', '100k runs / mo', '25 Websites', '3D Workflow Engine', 'API Access', 'Priority support'],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_ID
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    price: 99,
    priceAnnual: 990,
    limits: { flows: -1, executions: 500000, websites: 100, teamSeats: 5, allow3D: true, allowCustomDomain: true, allowWhiteLabel: true },
    features: ['Everything in Pro', '100 Websites', 'White-label', '5 Team seats', 'Resell license', 'Dedicated success manager'],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_ID
  }
};

// Enforcement helpers - use these EVERYWHERE
export function canCreateFlow(userUsage: { flows: number }, plan: Plan): boolean {
  if (plan.limits.flows === -1) return true;
  return userUsage.flows < plan.limits.flows;
}

export function canRunExecution(userUsage: { executionsThisMonth: number }, plan: Plan): boolean {
  return userUsage.executionsThisMonth < plan.limits.executions;
}

export function canCreateWebsite(userUsage: { websites: number }, plan: Plan): boolean {
  return userUsage.websites < plan.limits.websites;
}

export function getPlanById(id: PlanId): Plan {
  return PLANS[id] || PLANS.free;
}
 