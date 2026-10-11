import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeOrder } from '@/lib/cashfree';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { SubscriptionTier } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { orderId, tierId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId parameter' }, { status: 400 });
    }

    const orderStatusData = await verifyCashfreeOrder(orderId);

    // If order status is PAID
    const isPaid = orderStatusData.order_status === 'PAID';

    // Determine tier from tierId or extract from orderId (format: aura_tierId_timestamp)
    let resolvedTier: SubscriptionTier = 'starter';
    if (tierId && SUBSCRIPTION_TIERS[tierId as SubscriptionTier]) {
      resolvedTier = tierId as SubscriptionTier;
    } else {
      const parts = orderId.split('_');
      if (parts[1] && SUBSCRIPTION_TIERS[parts[1] as SubscriptionTier]) {
        resolvedTier = parts[1] as SubscriptionTier;
      }
    }

    const tierConfig = SUBSCRIPTION_TIERS[resolvedTier];

    return NextResponse.json({
      success: true,
      paid: isPaid,
      orderStatus: orderStatusData.order_status,
      orderId: orderStatusData.order_id,
      amount: orderStatusData.order_amount,
      tier: resolvedTier,
      tierName: tierConfig.name,
      dailyLimit: tierConfig.dailyRequestLimit,
      profitMarginUSD: tierConfig.estimatedProfitMarginUSD,
      activatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
