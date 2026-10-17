'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp, CheckCircle2, RefreshCw, Wand2, ChevronDown, ChevronRight, Copy, Check
} from 'lucide-react';
import { enhanceUserPrompt } from '@/lib/templates';
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
  const [showReasoning, setShowReasoning] = useState(false);
  const [enhancedFeedback, setEnhancedFeedback] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 1800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingReasoning, streamingDelta, isGenerating]);

  const handleSend = () => {
    if (!inputPrompt.trim() || isGenerating) return;

    if (account && account.today.requests >= account.today.requestLimit) {
      onOpenPricing();
      return;
    }

    onSendMessage(inputPrompt.trim());
    setInputPrompt('');
  };

  const handleEnhancePrompt = () => {
    const expanded = enhanceUserPrompt(inputPrompt);
    setInputPrompt(expanded);
    setEnhancedFeedback(true);
    setTimeout(() => setEnhancedFeedback(false), 1600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const starterTemplates = [
    {
      label: 'SaaS Revenue & Cohort Dashboard',
      prompt: 'Build a SaaS revenue and cohort intelligence platform with multi-view navigation, interactive SVG revenue chart, MRR growth simulator, and customer CRUD ledger.',
    },
    {
      label: 'High-Conversion Startup Website',
      prompt: 'Build a high-conversion interactive SaaS startup website with sticky navigation, hero product simulator, interactive ROI pricing calculator, FAQ accordion, and demo booking modal.',
    },
    {
      label: 'Luxury E-Commerce Storefront',
      prompt: 'Build a luxury minimalist e-commerce storefront with category filters, price sorting, slide-over shopping bag drawer, promo code AURA20, checkout flow, and product inventory modal.',
    },
    {
      label: 'Web3 Perpetuals Trading Terminal',
      prompt: 'Build an institutional crypto perpetuals trading terminal with pair switcher, interactive price chart, Buy/Sell order execution ticket, and position ledger.',
    },
    {
      label: 'Agile Sprint & Kanban Workspace',
      prompt: 'Build an agile Kanban & sprint studio with 4 status columns, 1-click task stage transitions, priority filter, sprint burnup bar, and task creation modal.',
    },
  ];

  const steps = [
    { label: 'Designing system architecture & data schema', done: streamingDelta.length > 80 },
    { label: 'Building responsive layout & components', done: streamingDelta.length > 500 },
    { label: 'Wiring reactive state, modals & persistence', done: streamingDelta.length > 1200 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#09090b] border-r border-zinc-800/80 w-full select-none">
      {/* Clean Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className="group relative">
            {msg.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl px-3.5 py-2.5 bg-zinc-800/90 text-xs text-zinc-100 leading-relaxed relative">
                  {msg.content}
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="absolute -left-7 top-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-white transition-opacity cursor-pointer"
                    title="Copy prompt"
                  >
                    {copiedMsgId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center text-[9px] font-bold">
                      A
                    </span>
                    <span>Aura</span>
                    {msg.version && (
                      <span className="text-[10px] font-mono text-zinc-500">v{msg.version}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-white transition-opacity cursor-pointer flex items-center gap-1 text-[10px]"
                    title="Copy message"
                  >
                    {copiedMsgId === msg.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line pl-6">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Clean Starter List (Shown only on fresh workspace) */}
        {messages.length <= 1 && !isGenerating && (
          <div className="pl-6 pt-1 space-y-2">
            <p className="text-[11px] text-zinc-500">Start from a blueprint:</p>
            <div className="space-y-1.5">
              {starterTemplates.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(item.prompt)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer block"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calm, Mature Generation Progress */}
        {isGenerating && (
          <div className="pl-6 space-y-2.5">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-zinc-200 font-medium">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
                  <span>Building application...</span>
                </div>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-0.5"
                >
                  <span>Details</span>
                  {showReasoning ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              </div>

              <div className="space-y-1.5 pt-0.5">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    {step.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                    )}
                    <span className={step.done ? 'text-zinc-300' : 'text-zinc-500'}>{step.label}</span>
                  </div>
                ))}
              </div>

              {showReasoning && streamingReasoning && (
                <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono whitespace-pre-wrap max-h-28 overflow-y-auto custom-scrollbar">
                  {streamingReasoning}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Surgical Refinement Chips (Shown when app is built) */}
      {messages.length > 1 && !isGenerating && (
        <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 overflow-x-auto custom-scrollbar whitespace-nowrap">
          {[
            { label: '+ Dark/Light Mode', prompt: 'Add an interactive Dark/Light mode theme switcher to the navigation header' },
            { label: '+ Export to CSV', prompt: 'Add an Export to CSV button that downloads the active table records as a real CSV file' },
            { label: '+ Analytics Chart', prompt: 'Add an interactive SVG metrics analytics chart with timeframe toggles' },
            { label: '+ Add Filters', prompt: 'Add dynamic category and status filtering dropdowns to the data view' },
            { label: '+ Emerald Theme', prompt: 'Switch the primary accent palette to Emerald luxury theme' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(chip.prompt)}
              className="px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[10px] text-zinc-300 hover:text-white transition-all cursor-pointer shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* Minimal, Lovable/Emergent Prompt Composer */}
      <div className="p-3 bg-[#09090b]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 focus-within:border-zinc-700 transition-all p-3 space-y-2">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder="Ask Aura to build or make changes..."
            rows={3}
            className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none resize-none disabled:opacity-50 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Expand prompt into a detailed specification"
            >
              <Wand2 className="w-3 h-3" />
              <span>{enhancedFeedback ? 'Enhanced' : 'Enhance'}</span>
            </button>

            <button
              onClick={handleSend}
              disabled={!inputPrompt.trim() || isGenerating}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                inputPrompt.trim() && !isGenerating
                  ? 'bg-white hover:bg-zinc-200 text-black cursor-pointer'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              title="Send"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
