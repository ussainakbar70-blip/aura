'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Sparkles, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/lib/client/auth-context';
import { AuraLogo } from './AuraLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { isConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e0e13] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <AuraLogo size="sm" showSubtitle={false} />
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isSignUp ? 'Create your Aura account' : 'Welcome back to Aura'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Access frontier models, save project history, and unlock Cashfree subscription limits.
          </p>
        </div>

        {!isConfigured ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Firebase Auth Setup Required</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Add your Firebase credentials to <code className="text-amber-300 font-mono">.env.local</code> to enable Google One-Tap and persistent accounts across devices. In the meantime, you are browsing with free guest access.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 bg-amber-400 hover:bg-amber-300 text-black font-semibold rounded-lg text-xs"
            >
              Continue as Guest
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-zinc-800" />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">or email</span>
              <div className="flex-1 h-[1px] bg-zinc-800" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
