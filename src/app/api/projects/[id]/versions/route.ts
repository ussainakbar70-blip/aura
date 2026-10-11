import { requireUser } from '@/lib/server/auth';
import { listVersions } from '@/lib/server/projects';
import { errorResponse } from '@/lib/server/errors';


export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await ctx.params;
    const versions = await listVersions(user.uid, id);
    return Response.json(versions);
  } catch (err) {
    return errorResponse(err);
  }
}
