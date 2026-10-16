'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Monitor, Tablet, Smartphone, Code, Eye, Columns, Share2, 
  Download, Settings, User, LogOut, Zap, History, FolderKanban, Home
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
  version: number;
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
  onOpenAuth,
  onOpenProjects,
  version,
}: NavbarProps) {
  const { user, account, signOut } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectTitle);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const planName = account?.planName || 'Free';
  const requestsRemaining = account
    ? Math.max(0, account.today.requestLimit - account.today.requests)
    : 5;
  const isNearLimit = requestsRemaining <= 2;

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
      {/* Left: Brand + Home + Project Drawer + Project Title */}
      <div className="flex items-center gap-3">
        <AuraLogo size="sm" showSubtitle={false} href="/" />

        <Link
          href="/"
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Return to Landing Page"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>

        <div className="h-4 w-[1px] bg-zinc-800" />

        {/* Projects Drawer Trigger */}
        <button
          onClick={onOpenProjects}
          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Open Projects & History"
        >
          <FolderKanban className="w-3.5 h-3.5" />
        </button>

        {/* Project Title editable */}
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

      {/* Right: Plan pill, share, export, auth */}
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
          <span className="font-semibold text-white">{planName}</span>
          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
            {requestsRemaining} left today
          </span>
          {account && (
            <span className="text-[10px] text-zinc-500 font-mono hidden md:inline">
              ({account.credits.remaining} cr)
            </span>
          )}
          <span className="text-[10px] font-bold text-amber-300 ml-1 underline decoration-amber-400/50">
            {account?.plan === 'pro' ? 'Limits' : 'Upgrade'}
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

        {/* User Account / Sign In */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-amber-400 hover:border-zinc-600 transition-colors overflow-hidden"
              title={user.email || 'User Account'}
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
                <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="font-semibold text-white truncate">{user.displayName || 'Member'}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <p className="text-[10px] text-amber-400 font-mono mt-1 font-semibold">{planName} Plan</p>
                  </div>

                  <Link
                    href="/"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full px-3 py-2 text-left rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Landing Page</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenSettings();
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="w-full px-3 py-2 text-left rounded-lg text-red-400 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
