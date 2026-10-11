/**
 * Aura plan economics.
 *
 * Every plan converts the money a user pays into a monthly "compute budget",
 * expressed in credits (1 credit = $0.01 of real OpenRouter spend, incl. fees).
 *
 *   monthlyCredits = (priceINR / USD_INR) * (1 - PAYMENT_FEE_RATE) - targetMarginUSD
 *
 * Because every request is billed against this budget using the *actual* cost
 * OpenRouter reports, the target profit margin is protected no matter which
 * model a user picks. Daily caps (requests + credits) enforce fair usage so a
 * single day can't drain a month's budget.
 *
 * Tune these numbers freely — everything else in the app derives from them.
 */

export type PlanId = 'free' | 'starter' | 'mid' | 'pro';

/** Approximate INR per USD used to convert INR revenue into USD compute budget. */
export const USD_INR = 88;
/** Cashfree transaction fee + GST buffer (fraction of revenue). */
export const PAYMENT_FEE_RATE = 0.025;
/** OpenRouter platform fee on credit purchases (fraction of compute cost). */
export const OPENROUTER_FEE_RATE = 0.055;
/** Value of one Aura credit in USD of compute. */
export const USD_PER_CREDIT = 0.01;
/** Length of one paid billing period. */
export const PERIOD_DAYS = 30;
/** Requests that can't afford at least this many output tokens are rejected up-front. */
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
    tagline: 'Try Aura with fast models.',
    priceINR: 0,
    priceUSD: 0,
    targetMarginUSD: 0,
    monthlyCredits: 30,
    dailyCreditCap: 6,
    dailyRequestLimit: 5,
    maxOutputTokens: 8000,
    features: ['5 generations / day', 'Claude Haiku & GPT-6 Luna', 'Live preview & code export', 'Public share links'],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For hobby projects and quick prototypes.',
    priceINR: 449,
    priceUSD: 5,
    targetMarginUSD: 2,
    monthlyCredits: starterCredits,
    dailyCreditCap: dailyCapFor(starterCredits, 3),
    dailyRequestLimit: 15,
    maxOutputTokens: 12000,
    features: [
      `${starterCredits} credits / month`,
      '15 generations / day (strict FUP)',
      'Adds Gemini 3.8 Flash & Flash Lite',
      'Version history & restore',
    ],
  },
  mid: {
    id: 'mid',
    name: 'Creator',
    tagline: 'Flagship models for serious builders.',
    priceINR: 1329,
    priceUSD: 15,
    targetMarginUSD: 7,
    monthlyCredits: midCredits,
    dailyCreditCap: dailyCapFor(midCredits, 3),
    dailyRequestLimit: 60,
    maxOutputTokens: 16000,
    highlight: true,
    features: [
      `${midCredits} credits / month`,
      '60 generations / day',
      'Claude Sonnet 5.5, GPT-6.1 Sol, Gemini 3.1 Pro',
      'Larger apps (16k output tokens)',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'Maximum power, every frontier model.',
    priceINR: 2649,
    priceUSD: 30,
    targetMarginUSD: 15,
    monthlyCredits: proCredits,
    dailyCreditCap: dailyCapFor(proCredits, 3),
    dailyRequestLimit: 200,
    maxOutputTokens: 20000,
    features: [
      `${proCredits} credits / month`,
      '200 generations / day',
      'Everything + Claude Opus 5.5',
      'Largest apps (20k output tokens)',
    ],
  },
};

export const PAID_PLAN_IDS: PlanId[] = ['starter', 'mid', 'pro'];
export const PLAN_RANK: Record<PlanId, number> = { free: 0, starter: 1, mid: 2, pro: 3 };

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && value in PLANS;
}

/** Convert a raw OpenRouter USD cost into Aura credits (includes OpenRouter's fee). */
export function usdToCredits(usd: number): number {
  return (usd * (1 + OPENROUTER_FEE_RATE)) / USD_PER_CREDIT;
}

/** Convert Aura credits back into raw OpenRouter USD spend. */
export function creditsToUsd(credits: number): number {
  return (credits * USD_PER_CREDIT) / (1 + OPENROUTER_FEE_RATE);
}
