'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, User, CheckCircle2, ChevronRight, 
  ArrowRight, RefreshCw, FileCode, Zap, Layers, Cpu,
  Database, ShieldCheck, Terminal, Code2
} from 'lucide-react';
import { AURA_ENGINE_DISPLAY } from '@/config/models';
import type { ChatMessage } from '@/types';
import { useAuth } from '@/lib/client/auth-context';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (prompt: string) => void;
  isGenerating: boolean;
  onOpenPricing: () => void;
  streamingReasoning?: string;
  streamingDelta?: string;
  onAutoFix?: (errorText: string) => void;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isGenerating,
  onOpenPricing,
  streamingReasoning = '',
  streamingDelta = '',
}: ChatPanelProps) {
  const { account } = useAuth();
  const [inputPrompt, setInputPrompt] = useState('');
  const [activeStreamTab, setActiveStreamTab] = useState<'timeline' | 'reasoning' | 'code'>('timeline');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingReasoning, streamingDelta, isGenerating]);

  const handleSend = () => {
    if (!inputPrompt.trim() || isGenerating) return;

    // Check daily request limit
    if (account && account.today.requests >= account.today.requestLimit) {
      onOpenPricing();
      return;
    }

    onSendMessage(inputPrompt.trim());
    setInputPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    { 
      label: 'Apex SaaS Analytics Matrix', 
      desc: 'Realtime ARR metrics, MRR growth charts, customer cohort retention & active users.',
      prompt: 'Build a high-conversion SaaS analytics dashboard with revenue metrics, retention charts, and active user breakdown.' 
    },
    { 
      label: 'Obsidian Trading Desk', 
      desc: 'Limit order books, live asset price tickers, interactive token swap modal & portfolio table.',
      prompt: 'Build an ultra-modern crypto trading desk with live order books, token swaps, and multi-asset performance charts.' 
    },
    { 
      label: 'Luxe Minimalist Storefront', 
      desc: 'Curated gallery, category filters, interactive cart drawer, and checkout modal.',
      prompt: 'Build a luxury minimalist e-commerce storefront with product cards, category filters, interactive cart drawer, and checkout modal.' 
    },
    { 
      label: 'Pulse Agile Kanban Studio', 
      desc: 'Multi-column sprint board, drag-and-drop style task states, priority tags, and metric bars.',
      prompt: 'Build a drag-and-drop style collaborative Kanban board with task priority tags, member avatars, and column metrics.' 
    },
  ];

  const architecturalPills = [
    'Add full CRUD modal with input validation',
    'Add instant search & dynamic status filters',
    'Add live calculated KPI cards & metrics',
    'Enable automatic LocalStorage persistence',
    'Add working CSV & JSON file export',
    'Add Dark / Light mode theme switcher',
    'Optimize responsive drawer for mobile viewports',
  ];

  // Derive execution timeline steps based on stream progress
  const timelineSteps = [
    {
      id: 'step-arch',
      label: 'System Architecture & Schema Design',
      desc: 'Deconstructing user intent, entities, and responsive layout hierarchy',
      status: streamingDelta.length > 50 || !isGenerating ? 'completed' : 'active',
    },
    {
      id: 'step-design',
      label: 'Obsidian Luxury Design System',
      desc: 'Synthesizing glassmorphic tokens, accessible palettes & typography scale',
      status: streamingDelta.length > 300 ? 'completed' : streamingDelta.length > 50 ? 'active' : 'pending',
    },
    {
      id: 'step-state',
      label: 'Reactive State Store & Event Handlers',
      desc: 'Compiling CRUD operations, instant filters, modals & live calculations',
      status: streamingDelta.length > 800 ? 'completed' : streamingDelta.length > 300 ? 'active' : 'pending',
    },
    {
      id: 'step-persistence',
      label: 'LocalStorage Persistence & Data Export',
      desc: 'Injecting automatic browser state syncing, CSV & JSON blob builders',
      status: streamingDelta.length > 1400 ? 'completed' : streamingDelta.length > 800 ? 'active' : 'pending',
    },
    {
      id: 'step-verify',
      label: 'Self-Inspection & Sandbox Verification',
      desc: 'Verifying zero dead buttons, Lucide icons re-render & responsive checks',
      status: !isGenerating ? 'completed' : streamingDelta.length > 1400 ? 'active' : 'pending',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d0d12] border-r border-zinc-800/80 w-full select-none">
      {/* Panel Header: Aura Autonomous Engine Status */}
      <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-950/70 flex items-center justify-between relative">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-semibold text-white tracking-tight">
              {AURA_ENGINE_DISPLAY.name}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold uppercase tracking-wider">
              {AURA_ENGINE_DISPLAY.version}
            </span>
          </div>
        </div>

        {/* Daily limit badge */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
          <div className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/80 text-[10px]">
            FUP:{' '}
            <span className="text-white font-semibold">
              {account ? Math.max(0, account.today.requestLimit - account.today.requests) : 5}
            </span>
            /{account?.today.requestLimit || 5} req
          </div>
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="py-4 space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous Vibe-Coding Studio</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                What application shall we engineer?
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                Describe your app, workflow, or SaaS vision. Aura Autonomous Engine writes 100% complete, fully interactive code with true reactive state, local persistence, and live sandbox execution.
              </p>
            </div>

            {/* Quick Inspiration Starters */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-amber-400" />
                <span>Curated Architectural Templates</span>
              </span>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.prompt)}
                    className="w-full text-left p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900 text-xs text-zinc-300 hover:text-white transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                        <span>{item.label}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Stream */
          messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.role === 'user' ? (
                /* User Message */
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-none px-4 py-2.5 bg-gradient-to-r from-zinc-800 to-zinc-850 border border-zinc-700/60 text-xs text-zinc-100 shadow-sm leading-relaxed">
                    {msg.content}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700 text-zinc-300">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                /* Assistant / Aura Copilot Message */
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#EFE2CC] flex items-center justify-center shrink-0 border border-amber-200/30 text-black font-black text-[10px] shadow-sm">
                    A
                  </div>
                  <div className="max-w-[90%] space-y-2.5">
                    <div className="rounded-2xl rounded-tl-none p-4 bg-zinc-900/90 border border-zinc-800/90 text-xs text-zinc-200 space-y-3 shadow-md">
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-amber-400" />
                          <span>{AURA_ENGINE_DISPLAY.name}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          {msg.version && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                              v{msg.version}.0
                            </span>
                          )}
                          {msg.credits !== undefined && (
                            <span className="text-[10px] font-mono text-zinc-500">
                              {msg.credits} cr
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50 text-[10px]">
                        <span className="inline-flex items-center gap-1 font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                          <FileCode className="w-3 h-3 text-amber-400" />
                          <span>index.html (Compiled App)</span>
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified in Sandbox</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Autonomous Generation Stream */}
        {isGenerating && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#EFE2CC] flex items-center justify-center shrink-0 border border-amber-200/30 text-black font-black text-[10px] animate-pulse">
              A
            </div>
            <div className="w-full max-w-[92%] rounded-2xl rounded-tl-none p-4 bg-zinc-900/95 border border-amber-500/30 text-xs text-zinc-200 space-y-3.5 shadow-xl">
              {/* Header Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Aura Engine is synthesizing application...</span>
                </div>

                {/* Sub-tabs: Timeline | Reasoning | Code */}
                <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[10px]">
                  <button
                    onClick={() => setActiveStreamTab('timeline')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      activeStreamTab === 'timeline'
                        ? 'bg-zinc-800 text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveStreamTab('reasoning')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      activeStreamTab === 'reasoning'
                        ? 'bg-zinc-800 text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Reasoning
                  </button>
                  <button
                    onClick={() => setActiveStreamTab('code')}
                    className={`px-2 py-0.5 rounded transition-all ${
                      activeStreamTab === 'code'
                        ? 'bg-zinc-800 text-white font-medium shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Code Stream
                  </button>
                </div>
              </div>

              {/* View 1: Execution Timeline Matrix (Better than Lovable) */}
              {activeStreamTab === 'timeline' && (
                <div className="space-y-2 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Autonomous Execution Matrix</span>
                    <span className="text-amber-400/80 font-mono">Real-time pipeline</span>
                  </div>

                  <div className="space-y-2">
                    {timelineSteps.map((step) => {
                      const isDone = step.status === 'completed';
                      const isActive = step.status === 'active';

                      return (
                        <div key={step.id} className="flex items-start gap-2.5 text-xs">
                          <div className="mt-0.5 shrink-0">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : isActive ? (
                              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 bg-zinc-900" />
                            )}
                          </div>
                          <div>
                            <div className={`font-medium ${isActive ? 'text-amber-300' : isDone ? 'text-white' : 'text-zinc-500'}`}>
                              {step.label}
                            </div>
                            <div className="text-[10px] text-zinc-500 leading-snug">
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* View 2: Deep Architectural Reasoning */}
              {activeStreamTab === 'reasoning' && (
                <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Architectural Reasoning Trace:
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
                    {streamingReasoning || 'Analyzing system boundaries, user workflows, and state transitions...'}
                  </p>
                </div>
              )}

              {/* View 3: Live Code Stream */}
              {activeStreamTab === 'code' && (
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-500">
                    <span>Synthesizing Application Tree:</span>
                    <span className="font-mono">{streamingDelta.length} chars</span>
                  </div>
                  <pre className="text-[10px] text-emerald-400/90 font-mono overflow-hidden h-24 line-clamp-5 bg-black/60 p-2 rounded-lg">
                    {streamingDelta.slice(-280) || '// Initializing AST and markup compiler...'}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Architectural Iteration Pills */}
      {messages.length > 0 && !isGenerating && (
        <div className="px-3 py-2 border-t border-zinc-800/60 bg-zinc-950/40 overflow-x-auto whitespace-nowrap flex gap-1.5 custom-scrollbar">
          {architecturalPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(pill)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0 flex items-center gap-1 group"
            >
              <span className="text-amber-400 group-hover:scale-110 transition-transform">+</span>
              <span>{pill}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80">
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/90 focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/20 transition-all shadow-inner">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={
              messages.length === 0
                ? "Describe the app to build (e.g., 'Modern crypto portfolio with swap modal & live order book')..."
                : "Ask Aura to refine, add features, change styles, or wire up new actions..."
            }
            rows={3}
            className="w-full bg-transparent p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none disabled:opacity-50"
          />

          <div className="px-3 pb-2.5 pt-1 flex items-center justify-between border-t border-zinc-800/40">
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="font-medium text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>{AURA_ENGINE_DISPLAY.name}</span>
              </span>
              <span className="hidden sm:inline text-zinc-500 text-[10px]">Shift + Enter for new line</span>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputPrompt.trim() || isGenerating}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                inputPrompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black shadow-md shadow-amber-500/10'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
