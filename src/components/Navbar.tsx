'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Monitor, Tablet, Smartphone, Code2, Eye, Share2,
  Download, Settings, User, LogOut, Zap, FolderKanban,
  Undo2, Redo2, Plus, ChevronDown, ExternalLink, RotateCw,
  MousePointerClick
} from 'lucide-react';
import { AuraLogo } from './AuraLogo';
import { useAuth } from '@/lib/client/auth-context';

interface NavbarProps {
  projectTitle: string;
  onUpdateTitle: (newTitle: string) => void;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;
  viewMode: 'split' | 'preview' | 'code';
  onChangeViewMode: (vm: 'split' | 'preview' | 'code') => void;
  onOpenPricing: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onOpenExport: () => void;
  onOpenAuth: () => void;
  onOpenProjects: () => void;
  onNewProject?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  version: number;
  inspectMode?: boolean;
  onToggleInspect?: () => void;
  onRefreshPreview?: () => void;
  onOpenExternalPreview?: () => void;
  hasCode?: boolean;
}

export function Navbar({
  projectTitle,
  onUpdateTitle,
  viewport,
  onChangeViewport,
  viewMode,
  onChangeViewMode,
  onOpenPricing,
  onOpenSettings,
  onOpenShare,
  onOpenExport,
  onOpenProjects,
  onNewProject,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  version,
  inspectMode = false,
  onToggleInspect,
  onRefreshPreview,
  onOpenExternalPreview,
  hasCode = false,
}: NavbarProps) {
  const { user, account, signOut } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  useEffect(() => {
    setTitleInput(projectTitle);
  }, [projectTitle]);

  const planName = account?.planName || 'Free';

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(projectTitle);
    }
  };

  return (
    <header className="h-12 border-b border-zinc-800/80 bg-[#09090b] px-3.5 flex items-center justify-between z-30 select-none">
      {/* Left: Brand + Clean Project Dropdown + Undo/Redo */}
      <div className="flex items-center gap-2">
        <AuraLogo size="sm" showSubtitle={false} href="/" />

        <span className="text-zinc-700 text-sm">/</span>

        {/* Project Menu / Rename Trigger (Lovable style) */}
        <div className="relative">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-zinc-900 border border-zinc-700 text-xs px-2.5 py-1 rounded-lg text-white focus:outline-none focus:border-zinc-500 w-44"
            />
          ) : (
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="px-2 py-1 rounded-lg hover:bg-zinc-900 text-xs font-medium text-zinc-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="truncate max-w-[160px]">{projectTitle}</span>
              <span className="text-[10px] text-zinc-500 font-mono">v{version}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          )}

          {showProjectMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)} />
              <div className="absolute left-0 mt-1.5 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5">
                <button
                  onClick={() => {
                    setShowProjectMenu(false);
                    setIsEditingTitle(true);
                  }}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Rename project
                </button>
                <button
                  onClick={() => {
                    setShowProjectMenu(false);
                    onOpenProjects();
                  }}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-zinc-400" />
                  <span>All projects &amp; history</span>
                </button>
                {onNewProject && (
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      onNewProject();
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>New project</span>
                  </button>
                )}
                <div className="h-[1px] bg-zinc-800 my-1" />
                <Link
                  href="/"
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 block transition-colors"
                >
                  Back to home
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Subtle Undo / Redo */}
        {(onUndo || onRedo) && (
          <div className="hidden sm:flex items-center gap-0.5 ml-1 border-l border-zinc-800/80 pl-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1 rounded-md transition-colors ${
                canUndo
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer'
                  : 'text-zinc-700 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1 rounded-md transition-colors ${
                canRedo
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 cursor-pointer'
                  : 'text-zinc-700 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Center: Unified Preview / Code Segmented Control + Viewport & Sandbox Actions */}
      <div className="flex items-center gap-2">
        {/* Preview | Code Pill Switcher */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800/90 p-0.5 rounded-lg text-xs font-medium">
          <button
            onClick={() => onChangeViewMode('split')}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode !== 'code'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => onChangeViewMode('code')}
            className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'code'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>

        {/* Viewport & Preview Controls (Only visible in Preview mode) */}
        {viewMode !== 'code' && (
          <div className="hidden md:flex items-center gap-1 bg-zinc-900 border border-zinc-800/90 p-0.5 rounded-lg">
            <button
              onClick={() => onChangeViewport('desktop')}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                viewport === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Desktop view"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewport('tablet')}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                viewport === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Tablet view"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeViewport('mobile')}
              className={`p-1 rounded-md transition-all cursor-pointer ${
                viewport === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Mobile view"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>

            {hasCode && (
              <>
                <div className="w-[1px] h-3.5 bg-zinc-800 mx-0.5" />
                {onToggleInspect && (
                  <button
                    onClick={onToggleInspect}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      inspectMode
                        ? 'bg-amber-400 text-black'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Inspect & Edit elements in preview"
                  >
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </button>
                )}
                {onRefreshPreview && (
                  <button
                    onClick={onRefreshPreview}
                    className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Reload preview"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenExternalPreview && (
                  <button
                    onClick={onOpenExternalPreview}
                    className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right: Clean Actions (Export, Publish/Share, Upgrade, Profile) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenExport}
          className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
          title="Export code"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onOpenShare}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Publish</span>
        </button>

        <button
          onClick={onOpenPricing}
          className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-white text-black text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3 h-3 fill-black" />
          <span>{account?.plan === 'pro' ? 'Pro' : 'Upgrade'}</span>
        </button>

        {/* User Avatar */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 hover:border-zinc-500 transition-colors overflow-hidden cursor-pointer"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{(user.email || user.displayName || 'U').charAt(0).toUpperCase()}</span>
              )}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-1.5 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5">
                  <div className="px-2.5 py-2 border-b border-zinc-800">
                    <p className="font-semibold text-white truncate">{user.displayName || 'Builder'}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{planName} Plan</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Settings &amp; API Key</span>
                  </button>

                  <Link
                    href="/guide"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 block"
                  >
                    Documentation
                  </Link>

                  <div className="h-[1px] bg-zinc-800 my-1" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg text-rose-400 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            Sign in
          </Link>
        )}

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          title="Platform Settings & BYOK Compute Key"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
