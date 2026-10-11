import { requireUser } from '@/lib/server/auth';
import { getVersionHtml } from '@/lib/server/projects';
import { errorResponse, ApiError } from '@/lib/server/errors';


export async function GET(req: Request, ctx: { params: Promise<{ id: string; version: string }> }) {
  try {
    const user = await requireUser(req);
    const { id, version } = await ctx.params;
    const versionNum = parseInt(version, 10);
    if (isNaN(versionNum) || versionNum < 1) {
      throw new ApiError(400, 'INVALID_VERSION', 'Version must be a positive integer.');
    }
    const html = await getVersionHtml(user.uid, id, versionNum);
    return Response.json({ version: versionNum, html });
  } catch (err) {
    return errorResponse(err);
  }
}
