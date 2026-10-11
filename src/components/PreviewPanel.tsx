'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, ExternalLink, Smartphone, Tablet, Monitor, 
  Terminal, ShieldCheck, Check, Copy, Maximize2, Sparkles, AlertCircle
} from 'lucide-react';

interface PreviewPanelProps {
  htmlCode: string;
  title: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;
  isGenerating: boolean;
  version: number;
}

export function PreviewPanel({
  htmlCode,
  title,
  viewport,
  onChangeViewport,
  isGenerating,
  version,
}: PreviewPanelProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; message: string; time: string }[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Listen to messages from sandbox iframe
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AURA_SANDBOX_LOG') {
        setConsoleLogs((prev) => [
          ...prev.slice(-20),
          {
            type: event.data.level || 'info',
            message: event.data.message || JSON.stringify(event.data),
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  const viewportStyles = {
    desktop: 'w-full h-full rounded-none border-0',
    tablet: 'w-[768px] max-w-full h-[92%] my-auto rounded-2xl border-2 border-zinc-700 shadow-2xl overflow-hidden',
    mobile: 'w-[375px] max-w-full h-[680px] my-auto rounded-3xl border-4 border-zinc-700 shadow-2xl overflow-hidden',
  }[viewport];

  return (
    <div className="flex flex-col h-full bg-[#09090c] w-full relative overflow-hidden select-none">
      {/* Top Preview Toolbar */}
      <div className="h-10 px-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between z-10">
        {/* Mock browser address bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 w-full font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-zinc-500">https://aura.build/sandbox/</span>
            <span className="text-zinc-200 truncate">{title.toLowerCase().replace(/\s+/g, '-')}</span>
            <span className="text-zinc-500 ml-auto text-[10px]">v{version}.0</span>
          </div>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center gap-2">
          {/* Viewport indicators */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-zinc-400">
            <button
              onClick={() => onChangeViewport('desktop')}
              className={`p-1 rounded ${viewport === 'desktop' ? 'bg-zinc-800 text-white' : 'hover:text-white'}`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3 h-3" />
            </button>
            <button
              onClick={() => onChangeViewport('tablet')}
              className={`p-1 rounded ${viewport === 'tablet' ? 'bg-zinc-800 text-white' : 'hover:text-white'}`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3 h-3" />
            </button>
            <button
              onClick={() => onChangeViewport('mobile')}
              className={`p-1 rounded ${viewport === 'mobile' ? 'bg-zinc-800 text-white' : 'hover:text-white'}`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3 h-3" />
            </button>
          </div>

          {/* Refresh iframe */}
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
            title="Reload sandbox preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Open in new window */}
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Sandbox Canvas */}
      <div className="flex-1 bg-zinc-950/40 relative flex items-center justify-center p-2 overflow-auto custom-scrollbar">
        {/* Ambient Grid Wallpaper */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3f3f46 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-spin">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-xs font-semibold text-white tracking-wide">
              Rendering interactive application in live sandbox...
            </p>
          </div>
        )}

        {/* Sandboxed Interactive Iframe */}
        <div className={`transition-all duration-300 flex items-center justify-center ${viewportStyles}`}>
          <iframe
            key={iframeKey}
            ref={iframeRef}
            srcDoc={htmlCode}
            title={title}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
            className="w-full h-full bg-black border-0"
          />
        </div>
      </div>

      {/* Bottom Status & Console Bar */}
      <div className="h-7 px-4 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>Console</span>
            {consoleLogs.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
          <span>|</span>
          <span className="text-[10px] text-zinc-500 font-mono">
            {viewport === 'desktop' ? '100% Responsive' : viewport === 'tablet' ? '768 x 1024px' : '375 x 812px'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Interactive Sandbox Ready</span>
        </div>
      </div>

      {/* Console Drawer */}
      {showConsole && (
        <div className="h-40 border-t border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar z-30">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-zinc-400">
            <span>Runtime Logs & Sandbox Diagnostics</span>
            <button
              onClick={() => setConsoleLogs([])}
              className="hover:text-white text-[10px]"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 pt-2">
            <div className="text-zinc-500">[System] Sandbox mounted with Tailwind CSS and Lucide engine.</div>
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="text-zinc-300">
                <span className="text-zinc-500">[{log.time}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
