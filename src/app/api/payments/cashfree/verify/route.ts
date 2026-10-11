import { requireUser } from '@/lib/server/auth';
import { verifyAndActivateOrder } from '@/lib/server/cashfree';
import { errorResponse, readJson, ApiError } from '@/lib/server/errors';


interface VerifyOrderBody {
  orderId: string;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson<VerifyOrderBody>(req);

    if (!body.orderId || typeof body.orderId !== 'string') {
      throw new ApiError(400, 'MISSING_ORDER_ID', 'Order ID is required.');
    }

    const result = await verifyAndActivateOrder(body.orderId, user.uid);

    return Response.json({
      success: true,
      paid: result.paid,
      status: result.status,
      account: result.account,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
