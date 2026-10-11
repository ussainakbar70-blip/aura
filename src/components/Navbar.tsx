'use client';

import React, { useState } from 'react';
import { 
  Monitor, Tablet, Smartphone, Code, Eye, Columns, Share2, 
  Download, Settings, Sparkles, Check, ChevronDown, Zap
} from 'lucide-react';
import { AuraLogo } from './AuraLogo';
import { SubscriptionTier, UserSubscription } from '@/types';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';

interface NavbarProps {
  projectTitle: string;
  onUpdateTitle: (newTitle: string) => void;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;
  viewMode: 'split' | 'preview' | 'code';
  onChangeViewMode: (vm: 'split' | 'preview' | 'code') => void;
  subscription: UserSubscription;
  onOpenPricing: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  version: number;
}

export function Navbar({
  projectTitle,
  onUpdateTitle,
  viewport,
  onChangeViewport,
  viewMode,
  onChangeViewMode,
  subscription,
  onOpenPricing,
  onOpenSettings,
  onOpenShare,
  onOpenExport,
  version,
}: NavbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);

  const currentTier = SUBSCRIPTION_TIERS[subscription.tier] || SUBSCRIPTION_TIERS.starter;
  const requestsRemaining = Math.max(0, subscription.dailyRequestsLimit - subscription.dailyRequestsUsed);
  const isNearLimit = requestsRemaining <= 3;

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(projectTitle);
    }
  };

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Left: Brand + Project Title */}
      <div className="flex items-center gap-4">
        <AuraLogo size="sm" showSubtitle={false} />

        <div className="h-4 w-[1px] bg-zinc-800" />

        {/* Project Name editable */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-zinc-900 border border-zinc-700 text-xs px-2 py-1 rounded text-white focus:outline-none focus:border-amber-500 w-44"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-medium text-zinc-300 hover:text-white transition-colors truncate max-w-[160px] group flex items-center gap-1.5"
              title="Click to rename project"
            >
              <span>{projectTitle}</span>
              <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400">✏️</span>
            </button>
          )}

          {/* Version badge */}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
            v{version}.0
          </span>

          <span className="text-[10px] text-emerald-400/90 flex items-center gap-1 hidden md:flex">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Middle: Viewport & View Mode Switches (Lovable style) */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Viewport switcher */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800/80 p-0.5 rounded-lg">
          <button
            onClick={() => onChangeViewport('desktop')}
            className={`p-1.5 rounded-md transition-all ${
              viewport === 'desktop' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desktop View (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeViewport('tablet')}
            className={`p-1.5 rounded-md transition-all ${
              viewport === 'tablet' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onChangeViewport('mobile')}
            className={`p-1.5 rounded-md transition-all ${
              viewport === 'mobile' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode switcher: Split | Preview | Code */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800/80 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => onChangeViewMode('split')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === 'split' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Split</span>
          </button>
          <button
            onClick={() => onChangeViewMode('preview')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === 'preview' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => onChangeViewMode('code')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-all ${
              viewMode === 'code' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code className="w-3 h-3" />
            <span>Code</span>
          </button>
        </div>
      </div>

      {/* Right: Subscription Tier Badge, Actions, Settings */}
      <div className="flex items-center gap-2.5">
        {/* Tier & Daily Limits Quota Badge */}
        <button
          onClick={onOpenPricing}
          className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all group ${
            isNearLimit
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
          }`}
          title="Click to view pricing & daily fair usage quota"
        >
          <Zap className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-white">{currentTier.name}</span>
          <span className="text-[10px] text-zinc-400 font-mono">
            {requestsRemaining}/{subscription.dailyRequestsLimit} left today
          </span>
          <span className="text-[10px] font-bold text-amber-300 ml-1 underline decoration-amber-400/50">
            Upgrade
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShare}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-1.5"
          title="Share Project Link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-1.5"
          title="Export Code or Download Bundle"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          title="Settings & OpenRouter BYOK Key"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
