/**
 * Aura Plan Economics & Capability Tiers.
 *
 * Every plan converts the money a user pays into a monthly "compute budget",
 * expressed in credits (1 credit = $0.01 of real compute spend, incl. fees).
 *
 * All upstream model details are hidden; plans describe Aura Engine capabilities,
 * token output quotas, state persistence features, and daily fair usage limits.
 */

export type PlanId = 'free' | 'starter' | 'mid' | 'pro';

/** Approximate INR per USD used to convert INR revenue into USD compute budget. */
export const USD_INR = 88;
/** Cashfree transaction fee + GST buffer (fraction of revenue). */
export const PAYMENT_FEE_RATE = 0.025;
/** Platform buffer on compute operations. */
export const OPENROUTER_FEE_RATE = 0.055;
/** Value of one Aura credit in USD of compute. */
export const USD_PER_CREDIT = 0.01;
/** Length of one paid billing period in days. */
export const PERIOD_DAYS = 30;
/** Minimum output tokens reserved per generation. */
export const MIN_OUTPUT_TOKENS = 3000;

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  priceINR: number;
  /** Marketing price shown next to INR. */
  priceUSD: number;
  targetMarginUSD: number;
  monthlyCredits: number;
  dailyCreditCap: number;
  dailyRequestLimit: number;
  maxOutputTokens: number;
  highlight?: boolean;
  features: string[];
}

function creditsFor(priceINR: number, marginUSD: number): number {
  const netUSD = (priceINR / USD_INR) * (1 - PAYMENT_FEE_RATE);
  return Math.max(0, Math.floor((netUSD - marginUSD) / USD_PER_CREDIT));
}

function dailyCapFor(monthlyCredits: number, burst: number): number {
  return Math.ceil((monthlyCredits / PERIOD_DAYS) * burst);
}

const starterCredits = creditsFor(449, 2);
const midCredits = creditsFor(1329, 7);
const proCredits = creditsFor(2649, 15);

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Instant prototyping with Aura Core Engine.',
    priceINR: 0,
    priceUSD: 0,
    targetMarginUSD: 0,
    monthlyCredits: 30,
    dailyCreditCap: 6,
    dailyRequestLimit: 5,
    maxOutputTokens: 8000,
    features: [
      '5 generations / day',
      'Aura Core Synthesis Engine',
      'Live interactive preview sandbox',
      'One-click multi-file code export',
    ],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For creators, developers, and agile prototypes.',
    priceINR: 449,
    priceUSD: 5,
    targetMarginUSD: 2,
    monthlyCredits: starterCredits,
    dailyCreditCap: dailyCapFor(starterCredits, 3),
    dailyRequestLimit: 15,
    maxOutputTokens: 12000,
    features: [
      `${starterCredits} compute credits / month`,
      '15 generations / day (strict FUP)',
      'Aura Advanced Synthesis with CRUD & State',
      'Full project version history & rollback',
      'LocalStorage auto-persistence enabled',
    ],
  },
  mid: {
    id: 'mid',
    name: 'Creator',
    tagline: 'Flagship autonomous intelligence for serious builders.',
    priceINR: 1329,
    priceUSD: 15,
    targetMarginUSD: 7,
    monthlyCredits: midCredits,
    dailyCreditCap: dailyCapFor(midCredits, 3),
    dailyRequestLimit: 60,
    maxOutputTokens: 16000,
    highlight: true,
    features: [
      `${midCredits} compute credits / month`,
      '60 generations / day',
      'Aura Turbo Intelligence (16k token output)',
      'Deep architectural reasoning & data schemas',
      'Interactive charts, modal flows & CSV export',
      'Priority generation queue',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Maximum power & depth for enterprise-grade apps.',
    priceINR: 2649,
    priceUSD: 30,
    targetMarginUSD: 15,
    monthlyCredits: proCredits,
    dailyCreditCap: dailyCapFor(proCredits, 3),
    dailyRequestLimit: 200,
    maxOutputTokens: 20000,
    features: [
      `${proCredits} compute credits / month`,
      '200 generations / day',
      'Aura Autonomous Studio Max (20k token output)',
      'Complex multi-panel workflows & state machines',
      'Highest reasoning depth & self-healing code',
      'Unlimited project forks & version branching',
    ],
  },
};

export const PAID_PLAN_IDS: PlanId[] = ['starter', 'mid', 'pro'];
export const PLAN_RANK: Record<PlanId, number> = { free: 0, starter: 1, mid: 2, pro: 3 };

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && value in PLANS;
}

/** Convert a raw USD cost into Aura credits (includes fee buffer). */
export function usdToCredits(usd: number): number {
  return (usd * (1 + OPENROUTER_FEE_RATE)) / USD_PER_CREDIT;
}

/** Convert Aura credits back into raw USD spend. */
export function creditsToUsd(credits: number): number {
  return (credits * USD_PER_CREDIT) / (1 + OPENROUTER_FEE_RATE);
}
