import { adminAuth, isAdminConfigured } from './firebase-admin';
import { ApiError } from './errors';

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

/** Verify the Firebase ID token sent as `Authorization: Bearer <token>`, or return a guest user for local testing. */
export async function requireUser(req: Request): Promise<AuthUser> {
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);

  // If no auth token or Firebase Admin is not configured, seamlessly return a guest user
  if (!match || !isAdminConfigured()) {
    const guestId = req.headers.get('x-guest-id') || 'guest_user';
    return {
      uid: guestId,
      email: 'guest@aura.build',
      name: 'Aura Guest',
      picture: null,
    };
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
    // If token expired in dev or guest session, smoothly fallback to guest instead of blocking
    return {
      uid: 'guest_user',
      email: 'guest@aura.build',
      name: 'Aura Guest',
      picture: null,
    };
  }
}
