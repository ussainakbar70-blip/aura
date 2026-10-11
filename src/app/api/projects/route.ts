import { requireUser } from '@/lib/server/auth';
import { listProjects } from '@/lib/server/projects';
import { errorResponse } from '@/lib/server/errors';


export async function GET(req: Request) {
  try {
    const user = await requireUser(req);
    const projects = await listProjects(user.uid);
    return Response.json(projects);
  } catch (err) {
    return errorResponse(err);
  }
}
