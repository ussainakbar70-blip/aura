import crypto from 'crypto';

export interface CreateOrderParams {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  tierId: string;
}

export interface CashfreeOrderResponse {
  cf_order_id?: string;
  order_id: string;
  order_status: string;
  payment_session_id?: string;
  order_amount: number;
  order_currency: string;
  order_meta?: {
    payment_methods?: string;
  };
  message?: string;
}

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'production';

const BASE_URL = CASHFREE_ENV === 'sandbox'
  ? 'https://sandbox.cashfree.com/pg'
  : 'https://api.cashfree.com/pg';

const API_VERSION = '2023-08-01';

/**
 * Creates an order on Cashfree Payment Gateway
 */
export async function createCashfreeOrder(params: CreateOrderParams): Promise<CashfreeOrderResponse> {
  const url = `${BASE_URL}/orders`;

  const body = {
    order_id: params.orderId,
    order_amount: Math.round(params.orderAmount * 100) / 100,
    order_currency: params.orderCurrency || 'INR',
    customer_details: {
      customer_id: `user_${Date.now()}`,
      customer_name: params.customerName || 'Aura Member',
      customer_email: params.customerEmail || 'developer@aura.build',
      customer_phone: params.customerPhone || '9876543210',
    },
    order_meta: {
      return_url: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}?payment_status=success&order_id={order_id}`,
      notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/cashfree/webhook`,
    },
    order_note: `Aura Platform ${params.tierId.toUpperCase()} Subscription Plan`,
    order_tags: {
      tier: params.tierId,
      platform: 'aura-vibe-coding',
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-version': API_VERSION,
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Cashfree order creation error:', data);
      throw new Error(data.message || `Cashfree API returned ${res.status}`);
    }

    return data as CashfreeOrderResponse;
  } catch (error: any) {
    console.error('Failed to communicate with Cashfree:', error);
    throw error;
  }
}

/**
 * Verifies an order status directly with Cashfree PG
 */
export async function verifyCashfreeOrder(orderId: string): Promise<CashfreeOrderResponse> {
  const url = `${BASE_URL}/orders/${encodeURIComponent(orderId)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-api-version': API_VERSION,
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Cashfree verification failed:', data);
      throw new Error(data.message || `Cashfree verify returned ${res.status}`);
    }

    return data as CashfreeOrderResponse;
  } catch (error: any) {
    console.error('Cashfree verification error:', error);
    throw error;
  }
}

/**
 * Verifies Cashfree Webhook Signature using HMAC SHA256
 */
export function verifyCashfreeWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  if (!signature || !timestamp || !CASHFREE_SECRET_KEY) {
    return false;
  }

  try {
    const signatureData = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', CASHFREE_SECRET_KEY)
      .update(signatureData)
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}
