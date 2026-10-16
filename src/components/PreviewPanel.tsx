'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  RotateCw, ExternalLink, Smartphone, Tablet, Monitor, 
  Terminal, ShieldCheck, Check, Copy, Maximize2, Sparkles, 
  AlertCircle, Wrench, X
} from 'lucide-react';

interface PreviewPanelProps {
  htmlCode: string;
  title: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport: (vp: 'desktop' | 'tablet' | 'mobile') => void;
  isGenerating: boolean;
  version: number;
  onAutoFix?: (errorText: string) => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function PreviewPanel({
  htmlCode,
  title,
  viewport,
  onChangeViewport,
  isGenerating,
  version,
  onAutoFix,
  onSelectPrompt,
}: PreviewPanelProps) {
  const [iframeKey, setIframeKey] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; message: string; time: string }[]>([]);
  const [latestError, setLatestError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (!htmlCode) return;
    setLatestError(null);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Listen to messages from sandbox iframe
  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AURA_SANDBOX_LOG') {
        const level = event.data.level || 'info';
        const msg = event.data.message || JSON.stringify(event.data);
        setConsoleLogs((prev) => [
          ...prev.slice(-30),
          {
            type: level,
            message: msg,
            time: new Date().toLocaleTimeString(),
          },
        ]);

        if (level === 'error' && typeof msg === 'string' && msg.trim()) {
          setLatestError(msg.slice(0, 140));
        }
      }
    };

    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, []);

  const sandboxedHtml = React.useMemo(() => {
    if (!htmlCode) return '';
    const telemetryScript = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          function send(level, args) {
            try {
              const message = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
              window.parent.postMessage({ type: 'AURA_SANDBOX_LOG', level: level, message: message }, '*');
            } catch(e) {}
          }
          console.log = function(...args) { originalLog.apply(console, args); send('info', args); };
          console.warn = function(...args) { originalWarn.apply(console, args); send('warn', args); };
          console.error = function(...args) { originalError.apply(console, args); send('error', args); };
          window.addEventListener('error', function(e) {
            send('error', [e.message]);
          });
          // Auto-render Lucide icons on any dynamic DOM changes
          if (window.MutationObserver) {
            const observer = new MutationObserver(function() {
              if (window.lucide && window.lucide.createIcons) {
                window.lucide.createIcons();
              }
            });
            window.addEventListener('load', function() {
              if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
              }
            });
          }
        })();
      </script>
    `;

    if (htmlCode.includes('<head>')) {
      return htmlCode.replace('<head>', `<head>${telemetryScript}`);
    } else if (htmlCode.includes('<head ')) {
      return htmlCode.replace(/<head[^>]*>/, `$&${telemetryScript}`);
    } else if (htmlCode.includes('<!DOCTYPE') || htmlCode.includes('<html')) {
      return htmlCode.replace(/<html[^>]*>/, `$&<head>${telemetryScript}</head>`);
    } else {
      return `${telemetryScript}${htmlCode}`;
    }
  }, [htmlCode]);

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
            <span className="text-zinc-200 truncate">{htmlCode ? title.toLowerCase().replace(/\s+/g, '-') : 'new-app'}</span>
            <span className="text-zinc-500 ml-auto text-[10px]">{htmlCode ? `v${version}.0` : 'canvas'}</span>
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
            disabled={!htmlCode}
            className={`p-1.5 rounded-md border transition-colors ${
              htmlCode ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-zinc-800' : 'text-zinc-700 border-zinc-900 cursor-not-allowed'
            }`}
            title="Reload sandbox preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Open in new window */}
          <button
            onClick={handleOpenNewTab}
            disabled={!htmlCode}
            className={`p-1.5 rounded-md border transition-colors ${
              htmlCode ? 'text-zinc-400 hover:text-white hover:bg-zinc-900 border-zinc-800' : 'text-zinc-700 border-zinc-900 cursor-not-allowed'
            }`}
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Self-Healing Diagnostic Alert Bar */}
      {latestError && (
        <div className="bg-amber-950/80 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-200 truncate">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-white">Sandbox Exception:</span>
            <span className="truncate font-mono text-[11px] text-amber-300">{latestError}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            {onAutoFix && (
              <button
                onClick={() => {
                  onAutoFix(latestError);
                  setLatestError(null);
                }}
                className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-[11px] flex items-center gap-1 shadow-sm"
              >
                <Wrench className="w-3 h-3" />
                <span>Auto-Fix with Aura</span>
              </button>
            )}
            <button
              onClick={() => setLatestError(null)}
              className="p-1 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Preview Sandbox Canvas */}
      <div className="flex-1 bg-zinc-950/40 relative flex items-center justify-center p-4 overflow-auto custom-scrollbar">
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
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-spin">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <p className="text-xs font-semibold text-white tracking-wide">
              Aura Autonomous Engine is compiling code into live sandbox...
            </p>
          </div>
        )}

        {/* Conditional Content: Empty Lovable Canvas vs Sandboxed Iframe */}
        {!htmlCode || htmlCode.trim() === '' ? (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl text-center space-y-6 relative z-10 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 via-zinc-800 to-zinc-900 border border-amber-400/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ready to Synthesize</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Your application canvas is clear
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Describe your application in the copilot panel on the left. Aura Autonomous Engine will write, compile, and live-render your reactive interface right here.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 space-y-2.5">
              <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Or launch with an architectural idea:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: '⚡ SaaS Revenue Analytics', prompt: 'Build a high-conversion SaaS analytics dashboard with revenue metrics, retention charts, and active user breakdown' },
                  { label: '💳 Crypto Portfolio Desk', prompt: 'Build an ultra-modern crypto trading desk with live order books, token swaps, and multi-asset performance charts' },
                  { label: '📋 Sprint Kanban Studio', prompt: 'Build a drag-and-drop style collaborative Kanban board with task priority tags, member avatars, and column metrics' },
                  { label: '🛍️ Luxe Minimal Storefront', prompt: 'Build a luxury minimalist e-commerce storefront with product cards, category filters, interactive cart drawer, and checkout modal' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectPrompt?.(item.prompt)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/40 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 group"
                  >
                    <span>{item.label}</span>
                    <Sparkles className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={`transition-all duration-300 flex items-center justify-center ${viewportStyles}`}>
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={sandboxedHtml}
              title={title}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
              className="w-full h-full bg-black border-0"
            />
          </div>
        )}
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
        <div className="h-44 border-t border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] overflow-y-auto custom-scrollbar z-30">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-zinc-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Runtime Logs & Sandbox Diagnostics</span>
            </span>
            <button
              onClick={() => setConsoleLogs([])}
              className="hover:text-white text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1 pt-2">
            <div className="text-zinc-500">[System] Sandbox mounted with Tailwind CSS, Lucide icons, and reactive state telemetry.</div>
            {consoleLogs.map((log, idx) => (
              <div 
                key={idx} 
                className={`${log.type === 'error' ? 'text-red-400 bg-red-950/20 px-1 py-0.5 rounded' : log.type === 'warn' ? 'text-amber-400' : 'text-zinc-300'}`}
              >
                <span className="text-zinc-500">[{log.time}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
