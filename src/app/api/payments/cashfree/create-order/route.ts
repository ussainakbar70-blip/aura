import { requireUser } from '@/lib/server/auth';
import { createCashfreeOrder } from '@/lib/server/cashfree';
import { errorResponse, readJson, ApiError } from '@/lib/server/errors';
import { isPlanId, PlanId } from '@/config/plans';


interface CreateOrderBody {
  planId: PlanId;
  phone?: string;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson<CreateOrderBody>(req);

    if (!body.planId || !isPlanId(body.planId) || body.planId === 'free') {
      throw new ApiError(400, 'INVALID_PLAN', 'Please select a valid paid plan (Starter, Creator, or Pro).');
    }

    const orderData = await createCashfreeOrder(
      user.uid,
      user.email,
      user.name,
      body.phone || null,
      body.planId
    );

    return Response.json({
      success: true,
      orderId: orderData.orderId,
      paymentSessionId: orderData.paymentSessionId,
      amountINR: orderData.amountINR,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
