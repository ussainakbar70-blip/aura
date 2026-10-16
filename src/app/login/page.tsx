'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, 
  CheckCircle2, AlertCircle, ShieldCheck, Zap, ArrowLeft
} from 'lucide-react';
import { AuraLogo } from '@/components/AuraLogo';
import { useAuth } from '@/lib/client/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/studio';

  const { isConfigured, signInWithEmail, signInWithGoogle, demoSignIn, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirectPath);
    } catch (err: any) {
      setError(err?.message || 'Google sign-in was interrupted. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    demoSignIn('developer@aura.build', 'Aura Architect');
    router.push(redirectPath);
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotError(null);
    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to dispatch reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -top-40 right-[-100px] w-96 h-96 bg-amber-400/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-50px] left-[-50px] w-96 h-96 bg-zinc-800/40 blur-[130px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <header className="relative z-20 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <AuraLogo size="md" showSubtitle={true} href="/" />
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/studio"
            className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            Launch Studio
          </Link>
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Left Column: Login Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-6 relative">
              {/* Subtle top shimmer line */}
              <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

              {/* Header Title */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Welcome Back</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Sign in to Aura
                </h1>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Access your projects, custom prompts, version history, and frontier AI generation engines.
                </p>
              </div>

              {/* Status Notice if Firebase Pending */}
              {!isConfigured && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Firebase Auth Connection Ready</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-normal">
                    You can type any email or click below to enter with instant <strong className="text-white">Developer Demo Session</strong> while Firebase keys are being configured in <code className="text-amber-300 font-mono">.env.local</code>.
                  </p>
                  <button
                    type="button"
                    onClick={handleDemoSignIn}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>⚡ Instant 1-Click Demo Login</span>
                  </button>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              {/* Google Social Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all hover:border-zinc-600 shadow-sm cursor-pointer group"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span className="group-hover:text-amber-200 transition-colors">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-zinc-800" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">or email</span>
                <div className="flex-1 h-[1px] bg-zinc-800" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-zinc-300 block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setShowForgotModal(true);
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-400/50 accent-amber-400"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">TLS 256-bit</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="pt-2 text-center border-t border-zinc-800/80">
                <p className="text-xs text-zinc-400">
                  New to Aura?{' '}
                  <Link
                    href={`/signup${redirectPath !== '/studio' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
                    className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                  >
                    Create a free account
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6">
            <div className="p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 space-y-6 shadow-2xl relative overflow-hidden">
              {/* Subtle ambient corner gradient */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/10 blur-3xl pointer-events-none rounded-full" />

              {/* Live Metric Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Engine v2.5 Online
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[11px] font-mono">
                  1.8s Latency
                </span>
              </div>

              {/* Holographic Code Snippet */}
              <div className="rounded-2xl bg-black/80 border border-zinc-800/90 p-4 font-mono text-[11px] leading-relaxed text-zinc-300 shadow-inner">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-800/80 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/60" />
                    <span className="w-2 h-2 rounded-full bg-amber-500/60" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
                    <span className="ml-1 text-zinc-400">AutonomousSynthesis.tsx</span>
                  </span>
                  <span className="text-amber-400/90">Aura Engine</span>
                </div>
                <p className="text-zinc-500">{"// Autonomous full-stack generation"}</p>
                <p>
                  <span className="text-amber-400">const</span>{' '}
                  <span className="text-cyan-300">app</span> ={' '}
                  <span className="text-amber-400">await</span> aura.
                  <span className="text-yellow-200">synthesize</span>({`{`}
                </p>
                <p className="pl-4 text-emerald-300">
                  prompt: <span className="text-zinc-200">"Modern SaaS revenue intelligence"</span>,
                </p>
                <p className="pl-4 text-purple-300">
                  reactiveState: <span className="text-amber-400">true</span>,
                </p>
                <p className="pl-4 text-blue-300">
                  exportTarget: <span className="text-zinc-200">"Next.js 16 + Tailwind v4"</span>
                </p>
                <p>{`}`});</p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>15 Free daily autonomous builds reset at midnight</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Multi-device preview: Desktop, Tablet, and Mobile</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>One-click Cashfree upgrade and OpenRouter BYOK</span>
                </div>
              </div>

              {/* Founder quote */}
              <div className="pt-4 border-t border-zinc-800/80">
                <p className="text-xs text-zinc-400 italic">
                  “Aura turned a 2-week sprint into a 15-minute prompt session. The interactive code was ready to show investors immediately.”
                </p>
                <div className="flex items-center gap-2.5 mt-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black font-black text-[11px] flex items-center justify-center">
                    AR
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Alex Rivera</p>
                    <p className="text-[10px] text-zinc-500">Founder, NexaFlow Tech</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white">Reset your Aura password</h3>
            <p className="text-xs text-zinc-400">
              Enter your email address and we'll send you an encrypted password reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Reset link dispatched!</span>
                </p>
                <p className="text-[11px] text-zinc-300">
                  Check your inbox for instructions to set your new password.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full mt-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                {forgotError && (
                  <p className="text-xs text-red-400">{forgotError}</p>
                )}
                <div>
                  <label className="text-[11px] text-zinc-300 block mb-1">Account Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="you@domain.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-20 py-4 px-6 border-t border-zinc-900 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500">
        <span>© 2026 Aura Autonomous AI Software Studio</span>
        <span>•</span>
        <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
        <span>•</span>
        <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
        <span>•</span>
        <Link href="/faq" className="hover:text-zinc-300 transition-colors">FAQ</Link>
        <span>•</span>
        <Link href="/guide" className="hover:text-zinc-300 transition-colors">User Guide</Link>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-amber-400 font-mono text-xs">
          Loading Aura Login...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
