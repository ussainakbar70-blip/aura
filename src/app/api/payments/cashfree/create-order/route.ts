import { NextRequest, NextResponse } from 'next/server';
import { createCashfreeOrder } from '@/lib/cashfree';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { SubscriptionTier } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tierId, customerName, customerEmail, customerPhone } = body;

    const tier = SUBSCRIPTION_TIERS[tierId as SubscriptionTier];
    if (!tier) {
      return NextResponse.json(
        { error: `Invalid subscription tier: ${tierId}` },
        { status: 400 }
      );
    }

    const orderId = `aura_${tierId}_${Date.now()}`;
    const orderAmount = tier.priceINR; // Cashfree PG standard amount in INR

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const returnUrl = `${protocol}://${host}?payment_status=success&order_id={order_id}&tier=${tierId}`;

    const orderData = await createCashfreeOrder({
      orderId,
      orderAmount,
      orderCurrency: 'INR',
      customerName: customerName || 'Aura Developer',
      customerEmail: customerEmail || 'dev@aura.build',
      customerPhone: customerPhone || '9876543210',
      returnUrl,
      tierId,
    });

    return NextResponse.json({
      success: true,
      orderId: orderData.order_id,
      paymentSessionId: orderData.payment_session_id,
      orderAmount,
      orderCurrency: 'INR',
      tier: tier.name,
      tierId: tier.id,
      dailyLimit: tier.dailyRequestLimit,
    });
  } catch (error: any) {
    console.error('Order creation handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Cashfree payment' },
      { status: 500 }
    );
  }
}
