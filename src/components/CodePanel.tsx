'use client';

import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, Layers } from 'lucide-react';

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

interface CodePanelProps {
  files: CodeFile[];
  title: string;
}

export function CodePanel({ files, title }: CodePanelProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = files[activeFileIndex] || files[0] || {
    name: 'App.tsx',
    language: 'typescript',
    content: '// No files generated yet',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = currentFile.content.split('\n');

  return (
    <div className="flex flex-col h-full bg-[#0d0d11] w-full select-none overflow-hidden font-mono">
      {/* File Tabs & Actions Toolbar */}
      <div className="h-10 px-4 border-b border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between">
        {/* Tab list */}
        <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {files.map((file, idx) => {
            const isActive = idx === activeFileIndex;
            return (
              <button
                key={file.name}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-3 py-1.5 text-xs rounded-t-md flex items-center gap-2 transition-all border-b-2 ${
                  isActive
                    ? 'bg-zinc-900 text-white border-amber-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 border-transparent hover:bg-zinc-900/40'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Copy & Download Actions */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 mr-2 hidden sm:inline">
            {lines.length} lines • {Math.round(currentFile.content.length / 1024 * 10) / 10} KB
          </span>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-sans">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="font-sans">Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="p-1 text-xs rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Editor Preview Area */}
      <div className="flex-1 overflow-auto bg-[#09090c] p-4 text-xs text-zinc-300 font-mono leading-relaxed custom-scrollbar">
        <div className="flex">
          {/* Line Numbers */}
          <div className="select-none text-zinc-600 text-right pr-4 border-r border-zinc-800/80 mr-4 font-mono text-[11px] shrink-0">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Actual Code content */}
          <pre className="flex-1 overflow-x-auto text-[11px] font-mono text-zinc-200">
            <code>{currentFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
