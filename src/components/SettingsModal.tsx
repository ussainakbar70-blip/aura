'use client';

import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, RotateCcw, Cpu, ExternalLink } from 'lucide-react';
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
              Leave blank to use Aura&#39;s server-managed GPU infrastructure. Entering a custom key routes generation prompts through your personal endpoint.
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

        {/* Section 2: Cashfree & Server Gateway Status */}
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
