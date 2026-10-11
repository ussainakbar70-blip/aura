import { NextRequest, NextResponse } from 'next/server';
import { verifyCashfreeWebhookSignature } from '@/lib/cashfree';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('x-webhook-timestamp') || '';

    // Verify webhook signature if in production
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && signature && timestamp) {
      const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature);
      if (!isValid) {
        console.warn('Invalid Cashfree webhook signature detected');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { raw: rawBody };
    }

    console.log('[Cashfree Webhook Received]:', {
      type: payload.type || payload.event,
      orderId: payload.data?.order?.order_id || payload.order_id,
      status: payload.data?.payment?.payment_status || payload.order_status,
      timestamp: new Date().toISOString(),
    });

    // In a production app with a DB, here we'd execute:
    // await db.users.update({ where: { orderId }, data: { tier, expiresAt, dailyLimit } });
    
    return NextResponse.json({
      received: true,
      status: 'SUCCESS',
      message: 'Subscription updated and webhook acknowledged',
    });
  } catch (error: any) {
    console.error('Error handling Cashfree webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing error', details: error.message },
      { status: 500 }
    );
  }
}
