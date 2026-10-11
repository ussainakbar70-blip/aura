'use client';

import React, { useState } from 'react';
import { X, Download, FileCode, Check, Copy, Package } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  files: { name: string; language: string; content: string }[];
  htmlCode: string;
}

export function ExportModal({ isOpen, onClose, title, files, htmlCode }: ExportModalProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReact = () => {
    const reactFile = files.find((f) => f.name.includes('.tsx') || f.name.includes('.jsx')) || files[0];
    if (reactFile) {
      navigator.clipboard.writeText(reactFile.content);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0e0e13] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Export Application Code</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Aura generates zero-dependency, deployable applications. Choose your preferred export format below:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Download Standalone HTML */}
          <button
            onClick={handleDownloadHtml}
            className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">Standalone HTML</span>
              <FileCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Ready-to-deploy single-file bundle with Tailwind CDN & Lucide icons.
            </p>
          </button>

          {/* Copy React App Code */}
          <button
            onClick={handleCopyReact}
            className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 text-left transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">
                {copiedAll ? 'Copied to Clipboard!' : 'Copy React Component'}
              </span>
              {copiedAll ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Drop directly into any Next.js or Vite React project.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
