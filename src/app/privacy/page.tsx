'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, ArrowLeft, EyeOff, CheckCircle2
} from 'lucide-react';
import { AuraLogo } from '@/components/AuraLogo';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <AuraLogo size="sm" showSubtitle={true} href="/" />
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/studio"
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold transition-all"
            >
              Launch Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 md:py-16 space-y-12">
        {/* Title & Metadata */}
        <div className="space-y-4 border-b border-zinc-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
            Effective Date: October 16, 2026 &bull; Compliant with Global Privacy Regulations (GDPR, CCPA, and ISO/IEC 27701).
          </p>
        </div>

        {/* Highlight Banner: Zero AI Training on User Code */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <EyeOff className="w-4 h-4" />
            <span>Core Privacy Pledge: Zero Model Training on Your Private Code</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Aura firmly believes that your ideas, private prompts, and proprietary web application code belong exclusively to you. <strong>We do not use customer prompts, proprietary business logic, or generated source code to train or fine-tune public foundation models.</strong> Your prompts are passed through isolated inference pipelines and discarded following token delivery.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No AI training on prompts</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>End-to-end TLS 1.3 encryption</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Isolated customer workspaces</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">01.</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              We collect minimal information necessary to deliver, authenticate, and improve the Aura software generation experience:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Account & Authentication Data</span>
                <p className="text-zinc-400 text-xs">
                  When you sign up or sign in using Firebase Authentication or Google One-Tap, we collect your email address, display name, and avatar URL. If you use Aura without logging in, a temporary anonymous session ID is assigned.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Project Workspaces & Generations</span>
                <p className="text-zinc-400 text-xs">
                  Project titles, prompt histories, and generated code files are saved to your local browser storage (`localStorage`) and, when authenticated, synchronized to your private cloud storage under per-user access control rules.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Payment & Transaction Data</span>
                <p className="text-zinc-400 text-xs">
                  Subscription upgrades are managed via Cashfree Payments. Aura never stores complete credit card numbers, debit card PINs, or bank credentials. We only receive secure tokenized order confirmation IDs and billing status.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">02.</span>
              <span>How We Process Your Prompts</span>
            </h2>
            <p>
              When you submit a design prompt or code modification in the Studio chat:
            </p>
            <ol className="space-y-2 list-decimal list-inside text-zinc-400 marker:text-emerald-400">
              <li>Your prompt is sent over an encrypted HTTPS connection to our streaming synthesis backend.</li>
              <li>The Aura Autonomous Engine processes the instructions, constructs the project AST, and streams HTML/React tokens back to your browser canvas in real-time.</li>
              <li>Once streaming completes, the session memory remains strictly within your browser workspace or your private user project database.</li>
            </ol>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">03.</span>
              <span>Bring Your Own Key (BYOK) Security</span>
            </h2>
            <p className="text-zinc-400">
              If you supply your own Dedicated Compute Key in Studio Settings, it is stored in your device&apos;s local browser storage. When generation requests occur, the key is passed directly via encrypted headers to authorize compute on your behalf. We do not store your private API credentials in unencrypted backend log tables.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">04.</span>
              <span>Cookies & Local Storage</span>
            </h2>
            <p>
              Aura uses strictly necessary cookies and local storage tokens for:
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-zinc-400 marker:text-emerald-400">
              <li>Authentication session state (Firebase Auth tokens)</li>
              <li>Workspace UI preferences (Split vs. Preview vs. Code view, mobile/tablet viewport selections)</li>
              <li>Offline draft caching so you don&apos;t lose work if your connection drops</li>
            </ul>
            <p className="text-zinc-500 text-xs">
              We do not utilize invasive cross-site advertising tracking cookies.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">05.</span>
              <span>Data Rights & Deletion (GDPR & CCPA)</span>
            </h2>
            <p>
              Under global data privacy laws, you have the following inalienable rights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Right to Export</span>
                <p className="text-xs text-zinc-400">Download your projects and codebundles anytime using the one-click Export drawer.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1">
                <span className="font-semibold text-white">Right to Erasure</span>
                <p className="text-xs text-zinc-400">Request complete account deletion and database wiping by contacting our privacy team.</p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-zinc-800 pt-8">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">06.</span>
              <span>Contact Data Protection Officer</span>
            </h2>
            <p className="text-zinc-400">
              For any questions regarding your personal information, data processing agreements (DPA), or compliance inquiries, reach out to our team at:
            </p>
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 inline-block font-mono text-xs text-emerald-400">
              privacy@aura.build &bull; Attn: Data Protection Officer
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/60 py-8 px-6 mt-16 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Aura Autonomous AI Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/faq" className="hover:text-zinc-300 transition-colors">FAQ</Link>
            <Link href="/guide" className="hover:text-zinc-300 transition-colors">User Guide</Link>
            <Link href="/studio" className="text-amber-400 hover:text-amber-300 transition-colors">Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
