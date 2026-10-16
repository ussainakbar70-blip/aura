'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, ArrowLeft, Sparkles, Terminal, Code, Layers, 
  Monitor, Smartphone, Tablet, Zap, CheckCircle2, Copy, 
  ExternalLink, Rocket, RefreshCw, Key, ShieldCheck, ChevronRight
} from 'lucide-react';
import { AuraLogo } from '@/components/AuraLogo';

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string>('workspace');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'workspace', title: '1. Studio Architecture' },
    { id: 'prompting', title: '2. Prompt Engineering' },
    { id: 'reactive', title: '3. Reactive State & Logic' },
    { id: 'iteration', title: '4. Iteration & Auto-Fix' },
    { id: 'code', title: '5. Code Inspector' },
    { id: 'export', title: '6. Exporting & Deployment' },
    { id: 'byok', title: '7. Bring Your Own Key' },
    { id: 'shortcuts', title: '8. Power User Tips' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 md:py-14 flex flex-col lg:flex-row gap-10">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Documentation</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">User Manual</h2>
              <p className="text-xs text-zinc-400">Complete guide to building software with Aura Studio.</p>
            </div>

            <nav className="space-y-1 border-l border-zinc-800 pl-3">
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveSection(sec.id);
                    const el = document.getElementById(sec.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`block w-full text-left py-1.5 text-xs transition-colors truncate ${
                    activeSection === sec.id
                      ? 'text-amber-400 font-bold -ml-[13px] pl-3 border-l-2 border-amber-400'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </nav>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <span className="text-xs font-semibold text-white block">Ready to experiment?</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Open a clean canvas and test these architectural patterns live.
              </p>
              <Link
                href="/studio"
                className="w-full py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Open Studio</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </aside>

        {/* Documentation Content */}
        <main className="flex-1 max-w-3xl space-y-16">
          {/* Section 1: Studio Architecture */}
          <section id="workspace" className="space-y-4 scroll-mt-24">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 01</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Studio Architecture & Layout</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Aura Studio is modeled after modern high-velocity development environments like Lovable. The interface is optimized to give you continuous tactile feedback between your prompt and the running web application:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>1. Prompt Terminal</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Left-hand chat panel with conversational history, token stream telemetry, and prompt suggestions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Monitor className="w-4 h-4" />
                  <span>2. Live Sandbox</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Interactive browser iframe rendering your reactive React application with zero lag.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Code className="w-4 h-4" />
                  <span>3. Code Inspector</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Full syntax-highlighted multi-file viewer with index.html, App.tsx, and bundle export.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                <span>Responsive Viewport Controls</span>
              </span>
              <p className="text-zinc-400">
                Use the top navigation bar to toggle between <strong>Desktop (100% full width)</strong>, <strong>Tablet (768px iPad view)</strong>, and <strong>Mobile (375px iPhone view)</strong> to test responsiveness in real-time.
              </p>
            </div>
          </section>

          {/* Section 2: Prompting */}
          <section id="prompting" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 02</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The Art of High-Conversion Prompting</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              The Aura Autonomous Engine excels at interpreting structural specifications. To achieve the cleanest, most production-ready results, structure your prompts into three distinct layers:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="font-semibold text-amber-300 text-xs">A. Purpose & Domain</span>
                <p className="text-xs text-zinc-400">State what the software is (e.g. &ldquo;Crypto portfolio dashboard&rdquo;, &ldquo;SaaS subscriber analytics&rdquo;, &ldquo;Team task kanban board&rdquo;).</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="font-semibold text-amber-300 text-xs">B. Core Interactive Features</span>
                <p className="text-xs text-zinc-400">List 2-4 interactive workflows (e.g. &ldquo;Include working filter tabs for 24h/7d/30d, an interactive add-item modal, and calculation of total balance&rdquo;).</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                <span className="font-semibold text-amber-300 text-xs">C. Aesthetic & Visual Palette</span>
                <p className="text-xs text-zinc-400">Specify design styling (e.g. &ldquo;Obsidian dark theme, emerald accents, border card styling, Lucide icons&rdquo;).</p>
              </div>
            </div>

            {/* Prompt Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                <span className="text-xs font-bold text-red-400">❌ Vague Prompt</span>
                <p className="text-xs text-zinc-400 italic">
                  &ldquo;Make a dashboard for sales.&rdquo;
                </p>
                <p className="text-[11px] text-zinc-500">
                  Result: Generic dashboard with standard placeholders and default layouts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-400">✅ High-Impact Aura Prompt</span>
                <p className="text-xs text-zinc-300 italic">
                  &ldquo;Build an executive SaaS revenue dashboard with MRR, churn rate, cohort retention table, working date filter tabs (Today, 7D, 30D), interactive invoice search bar, and dark obsidian aesthetic.&rdquo;
                </p>
                <p className="text-[11px] text-emerald-400/80">
                  Result: Pixel-perfect, deeply interactive web app with functional filters and reactive state.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Reactive State */}
          <section id="reactive" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 03</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Reactive State & Dynamic Calculations</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Unlike static mockups, every application synthesized by Aura includes genuine React state hooks (`useState`, `useMemo`, `useEffect`). That means:
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-zinc-400 marker:text-amber-400">
              <li><strong>Clickable tabs</strong> dynamically filter data lists and recalculate summary metrics.</li>
              <li><strong>Forms and inputs</strong> capture user keystrokes and update internal state arrays in real-time.</li>
              <li><strong>Modals and drawers</strong> open and close smoothly with proper keyboard accessibility (`Escape` key handling).</li>
              <li><strong>Local Storage persistence</strong> keeps user-created items across page refreshes.</li>
            </ul>
          </section>

          {/* Section 4: Iteration & Auto-Fix */}
          <section id="iteration" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 04</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Iterative Refinement & Real-Time Auto-Fix</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Building software is an iterative conversation. You never have to settle for the initial generation:
            </p>
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 text-xs">
                <span className="font-semibold text-white">1. Incremental Follow-Up Prompts</span>
                <p className="text-zinc-400">
                  Ask Aura for specific adjustments: &ldquo;Make the navigation bar sticky on scroll&rdquo;, &ldquo;Add a dark mode / light mode toggle switch in the corner&rdquo;, or &ldquo;Add an export to CSV button&rdquo;. Aura will surgically modify the code while preserving existing features.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1 text-xs">
                <span className="font-semibold text-white">2. Autonomous Sandbox Auto-Fix</span>
                <p className="text-zinc-400">
                  If any unexpected JavaScript runtime error or undefined variable occurs in the sandbox, an amber <strong>Auto-Fix</strong> button appears in the toolbar. Clicking it triggers the Autonomous Engine to parse the browser console exception and hot-patch the code instantly.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Code Inspector */}
          <section id="code" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 05</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Inspecting & Editing Code</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Click the <strong>Code</strong> button in the top navbar anytime to open the multi-file code inspector. Here you can inspect:
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-zinc-400 marker:text-sky-400">
              <li><code className="text-amber-300">index.html</code> — Standalone HTML5 bundle with Tailwind CSS and Babel/React runtime.</li>
              <li><code className="text-amber-300">App.tsx</code> — Clean, modular React component tree with TypeScript interfaces.</li>
              <li><code className="text-amber-300">package.json</code> &amp; <code className="text-amber-300">tailwind.config.js</code> — Ready for immediate `npm install` in your local terminal.</li>
            </ul>
          </section>

          {/* Section 6: Export & Deployment */}
          <section id="export" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 06</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Exporting & Deploying to Production</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              When your web application is ready, click the <strong>Export</strong> button in the top navbar. You have several instant deployment choices:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="font-semibold text-white">Deploy to Vercel or Netlify</span>
                <p className="text-zinc-400">
                  Download the project ZIP bundle, initialize a GitHub repository, and connect it to Vercel or Netlify for instant global edge deployment.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="font-semibold text-white">Run Locally with Vite</span>
                <div className="p-2.5 rounded bg-black/60 font-mono text-[11px] text-zinc-300 flex items-center justify-between">
                  <span>npm install &amp;&amp; npm run dev</span>
                  <button
                    onClick={() => handleCopy('npm install && npm run dev', 'cmd1')}
                    className="text-zinc-500 hover:text-white"
                  >
                    {copiedCode === 'cmd1' ? '✓' : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: BYOK */}
          <section id="byok" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 07</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Bring Your Own Key (BYOK)</h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              If you have enterprise compute quotas or want unlimited continuous generations without consuming daily Aura credits:
            </p>
            <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-zinc-400 marker:text-amber-400">
              <li>Click the user avatar or Settings gear icon in the Studio navbar.</li>
              <li>Under <strong>&ldquo;Dedicated Compute Key (BYOK)&rdquo;</strong>, paste your custom compute token.</li>
              <li>Click <strong>Save Key</strong>. Your key is securely stored in your local browser storage and unlocks unmetered autonomous synthesis.</li>
            </ol>
          </section>

          {/* Section 8: Power User Tips */}
          <section id="shortcuts" className="space-y-4 scroll-mt-24 border-t border-zinc-800/80 pt-10">
            <div className="space-y-1">
              <span className="text-xs font-mono text-amber-400 tracking-wider uppercase">Chapter 08</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Power User Shortcuts & Best Practices</h2>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-zinc-800">
                  <span className="text-zinc-300">Submit Prompt</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-amber-300">Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-zinc-800">
                  <span className="text-zinc-300">New Line in Prompt</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-amber-300">Shift + Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-zinc-800">
                  <span className="text-zinc-300">Quick Rename Project</span>
                  <span className="text-zinc-400 text-[11px]">Click title in navbar</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-zinc-800">
                  <span className="text-zinc-300">Project History & Versions</span>
                  <span className="text-zinc-400 text-[11px]">Click folder icon in navbar</span>
                </div>
              </div>
            </div>
          </section>

          {/* Launch Studio CTA */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-amber-500/5 border border-amber-500/30 text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Ready to create your next application?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Launch Aura Studio and build software at the speed of thought.
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch Aura Studio</span>
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/60 py-8 px-6 mt-16 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Aura Autonomous AI Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/faq" className="hover:text-zinc-300 transition-colors">FAQ</Link>
            <Link href="/studio" className="text-amber-400 hover:text-amber-300 transition-colors">Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
