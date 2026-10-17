'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, AlertCircle, Wrench, X, MousePointerClick, Send, Type,
  Sliders, Monitor, Tablet, Smartphone, Laptop, ZoomIn, ZoomOut,
  RotateCcw, Palette, Check, Terminal, Trash2
} from 'lucide-react';

interface PreviewPanelProps {
  htmlCode: string;
  title: string;
  viewport: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport?: (vp: 'desktop' | 'tablet' | 'mobile') => void;
  isGenerating: boolean;
  version: number;
  inspectMode?: boolean;
  onCloseInspect?: () => void;
  iframeKey?: number;
  onAutoFix?: (errorText: string) => void;
  onSelectPrompt?: (prompt: string) => void;
  onUpdateHtml?: (newHtml: string) => void;
}

interface SelectedElementInfo {
  tagName: string;
  text: string;
  classes: string;
}

export interface ConsoleLogItem {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
}

export function PreviewPanel({
  htmlCode,
  title,
  viewport,
  onChangeViewport,
  isGenerating,
  inspectMode = false,
  onCloseInspect,
  iframeKey = 0,
  onAutoFix,
  onSelectPrompt,
  onUpdateHtml,
}: PreviewPanelProps) {
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo | null>(null);
  const [liveTextEdit, setLiveTextEdit] = useState('');
  const [elementAiPrompt, setElementAiPrompt] = useState('');
  const [latestError, setLatestError] = useState<string | null>(null);
  const [logs, setLogs] = useState<ConsoleLogItem[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'errors' | 'warnings'>('all');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Dynamic Responsive Viewport & UI Tuning State
  const [customWidth, setCustomWidth] = useState<number>(-1); // -1 = fluid 100%
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [showTuning, setShowTuning] = useState(false);
  const [borderRadius, setBorderRadius] = useState<number>(12);
  const [fontScale, setFontScale] = useState<number>(100);
  const [spacingScale, setSpacingScale] = useState<number>(1.0);
  const [accentHue, setAccentHue] = useState<number>(0);
  const [tuningCommitted, setTuningCommitted] = useState(false);

  // Sync preset viewport from props
  useEffect(() => {
    if (viewport === 'desktop') setCustomWidth(-1);
    else if (viewport === 'tablet') setCustomWidth(768);
    else if (viewport === 'mobile') setCustomWidth(375);
  }, [viewport]);

  const broadcastTuning = useCallback((r: number, f: number, s: number, h: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'AURA_TUNE_STYLE',
        borderRadius: r,
        fontScale: f,
        spacing: s,
        accentHue: h,
      },
      '*'
    );
  }, []);

  const handleTuningChange = (
    nextRadius = borderRadius,
    nextFont = fontScale,
    nextSpacing = spacingScale,
    nextHue = accentHue
  ) => {
    setBorderRadius(nextRadius);
    setFontScale(nextFont);
    setSpacingScale(nextSpacing);
    setAccentHue(nextHue);
    broadcastTuning(nextRadius, nextFont, nextSpacing, nextHue);
  };

  // Sync inspectMode state with iframe
  useEffect(() => {
    if (!inspectMode) {
      setSelectedElement(null);
    }
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'AURA_SET_INSPECT_MODE', enabled: inspectMode },
      '*'
    );
  }, [inspectMode]);

  const handleApplyLiveText = () => {
    if (!selectedElement || !liveTextEdit.trim()) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'AURA_UPDATE_ELEMENT_TEXT', text: liveTextEdit },
      '*'
    );
    if (onUpdateHtml && selectedElement.text && htmlCode.includes(selectedElement.text)) {
      onUpdateHtml(htmlCode.replace(selectedElement.text, liveTextEdit));
    }
    setSelectedElement({ ...selectedElement, text: liveTextEdit });
  };

  const handleSendElementPrompt = () => {
    if (!selectedElement || !elementAiPrompt.trim() || !onSelectPrompt) return;
    const contextualPrompt = `Update the <${selectedElement.tagName.toLowerCase()}> element (currently showing "${selectedElement.text.slice(0, 60)}"): ${elementAiPrompt.trim()}`;
    onSelectPrompt(contextualPrompt);
    setElementAiPrompt('');
    setSelectedElement(null);
    onCloseInspect?.();
  };

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.type === 'AURA_SANDBOX_LOG') {
        const level: 'log' | 'info' | 'warn' | 'error' = event.data.level || 'info';
        const msg = String(event.data.message || '');
        if (level === 'error' && msg.trim()) {
          setLatestError(msg.slice(0, 140));
        }
        setLogs((prev) => [
          ...prev.slice(-99),
          {
            id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            level,
            message: msg,
            timestamp: Date.now(),
          },
        ]);
      } else if (event.data.type === 'AURA_ELEMENT_SELECTED') {
        const info: SelectedElementInfo = {
          tagName: event.data.tagName || 'DIV',
          text: (event.data.text || '').trim().slice(0, 120),
          classes: event.data.classes || '',
        };
        setSelectedElement(info);
        setLiveTextEdit(info.text);
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
          const origLog = console.log;
          const origInfo = console.info;
          const origWarn = console.warn;
          const origError = console.error;
          function send(level, args) {
            try {
              const message = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
              window.parent.postMessage({ type: 'AURA_SANDBOX_LOG', level: level, message: message }, '*');
            } catch(e) {}
          }
          console.log = function(...args) { origLog.apply(console, args); send('log', args); };
          console.info = function(...args) { origInfo.apply(console, args); send('info', args); };
          console.warn = function(...args) { origWarn.apply(console, args); send('warn', args); };
          console.error = function(...args) { origError.apply(console, args); send('error', args); };
          window.addEventListener('error', function(e) {
            send('error', [e.message || 'Script error']);
          });
          window.addEventListener('unhandledrejection', function(e) {
            send('error', ['Unhandled Promise Rejection: ' + (e.reason ? (e.reason.message || e.reason) : 'Unknown')]);
          });

          let inspectEnabled = false;
          let hoveredEl = null;
          let selectedEl = null;

          window.addEventListener('message', function(ev) {
            if (!ev.data) return;
            if (ev.data.type === 'AURA_SET_INSPECT_MODE') {
              inspectEnabled = Boolean(ev.data.enabled);
              if (!inspectEnabled && hoveredEl) {
                hoveredEl.style.outline = '';
                hoveredEl = null;
              }
              if (!inspectEnabled && selectedEl) {
                selectedEl.style.outline = '';
                selectedEl = null;
              }
              document.body.style.cursor = inspectEnabled ? 'crosshair' : '';
            } else if (ev.data.type === 'AURA_UPDATE_ELEMENT_TEXT' && selectedEl) {
              selectedEl.innerText = ev.data.text;
            } else if (ev.data.type === 'AURA_TUNE_STYLE') {
              const d = ev.data;
              let s = document.getElementById('aura-live-tuning-style');
              if (!s) {
                s = document.createElement('style');
                s.id = 'aura-live-tuning-style';
                document.head.appendChild(s);
              }
              const rules = [];
              if (typeof d.borderRadius === 'number') {
                rules.push('.rounded-2xl, .rounded-xl, .rounded-3xl, .rounded-lg, button, input, select { border-radius: ' + d.borderRadius + 'px !important; }');
              }
              if (typeof d.fontScale === 'number') {
                rules.push('html { font-size: ' + d.fontScale + '% !important; }');
              }
              if (typeof d.spacing === 'number') {
                rules.push('body { line-height: ' + (1.4 * d.spacing) + ' !important; }');
              }
              if (typeof d.accentHue === 'number' && d.accentHue !== 0) {
                rules.push('body { filter: hue-rotate(' + d.accentHue + 'deg) !important; }');
              } else if (d.accentHue === 0) {
                rules.push('body { filter: none !important; }');
              }
              s.innerHTML = rules.join('\n');
            }
          });

          document.addEventListener('mouseover', function(e) {
            if (!inspectEnabled) return;
            if (hoveredEl && hoveredEl !== selectedEl) hoveredEl.style.outline = '';
            hoveredEl = e.target;
            if (hoveredEl && hoveredEl !== document.body && hoveredEl !== document.documentElement) {
              hoveredEl.style.outline = '2px dashed #fbbf24';
              hoveredEl.style.outlineOffset = '2px';
            }
          }, true);

          document.addEventListener('mouseout', function(e) {
            if (!inspectEnabled) return;
            if (e.target && e.target !== selectedEl) {
              e.target.style.outline = '';
            }
          }, true);

          document.addEventListener('click', function(e) {
            if (!inspectEnabled) return;
            e.preventDefault();
            e.stopPropagation();
            if (selectedEl) selectedEl.style.outline = '';
            selectedEl = e.target;
            selectedEl.style.outline = '2px solid #10b981';
            selectedEl.style.outlineOffset = '2px';
            window.parent.postMessage({
              type: 'AURA_ELEMENT_SELECTED',
              tagName: selectedEl.tagName,
              text: selectedEl.innerText || '',
              classes: selectedEl.className || ''
            }, '*');
          }, true);

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

  const isConstrained = customWidth > 0;
  const frameClasses = isConstrained
    ? customWidth <= 425
      ? 'rounded-3xl border-2 border-zinc-700 shadow-2xl shadow-black/80 overflow-hidden my-auto'
      : 'rounded-2xl border border-zinc-800 shadow-2xl shadow-black/80 overflow-hidden my-auto'
    : 'w-full h-full rounded-none border-0';

  const containerStyle: React.CSSProperties = {
    width: customWidth > 0 ? `${customWidth}px` : '100%',
    maxWidth: '100%',
    height: customWidth > 0 ? (customWidth <= 425 ? '720px' : '94%') : '100%',
    transform: `scale(${zoomScale / 100})`,
    transformOrigin: 'center center',
    transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s ease-out',
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] w-full relative overflow-hidden select-none">
      {/* Visual Element Inspector Bar (Only shown when Inspect Mode is toggled on) */}
      {inspectMode && (
        <div className="bg-zinc-900/95 border-b border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-md">
          {!selectedElement ? (
            <div className="flex items-center justify-between w-full text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
                <span>Click any element in the preview to edit its text or ask Aura to modify it.</span>
              </div>
              <button onClick={onCloseInspect} className="text-zinc-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5 w-full">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                &lt;{selectedElement.tagName.toLowerCase()}&gt;
              </span>

              <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                <Type className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  value={liveTextEdit}
                  onChange={(e) => setLiveTextEdit(e.target.value)}
                  placeholder="Edit text..."
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-zinc-600"
                />
                <button
                  onClick={handleApplyLiveText}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium shrink-0"
                >
                  Apply
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                <input
                  type="text"
                  value={elementAiPrompt}
                  onChange={(e) => setElementAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendElementPrompt()}
                  placeholder="Ask AI to change this element..."
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white flex-1 focus:outline-none focus:border-zinc-600"
                />
                <button
                  onClick={handleSendElementPrompt}
                  className="px-2.5 py-1 rounded-lg bg-white text-black text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>Update</span>
                </button>
              </div>

              <button onClick={onCloseInspect} className="p-1 text-zinc-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Self-Healing Runtime Error Banner */}
      {latestError && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between text-xs z-20">
          <div className="flex items-center gap-2 text-zinc-300 truncate">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate font-mono text-[11px]">{latestError}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            {onAutoFix && (
              <button
                onClick={() => {
                  onAutoFix(latestError);
                  setLatestError(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-white text-black font-semibold text-[11px] flex items-center gap-1"
              >
                <Wrench className="w-3 h-3" />
                <span>Fix error</span>
              </button>
            )}
            <button onClick={() => setLatestError(null)} className="p-1 text-zinc-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Preview Canvas */}
      <div className="flex-1 bg-[#09090b] relative flex items-center justify-center overflow-auto custom-scrollbar">
        {/* Subtle Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
            <p className="text-xs font-medium text-zinc-300">
              Building your application...
            </p>
          </div>
        )}

        {/* Empty State vs Live Sandboxed Application */}
        {!htmlCode || htmlCode.trim() === '' ? (
          <div className="max-w-md mx-auto p-8 text-center space-y-5 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
              <Sparkles className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-white">
                Ready to build
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Describe your app or website in the chat panel on the left, or choose a starter below.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {[
                { label: 'SaaS Analytics', prompt: 'Build a SaaS revenue and cohort intelligence dashboard with multi-view navigation, interactive SVG chart, and customer CRUD table' },
                { label: 'Startup Website', prompt: 'Build a high-conversion interactive SaaS startup website with hero product simulator, ROI pricing calculator, and demo booking modal' },
                { label: 'E-Commerce Store', prompt: 'Build a luxury minimalist e-commerce storefront with category filters, shopping bag drawer, promo code AURA20, and checkout modal' },
                { label: 'Kanban Workspace', prompt: 'Build an agile Kanban project board with 4 status columns, task stage transitions, sprint burnup bar, and new task modal' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectPrompt?.(item.prompt)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/90 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={containerStyle} className={`transition-all duration-300 flex items-center justify-center ${frameClasses}`}>
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={sandboxedHtml}
              title={title}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin allow-popups"
              className="w-full h-full bg-[#09090b] border-0"
            />
          </div>
        )}

        {/* Dynamic Responsive & Design Sliders Dock */}
        {htmlCode && htmlCode.trim() !== '' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 max-w-[95vw]">
            {/* Live UI Design Sliders Popover */}
            {showTuning && (
              <div className="w-[340px] sm:w-[380px] bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-3.5 backdrop-blur-xl text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">Live Design Sliders</span>
                  </div>
                  <button
                    onClick={() => setShowTuning(false)}
                    className="text-zinc-500 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Slider 1: Corner Radius */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Border Radius</span>
                    <span className="font-mono text-amber-300 font-bold">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    step="2"
                    value={borderRadius}
                    onChange={(e) => handleTuningChange(Number(e.target.value), fontScale, spacingScale, accentHue)}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                    <span>Sharp (0px)</span>
                    <span>Balanced (12px)</span>
                    <span>Pill (24px)</span>
                  </div>
                </div>

                {/* Slider 2: Typography Scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Typography Scale</span>
                    <span className="font-mono text-emerald-400 font-bold">{fontScale}%</span>
                  </div>
                  <input
                    type="range"
                    min="85"
                    max="120"
                    step="5"
                    value={fontScale}
                    onChange={(e) => handleTuningChange(borderRadius, Number(e.target.value), spacingScale, accentHue)}
                    className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                    <span>Compact (85%)</span>
                    <span>Standard (100%)</span>
                    <span>Large (120%)</span>
                  </div>
                </div>

                {/* Slider 3: UI Spacing Density */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Layout Spacing Density</span>
                    <span className="font-mono text-blue-400 font-bold">{spacingScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.3"
                    step="0.05"
                    value={spacingScale}
                    onChange={(e) => handleTuningChange(borderRadius, fontScale, Number(e.target.value), accentHue)}
                    className="w-full accent-blue-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                    <span>Tight (0.75x)</span>
                    <span>Normal (1.0x)</span>
                    <span>Roomy (1.3x)</span>
                  </div>
                </div>

                {/* Slider 4: Accent Hue Rotation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-400">Palette Hue Shift</span>
                    <span className="font-mono text-purple-400 font-bold">{accentHue}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={accentHue}
                    onChange={(e) => handleTuningChange(borderRadius, fontScale, spacingScale, Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                    <span>Default (0°)</span>
                    <span>Complementary (180°)</span>
                    <span>Cycle (360°)</span>
                  </div>
                </div>

                {/* Action: Commit to Prompt */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTuningChange(12, 100, 1.0, 0)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectPrompt) {
                        onSelectPrompt(
                          `Refactor the application styling: set corner border-radius to ${borderRadius}px, typography base scale to ${fontScale}%, and spacing layout multiplier to ${spacingScale}x throughout.`
                        );
                        setShowTuning(false);
                      }
                    }}
                    className="px-3 py-1 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Persist with AI</span>
                  </button>
                </div>
              </div>
            )}

            {/* Dock Toolbar */}
            <div className="flex items-center gap-2 bg-zinc-950/90 border border-zinc-800/90 px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-xl">
              {/* Viewport Presets */}
              <div className="flex items-center gap-1 border-r border-zinc-800 pr-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomWidth(375);
                    onChangeViewport?.('mobile');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    customWidth === 375 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Mobile (375px)"
                >
                  <Smartphone className="w-3 h-3" />
                  <span className="hidden sm:inline">375</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomWidth(768);
                    onChangeViewport?.('tablet');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    customWidth === 768 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Tablet (768px)"
                >
                  <Tablet className="w-3 h-3" />
                  <span className="hidden sm:inline">768</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomWidth(1024);
                    onChangeViewport?.('desktop');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    customWidth === 1024 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Laptop (1024px)"
                >
                  <Laptop className="w-3 h-3" />
                  <span className="hidden sm:inline">1024</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomWidth(-1);
                    onChangeViewport?.('desktop');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    customWidth === -1 ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Fluid Desktop (100%)"
                >
                  <Monitor className="w-3 h-3" />
                  <span className="hidden sm:inline">Fluid</span>
                </button>
              </div>

              {/* Dynamic Responsive Viewport Slider */}
              <div className="hidden md:flex items-center gap-2 border-r border-zinc-800 pr-2">
                <span className="text-[10px] text-zinc-500 font-mono">Width:</span>
                <input
                  type="range"
                  min="360"
                  max="1440"
                  step="20"
                  value={customWidth > 0 ? customWidth : 1440}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-24 lg:w-32 accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded appearance-none"
                />
                <span className="font-mono text-[10px] text-amber-300 font-semibold min-w-[44px]">
                  {customWidth > 0 ? `${customWidth}px` : '100%'}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 border-r border-zinc-800 pr-2">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(60, z - 10))}
                  className="p-1 rounded-md text-zinc-400 hover:text-white cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="font-mono text-[10px] text-zinc-300 min-w-[32px] text-center">
                  {zoomScale}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(130, z + 10))}
                  className="p-1 rounded-md text-zinc-400 hover:text-white cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
                {zoomScale !== 100 && (
                  <button
                    type="button"
                    onClick={() => setZoomScale(100)}
                    className="p-1 rounded-md text-zinc-500 hover:text-amber-400 cursor-pointer"
                    title="Reset zoom to 100%"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>

              {/* Design Sliders Button */}
              <button
                type="button"
                onClick={() => setShowTuning((v) => !v)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  showTuning
                    ? 'bg-amber-400 text-black font-bold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                }`}
                title="Open Live UI Sliders"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tune UI</span>
              </button>

              {/* DevTools Console Button */}
              <button
                type="button"
                onClick={() => setShowConsole((v) => !v)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  showConsole
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                    : logs.filter((l) => l.level === 'error').length > 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800'
                }`}
                title="Toggle DevTools Console"
              >
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Console</span>
                {logs.filter((l) => l.level === 'error').length > 0 ? (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {logs.filter((l) => l.level === 'error').length}
                  </span>
                ) : logs.length > 0 ? (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {logs.length}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        )}

        {/* Interactive DevTools Console Drawer */}
        {showConsole && htmlCode && htmlCode.trim() !== '' && (
          <div className="absolute bottom-16 left-4 right-4 sm:left-8 sm:right-8 max-h-64 h-60 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden backdrop-blur-xl">
            {/* Header */}
            <div className="h-9 px-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs font-sans shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sandbox Console</span>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <button
                    onClick={() => setConsoleFilter('all')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      consoleFilter === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    All ({logs.length})
                  </button>
                  <button
                    onClick={() => setConsoleFilter('errors')}
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                      consoleFilter === 'errors' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-500 hover:text-rose-400'
                    }`}
                  >
                    <span>Errors</span>
                    {logs.filter((l) => l.level === 'error').length > 0 && (
                      <span className="px-1 rounded bg-rose-500 text-white text-[9px] font-bold">
                        {logs.filter((l) => l.level === 'error').length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setConsoleFilter('warnings')}
                    className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                      consoleFilter === 'warnings' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-500 hover:text-amber-400'
                    }`}
                  >
                    Warnings
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLogs([])}
                  className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Clear console"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowConsole(false)}
                  className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Close console"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Log Messages Stream */}
            <div className="flex-1 overflow-y-auto p-2.5 font-mono text-xs space-y-1 custom-scrollbar">
              {logs.filter((l) => {
                if (consoleFilter === 'errors') return l.level === 'error';
                if (consoleFilter === 'warnings') return l.level === 'warn';
                return true;
              }).length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-600 text-[11px]">
                  No console messages recorded. Runtime events will stream here.
                </div>
              ) : (
                logs
                  .filter((l) => {
                    if (consoleFilter === 'errors') return l.level === 'error';
                    if (consoleFilter === 'warnings') return l.level === 'warn';
                    return true;
                  })
                  .map((log) => {
                    const isErr = log.level === 'error';
                    const isWarn = log.level === 'warn';
                    return (
                      <div
                        key={log.id}
                        className={`px-2.5 py-1.5 rounded-lg flex items-start justify-between gap-3 text-[11px] leading-relaxed border ${
                          isErr
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                            : isWarn
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                            : 'bg-zinc-900/40 border-zinc-850 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-start gap-2 overflow-hidden">
                          <span
                            className={`uppercase font-bold text-[9px] px-1 rounded shrink-0 mt-0.5 ${
                              isErr
                                ? 'bg-rose-500 text-white'
                                : isWarn
                                ? 'bg-amber-500 text-black'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {log.level}
                          </span>
                          <span className="whitespace-pre-wrap break-all">{log.message}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] text-zinc-600">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                          {isErr && onAutoFix && (
                            <button
                              onClick={() => onAutoFix(log.message)}
                              className="px-2 py-0.5 rounded bg-white text-black font-semibold text-[10px] flex items-center gap-1 hover:bg-zinc-200 transition-colors cursor-pointer"
                            >
                              <Wrench className="w-2.5 h-2.5" />
                              <span>Fix</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
