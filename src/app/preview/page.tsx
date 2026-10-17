'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft, ExternalLink, Monitor, Tablet, Smartphone, RotateCw } from 'lucide-react';
import { synthesizeAppFromPrompt } from '@/lib/templates';

function StandalonePreviewContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const titleParam = searchParams.get('title') || 'Aura Application';
  const promptParam = searchParams.get('prompt') || titleParam;
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // 1. Try to load by ID from local storage
    if (idParam) {
      try {
        const localRaw = localStorage.getItem('aura_local_projects');
        if (localRaw) {
          const list = JSON.parse(localRaw);
          const found = list.find((p: any) => p.id === idParam);
          if (found && found.html) {
            setHtmlCode(found.html);
            return;
          }
        }
      } catch {}

      // Try fetching from public API
      fetch(`/api/projects/${idParam}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data && data.html) setHtmlCode(data.html);
        })
        .catch(() => {});
    }

    // 2. Try active studio session
    try {
      const savedSession = localStorage.getItem('aura_active_studio_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.htmlCode && parsed.htmlCode.trim().length > 50) {
          setHtmlCode(parsed.htmlCode);
          return;
        }
      }
    } catch {}

    // 3. Fallback to synthesis
    const synth = synthesizeAppFromPrompt(promptParam);
    setHtmlCode(synth.htmlCode);
  }, [idParam, promptParam]);

  const frameWidth = viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%';

  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] text-white overflow-hidden select-none">
      {/* Sleek Floating Studio Banner */}
      <div className="h-11 px-4 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="text-zinc-400 hover:text-white flex items-center gap-1.5 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Studio</span>
          </Link>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="font-semibold text-white truncate max-w-[200px]">{titleParam}</span>
          <span className="hidden md:inline text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Live Sandbox
          </span>
        </div>

        {/* Viewport switch & refresh */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded transition-colors ${viewport === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Desktop"
            >
              <Monitor className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded transition-colors ${viewport === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Tablet"
            >
              <Tablet className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded transition-colors ${viewport === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Mobile"
            >
              <Smartphone className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Reload preview"
          >
            <RotateCw className="w-3 h-3" />
          </button>

          <Link
            href={`/studio?prompt=${encodeURIComponent(promptParam)}`}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Fork in Studio</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="flex-1 w-full h-full bg-[#09090b] flex items-center justify-center overflow-auto p-0 sm:p-2">
        {htmlCode ? (
          <div
            style={{ width: frameWidth, height: viewport === 'desktop' ? '100%' : viewport === 'mobile' ? '720px' : '92%' }}
            className={`transition-all duration-200 ${viewport !== 'desktop' ? 'rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden my-auto' : 'w-full h-full'}`}
          >
            <iframe
              key={refreshKey}
              title={titleParam}
              srcDoc={htmlCode}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
              className="w-full h-full border-0 bg-[#09090b]"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 font-mono">
            Initializing Aura Standalone Sandbox...
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#09090b] flex items-center justify-center text-amber-400 font-mono text-xs">
          Loading Live Preview...
        </div>
      }
    >
      <StandalonePreviewContent />
    </Suspense>
  );
}
