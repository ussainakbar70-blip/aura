'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Send, Bot, User, CheckCircle2, ChevronDown, Lock, 
  ArrowRight, RefreshCw, FileCode, Paperclip, AlertCircle, Info, Zap
} from 'lucide-react';
import { FRONTIER_MODELS } from '@/config/models';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { ModelOption, SubscriptionTier, ChatMessage, UserSubscription } from '@/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  subscription: UserSubscription;
  onSendMessage: (prompt: string) => void;
  isGenerating: boolean;
  onOpenPricing: () => void;
  activeThoughtSteps?: string[];
}

export function ChatPanel({
  messages,
  selectedModel,
  onSelectModel,
  subscription,
  onSendMessage,
  isGenerating,
  onOpenPricing,
  activeThoughtSteps = [],
}: ChatPanelProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentModel = FRONTIER_MODELS.find((m) => m.id === selectedModel) || FRONTIER_MODELS[0];
  const userTier = SUBSCRIPTION_TIERS[subscription.tier] || SUBSCRIPTION_TIERS.starter;

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeThoughtSteps, isGenerating]);

  const handleSend = () => {
    if (!inputPrompt.trim() || isGenerating) return;

    // Check FUP daily limit
    if (subscription.dailyRequestsUsed >= subscription.dailyRequestsLimit) {
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

  const isModelAllowedForUser = (model: ModelOption): boolean => {
    const tierPriority: Record<SubscriptionTier, number> = { starter: 1, mid: 2, pro: 3 };
    return tierPriority[subscription.tier] >= tierPriority[model.minTier];
  };

  const quickPrompts = [
    { label: 'SaaS Analytics Matrix', prompt: 'Build a high-conversion SaaS analytics dashboard with revenue metrics, retention charts, and active user breakdown.' },
    { label: 'Apex Crypto Trading Hub', prompt: 'Build an ultra-modern crypto trading desk with live order books, token swaps, and multi-asset performance charts.' },
    { label: 'Luxe Minimalist Store', prompt: 'Build a luxury minimalist e-commerce storefront with product cards, category filters, interactive cart drawer, and checkout modal.' },
    { label: 'Pulse Kanban Suite', prompt: 'Build a drag-and-drop style collaborative Kanban board with task priority tags, member avatars, and column metrics.' },
  ];

  const iterationChips = [
    'Add Dark/Light mode switcher',
    'Make fully responsive for mobile screens',
    'Add dynamic search & filter bar',
    'Add realistic dummy transaction data',
    'Add CSV/JSON export action',
  ];

  return (
    <div className="flex flex-col h-full bg-[#0d0d11] border-r border-zinc-800/80 w-full select-none">
      {/* Panel Header & Frontier Model Selector */}
      <div className="p-3.5 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between relative">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">Frontier Model:</span>

          {/* Model Selector Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-white transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-medium">{currentModel.name}</span>
              <span className="text-[10px] text-zinc-400">({currentModel.provider})</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
            </button>

            {/* Model Dropdown Menu */}
            {isModelDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsModelDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 divide-y divide-zinc-800/60 max-h-[85vh] overflow-y-auto">
                  <div className="px-3.5 py-2 text-[11px] text-zinc-400 font-medium">
                    Select Frontier AI Model (via OpenRouter)
                  </div>

                  {/* Group models by provider */}
                  {['Anthropic', 'OpenAI', 'Google'].map((provider) => {
                    const providerModels = FRONTIER_MODELS.filter((m) => m.provider === provider);
                    return (
                      <div key={provider} className="py-1">
                        <div className="px-3.5 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {provider}
                        </div>
                        {providerModels.map((model) => {
                          const allowed = isModelAllowedForUser(model);
                          const isSelected = model.id === selectedModel;

                          return (
                            <button
                              key={model.id}
                              disabled={!allowed}
                              onClick={() => {
                                onSelectModel(model.id);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 text-xs flex items-start justify-between gap-3 transition-colors ${
                                isSelected
                                  ? 'bg-amber-500/10 text-white'
                                  : allowed
                                  ? 'hover:bg-zinc-800/80 text-zinc-200'
                                  : 'opacity-50 cursor-not-allowed hover:bg-zinc-900'
                              }`}
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">{model.name}</span>
                                  {model.badge && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                      {model.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">
                                  {model.description}
                                </p>
                              </div>

                              {!allowed ? (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsModelDropdownOpen(false);
                                    onOpenPricing();
                                  }}
                                  className="flex items-center gap-1 text-[10px] text-amber-400 hover:underline shrink-0 font-medium cursor-pointer"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>{model.minTier.toUpperCase()}</span>
                                </div>
                              ) : isSelected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Daily limit badge */}
        <div className="text-[11px] text-zinc-400 font-mono">
          FUP Limit:{' '}
          <span className="text-white font-semibold">
            {subscription.dailyRequestsLimit - subscription.dailyRequestsUsed}
          </span>
          /{subscription.dailyRequestsLimit}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {messages.length === 0 ? (
          /* Empty / Welcome State (Lovable hero style) */
          <div className="py-6 space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vibe-Coding Frontier Studio</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                What do you want to build today?
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                Type your app prompt or choose a starter template below. Aura generates full responsive code and renders the live interactive app instantly.
              </p>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Inspiration Prompts
              </span>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item.prompt)}
                    className="w-full text-left p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 hover:bg-zinc-900 text-xs text-zinc-300 hover:text-white transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {item.label}
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                        {item.prompt}
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
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Aura Copilot
                        </span>
                        {msg.model && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            {msg.model}
                          </span>
                        )}
                      </div>

                      <p className="leading-relaxed">{msg.content}</p>

                      {/* Lovable-style Thought Steps List */}
                      {msg.thoughtSteps && msg.thoughtSteps.length > 0 && (
                        <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-800/60 space-y-1.5">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                            Synthesis Pipeline:
                          </span>
                          {msg.thoughtSteps.map((step, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center gap-2 text-[11px] text-zinc-300"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Affected Files pills */}
                      {msg.filesAffected && msg.filesAffected.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.filesAffected.map((file, fIdx) => (
                            <span
                              key={fIdx}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                            >
                              <FileCode className="w-3 h-3 text-amber-400" />
                              {file}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Live Generating Animation (Lovable Thought Stream) */}
        {isGenerating && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FFFDF9] via-[#FAF4EA] to-[#EFE2CC] flex items-center justify-center shrink-0 border border-amber-200/30 text-black font-black text-[10px] animate-pulse">
              A
            </div>
            <div className="w-full max-w-[90%] rounded-2xl rounded-tl-none p-4 bg-zinc-900/90 border border-amber-500/20 text-xs text-zinc-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Aura is architecting your application...</span>
              </div>

              {/* Dynamic steps stream */}
              <div className="space-y-2 bg-zinc-950/70 rounded-xl p-3 border border-zinc-800/80">
                {activeThoughtSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-300 animate-fadeIn">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Iteration Chips (Lovable style) */}
      {messages.length > 0 && !isGenerating && (
        <div className="px-3 py-2 border-t border-zinc-800/60 bg-zinc-950/40 overflow-x-auto whitespace-nowrap flex gap-1.5 custom-scrollbar">
          {iterationChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(chip)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all shrink-0"
            >
              + {chip}
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
                ? "Describe the app you want to build (e.g. 'Luxury watch marketplace with live auctions')..."
                : "Ask Aura to refine, add features, change styles or create components..."
            }
            rows={3}
            className="w-full bg-transparent p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none disabled:opacity-50"
          />

          <div className="px-3 pb-2.5 pt-1 flex items-center justify-between border-t border-zinc-800/40">
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                {currentModel.name}
              </span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputPrompt.trim() || isGenerating}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                inputPrompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-black shadow-md'
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
