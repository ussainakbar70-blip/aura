'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getClientAuth, googleProvider, isFirebaseConfigured } from './firebase';
import type { AccountView } from '@/types';
import { PLANS } from '@/config/plans';

interface AuthContextType {
  user: User | null;
  account: AccountView | null;
  loading: boolean;
  isConfigured: boolean;
  getToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
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
  getToken: async () => null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  refreshAccount: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountView | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  const refreshAccount = useCallback(async () => {
    if (!user) {
      setAccount(defaultAccountView);
      return;
    }
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/account', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAccount(data);
      }
    } catch (err) {
      console.warn('[aura] Failed to fetch account telemetry:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!configured) {
      setAccount(defaultAccountView);
      setLoading(false);
      return;
    }

    const auth = getClientAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          const res = await fetch('/api/account', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setAccount(await res.json());
          }
        } catch {
          setAccount(defaultAccountView);
        }
      } else {
        setAccount(defaultAccountView);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [configured]);

  const signInWithGoogle = async () => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase Auth is not configured in .env.local');
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (e: string, p: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase Auth is not configured in .env.local');
    await signInWithEmailAndPassword(auth, e, p);
  };

  const signUpWithEmail = async (e: string, p: string) => {
    const auth = getClientAuth();
    if (!auth) throw new Error('Firebase Auth is not configured in .env.local');
    await createUserWithEmailAndPassword(auth, e, p);
  };

  const signOut = async () => {
    const auth = getClientAuth();
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setAccount(defaultAccountView);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        account: account ?? defaultAccountView,
        loading,
        isConfigured: configured,
        getToken,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
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
