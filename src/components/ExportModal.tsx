'use client';

import React, { useState } from 'react';
import { X, Download, FileCode, Check, Copy, Package, Terminal, Archive } from 'lucide-react';
import type { CodeFile } from '@/types';
import { downloadZipFile } from '@/lib/zip';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  files: CodeFile[];
  htmlCode: string;
}

export function ExportModal({ isOpen, onClose, title, files, htmlCode }: ExportModalProps) {
  const [copiedReact, setCopiedReact] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const slug = (title || 'aura-app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'aura-app';

  const handleDownloadZip = () => {
    try {
      setDownloadingZip(true);
      downloadZipFile(`${slug}-codebase.zip`, files);
      setTimeout(() => setDownloadingZip(false), 1500);
    } catch (err) {
      console.error('[aura] Zip export error:', err);
      setDownloadingZip(false);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReact = () => {
    const reactFile = files.find((f) => f.name.includes('App.tsx')) || files[0];
    if (reactFile) {
      navigator.clipboard.writeText(reactFile.content);
      setCopiedReact(true);
      setTimeout(() => setCopiedReact(false), 2000);
    }
  };

  const handleDownloadProjectBundle = () => {
    handleDownloadZip();
  };

  const handleDownloadSingleFile = (file: CodeFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.split('/').pop() || file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cliCommand = `npx create-next-app@latest ${slug} --typescript --tailwind --eslint`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#0e0e13] border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Export Production Codebase</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Aura compiles your application into both a zero-dependency standalone HTML5 runtime and a structured Next.js 16 / React 19 TypeScript codebase.
        </p>

        {/* Primary Export Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadHtml}
            className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">Standalone HTML</span>
              <FileCode className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Single-file deployable bundle with Tailwind &amp; Lucide.
            </p>
          </button>

          <button
            onClick={handleCopyReact}
            className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">
                {copiedReact ? 'Copied App.tsx!' : 'Copy React 19 TSX'}
              </span>
              {copiedReact ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Copy <code className="text-zinc-300">src/App.tsx</code> to clipboard.
            </p>
          </button>

          <button
            onClick={handleDownloadZip}
            className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-900 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-xs">
                {downloadingZip ? 'Packaging ZIP...' : 'Download .ZIP'}
              </span>
              <Archive className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Full 6-file Next.js &amp; React 19 project archive.
            </p>
          </button>
        </div>

        {/* Individual File Downloads */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Compiled Project Files ({files.length})
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => handleDownloadSingleFile(file)}
                className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white flex items-center justify-between transition-all cursor-pointer"
              >
                <span className="font-mono text-[11px] truncate">{file.name}</span>
                <Download className="w-3 h-3 text-zinc-500 shrink-0 ml-1.5" />
              </button>
            ))}
          </div>
        </div>

        {/* CLI Quickstart */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 truncate text-zinc-300">
            <Terminal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{cliCommand}</span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(cliCommand);
              setCopiedCli(true);
              setTimeout(() => setCopiedCli(false), 1800);
            }}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] shrink-0"
          >
            {copiedCli ? 'Copied' : 'Copy CLI'}
          </button>
        </div>
      </div>
    </div>
  );
}
