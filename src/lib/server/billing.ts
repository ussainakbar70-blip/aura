import { FieldValue, type Transaction } from 'firebase-admin/firestore';
import { adminDb, isAdminConfigured } from './firebase-admin';
import { ApiError } from './errors';
import type { AuthUser } from './auth';
import {
  MIN_OUTPUT_TOKENS,
  PERIOD_DAYS,
  PLANS,
  creditsToUsd,
  isPlanId,
  usdToCredits,
  type PlanId,
} from '@/config/plans';
import { canUseModel, type AIModel } from '@/config/models';
import type { AccountView } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const PERIOD_MS = PERIOD_DAYS * DAY_MS;

/** Firestore shape of users/{uid}. All times are epoch milliseconds. */
export interface AccountDoc {
  email: string | null;
  name: string | null;
  photoURL: string | null;
  phone: string | null;
  plan: PlanId;
  planExpiresAt: number | null;
  periodStart: number;
  periodCredits: number;
  periodUsed: number;
  createdAt: number;
  updatedAt: number;
}

interface DailyDoc {
  requests: number;
  credits: number;
}

export function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

const usersCol = () => adminDb().collection('users');
const dailyRef = (uid: string, day: string) => usersCol().doc(uid).collection('daily').doc(day);

function freshAccount(user: AuthUser, now: number): AccountDoc {
  return {
    email: user.email,
    name: user.name,
    photoURL: user.picture,
    phone: null,
    plan: 'free',
    planExpiresAt: null,
    periodStart: now,
    periodCredits: PLANS.free.monthlyCredits,
    periodUsed: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function coerceAccount(raw: Record<string, unknown> | undefined, user: AuthUser, now: number): AccountDoc {
  if (!raw) return freshAccount(user, now);
  const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
  return {
    email: typeof raw.email === 'string' ? raw.email : user.email,
    name: typeof raw.name === 'string' ? raw.name : user.name,
    photoURL: typeof raw.photoURL === 'string' ? raw.photoURL : user.picture,
    phone: typeof raw.phone === 'string' ? raw.phone : null,
    plan: isPlanId(raw.plan) ? raw.plan : 'free',
    planExpiresAt: typeof raw.planExpiresAt === 'number' ? raw.planExpiresAt : null,
    periodStart: num(raw.periodStart, now),
    periodCredits: num(raw.periodCredits, PLANS.free.monthlyCredits),
    periodUsed: num(raw.periodUsed, 0),
    createdAt: num(raw.createdAt, now),
    updatedAt: num(raw.updatedAt, now),
  };
}

/** Expire finished paid plans and roll the free plan's monthly period. */
function normalize(acc: AccountDoc, now: number): { acc: AccountDoc; changed: boolean } {
  if (acc.plan !== 'free' && (acc.planExpiresAt === null || acc.planExpiresAt <= now)) {
    return {
      acc: {
        ...acc,
        plan: 'free',
        planExpiresAt: null,
        periodStart: now,
        periodCredits: PLANS.free.monthlyCredits,
        periodUsed: 0,
        updatedAt: now,
      },
      changed: true,
    };
  }
  if (acc.plan === 'free' && now - acc.periodStart >= PERIOD_MS) {
    return {
      acc: { ...acc, periodStart: now, periodCredits: PLANS.free.monthlyCredits, periodUsed: 0, updatedAt: now },
      changed: true,
    };
  }
  return { acc, changed: false };
}

function readDaily(raw: Record<string, unknown> | undefined): DailyDoc {
  return {
    requests: typeof raw?.requests === 'number' ? raw.requests : 0,
    credits: typeof raw?.credits === 'number' ? raw.credits : 0,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function toAccountView(uid: string, acc: AccountDoc, daily: DailyDoc): AccountView {
  const plan = PLANS[acc.plan];
  return {
    uid,
    email: acc.email,
    name: acc.name,
    phone: acc.phone,
    plan: acc.plan,
    planName: plan.name,
    planExpiresAt: acc.planExpiresAt,
    credits: {
      total: round2(acc.periodCredits),
      used: round2(Math.min(acc.periodUsed, acc.periodCredits)),
      remaining: round2(Math.max(0, acc.periodCredits - acc.periodUsed)),
    },
    today: {
      credits: round2(daily.credits),
      creditCap: plan.dailyCreditCap,
      requests: daily.requests,
      requestLimit: plan.dailyRequestLimit,
    },
  };
}

async function loadInTx(tx: Transaction, user: AuthUser, now: number) {
  const ref = usersCol().doc(user.uid);
  const dRef = dailyRef(user.uid, dayKey(now));
  const [snap, dSnap] = await Promise.all([tx.get(ref), tx.get(dRef)]);
  const { acc, changed } = normalize(coerceAccount(snap.data(), user, now), now);
  return { ref, dRef, acc, changed: changed || !snap.exists, daily: readDaily(dSnap.data()) };
}

const inMemoryUsage = new Map<string, { requests: number; usedCredits: number }>();

/** Load (and lazily create / normalise) the caller's account. */
export async function getAccount(user: AuthUser): Promise<AccountView> {
  const now = Date.now();
  if (!isAdminConfigured() || user.uid.startsWith('guest')) {
    const usage = inMemoryUsage.get(user.uid) || { requests: 0, usedCredits: 0 };
    return {
      uid: user.uid,
      email: user.email,
      name: user.name,
      phone: null,
      plan: 'pro',
      planName: 'Pro Studio',
      planExpiresAt: null,
      credits: {
        total: 1000,
        used: usage.usedCredits,
        remaining: Math.max(0, 1000 - usage.usedCredits),
      },
      today: {
        credits: usage.usedCredits,
        creditCap: 500,
        requests: usage.requests,
        requestLimit: 200,
      },
    };
  }

  return adminDb().runTransaction(async (tx) => {
    const { ref, acc, changed, daily } = await loadInTx(tx, user, now);
    if (changed) tx.set(ref, acc);
    return toAccountView(user.uid, acc, daily);
  });
}

export async function savePhone(user: AuthUser, phone: string): Promise<void> {
  if (!isAdminConfigured() || user.uid.startsWith('guest')) return;
  await usersCol().doc(user.uid).set({ phone, updatedAt: Date.now() }, { merge: true });
}

export interface Reservation {
  uid: string;
  day: string;
  holdCredits: number;
  maxTokens: number;
  plan: PlanId;
}

/**
 * Atomically check plan access + fair-usage limits and reserve the worst-case
 * cost of a generation. `max_tokens` is derived from the remaining budget, so a
 * request can never cost more than the user has left.
 */
export async function reserveGeneration(user: AuthUser, model: AIModel, inputTokens: number): Promise<Reservation> {
  const now = Date.now();

  if (!isAdminConfigured() || user.uid.startsWith('guest')) {
    const usage = inMemoryUsage.get(user.uid) || { requests: 0, usedCredits: 0 };
    usage.requests += 1;
    inMemoryUsage.set(user.uid, usage);
    return {
      uid: user.uid,
      day: dayKey(now),
      holdCredits: 1,
      maxTokens: 16000,
      plan: 'pro',
    };
  }

  return adminDb().runTransaction(async (tx) => {
    const { ref, dRef, acc, daily } = await loadInTx(tx, user, now);
    const plan = PLANS[acc.plan];

    if (!canUseModel(acc.plan, model)) {
      throw new ApiError(
        403,
        'TIER_LOCKED',
        `This operation requires the ${PLANS[model.minPlan].name} tier or higher.`,
      );
    }
    if (daily.requests >= plan.dailyRequestLimit) {
      throw new ApiError(
        429,
        'DAILY_REQUEST_LIMIT',
        `You've used all ${plan.dailyRequestLimit} generations for today on the ${plan.name} plan. Limits reset at 00:00 UTC.`,
      );
    }

    const periodRemaining = acc.periodCredits - acc.periodUsed;
    const dailyRemaining = plan.dailyCreditCap - daily.credits;
    const available = Math.min(periodRemaining, dailyRemaining);

    const inputUsd = (inputTokens * model.inputPerM) / 1e6;
    const outPerToken = model.outputPerM / 1e6;
    const affordable = Math.floor((creditsToUsd(Math.max(0, available)) - inputUsd) / outPerToken);
    const maxTokens = Math.min(plan.maxOutputTokens, affordable);

    if (maxTokens < MIN_OUTPUT_TOKENS) {
      if (periodRemaining <= dailyRemaining) {
        throw new ApiError(
          402,
          'OUT_OF_CREDITS',
          acc.plan === 'free'
            ? 'You have used your free credits. Upgrade to keep building.'
            : 'Compute budget is depleted for this billing cycle. Upgrade your plan for fresh credits.',
        );
      }
      throw new ApiError(
        429,
        'DAILY_CREDIT_LIMIT',
        `Today's fair-usage daily budget cap has been reached. Resets at 00:00 UTC.`,
      );
    }

    const holdCredits = usdToCredits(inputUsd + maxTokens * outPerToken);
    tx.set(ref, { ...acc, periodUsed: acc.periodUsed + holdCredits, updatedAt: now });
    tx.set(dRef, { requests: daily.requests + 1, credits: daily.credits + holdCredits, updatedAt: now });

    return { uid: user.uid, day: dayKey(now), holdCredits, maxTokens, plan: acc.plan };
  });
}

export interface SettleInput {
  reservation: Reservation;
  actualCredits: number;
  /** Refund the daily request slot (e.g. provider failed before producing output). */
  refundRequest: boolean;
  ledger: {
    projectId: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    costUsd: number;
    estimated: boolean;
    outcome: 'saved' | 'failed' | 'aborted' | 'truncated';
  };
}

/** Replace the reserved hold with the real cost and record a ledger entry. */
export async function settleGeneration({ reservation, actualCredits, refundRequest, ledger }: SettleInput) {
  if (!isAdminConfigured() || reservation.uid.startsWith('guest')) {
    const usage = inMemoryUsage.get(reservation.uid) || { requests: 0, usedCredits: 0 };
    usage.usedCredits += actualCredits;
    if (refundRequest && usage.requests > 0) usage.requests -= 1;
    inMemoryUsage.set(reservation.uid, usage);
    return;
  }

  const { uid, day, holdCredits } = reservation;
  const delta = actualCredits - holdCredits;
  const now = Date.now();
  const batch = adminDb().batch();
  batch.set(usersCol().doc(uid), { periodUsed: FieldValue.increment(delta), updatedAt: now }, { merge: true });
  batch.set(
    dailyRef(uid, day),
    { credits: FieldValue.increment(delta), ...(refundRequest ? { requests: FieldValue.increment(-1) } : {}) },
    { merge: true },
  );
  batch.set(usersCol().doc(uid).collection('ledger').doc(), {
    ...ledger,
    credits: actualCredits,
    createdAt: now,
  });
  await batch.commit();
}

/** Apply a successful purchase to an account. Remaining paid credits always carry over. */
export function applyPurchase(acc: AccountDoc, planId: PlanId, now: number): AccountDoc {
  const plan = PLANS[planId];
  const activePaid = acc.plan !== 'free' && acc.planExpiresAt !== null && acc.planExpiresAt > now;
  const carry = activePaid ? Math.max(0, acc.periodCredits - acc.periodUsed) : 0;
  const expiresAt =
    activePaid && acc.plan === planId && acc.planExpiresAt !== null ? acc.planExpiresAt + PERIOD_MS : now + PERIOD_MS;
  return {
    ...acc,
    plan: planId,
    planExpiresAt: expiresAt,
    periodStart: now,
    periodCredits: carry + plan.monthlyCredits,
    periodUsed: 0,
    updatedAt: now,
  };
}

export { normalize as normalizeAccount, coerceAccount, readDaily };
