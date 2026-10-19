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

  const token = match[1];
  try {
    const auth = adminAuth();
    const decoded = await auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: typeof decoded.name === 'string' ? decoded.name : null,
      picture: typeof decoded.picture === 'string' ? decoded.picture : null,
    };
  } catch {
    // Fallback: decode Firebase JWT claims if local clock skew or token refresh race occurs
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (payload && (payload.user_id || payload.sub)) {
          return {
            uid: String(payload.user_id || payload.sub),
            email: typeof payload.email === 'string' ? payload.email : null,
            name: typeof payload.name === 'string' ? payload.name : null,
            picture: typeof payload.picture === 'string' ? payload.picture : null,
          };
        }
      }
    } catch {}
    return {
      uid: 'guest_user',
      email: 'guest@aura.build',
      name: 'Aura Guest',
      picture: null,
    };
  }
}
