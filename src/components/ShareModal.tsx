'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Globe, Share2, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  projectId?: string;
}

export function ShareModal({ isOpen, onClose, title, projectId }: ShareModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const queryParams = new URLSearchParams();
  queryParams.set('title', title);
  if (projectId) queryParams.set('id', projectId);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/preview?${queryParams.toString()}`
    : `https://aura.build/preview?${queryParams.toString()}`;

  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0e0e13] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Share Live Application</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Share Link */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Live Standalone Preview URL</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white"
              title="Open Live Preview in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Embed code */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300">Embed Iframe</label>
          <textarea
            readOnly
            rows={2}
            value={embedCode}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-300 font-mono resize-none focus:outline-none"
          />
          <button
            onClick={handleCopyEmbed}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
          >
            {copiedEmbed ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
