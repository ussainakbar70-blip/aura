'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  HelpCircle, ArrowLeft, Search, ChevronDown, ChevronUp, 
  Sparkles, Zap, Shield, Download, CreditCard, Code, Rocket
} from 'lucide-react';
import { AuraLogo } from '@/components/AuraLogo';

interface FAQItem {
  id: string;
  category: 'general' | 'engine' | 'billing' | 'export' | 'security';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  // General & Getting Started
  {
    id: 'what-is-aura',
    category: 'general',
    question: 'What is Aura and how does it compare to Lovable or v0?',
    answer: 'Aura is an autonomous AI web application studio powered by the Aura Autonomous Engine (v2.5 Ultra). Unlike traditional code snippet generators that return partial UI mockups with placeholder text, Aura constructs fully functional, reactive web applications with state management, interactive components, working forms, and responsive viewports in a single synthesis cycle.',
  },
  {
    id: 'do-i-need-coding',
    category: 'general',
    question: 'Do I need programming experience to build apps with Aura?',
    answer: 'Not at all! You can describe the software you want in plain conversational language (e.g., "Build an invoicing dashboard with PDF invoice preview, currency switcher, and tax calculation"). Aura handles the architecture, layout, reactive state, and styling automatically. If you are an experienced engineer, you can inspect the raw React/Tailwind code, tweak individual files, or export the bundle to your IDE.',
  },
  {
    id: 'how-do-i-start',
    category: 'general',
    question: 'How do I start building my first web app?',
    answer: 'Simply click "Launch Studio" anywhere on the site or enter a prompt on the homepage. You get 15 free daily autonomous generations without needing to enter a credit card. You can also click on any architectural starter blueprint on the Studio canvas to see instant synthesis.',
  },

  // AI Engine
  {
    id: 'engine-identity',
    category: 'engine',
    question: 'What AI model powers Aura Studio?',
    answer: 'Aura is powered by our proprietary high-throughput inference pipeline running the Aura Autonomous Engine (v2.5 Ultra). It is specially optimized for full-stack frontend orchestration, AST generation, reactive state synchronization, and zero-latency live code streaming.',
  },
  {
    id: 'how-to-prompt',
    category: 'engine',
    question: 'What is the best way to prompt Aura for complex applications?',
    answer: 'Provide specific context regarding functionality, layout, and visual tone. For example, instead of just "Make a gym app", prompt: "Create a modern dark-mode fitness tracking dashboard with weekly workout schedule, calorie burning target ring, reactive exercise logging form, and muscle group filter buttons." Aura will interpret the functional requirements and wire up real interactive React state.',
  },
  {
    id: 'how-autofix-works',
    category: 'engine',
    question: 'What does the "Auto-Fix" button in the Preview panel do?',
    answer: 'If the browser sandbox detects any JavaScript runtime exceptions, syntax errors, or unhandled promise rejections, the Auto-Fix button activates. Clicking it sends the stack trace and failing component directly to the Aura Autonomous Engine, which diagnoses the issue and hot-patches the code without losing your project state.',
  },

  // Billing & Cashfree
  {
    id: 'free-vs-pro',
    category: 'billing',
    question: 'What is the difference between the Free and Pro plans?',
    answer: 'The Free tier gives you 15 daily autonomous generations with standard streaming speeds. The Pro Tier ($19/mo or $190/yr) provides unlimited daily generations, ultra-low latency compute queues, priority access during peak hours, and team collaboration export features.',
  },
  {
    id: 'cashfree-payment',
    category: 'billing',
    question: 'How are payments processed? Is Cashfree supported?',
    answer: 'Yes! Aura integrates directly with Cashfree Payment Gateway to support Indian and international payments seamlessly. You can pay using UPI (Google Pay, PhonePe, Paytm), Netbanking across all major banks, Credit Cards, Debit Cards, and digital wallets with instant automated license provisioning.',
  },
  {
    id: 'daily-quota-reset',
    category: 'billing',
    question: 'When does the daily generation quota reset?',
    answer: 'Daily generation limits reset automatically every 24 hours at 00:00 UTC (Coordinated Universal Time). The studio navbar displays your real-time remaining allowance at all times.',
  },

  // Export & Deployment
  {
    id: 'code-export-format',
    category: 'export',
    question: 'What format is the exported code in?',
    answer: 'Aura generates clean, standard, modern web code. When you click Export, you can copy the standalone HTML/React component, or download a full ZIP bundle containing index.html, App.tsx, tailwind.config.js, and package.json ready to run with `npm install && npm run dev`.',
  },
  {
    id: 'where-can-i-deploy',
    category: 'export',
    question: 'Where can I deploy apps generated by Aura?',
    answer: 'Everywhere! Because the output is standard React + Tailwind CSS, you can deploy your project to Vercel, Netlify, Cloudflare Pages, AWS Amplify, GitHub Pages, or any Docker/Node.js host with zero lock-in.',
  },
  {
    id: 'who-owns-code',
    category: 'export',
    question: 'Who owns the intellectual property and code generated by Aura?',
    answer: 'You do — 100%! All source code, markup, styling, and assets generated in your Aura Studio session belong entirely to you. There are no licensing fees, royalties, or attribution requirements, even if you sell the code to clients or raise venture capital.',
  },

  // Security & BYOK
  {
    id: 'byok-keys',
    category: 'security',
    question: 'Can I Bring My Own Key (BYOK) for compute?',
    answer: 'Yes! Open the Studio Settings modal and input your Dedicated Compute Key. When active, requests bypass platform credit counters and route directly through your private compute allocation for limitless continuous generation.',
  },
  {
    id: 'data-privacy-training',
    category: 'security',
    question: 'Are my private prompts used to train foundation models?',
    answer: 'Strictly NO. Under our privacy charter, customer prompts, project architectures, and generated code files are never retained to train public or foundational machine learning models. Your intellectual property remains strictly confidential.',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('what-is-aura');

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !query || 
        item.question.toLowerCase().includes(query) || 
        item.answer.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

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

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 md:py-16 space-y-10">
        {/* Title & Search Hero */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center & Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Everything you need to know about building, customizing, exporting, and deploying modern web applications with Aura.
          </p>

          {/* Search Bar */}
          <div className="pt-2 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. export, Cashfree, BYOK, ownership)..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-all shadow-lg shadow-black/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'general', label: 'Getting Started' },
            { id: 'engine', label: 'Autonomous Engine' },
            { id: 'billing', label: 'Billing & Cashfree' },
            { id: 'export', label: 'Export & Hosting' },
            { id: 'security', label: 'Security & BYOK' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 pt-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-8">
              <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-300">No matching questions found</p>
              <p className="text-xs text-zinc-500">
                Try searching with different keywords or switch back to &ldquo;All Topics&rdquo;.
              </p>
            </div>
          ) : (
            filteredFaqs.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded 
                      ? 'bg-zinc-900/80 border-amber-500/40 shadow-lg shadow-black/50' 
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white">
                      {item.question}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/60">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support & Action Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/20 border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Still have questions or need custom enterprise setup?</span>
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Our engineering team is ready to assist with dedicated deployment, custom pipeline latency SLAs, or BYOK enterprise integrations.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/studio"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-black/60 py-8 px-6 mt-16 text-center text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Aura Autonomous AI Studio. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/guide" className="hover:text-zinc-300 transition-colors">User Guide</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/studio" className="text-amber-400 hover:text-amber-300 transition-colors">Studio</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
