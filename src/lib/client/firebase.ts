import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDcUk5bBr65b5Rfcgiy3HMoL6uXVcJgcVo',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'aura-build-d83b5.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aura-build-d83b5',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'aura-build-d83b5.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '17160992529',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:17160992529:web:056090553e5b26180a7eb0',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-RBQLWZEQ5E',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let analytics: Analytics | undefined;

export function getClientApp(): FirebaseApp | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!isFirebaseConfigured()) return undefined;
  if (app) return app;
  app = getApps()[0] ?? initializeApp(firebaseConfig);

  // Initialize Firebase Analytics in browser when supported
  if (!analytics) {
    isAnalyticsSupported()
      .then((supported) => {
        if (supported && app && !analytics) {
          analytics = getAnalytics(app);
        }
      })
      .catch(() => {});
  }

  return app;
}

export function getClientAuth(): Auth | undefined {
  if (typeof window === 'undefined') return undefined;
  const a = getClientApp();
  if (!a) return undefined;
  if (!auth) {
    auth = getAuth(a);
  }
  return auth;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

