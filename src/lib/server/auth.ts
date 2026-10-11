import { adminAuth } from './firebase-admin';
import { ApiError } from './errors';

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

/** Verify the Firebase ID token sent as `Authorization: Bearer <token>`. */
export async function requireUser(req: Request): Promise<AuthUser> {
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Please sign in to continue.');
  }
  const auth = adminAuth();
  try {
    const decoded = await auth.verifyIdToken(match[1]);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: typeof decoded.name === 'string' ? decoded.name : null,
      picture: typeof decoded.picture === 'string' ? decoded.picture : null,
    };
  } catch {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Your session has expired. Please sign in again.');
  }
}
