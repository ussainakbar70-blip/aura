import { processWebhookEvent } from '@/lib/server/cashfree';
import { errorResponse } from '@/lib/server/errors';


export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get('x-webhook-timestamp') ?? '';
    const signature = req.headers.get('x-webhook-signature') ?? '';

    await processWebhookEvent(rawBody, timestamp, signature);

    return Response.json({
      received: true,
      status: 'SUCCESS',
      message: 'Cashfree webhook acknowledged.',
    });
  } catch (err) {
    return errorResponse(err);
  }
}
