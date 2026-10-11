import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { SubscriptionTier } from '@/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tierParam = (searchParams.get('tier') || 'starter') as SubscriptionTier;

  const tier = SUBSCRIPTION_TIERS[tierParam] || SUBSCRIPTION_TIERS.starter;

  // Economic analysis of fair usage policy
  const profitMarginPercent = Math.round((tier.estimatedProfitMarginUSD / tier.priceUSD) * 100);
  const costPerRequestBudget = (tier.computeAllowanceUSD / (tier.dailyRequestLimit * 30)).toFixed(4);

  return NextResponse.json({
    tier: tier.id,
    name: tier.name,
    priceUSD: tier.priceUSD,
    priceINR: tier.priceINR,
    dailyLimit: tier.dailyRequestLimit,
    economics: {
      monthlyPrice: tier.priceUSD,
      monthlyComputeAllowance: tier.computeAllowanceUSD,
      estimatedProfitMargin: tier.estimatedProfitMarginUSD,
      profitMarginPercent: `${profitMarginPercent}%`,
      costPerRequestBudget: `$${costPerRequestBudget}`,
    },
    allowedModels: tier.allowedModels,
    fupRules: [
      'Daily requests reset automatically at 00:00 UTC',
      'Bursts permitted up to daily threshold',
      'Automatic fallback to lightweight models if compute exceeds soft thresholds',
    ],
  });
}
