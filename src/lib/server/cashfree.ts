import crypto from 'crypto';
import { adminDb } from './firebase-admin';
import { ApiError } from './errors';
import { applyPurchase, coerceAccount, dayKey, readDaily, toAccountView } from './billing';
import { PLANS, isPlanId, type PlanId } from '@/config/plans';
import type { AccountView } from '@/types';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'production';

const BASE_URL =
  CASHFREE_ENV === 'sandbox' ? 'https://sandbox.cashfree.com/pg' : 'https://api.cashfree.com/pg';

const API_VERSION = '2023-08-01';

export interface CashfreeOrderResponse {
  cf_order_id?: string;
  order_id: string;
  order_status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'TERMINATED';
  payment_session_id?: string;
  order_amount: number;
  order_currency: string;
  customer_details?: {
    customer_id: string;
    customer_email?: string;
    customer_phone?: string;
  };
  order_tags?: {
    planId?: string;
    uid?: string;
  };
}

export interface StoredOrder {
  orderId: string;
  uid: string;
  planId: PlanId;
  amountINR: number;
  status: 'ACTIVE' | 'PAID' | 'EXPIRED';
  createdAt: number;
  processedAt?: number;
  paymentSessionId?: string;
}

const ordersCol = () => adminDb().collection('orders');

function getHeaders() {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new ApiError(503, 'PAYMENTS_NOT_CONFIGURED', 'Cashfree credentials are not configured on the server.');
  }
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-api-version': API_VERSION,
    'x-client-id': CASHFREE_APP_ID,
    'x-client-secret': CASHFREE_SECRET_KEY,
  };
}

/**
 * Creates an order in Cashfree PG and records it in Firestore
 */
export async function createCashfreeOrder(
  uid: string,
  userEmail: string | null,
  userName: string | null,
  userPhone: string | null,
  planId: PlanId
): Promise<{ orderId: string; paymentSessionId: string; amountINR: number }> {
  if (planId === 'free' || !isPlanId(planId)) {
    throw new ApiError(400, 'INVALID_PLAN', 'Cannot checkout the free plan.');
  }

  const plan = PLANS[planId];
  const orderId = `aura_${planId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const body = {
    order_id: orderId,
    order_amount: plan.priceINR,
    order_currency: 'INR',
    customer_details: {
      customer_id: uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 48),
      customer_email: userEmail || 'user@aura.build',
      customer_phone: userPhone || '9876543210',
      customer_name: userName || 'Aura Creator',
    },
    order_meta: {
      return_url: `${appUrl}?order_id={order_id}&status=success`,
      notify_url: `${appUrl}/api/payments/cashfree/webhook`,
    },
    order_note: `Aura ${plan.name} Plan (30-day Access)`,
    order_tags: {
      planId,
      uid,
    },
  };

  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('[cashfree] Order creation error:', data);
    throw new ApiError(502, 'CASHFREE_ORDER_FAILED', data.message || 'Failed to initialize Cashfree order.');
  }

  const orderData = data as CashfreeOrderResponse;

  if (!orderData.payment_session_id) {
    throw new ApiError(502, 'CASHFREE_NO_SESSION', 'Cashfree did not return a payment session ID.');
  }

  // Store order in Firestore
  const stored: StoredOrder = {
    orderId,
    uid,
    planId,
    amountINR: plan.priceINR,
    status: 'ACTIVE',
    createdAt: Date.now(),
    paymentSessionId: orderData.payment_session_id,
  };
  await ordersCol().doc(orderId).set(stored);

  return {
    orderId,
    paymentSessionId: orderData.payment_session_id,
    amountINR: plan.priceINR,
  };
}

/**
 * Checks Cashfree PG order status and activates subscription if paid
 */
export async function verifyAndActivateOrder(
  orderId: string,
  uid: string
): Promise<{ paid: boolean; account?: AccountView; status: string }> {
  // Query Cashfree API directly
  const res = await fetch(`${BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(res.status, 'CASHFREE_VERIFY_ERROR', data.message || 'Failed to verify order with Cashfree.');
  }

  const cfOrder = data as CashfreeOrderResponse;
  const isPaid = cfOrder.order_status === 'PAID';

  if (!isPaid) {
    return { paid: false, status: cfOrder.order_status };
  }

  // Extract plan
  const planTag = (cfOrder.order_tags?.planId || orderId.split('_')[1]) as PlanId;
  const planId = isPlanId(planTag) ? planTag : 'starter';

  // Atomically process payment in Firestore transaction
  const now = Date.now();
  const orderRef = ordersCol().doc(orderId);
  const userRef = adminDb().collection('users').doc(uid);
  const dailyDocRef = userRef.collection('daily').doc(dayKey(now));

  const updatedAccountView = await adminDb().runTransaction(async (tx) => {
    const [orderSnap, userSnap, dailySnap] = await Promise.all([
      tx.get(orderRef),
      tx.get(userRef),
      tx.get(dailyDocRef),
    ]);

    const orderData = orderSnap.data() as StoredOrder | undefined;

    // Idempotency: If already processed, return current account view
    if (orderData?.status === 'PAID' && orderData.processedAt) {
      const currentAcc = coerceAccount(userSnap.data(), { uid, email: null, name: null, picture: null }, now);
      return toAccountView(uid, currentAcc, readDaily(dailySnap.data()));
    }

    // Apply purchase
    const currentAcc = coerceAccount(userSnap.data(), { uid, email: null, name: null, picture: null }, now);
    const upgradedAcc = applyPurchase(currentAcc, planId, now);

    tx.set(userRef, upgradedAcc, { merge: true });
    tx.set(
      orderRef,
      {
        orderId,
        uid,
        planId,
        amountINR: PLANS[planId].priceINR,
        status: 'PAID',
        processedAt: now,
      },
      { merge: true }
    );

    return toAccountView(uid, upgradedAcc, readDaily(dailySnap.data()));
  });

  return {
    paid: true,
    status: 'PAID',
    account: updatedAccountView,
  };
}

/**
 * Validates Cashfree Webhook HMAC SHA256 Signature
 */
export function verifyCashfreeSignature(rawBody: string, timestamp: string, signature: string): boolean {
  if (!signature || !timestamp || !CASHFREE_SECRET_KEY) {
    return false;
  }
  try {
    const payload = timestamp + rawBody;
    const computed = crypto.createHmac('sha256', CASHFREE_SECRET_KEY).update(payload).digest('base64');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
  } catch {
    return false;
  }
}

/**
 * Processes incoming Cashfree Webhook
 */
export async function processWebhookEvent(rawBody: string, timestamp: string, signature: string): Promise<boolean> {
  const isValid = verifyCashfreeSignature(rawBody, timestamp, signature);
  if (!isValid) {
    throw new ApiError(401, 'INVALID_WEBHOOK_SIGNATURE', 'Cashfree webhook signature verification failed.');
  }

  const event = JSON.parse(rawBody);
  const orderId = event.data?.order?.order_id || event.order_id;
  const paymentStatus = event.data?.payment?.payment_status || event.payment_status;
  const orderStatus = event.data?.order?.order_status || event.order_status;

  if (paymentStatus === 'SUCCESS' || orderStatus === 'PAID') {
    // Lookup stored order to get UID
    const orderSnap = await ordersCol().doc(orderId).get();
    if (orderSnap.exists) {
      const order = orderSnap.data() as StoredOrder;
      await verifyAndActivateOrder(orderId, order.uid);
    }
  }

  return true;
}
