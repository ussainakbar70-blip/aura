import type { App } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore, FieldValue } from 'firebase-admin/firestore';
import { ApiError } from './errors';

let app: App | undefined;
let db: Firestore | undefined;

// Lazy runtime require so Turbopack / Vercel never loads @grpc/grpc-js or protobufjs when Firebase Admin is unconfigured
const dynamicRequire = (mod: string): any => {
  return eval('require')(mod);
};

function readPrivateKey(): string | undefined {
  const raw = process.env.FIREBASE_PRIVATE_KEY;
  if (!raw) return undefined;
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
  const { cert, getApps, initializeApp } = dynamicRequire('firebase-admin/app');
  const instance: App =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: readPrivateKey(),
      }),
    });
  app = instance;
  return instance;
}

export function adminAuth(): Auth {
  const { getAuth } = dynamicRequire('firebase-admin/auth');
  return getAuth(getAdminApp());
}

export function adminDb(): Firestore {
  if (db) return db;
  const a = getAdminApp();
  const { getFirestore } = dynamicRequire('firebase-admin/firestore');
  const instance: Firestore = getFirestore(a);
  try {
    instance.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings already frozen on re-use
  }
  db = instance;
  return instance;
}

export function adminFieldValue(): typeof FieldValue {
  const { FieldValue: FV } = dynamicRequire('firebase-admin/firestore');
  return FV;
}
