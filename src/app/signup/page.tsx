'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, 
  AlertCircle, ShieldCheck, Zap, ArrowLeft
} from 'lucide-react';
import { AuraLogo } from '@/components/AuraLogo';
import { useAuth } from '@/lib/client/auth-context';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/studio';

  const { isConfigured, signUpWithEmail, signInWithGoogle, demoSignIn } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength calculation
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: 'Empty', color: 'bg-zinc-700' };
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-400' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide an email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service to proceed.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await signUpWithEmail(email, password, name.trim() || undefined);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err?.message || 'Account registration could not be completed.');
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
      setError(err?.message || 'Google registration was interrupted. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignUp = () => {
    demoSignIn(
      email.trim() || 'founder@aura.build',
      name.trim() || 'Aura Founder'
    );
    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-zinc-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-20 left-[-100px] w-96 h-96 bg-amber-400/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-zinc-800/40 blur-[140px] pointer-events-none rounded-full" />

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
            href="/login"
            className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            Sign In Instead
          </Link>
        </div>
      </header>

      {/* Main Content: Split Grid */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          
          {/* Left Column: Sign Up Form Card */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-5 relative">
              {/* Subtle top shimmer line */}
              <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

              {/* Header Title */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Free in 30 Seconds</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Create your Aura account
                </h1>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Join creators, engineers, and founders synthesizing web apps with frontier AI models.
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
                    You can register any test account or click below for instant <strong className="text-white">1-Click Demo Sandbox Access</strong> while Firebase credentials are being added.
                  </p>
                  <button
                    type="button"
                    onClick={handleDemoSignUp}
                    className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>⚡ Instant 1-Click Demo Access</span>
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

              {/* Google Social Sign Up */}
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
                <span className="group-hover:text-amber-200 transition-colors">Sign up with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-zinc-800" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">or email</span>
                <div className="flex-1 h-[1px] bg-zinc-800" />
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@domain.com"
                      required
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure password (8+ chars)"
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500">Strength:</span>
                        <span className="font-semibold text-zinc-300">{strength.label}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/30 transition-all"
                    />
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-[11px] text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-400 focus:ring-amber-400/50 accent-amber-400"
                    />
                    <span>
                      I agree to the{' '}
                      <Link href="/terms" target="_blank" className="text-zinc-300 underline hover:text-white">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" target="_blank" className="text-zinc-300 underline hover:text-white">
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="pt-2 text-center border-t border-zinc-800/80">
                <p className="text-xs text-zinc-400">
                  Already have an account?{' '}
                  <Link
                    href={`/login${redirectPath !== '/studio' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`}
                    className="font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Benefits & Value Showcase */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6">
            <div className="p-8 rounded-3xl bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 blur-3xl pointer-events-none rounded-full" />

              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase">
                  Aura Developer Cloud
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Everything you need to ship applications 10x faster
                </h3>
              </div>

              {/* Feature Cards */}
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">15 Free Daily Autonomous Builds</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Daily fair-usage quota resets every midnight. No hidden credit card requirements.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Full Reactive State & Persistence</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Never look at static wireframes again. Every generated app handles real clicks, data, and localStorage.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/60 border border-zinc-800/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Production React 19 + Next.js Export</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      One-click download of the complete codebase ready to deploy to Vercel, Netlify, or Docker.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security badge */}
              <div className="pt-2 flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enterprise grade encryption & strict privacy isolation</span>
              </div>
            </div>
          </div>
        </div>
      </main>

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

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-amber-400 font-mono text-xs">
          Loading Aura Sign Up...
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
