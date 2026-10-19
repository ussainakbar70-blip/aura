'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import { getClientAuth, googleProvider, isFirebaseConfigured } from './firebase';
import type { AccountView } from '@/types';
import { PLANS } from '@/config/plans';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
  isAnonymous?: boolean;
  getIdToken: () => Promise<string>;
}

interface AuthContextType {
  user: User | AppUser | null;
  account: AccountView | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, displayName?: string) => Promise<void>;
  demoSignIn: (email?: string, displayName?: string) => void;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAccount: () => Promise<void>;
}

const defaultAccountView: AccountView = {
  uid: 'guest',
  email: 'guest@aura.build',
  name: 'Aura Guest',
  phone: null,
  plan: 'free',
  planName: PLANS.free.name,
  planExpiresAt: null,
  credits: {
    total: PLANS.free.monthlyCredits,
    used: 0,
    remaining: PLANS.free.monthlyCredits,
  },
  today: {
    credits: 0,
    creditCap: PLANS.free.dailyCreditCap,
    requests: 0,
    requestLimit: PLANS.free.dailyRequestLimit,
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  account: defaultAccountView,
  loading: true,
  isConfigured: false,
  isDemoMode: false,
  getToken: async () => null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  demoSignIn: () => {},
  resetPassword: async () => {},
  signOut: async () => {},
  refreshAccount: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();

  const [user, setUser] = useState<User | AppUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('aura_demo_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          uid: parsed.uid || 'demo_user_1',
          email: parsed.email || 'developer@aura.build',
          displayName: parsed.displayName || 'Aura Developer',
          photoURL: parsed.photoURL || null,
          emailVerified: true,
          isAnonymous: false,
          getIdToken: async () => 'demo_token_valid',
        };
      }
    } catch {}
    return null;
  });

  const [account, setAccount] = useState<AccountView | null>(() => {
    if (typeof window === 'undefined') return defaultAccountView;
    try {
      const stored = localStorage.getItem('aura_demo_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultAccountView,
          uid: parsed.uid || 'demo_user_1',
          email: parsed.email || 'developer@aura.build',
          name: parsed.displayName || 'Aura Developer',
        };
      }
    } catch {}
    return defaultAccountView;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return Boolean(localStorage.getItem('aura_demo_user'));
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => (configured ? true : false));

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return 'demo_token';
    }
  }, [user]);

  const refreshAccount = useCallback(async () => {
    if (!user) {
      setAccount(defaultAccountView);
      return;
    }
    try {
      const token = await getToken();
      const res = await fetch('/api/account', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
      }
    } catch (err) {
      console.warn('[aura] Failed to fetch account telemetry:', err);
    }
  }, [user, getToken]);

  // Initialize auth state for Firebase if configured
  useEffect(() => {
    if (!configured) return;

    const auth = getClientAuth();
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          localStorage.removeItem('aura_demo_user');
        } catch {}
        setUser(currentUser);
        setIsDemoMode(false);
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch('/api/account', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setAccount(await res.json());
          }
        } catch {
          setAccount({
            ...defaultAccountView,
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Aura Builder',
          });
        }
      } else {
        // Check if user is in explicit demo session
        try {
          const stored = localStorage.getItem('aura_demo_user');
          if (!stored) {
            setUser(null);
            setIsDemoMode(false);
            setAccount(defaultAccountView);
          }
        } catch {
          setUser(null);
          setIsDemoMode(false);
          setAccount(defaultAccountView);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configured]);

  const signInWithGoogle = async () => {
    const auth = getClientAuth();
    if (!auth) {
      demoSignIn('google.user@aura.build', 'Google Demo User');
      return;
    }
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        try {
          localStorage.removeItem('aura_demo_user');
        } catch {}
        setUser(cred.user);
        setIsDemoMode(false);
      }
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Google sign-in window was closed before completing.');
      }
      throw err;
    }
  };

  const signInWithEmail = async (e: string, p: string) => {
    const auth = getClientAuth();
    if (!auth) {
      const inferredName = e.split('@')[0].replace(/[._]/g, ' ');
      const capitalized = inferredName.charAt(0).toUpperCase() + inferredName.slice(1);
      demoSignIn(e, capitalized || 'Aura Developer');
      return;
    }
    const cred = await signInWithEmailAndPassword(auth, e, p);
    if (cred.user) {
      try {
        localStorage.removeItem('aura_demo_user');
      } catch {}
      setUser(cred.user);
      setIsDemoMode(false);
    }
  };

  const signUpWithEmail = async (e: string, p: string, displayName?: string) => {
    const auth = getClientAuth();
    if (!auth) {
      demoSignIn(e, displayName || 'New Builder');
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, e, p);
    if (cred.user) {
      if (displayName) {
        try {
          await updateProfile(cred.user, { displayName });
        } catch (err) {
          console.warn('[aura] Could not set display name:', err);
        }
      }
      try {
        localStorage.removeItem('aura_demo_user');
      } catch {}
      setUser(cred.user);
      setIsDemoMode(false);
    }
  };

  const demoSignIn = (email = 'developer@aura.build', displayName = 'Aura Developer') => {
    const demoUser: AppUser = {
      uid: `demo_${Date.now()}`,
      email,
      displayName,
      photoURL: null,
      emailVerified: true,
      isAnonymous: false,
      getIdToken: async () => 'demo_token_valid',
    };
    try {
      localStorage.setItem('aura_demo_user', JSON.stringify({
        uid: demoUser.uid,
        email: demoUser.email,
        displayName: demoUser.displayName,
      }));
    } catch {}

    setUser(demoUser);
    setIsDemoMode(true);
    setAccount({
      ...defaultAccountView,
      uid: demoUser.uid,
      email: demoUser.email,
      name: demoUser.displayName,
    });
  };

  const resetPassword = async (emailToReset: string) => {
    const auth = getClientAuth();
    if (!auth) {
      // Simulated response when Firebase is pending
      await new Promise((res) => setTimeout(res, 600));
      return;
    }
    await sendPasswordResetEmail(auth, emailToReset);
  };

  const signOut = async () => {
    const auth = getClientAuth();
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch {}
    }
    try {
      localStorage.removeItem('aura_demo_user');
    } catch {}
    setUser(null);
    setIsDemoMode(false);
    setAccount(defaultAccountView);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account: account ?? defaultAccountView,
        loading,
        isConfigured: configured,
        isDemoMode,
        getToken,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        demoSignIn,
        resetPassword,
        signOut,
        refreshAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
