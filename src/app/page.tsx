'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, ArrowUp, Check, Monitor, Tablet, Smartphone, Laptop,
  Wand2, Layers, Code2, ShieldCheck, ChevronDown, Sliders, Sparkles,
  TrendingUp, DollarSign, Clock, Zap, CheckCircle2, SplitSquareVertical,
  ArrowLeftRight
} from 'lucide-react';
import { AuraLogo } from '@/components/AuraLogo';
import { useAuth } from '@/lib/client/auth-context';
import { synthesizeAppFromPrompt, enhanceUserPrompt } from '@/lib/templates';
import { AURA_ENGINE_DISPLAY } from '@/config/models';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [promptInput, setPromptInput] = useState('');
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [demoViewport, setDemoViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [demoWidth, setDemoWidth] = useState<number>(-1); // -1 = fluid 100%
  const [demoTab, setDemoTab] = useState<'preview' | 'code'>('preview');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Dynamic ROI Simulator Sliders
  const [teamSize, setTeamSize] = useState<number>(6);
  const [featuresPerMonth, setFeaturesPerMonth] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(85);
  const [roiCurrency, setRoiCurrency] = useState<'USD' | 'INR'>('USD');

  // Before / After Split Slider
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 to 100
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    {
      label: 'SaaS Analytics',
      prompt: 'Build a SaaS revenue and cohort analytics dashboard with multi-view navigation, interactive SVG revenue chart, MRR simulator, and customer CRUD ledger',
    },
    {
      label: 'Startup Website',
      prompt: 'Build a high-conversion interactive AI SaaS startup website with hero product simulator, interactive ROI pricing calculator, FAQ accordion, and lead capture modal',
    },
    {
      label: 'E-Commerce Store',
      prompt: 'Build a luxury minimalist e-commerce storefront with category filters, interactive cart drawer, promo code AURA20, and checkout modal',
    },
    {
      label: 'Trading Terminal',
      prompt: 'Build a Web3 crypto perpetuals trading desk with real-time pair switcher, interactive price chart, and Buy/Sell order execution ticket',
    },
    {
      label: 'Kanban Workspace',
      prompt: 'Build an agile Kanban project board with 4 status columns, 1-click task movement, story point burnup bar, and task creation modal',
    },
  ];

  const demoTemplates = [
    {
      title: 'SaaS Revenue & Cohort Matrix',
      category: 'SaaS Application',
      prompt: samplePrompts[0].prompt,
    },
    {
      title: 'Vanguard Interactive Website',
      category: 'Landing Page',
      prompt: samplePrompts[1].prompt,
    },
    {
      title: 'Maison Aura Storefront',
      category: 'E-Commerce',
      prompt: samplePrompts[2].prompt,
    },
    {
      title: 'Apex Perps Terminal',
      category: 'FinTech & Web3',
      prompt: samplePrompts[3].prompt,
    },
    {
      title: 'LinearPulse Kanban',
      category: 'Productivity',
      prompt: samplePrompts[4].prompt,
    },
  ];

  const currentDemo = demoTemplates[selectedDemoIndex];
  const synthesizedDemo = synthesizeAppFromPrompt(currentDemo.prompt, AURA_ENGINE_DISPLAY.name);

  const handleLaunchWithPrompt = (promptText: string) => {
    if (!promptText.trim()) {
      router.push('/studio');
      return;
    }
    router.push(`/studio?prompt=${encodeURIComponent(promptText.trim())}`);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-white selection:text-black">
      {/* Subtle Top Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[480px] bg-gradient-to-b from-amber-500/10 via-zinc-800/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Clean, Minimal Top Navigation (Lovable / Emergent Style) */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <AuraLogo size="sm" showSubtitle={false} href="/" />

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-zinc-400">
            <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/guide" className="hover:text-white transition-colors">Docs</Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/studio"
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/studio"
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-all"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* ========================================================= */}
        {/* CENTERPIECE HERO COMPOSER (Lovable & Emergent Style)      */}
        {/* ========================================================= */}
        <section className="relative pt-20 pb-20 md:pt-28 md:pb-24 px-6 max-w-4xl mx-auto w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              Build production software at the speed of thought.
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
              Describe the application or website you want to create. Aura architects full-stack interfaces, reactive state, and clean deployable code in seconds.
            </p>
          </div>

          {/* Centerpiece Multi-Line Prompt Composer */}
          <div className="max-w-2xl mx-auto w-full">
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 focus-within:border-zinc-600 shadow-2xl shadow-black/80 p-4 text-left transition-all">
              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleLaunchWithPrompt(promptInput);
                  }
                }}
                placeholder="Ask Aura to build a SaaS dashboard, interactive startup website, or e-commerce store..."
                rows={3}
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/70">
                <button
                  type="button"
                  onClick={() => setPromptInput(enhanceUserPrompt(promptInput))}
                  className="px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Expand into a complete engineering specification"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Enhance prompt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchWithPrompt(promptInput)}
                  className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Build now</span>
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Minimal Starter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLaunchWithPrompt(sp.prompt)}
                  className="px-3 py-1.5 rounded-full bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800/90 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE LIVE SANDBOX SHOWCASE                         */}
        {/* ========================================================= */}
        <section id="showcase" className="py-16 px-6 max-w-6xl mx-auto w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Interactive live builds
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Test generated applications and websites directly in the browser before opening the studio.
              </p>
            </div>

            {/* Clean Template Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {demoTemplates.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedDemoIndex === idx
                      ? 'bg-zinc-100 text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Sandbox Frame */}
          <div className="rounded-2xl bg-[#09090b] border border-zinc-800/90 shadow-2xl overflow-hidden flex flex-col">
            <div className="h-11 border-b border-zinc-800/80 bg-zinc-950 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                </div>
                <span className="text-xs font-medium text-zinc-200">{currentDemo.title}</span>
                <span className="text-[11px] text-zinc-500">{currentDemo.category}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Dynamic Responsive Viewport Slider & Snaps */}
                <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setDemoWidth(375)}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      demoWidth === 375 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Mobile (375px)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoWidth(768)}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      demoWidth === 768 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Tablet (768px)"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoWidth(1024)}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      demoWidth === 1024 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Laptop (1024px)"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoWidth(-1)}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      demoWidth === -1 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Fluid Desktop (100%)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>

                  <div className="hidden lg:flex items-center gap-1.5 pl-1.5 border-l border-zinc-800">
                    <input
                      type="range"
                      min="360"
                      max="1200"
                      step="20"
                      value={demoWidth > 0 ? demoWidth : 1200}
                      onChange={(e) => setDemoWidth(Number(e.target.value))}
                      className="w-20 accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                    />
                    <span className="font-mono text-[10px] text-amber-300 min-w-[36px]">
                      {demoWidth > 0 ? `${demoWidth}px` : '100%'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setDemoTab('preview')}
                    className={`px-2.5 py-1 rounded-md ${demoTab === 'preview' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab('code')}
                    className={`px-2.5 py-1 rounded-md ${demoTab === 'code' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Code
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchWithPrompt(currentDemo.prompt)}
                  className="hidden sm:inline-flex px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Edit in Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="h-[540px] bg-[#09090b] flex items-center justify-center overflow-hidden">
              {demoTab === 'preview' ? (
                <div
                  style={{
                    width: demoWidth > 0 ? `${demoWidth}px` : '100%',
                    maxWidth: '100%',
                    transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`h-full mx-auto overflow-hidden bg-[#09090b] ${
                    demoWidth > 0 ? 'border-x border-zinc-800 shadow-2xl' : ''
                  }`}
                >
                  <iframe
                    title={currentDemo.title}
                    srcDoc={synthesizedDemo.htmlCode}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-[#09090b] p-5 font-mono text-xs text-zinc-300 overflow-auto">
                  <pre className="leading-relaxed">
                    <code>{synthesizedDemo.htmlCode.slice(0, 2400)}...</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE PRODUCTION ROI & VELOCITY SIMULATOR           */}
        {/* ========================================================= */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12 border-t border-zinc-900">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-mono">
                <Sliders className="w-3.5 h-3.5" />
                <span>Dynamic Production Modeling</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                Calculate your velocity &amp; capital ROI
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Adjust team size and release frequency sliders to model the exact engineering hours and capital savings Aura delivers over manual coding and legacy prototyping tools.
              </p>
            </div>

            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl text-xs font-mono self-start md:self-auto">
              <button
                type="button"
                onClick={() => setRoiCurrency('USD')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  roiCurrency === 'USD' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setRoiCurrency('INR')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  roiCurrency === 'INR' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: 3 Interactive Range Sliders */}
            <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 space-y-7 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Slider 1: Team Size */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Engineering &amp; Product Team Size</span>
                    <span className="font-mono text-amber-300 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                      {teamSize} {teamSize === 1 ? 'builder' : 'engineers'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>1 (Solo Maker)</span>
                    <span>15 (Growth Startup)</span>
                    <span>50 (Scale-up)</span>
                  </div>
                </div>

                {/* Slider 2: Features / Apps per Month */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Production Features &amp; Prototypes / Month</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                      {featuresPerMonth} releases / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={featuresPerMonth}
                    onChange={(e) => setFeaturesPerMonth(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>1 MVP</span>
                    <span>10 Sprints</span>
                    <span>25 High-Frequency</span>
                  </div>
                </div>

                {/* Slider 3: Hourly Rate */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">Estimated Developer Cost Basis</span>
                    <span className="font-mono text-blue-400 font-bold bg-blue-400/10 px-2.5 py-1 rounded-lg border border-blue-400/20">
                      {roiCurrency === 'USD' ? `$${hourlyRate}/hr` : `₹${Math.round(hourlyRate * 86.5)}/hr`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    step="5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-blue-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>$40/hr (Indie)</span>
                    <span>$95/hr (US Senior)</span>
                    <span>$200/hr (Elite Agency)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Cycle turnaround compressed from <strong>18 days</strong> to <strong>3.5 hours</strong></span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  12.5x Faster
                </span>
              </div>
            </div>

            {/* Right: Dynamic Computed Metrics */}
            <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Estimated Net Value Generated
                </span>
                <div className="mt-2 text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  {roiCurrency === 'USD'
                    ? `$${Math.round(featuresPerMonth * 34 * hourlyRate * 12).toLocaleString()}`
                    : `₹${(Math.round(featuresPerMonth * 34 * hourlyRate * 12 * 86.5) / 10000000).toFixed(2)} Cr`}
                  <span className="text-xs font-normal text-zinc-400 block sm:inline sm:ml-2">/ year saved</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Direct capital saved across {featuresPerMonth * 12} annual production releases and architecture iterations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 space-y-1">
                  <span className="text-[11px] text-zinc-500">Monthly Hours Saved</span>
                  <div className="text-2xl font-bold text-white font-mono">
                    {Math.round(featuresPerMonth * 34)}h
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono block">85% manual code automated</span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 space-y-1">
                  <span className="text-[11px] text-zinc-500">Cost per Release</span>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    ${Math.max(1, Math.round(30 / featuresPerMonth))}
                  </div>
                  <span className="text-[10px] text-zinc-500 line-through font-mono block">
                    vs ${Math.round(34 * hourlyRate)} traditional
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/studio"
                  className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-white/5 cursor-pointer"
                >
                  <span>Start Building with Aura Pro</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* INTERACTIVE BEFORE / AFTER SPLIT COMPARISON SLIDER        */}
        {/* ========================================================= */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-8 border-t border-zinc-900">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[11px] font-mono">
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Interactive Spec Comparison</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Spec to production software in seconds
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Drag the interactive split handle to compare traditional raw prompts &amp; wireframes with Aura&apos;s full-stack reactive software output.
            </p>
          </div>

          {/* Split Frame */}
          <div className="space-y-4">
            <div
              ref={splitContainerRef}
              className="relative w-full h-[460px] rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden select-none shadow-2xl"
            >
              {/* Left Side: Raw Spec / Wireframe */}
              <div
                style={{ width: `${splitPos}%` }}
                className="absolute inset-y-0 left-0 bg-[#0c0c10] border-r border-amber-400/50 overflow-hidden z-10 transition-all duration-75"
              >
                <div className="w-[1000px] h-full p-8 font-mono text-xs space-y-4 text-zinc-400">
                  <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                    <span>RAW SPECIFICATION &amp; PROMPT INTENT</span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-300 space-y-2">
                    <p className="text-amber-400 font-semibold">&gt; User Prompt:</p>
                    <p className="text-white">&quot;Build a SaaS revenue and cohort analytics dashboard with multi-view navigation, interactive SVG revenue chart, MRR simulator, and customer CRUD ledger&quot;</p>
                  </div>
                  <div className="space-y-2 text-[11px] text-zinc-500">
                    <p>├── models/revenue.ts (pending architectural schema)</p>
                    <p>├── state/cohort-store.ts (unwired state hooks)</p>
                    <p>├── components/SvgChart.tsx (static placeholder dummy data)</p>
                    <p>└── api/export.ts (unimplemented CSV blob serializer)</p>
                  </div>
                  <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-zinc-600 text-center">
                    [Static Mockup / Unfinished Prototype in traditional builders]
                  </div>
                </div>
              </div>

              {/* Right Side: Aura Production Reality */}
              <div className="absolute inset-0 bg-[#09090b] flex flex-col justify-between p-8 overflow-hidden">
                <div className="space-y-4 max-w-xl ml-auto text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aura Full-Stack Production Reality</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Fully Interactive, Reactive &amp; Exportable
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Centrally managed state stores, dynamic KPI formula calculations, live SVG visualizations, working CRUD modals, LocalStorage sync, and clean React 19 code.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl ml-auto w-full text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left">
                    <span className="text-zinc-500 text-[10px]">Architecture</span>
                    <p className="text-white font-bold text-sm mt-0.5">Multi-View State</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left">
                    <span className="text-zinc-500 text-[10px]">Data Visuals</span>
                    <p className="text-emerald-400 font-bold text-sm mt-0.5">Dynamic SVG</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left">
                    <span className="text-zinc-500 text-[10px]">Bundle</span>
                    <p className="text-amber-300 font-bold text-sm mt-0.5">6-File Export</p>
                  </div>
                </div>
              </div>

              {/* Center Draggable Divider */}
              <div
                style={{ left: `${splitPos}%` }}
                className="absolute top-0 bottom-0 -ml-3 w-6 z-20 flex items-center justify-center pointer-events-none"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-400/50">
                  <ArrowLeftRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Split Position Slider Bar */}
            <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-xs">
              <span className="text-zinc-400 text-[11px] whitespace-nowrap">Drag to inspect:</span>
              <input
                type="range"
                min="10"
                max="90"
                value={splitPos}
                onChange={(e) => setSplitPos(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
              />
              <span className="font-mono text-zinc-300 text-[11px] min-w-[50px] text-right font-bold">
                {splitPos}% split
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PRODUCTION ARCHITECTURE: AURA VS LOVABLE COMPARISON      */}
        {/* ========================================================= */}
        <section className="py-20 px-6 max-w-6xl mx-auto w-full space-y-10 border-t border-zinc-900">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production Quality Benchmark</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why Aura beats Lovable in production engineering
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Beyond simple landing pages and static prototypes — Aura builds deployable, state-driven software suites.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-zinc-800/80 rounded-2xl overflow-hidden divide-y divide-zinc-800/80 bg-zinc-950/60">
              <thead className="bg-zinc-900/60 text-zinc-400 font-medium">
                <tr>
                  <th className="py-3.5 px-5">Capability / Architecture</th>
                  <th className="py-3.5 px-5 text-amber-300 font-bold bg-amber-400/5">Aura Studio</th>
                  <th className="py-3.5 px-5 text-zinc-400">Lovable &amp; Basic AI Builders</th>
                  <th className="py-3.5 px-5 text-zinc-500">Traditional Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-white">Reactive State &amp; Multi-View CRUD</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold bg-amber-400/5">✓ Native Centralized Store + LocalStorage</td>
                  <td className="py-3.5 px-5 text-zinc-400">Partial / often requires manual re-prompts</td>
                  <td className="py-3.5 px-5 text-zinc-500">2-4 weeks manual dev</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-white">Visual DOM Element Inspector</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold bg-amber-400/5">✓ Click-to-inspect &amp; in-place text edit</td>
                  <td className="py-3.5 px-5 text-zinc-400">Text prompt iteration only</td>
                  <td className="py-3.5 px-5 text-zinc-500">Figma to Jira handoff</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-white">Live Dynamic Design Tuning Sliders</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold bg-amber-400/5">✓ Real-time Radius, Typography, Hue &amp; Spacing sliders</td>
                  <td className="py-3.5 px-5 text-zinc-500">✗ Not available</td>
                  <td className="py-3.5 px-5 text-zinc-500">Manual CSS rewrites</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-white">Dynamic Viewport Responsive Resizer</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold bg-amber-400/5">✓ Smooth pixel width slider (360px-1440px) + Zoom</td>
                  <td className="py-3.5 px-5 text-zinc-400">Static 3 device buttons</td>
                  <td className="py-3.5 px-5 text-zinc-500">Chrome DevTools</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-white">Self-Healing Runtime Telemetry</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold bg-amber-400/5">✓ Auto-intercepts exceptions + 1-click Fix Error</td>
                  <td className="py-3.5 px-5 text-zinc-400">Manual error copying</td>
                  <td className="py-3.5 px-5 text-zinc-500">Sentry triage tickets</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-semibold text-white">Production Code Export</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold bg-amber-400/5">✓ 6-file clean React 19, TypeScript &amp; Tailwind</td>
                  <td className="py-3.5 px-5 text-zinc-400">Monolithic HTML or lock-in</td>
                  <td className="py-3.5 px-5 text-zinc-500">Custom repository</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FOCUSED 3-COLUMN ARCHITECTURE SECTION                     */}
        {/* ========================================================= */}
        <section id="capabilities" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-10 border-t border-zinc-900">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Engineered for real software, not static mockups.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Every application and website synthesized by Aura includes complete state management, interactive workflows, and clean multi-file export.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">Multi-View &amp; Reactive State</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generated applications include working view navigation, dynamic KPI calculations, interactive SVG charts, CRUD modals, and LocalStorage persistence out of the box.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">Visual DOM Inspector &amp; Code IDE</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click any element in the live preview to edit its text or request a targeted AI update, or switch to the multi-file code editor to inspect and export React 19 &amp; HTML bundles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-semibold text-white">Production Ready Infrastructure</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Integrated with Firebase Authentication, Cashfree PG subscriptions (UPI, Cards, Netbanking), immutable version snapshots, and optional BYOK compute keys.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CLEAN PRICING SECTION                                     */}
        {/* ========================================================= */}
        <section id="pricing" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-10 border-t border-zinc-900">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Simple, predictable pricing
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Start for free. Upgrade anytime as your projects scale.
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  billingCycle === 'annual' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Free',
                price: '$0',
                inr: '₹0 INR',
                desc: 'For exploring Aura and building initial prototypes.',
                features: ['5 daily builds', '30 monthly credits', 'Live sandbox preview', 'Multi-file code export'],
                cta: 'Get started',
                href: '/studio',
                highlight: false,
              },
              {
                name: 'Starter',
                price: billingCycle === 'monthly' ? '$5' : '$4',
                inr: '₹449 INR',
                desc: 'For indie makers shipping full-stack web apps.',
                features: ['15 daily builds', '298 monthly credits', '12k token output context', 'Version history & rollback'],
                cta: 'Start Starter',
                href: '/studio',
                highlight: false,
              },
              {
                name: 'Creator',
                price: billingCycle === 'monthly' ? '$15' : '$12',
                inr: '₹1,329 INR',
                desc: 'For product builders and fast-moving teams.',
                features: ['60 daily builds', '771 monthly credits', '16k token output context', 'Visual DOM Inspector & CRUD'],
                cta: 'Upgrade to Creator',
                href: '/studio',
                highlight: true,
              },
              {
                name: 'Pro',
                price: billingCycle === 'monthly' ? '$30' : '$24',
                inr: '₹2,649 INR',
                desc: 'Maximum capacity for agencies and power users.',
                features: ['200 daily builds', '1,434 monthly credits', '24k token output context', 'Priority compute pipeline'],
                cta: 'Choose Pro',
                href: '/studio',
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`p-6 rounded-2xl flex flex-col justify-between space-y-6 border ${
                  tier.highlight
                    ? 'bg-zinc-900/70 border-zinc-600'
                    : 'bg-zinc-900/30 border-zinc-800/80'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white">{tier.name}</h3>
                    {tier.highlight && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-black">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{tier.desc}</p>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{tier.price}</span>
                      <span className="text-xs text-zinc-500">/month</span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{tier.inr}</div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tier.href}
                  className={`w-full py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                    tier.highlight
                      ? 'bg-white hover:bg-zinc-200 text-black'
                      : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-zinc-900 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <AuraLogo size="sm" showSubtitle={false} href="/" />
            <span>© 2026 Aura Studio. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/studio" className="hover:text-zinc-300 transition-colors">Studio</Link>
            <Link href="/guide" className="hover:text-zinc-300 transition-colors">Documentation</Link>
            <Link href="/faq" className="hover:text-zinc-300 transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
