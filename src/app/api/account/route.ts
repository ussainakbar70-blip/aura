import { requireUser } from '@/lib/server/auth';
import { getAccount, savePhone } from '@/lib/server/billing';
import { errorResponse, readJson } from '@/lib/server/errors';

export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const account = await getAccount(user);
    return Response.json(account);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson<{ phone: string }>(req);
    if (typeof body.phone === 'string' && body.phone.trim()) {
      await savePhone(user, body.phone.trim());
    }
    const account = await getAccount(user);
    return Response.json(account);
  } catch (err) {
    return errorResponse(err);
  }
}
