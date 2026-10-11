import { requireUser } from '@/lib/server/auth';
import { deleteProject, getProject, updateProject } from '@/lib/server/projects';
import { errorResponse, readJson } from '@/lib/server/errors';


export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await ctx.params;
    const project = await getProject(user.uid, id);
    return Response.json(project);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await ctx.params;
    const body = await readJson<{ title?: string; isPublic?: boolean }>(req);
    await updateProject(user.uid, id, body);
    const updated = await getProject(user.uid, id);
    return Response.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(req);
    const { id } = await ctx.params;
    await deleteProject(user.uid, id);
    return Response.json({ success: true });
  } catch (err) {
    return errorResponse(err);
  }
}
