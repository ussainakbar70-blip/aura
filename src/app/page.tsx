'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, ArrowRight, Zap, Code, ShieldCheck, Download, 
  Monitor, Tablet, Smartphone, Check, ChevronDown, ChevronUp,
  Layers, Rocket, Play, RefreshCw, Star, CheckCircle2, 
  ExternalLink, Terminal, Cpu, ArrowUpRight, Lock, MessageSquare
} from 'lucide-react';
import { AuraLogo } from '@/components/AuraLogo';
import { useAuth } from '@/lib/client/auth-context';
import { synthesizeAppFromPrompt } from '@/lib/templates';
import { AURA_ENGINE_DISPLAY } from '@/config/models';

export default function LandingPage() {
  const router = useRouter();
  const { user, isConfigured } = useAuth();

  // Interactive Prompt Bar State
  const [promptInput, setPromptInput] = useState('');

  // Sample prompt chips
  const samplePrompts = [
    { label: '⚡ SaaS Revenue Analytics', prompt: 'High-conversion SaaS analytics dashboard with revenue metrics, retention charts, and active user breakdown' },
    { label: '💳 Crypto Portfolio Tracker', prompt: 'Modern dark-mode Web3 crypto portfolio tracker with real-time balance, asset distribution chart, and transaction history' },
    { label: '📋 Kanban Project Board', prompt: 'Interactive agile Kanban board with draggable task cards, priority badges, team assignment, and progress counters' },
    { label: '🛍️ Minimalist E-Commerce', prompt: 'Luxury minimalist product storefront with variant selectors, interactive cart drawer, and order calculation' },
    { label: '🤖 AI Agent Copilot', prompt: 'Next-gen autonomous AI workflow builder with node canvas, execution logs, and live telemetry' },
  ];

  // Interactive Live Demo Sandbox State
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [demoViewport, setDemoViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [demoTab, setDemoTab] = useState<'preview' | 'code' | 'reasoning'>('preview');

  const demoTemplates = [
    {
      title: 'SaaS Metric Engine',
      category: 'Analytics & FinTech',
      description: 'Dynamic ARR growth charts, churn telemetry, customer cohorts, and working date range filters.',
      prompt: 'High-conversion SaaS analytics dashboard with revenue metrics, retention charts, and active user breakdown',
      features: ['Real reactive data', 'Monthly/Annual MRR calculations', 'Cohort retention table'],
    },
    {
      title: 'DeFi Portfolio Matrix',
      category: 'Web3 & Crypto',
      description: 'Real-time multi-asset tracker with portfolio distribution donut chart and profit/loss calculator.',
      prompt: 'Modern dark-mode Web3 crypto portfolio tracker with real-time balance, asset distribution chart, and transaction history',
      features: ['Instant currency toggle', 'Dynamic asset rebalancing', 'Working mock transactions'],
    },
    {
      title: 'Agile Kanban Workspace',
      category: 'Productivity & Ops',
      description: 'Collaborative task management with status columns, priority chips, and local persistence.',
      prompt: 'Interactive agile Kanban board with draggable task cards, priority badges, team assignment, and progress counters',
      features: ['Local storage sync', 'Drag & drop simulation', 'Quick task creation'],
    },
    {
      title: 'Aura AI Voice Copilot',
      category: 'AI & Frontiers',
      description: 'Voice & text autonomous agent interface with token speed monitoring and real-time reasoning feed.',
      prompt: 'Autonomous AI assistant with speech waveforms, live token counter, and reasoning graph',
      features: ['Streaming wave animation', 'Live system telemetry', 'Reactive prompt history'],
    },
  ];

  const currentDemo = demoTemplates[selectedDemoIndex];
  const synthesizedDemo = synthesizeAppFromPrompt(currentDemo.prompt, AURA_ENGINE_DISPLAY.name);

  // Pricing Interval Toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I connect Firebase Authentication to this app?',
      a: 'Aura has built-in Firebase client and server SDKs already set up! Simply add your Firebase keys (NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, etc.) to your .env.local file. The login and signup pages will automatically switch from Demo Sandbox mode to production Firebase Auth with Google One-Tap and Email/Password.',
    },
    {
      q: 'Does Aura generate static placeholders or real reactive applications?',
      a: 'Aura produces 100% reactive, functional code. Every generated application includes working React state, calculations, interactive tabs, form handlers, and localStorage persistence — with zero fake lorem ipsum or non-clickable buttons.',
    },
    {
      q: 'How does code export work?',
      a: 'With one click, you can copy the standalone HTML/React component, or download a production-ready package with index.html, App.tsx, and Tailwind CSS styles ready to deploy to Vercel, Netlify, or Docker.',
    },
    {
      q: 'Can I bring my own AI compute key (BYOK)?',
      a: 'Yes! In the Studio Settings modal, you can optionally supply your own Dedicated Compute Key. This lets you generate unlimited applications at maximum pipeline speed without consuming Aura platform credits.',
    },
    {
      q: 'How does Cashfree integration work for Indian payments?',
      a: 'Aura includes full Cashfree Payment Gateway integration. Upgrade orders are created via secure server endpoints and processed with native support for UPI, Netbanking, Credit/Debit cards, and popular Indian payment methods.',
    },
    {
      q: 'How many apps can I build on the Free tier?',
      a: 'The Free Starter plan includes 15 autonomous app generations every day with 150 monthly credits. Quotas refresh automatically at midnight.',
    },
  ];

  const handleLaunchWithPrompt = (promptText: string) => {
    if (!promptText.trim()) {
      router.push('/studio');
      return;
    }
    router.push(`/studio?prompt=${encodeURIComponent(promptText.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-[-150px] w-[500px] h-[500px] bg-amber-400/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-[2000px] left-[-150px] w-[600px] h-[600px] bg-amber-500/5 blur-[180px] pointer-events-none rounded-full" />

      {/* Floating Dynamic Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <AuraLogo size="md" showSubtitle={true} href="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#sandbox" className="hover:text-amber-300 transition-colors">Live Sandbox</a>
            <a href="#features" className="hover:text-amber-300 transition-colors">Features</a>
            <a href="#templates" className="hover:text-amber-300 transition-colors">Showcase</a>
            <a href="#pricing" className="hover:text-amber-300 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-amber-300 transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Live Engine Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>v2.5 Online</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/studio"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/studio"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 text-white font-semibold text-xs transition-all"
                >
                  Launch Studio
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition-all"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="flex-1 flex flex-col">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 max-w-7xl mx-auto w-full text-center space-y-8">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-xs shadow-lg shadow-amber-500/10">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">Autonomous Software Studio</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 hidden sm:inline">Zero Fake Placeholders • Real Reactive State</span>
            <Link href="/studio" className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold ml-1">
              <span>Try Canvas</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Master Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              Turn Any Idea Into a{' '}
              <span className="bg-gradient-to-r from-white via-[#F5EDDF] to-amber-400 bg-clip-text text-transparent">
                Live Full-Stack App
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Describe what you want to build. Aura autonomously architects, writes, tests, and serves responsive web applications in seconds with multi-device viewports and clean code export.
            </p>
          </div>

          {/* Interactive Live Prompt Input Card */}
          <div className="max-w-3xl mx-auto w-full pt-2">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl shadow-black/80 flex flex-col sm:flex-row items-center gap-2 relative group focus-within:border-amber-400/80 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all">
              <div className="flex items-center gap-2.5 pl-3 w-full sm:w-auto flex-1">
                <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLaunchWithPrompt(promptInput)}
                  placeholder="e.g. Build a SaaS customer churn and revenue dashboard with filterable charts..."
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none py-2"
                />
              </div>
              <button
                type="button"
                onClick={() => handleLaunchWithPrompt(promptInput)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
              >
                <Rocket className="w-4 h-4" />
                <span>Synthesize in Studio</span>
              </button>
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] text-zinc-500 font-mono">Popular templates:</span>
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptInput(sp.prompt);
                    handleLaunchWithPrompt(sp.prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>{sp.label}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          {/* Social Proof Stats Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-zinc-900 text-center">
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">142,500+</p>
              <p className="text-xs text-zinc-400 mt-1">Apps Synthesized</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">99.8%</p>
              <p className="text-xs text-zinc-400 mt-1">Pass Rate Zero Errs</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">&lt; 1.8s</p>
              <p className="text-xs text-zinc-400 mt-1">Time to Live Reactive UI</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-900">
              <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">15 Free</p>
              <p className="text-xs text-zinc-400 mt-1">Daily Builds Included</p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE LIVE SANDBOX SHOWCASE (Try on page!) */}
        {/* ========================================================= */}
        <section id="sandbox" className="py-16 md:py-24 bg-zinc-950/60 border-y border-zinc-900 px-4 relative">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                Interactive Live Preview
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Click, test, and interact right now
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Explore real applications generated by Aura Autonomous Engine. Click between templates, test mobile viewports, or inspect the generated code.
              </p>
            </div>

            {/* Template Selector Bar */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {demoTemplates.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDemoIndex === idx
                      ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* Showcase Device Frame */}
            <div className="rounded-3xl bg-black border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
              {/* Studio Top Control Strip */}
              <div className="h-12 border-b border-zinc-800 bg-zinc-950/90 px-4 flex items-center justify-between">
                {/* Left: Window Dots & App Name */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-semibold text-white hidden sm:inline">
                    {currentDemo.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {currentDemo.category}
                  </span>
                </div>

                {/* Center: Viewport Toggle */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDemoViewport('desktop')}
                    className={`p-1.5 rounded-md transition-all ${
                      demoViewport === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Desktop 100%"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoViewport('tablet')}
                    className={`p-1.5 rounded-md transition-all ${
                      demoViewport === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Tablet 768px"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoViewport('mobile')}
                    className={`p-1.5 rounded-md transition-all ${
                      demoViewport === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Mobile 375px"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right: Tabs & Launch CTA */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setDemoTab('preview')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        demoTab === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setDemoTab('code')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        demoTab === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Code
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLaunchWithPrompt(currentDemo.prompt)}
                    className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs items-center gap-1 transition-all"
                  >
                    <span>Fork in Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Sandbox Body Content */}
              <div className="h-[520px] bg-[#09090b] flex items-center justify-center p-3 relative overflow-hidden">
                {demoTab === 'preview' ? (
                  <div
                    className={`h-full mx-auto transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-black ${
                      demoViewport === 'desktop'
                        ? 'w-full'
                        : demoViewport === 'tablet'
                        ? 'w-[768px]'
                        : 'w-[375px]'
                    }`}
                  >
                    <iframe
                      title={currentDemo.title}
                      srcDoc={synthesizedDemo.htmlCode}
                      className="w-full h-full border-0 bg-transparent"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#0a0a0f] p-4 font-mono text-xs text-zinc-300 overflow-auto rounded-xl border border-zinc-800/80">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 text-zinc-500 text-[11px]">
                      <span>Synthesized Production Component • App.tsx</span>
                      <span className="text-amber-400">React 19 + Tailwind CSS</span>
                    </div>
                    <pre className="text-zinc-300 leading-relaxed">
                      <code>{synthesizedDemo.htmlCode.slice(0, 1500)}...</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Sandbox Footer: Features Highlight */}
              <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-zinc-400">
                  <span className="font-semibold text-white">App Features:</span>
                  {currentDemo.features.map((feat, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleLaunchWithPrompt(currentDemo.prompt)}
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <span>Open full editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FEATURES BENTO GRID */}
        {/* ========================================================= */}
        <section id="features" className="py-20 md:py-28 px-4 max-w-7xl mx-auto w-full space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
              Proprietary Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Aura Outperforms Traditional Code Tools
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Built from the ground up for production readiness. No static mockups, no missing styles, no fake placeholders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Large Span */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-400/40 transition-all space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 blur-3xl pointer-events-none rounded-full" />
              <div className="p-3 w-fit rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Autonomous AST Synthesis Engine</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Aura doesn’t just output arbitrary strings. It parses UI hierarchy, binds interactive state, creates local storage persistence, and synthesizes complete calculations (MRR, formulas, search filters) that execute flawlessly in sandbox runtime.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-amber-300">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">100% Reactive State</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">Zero Lorem Ipsum</span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800">LocalStorage Synced</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-400/40 transition-all space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Multi-Device Viewport</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Toggle between desktop 100%, tablet 768px, and mobile 375px in real-time. Responsive design tested on every generation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-400/40 transition-all space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Production Clean Export</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Download a clean Next.js 16 / React 19 codebase bundle with Lucide Icons and Tailwind CSS v4 tokens ready for instant deployment.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-400/40 transition-all space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Immutable Time-Travel Snapshots</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Every prompt execution generates a version snapshot. Restore any previous milestone with 1 click without losing current progress.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-400/40 transition-all space-y-4">
              <div className="p-3 w-fit rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Firebase & Cashfree Native</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Pre-configured for Firebase Auth (Google One-Tap, Email/Pass) and Cashfree Indian payment gateways (UPI, Cards, Netbanking).
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HOW IT WORKS: 4 SIMPLE STEPS */}
        {/* ========================================================= */}
        <section className="py-20 bg-zinc-950/40 border-y border-zinc-900 px-4">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                From Prompt to Production in 4 Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center">
                  1
                </div>
                <h4 className="text-base font-bold text-white">Describe Your App</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Provide your requirements, target audience, layout vision, or specific business logic.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-extrabold text-xs flex items-center justify-center border border-zinc-700">
                  2
                </div>
                <h4 className="text-base font-bold text-white">Autonomous Synthesis</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Aura architects state management, components, interactive calculation models, and Tailwind styling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-extrabold text-xs flex items-center justify-center border border-zinc-700">
                  3
                </div>
                <h4 className="text-base font-bold text-white">Test Live in Sandbox</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Click through buttons, test inputs, switch to mobile mode, and request surgical revisions in chat.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-extrabold text-xs flex items-center justify-center border border-zinc-700">
                  4
                </div>
                <h4 className="text-base font-bold text-white">Ship & Export Code</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Export standalone React code, download zip bundle, or share live preview links with your team.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PRICING PLANS */}
        {/* ========================================================= */}
        <section id="pricing" className="py-20 md:py-28 px-4 max-w-7xl mx-auto w-full space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Simple Plans For Every Builder
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Start building for free with 15 daily requests. Upgrade anytime with Cashfree or bring your own API key.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 mt-2">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'annual' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            {/* Free Tier */}
            <div className="p-7 rounded-3xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Free</h3>
                <p className="text-xs text-zinc-400">
                  Instant prototyping with Aura Core Engine and live sandbox execution.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">$0</span>
                  <span className="text-xs text-zinc-500">/ forever</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">₹0 INR • No card required</div>
                <div className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>5</strong> Autonomous builds / day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>30</strong> Monthly compute credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>8k token output context</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>One-click multi-file code export</span>
                  </div>
                </div>
              </div>
              <Link
                href="/signup"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-white text-center transition-all"
              >
                Start Free Now
              </Link>
            </div>

            {/* Starter ($5 / ₹449) */}
            <div className="p-7 rounded-3xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-zinc-400">
                  For creators, developers, and agile full-stack prototypes.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingCycle === 'monthly' ? '$5' : '$4'}
                  </span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">₹449 INR (Cashfree PG)</div>
                <div className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>15</strong> Autonomous builds / day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>298</strong> Monthly compute credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>12k token output & full CRUD state</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Project version history & rollback</span>
                  </div>
                </div>
              </div>
              <Link
                href="/studio"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-white text-center transition-all"
              >
                Choose Starter
              </Link>
            </div>

            {/* Creator ($15 / ₹1,329) - Most Popular */}
            <div className="p-7 rounded-3xl bg-zinc-950 border-2 border-amber-400/80 shadow-2xl shadow-amber-400/10 flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-[10px] uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between">
                  <span>Creator</span>
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                </h3>
                <p className="text-xs text-zinc-400">
                  Flagship autonomous intelligence for serious product builders.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingCycle === 'monthly' ? '$15' : '$12'}
                  </span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <div className="text-[11px] text-amber-300/90 font-mono">₹1,329 INR (Cashfree PG)</div>
                <div className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>60</strong> Autonomous builds / day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>771</strong> Monthly compute credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>16k token Turbo intelligence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Interactive charts, modals & CSV export</span>
                  </div>
                </div>
              </div>
              <Link
                href="/studio"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs text-center transition-all shadow-md shadow-amber-500/20"
              >
                Upgrade to Creator
              </Link>
            </div>

            {/* Pro ($30 / ₹2,649) */}
            <div className="p-7 rounded-3xl bg-zinc-950/70 border border-zinc-800/90 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Pro</h3>
                <p className="text-xs text-zinc-400">
                  Maximum power & depth for enterprise-grade systems and teams.
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingCycle === 'monthly' ? '$30' : '$24'}
                  </span>
                  <span className="text-xs text-zinc-500">/ month</span>
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">₹2,649 INR (Cashfree PG)</div>
                <div className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>200</strong> Autonomous builds / day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>1,434</strong> Monthly compute credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>24k token Studio Max engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Highest reasoning depth & self-healing</span>
                  </div>
                </div>
              </div>
              <Link
                href="/studio"
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-white text-center transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FAQ ACCORDION */}
        {/* ========================================================= */}
        <section id="faq" className="py-20 bg-zinc-950/50 border-t border-zinc-900 px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-3">
              <span className="text-xs font-mono tracking-widest text-amber-400 uppercase">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/80"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {faq.q}
                    </span>
                    {openFaqIndex === idx ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FINAL CALL TO ACTION */}
        {/* ========================================================= */}
        <section className="py-20 md:py-28 px-4 max-w-5xl mx-auto w-full text-center space-y-6 relative">
          <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-amber-500/30 shadow-2xl shadow-amber-500/10 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/10 blur-[130px] pointer-events-none rounded-full" />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to build software at the speed of thought?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Launch Aura Studio right now with 15 free daily autonomous generations. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/studio"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>Launch Studio Free</span>
              </Link>
              <Link
                href="/signup"
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/60 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <AuraLogo size="sm" showSubtitle={true} href="/" />
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <Link href="/studio" className="hover:text-zinc-300 transition-colors">Studio</Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-zinc-300 transition-colors">Sign Up</Link>
            <a href="#features" className="hover:text-zinc-300 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-zinc-300 transition-colors">FAQ</a>
          </div>
          <p className="text-[11px] text-zinc-600 font-mono">
            © 2026 Aura Autonomous AI Studio.
          </p>
        </div>
      </footer>
    </div>
  );
}
