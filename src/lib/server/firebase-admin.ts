import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase-admin/firestore';
import { ApiError } from './errors';

let app: App | undefined;
let db: Firestore | undefined;

function readPrivateKey(): string | undefined {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) return undefined;
  // Vercel / .env files usually store the key with literal "\n" and sometimes wrapped in quotes.
  return raw.replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && readPrivateKey());
}

function getAdminApp(): App {
  if (app) return app;
  if (!isAdminConfigured()) {
    throw new ApiError(
      503,
      'SERVER_NOT_CONFIGURED',
      'Aura is not fully configured yet (missing Firebase Admin credentials).',
    );
  }
  app =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: readPrivateKey(),
      }),
    });
  return app;
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  if (db) return db;
  const a = getAdminApp();
  db = getFirestore(a);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings already frozen on re-use
  }
  return db;
}
