'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCode, Copy, Check, Download, Search, Edit3, Play, FolderTree, Sparkles, Archive
} from 'lucide-react';
import type { CodeFile } from '@/types';
import { downloadZipFile } from '@/lib/zip';

interface CodePanelProps {
  files: CodeFile[];
  title: string;
  onUpdateHtml?: (newHtml: string) => void;
}

export function CodePanel({ files, title, onUpdateHtml }: CodePanelProps) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedToast, setAppliedToast] = useState(false);

  const currentFile = files[activeFileIndex] || files[0] || {
    name: 'index.html',
    language: 'html',
    content: '// No files generated yet',
  };

  useEffect(() => {
    setDraftContent(currentFile.content);
  }, [currentFile.content, activeFileIndex]);

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? draftContent : currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([isEditing ? draftContent : currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name.split('/').pop() || currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = () => {
    const slug = (title || 'aura-project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'aura-project';
    downloadZipFile(`${slug}-codebase.zip`, files);
  };

  const handleApplyEdit = () => {
    if (currentFile.name === 'index.html' && onUpdateHtml) {
      onUpdateHtml(draftContent);
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 2000);
    } else {
      currentFile.content = draftContent;
      setAppliedToast(true);
      setTimeout(() => setAppliedToast(false), 2000);
    }
    setIsEditing(false);
  };

  const rawLines = (isEditing ? draftContent : currentFile.content).split('\n');
  const filteredLines = searchTerm.trim()
    ? rawLines
        .map((line, i) => ({ line, num: i + 1 }))
        .filter((item) => item.line.toLowerCase().includes(searchTerm.toLowerCase()))
    : rawLines.map((line, i) => ({ line, num: i + 1 }));

  return (
    <div className="flex h-full bg-[#09090c] w-full select-none overflow-hidden font-mono">
      {/* Left File Explorer Tree (Desktop) */}
      <aside className="hidden md:flex w-56 border-r border-zinc-800/80 bg-zinc-950/80 flex-col justify-between p-3 shrink-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-2 py-1 text-xs font-sans font-bold text-zinc-300 border-b border-zinc-800/80 pb-2.5">
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{title}</span>
          </div>

          <div className="space-y-1">
            {files.map((file, idx) => {
              const isActive = idx === activeFileIndex;
              return (
                <button
                  key={file.name}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/30 font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600 ml-1">
                    {Math.max(1, Math.round((file.content.length / 1024) * 10) / 10)}kb
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] font-sans text-zinc-400 space-y-1">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Live Sandbox Sync</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Edit <code className="text-amber-300">index.html</code> and click Apply to hot-reload your changes in the preview canvas.
          </p>
        </div>
      </aside>

      {/* Main Editor Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top File Tabs & Actions Toolbar */}
        <div className="h-11 px-4 border-b border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {files.map((file, idx) => {
              const isActive = idx === activeFileIndex;
              return (
                <button
                  key={file.name}
                  onClick={() => {
                    setActiveFileIndex(idx);
                    setIsEditing(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-t-md flex items-center gap-2 transition-all border-b-2 whitespace-nowrap cursor-pointer ${
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

          <div className="flex items-center gap-2 shrink-0">
            {/* Search lines */}
            <div className="relative hidden lg:block">
              <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find in file..."
                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-2.5 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-amber-400 w-36 font-sans"
              />
            </div>

            {isEditing ? (
              <button
                onClick={handleApplyEdit}
                className="px-3 py-1 text-xs rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-sans font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-black" />
                <span>{currentFile.name === 'index.html' ? 'Apply to Sandbox' : 'Save Changes'}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-amber-300 font-sans font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit</span>
              </button>
            )}

            {appliedToast && (
              <span className="text-[11px] text-emerald-400 font-sans font-semibold">Saved!</span>
            )}

            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-sans">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="font-sans">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadZip}
              className="px-2.5 py-1 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer font-sans"
              title="Download full project codebase as .ZIP"
            >
              <Archive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">.ZIP</span>
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 text-xs rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title={`Download ${currentFile.name}`}
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* File description bar */}
        {currentFile.description && (
          <div className="px-4 py-1.5 bg-zinc-950/60 border-b border-zinc-900 text-[11px] font-sans text-zinc-400 flex items-center justify-between">
            <span>{currentFile.description}</span>
            <span className="font-mono text-[10px] text-zinc-500">{rawLines.length} lines</span>
          </div>
        )}

        {/* Code Editor / Viewer Area */}
        <div className="flex-1 overflow-auto bg-[#09090c] p-4 text-xs text-zinc-300 font-mono leading-relaxed custom-scrollbar select-text">
          {isEditing ? (
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[500px] bg-zinc-950/90 border border-amber-500/30 rounded-xl p-4 text-[11px] font-mono text-emerald-300 focus:outline-none resize-none"
            />
          ) : (
            <div className="flex">
              <div className="select-none text-zinc-600 text-right pr-4 border-r border-zinc-800/80 mr-4 font-mono text-[11px] shrink-0">
                {filteredLines.map((item) => (
                  <div key={item.num}>{item.num}</div>
                ))}
              </div>
              <pre className="flex-1 overflow-x-auto text-[11px] font-mono text-zinc-200">
                <code>
                  {filteredLines.map((item) => item.line).join('\n')}
                </code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
