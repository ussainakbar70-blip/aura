import { NextRequest, NextResponse } from 'next/server';
import { PLANS, isPlanId, type PlanId } from '@/config/plans';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planParam = searchParams.get('plan') as PlanId;
  const plan = isPlanId(planParam) ? PLANS[planParam] : PLANS.starter;

  return NextResponse.json({
    plan: plan.id,
    name: plan.name,
    priceUSD: plan.priceUSD,
    priceINR: plan.priceINR,
    dailyRequestLimit: plan.dailyRequestLimit,
    dailyCreditCap: plan.dailyCreditCap,
    monthlyCredits: plan.monthlyCredits,
    targetMarginUSD: plan.targetMarginUSD,
    features: plan.features,
    fupRules: [
      'Daily requests and credits reset automatically at 00:00 UTC',
      'Bursts permitted up to daily credit allowance',
      'Requests capped at max output tokens to protect account budget',
    ],
  });
}
