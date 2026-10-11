import { PLANS, type Plan, type PlanId } from './plans';

export { PLANS, type Plan, type PlanId };

// Backward compatibility alias
export const SUBSCRIPTION_TIERS = PLANS;
export type SubscriptionTier = PlanId;
export type TierConfig = Plan;
