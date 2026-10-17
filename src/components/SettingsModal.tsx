'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Key, ShieldCheck, Check, RotateCcw, Cpu, Sparkles, Sliders, Layers } from 'lucide-react';
import { useAuth } from '@/lib/client/auth-context';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  computeKey?: string;
  openRouterKey?: string;
  onSaveComputeKey?: (key: string) => void;
  onSaveOpenRouterKey?: (key: string) => void;
  subscription?: any;
  onResetUsage?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  computeKey,
  openRouterKey,
  onSaveComputeKey,
  onSaveOpenRouterKey,
}: SettingsModalProps) {
  const { account, refreshAccount, isConfigured } = useAuth();
  const initialKey = computeKey ?? openRouterKey ?? '';
  const [keyInput, setKeyInput] = useState(initialKey);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [aiTemperature, setAiTemperature] = useState<number>(0.7);
  const [componentDepth, setComponentDepth] = useState<number>(4);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTemp = localStorage.getItem('aura_ai_temperature');
      if (savedTemp) setAiTemperature(parseFloat(savedTemp));
      const savedDepth = localStorage.getItem('aura_ai_max_depth');
      if (savedDepth) setComponentDepth(parseInt(savedDepth, 10));
    }
  }, []);

  const handleTemperatureChange = (val: number) => {
    setAiTemperature(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_ai_temperature', val.toString());
    }
  };

  const handleDepthChange = (val: number) => {
    setComponentDepth(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_ai_max_depth', val.toString());
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (onSaveComputeKey) onSaveComputeKey(trimmed);
    if (onSaveOpenRouterKey) onSaveOpenRouterKey(trimmed);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0e0e13] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Platform Settings</h2>
              <p className="text-xs text-zinc-400">Compute Key & Cashfree telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Custom Compute Key BYOK */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Dedicated Compute Key (Optional BYOK)</span>
            </label>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 font-mono"
            />
            <p className="text-[11px] text-zinc-500">
              Leave blank to use Aura&#39;s server-managed GPU infrastructure. Entering a custom key routes generation prompts through your personal endpoint. Need setup instructions? Read our{' '}
              <Link href="/guide#byok" target="_blank" className="underline text-amber-400 hover:text-amber-300">
                BYOK Setup Guide
              </Link>.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </div>

        {/* Section 2: Autonomous Synthesis Engine Dynamic Sliders */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              Autonomous Engine Tuning
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Live Hyperparameters
            </span>
          </div>

          {/* AI Creativity / Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-300 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Temperature / Creativity
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700">
                {aiTemperature.toFixed(2)} · {aiTemperature <= 0.35 ? 'Deterministic' : aiTemperature <= 0.75 ? 'Balanced' : 'Creative'}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={aiTemperature}
              onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.1 (Strict Precision)</span>
              <span>1.0 (Bold Discovery)</span>
            </div>
          </div>

          {/* Component Nesting Depth Slider */}
          <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-300 font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Component Decomposition Depth
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-indigo-300 border border-zinc-700">
                {componentDepth} Layers
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              step="1"
              value={componentDepth}
              onChange={(e) => handleDepthChange(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>2 (Flat Monolith)</span>
              <span>8 (Deep Atomic Architecture)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Cashfree & Server Gateway Status */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cashfree Production Gateway
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active (Production)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono pt-1">
            <div>
              <span className="text-zinc-600 block text-[10px]">Encryption & Webhook:</span>
              <span className="text-zinc-300 truncate block">HMAC-SHA256 Verified</span>
            </div>
            <div>
              <span className="text-zinc-600 block text-[10px]">Supported Methods:</span>
              <span className="text-zinc-300 truncate block">UPI, Cards & NetBanking</span>
            </div>
          </div>
        </div>

        {/* Section 3: Live Account Limits */}
        {account && (
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
            <div>
              <span className="text-zinc-300 font-medium block">
                {account.planName} Plan • Daily Quota
              </span>
              <span className="text-[11px] text-zinc-500">
                {account.today.requests} of {account.today.requestLimit} requests used today ({account.credits.remaining} credits left)
              </span>
            </div>

            <button
              onClick={() => refreshAccount()}
              className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
