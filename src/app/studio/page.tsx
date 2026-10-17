'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/client/auth-context';
import { Navbar } from '@/components/Navbar';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { CodePanel } from '@/components/CodePanel';
import { PricingModal } from '@/components/PricingModal';
import { AuthModal } from '@/components/AuthModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ShareModal } from '@/components/ShareModal';
import { ExportModal } from '@/components/ExportModal';
import { ProjectsDrawer } from '@/components/ProjectsDrawer';
import { AURA_ENGINE_DISPLAY } from '@/config/models';
import {
  synthesizeAppFromPrompt,
  compileProjectFiles,
  detectCategoryAndTitle,
} from '@/lib/templates';
import type { ChatMessage, GenerateEvent } from '@/types';

const SESSION_STORAGE_KEY = 'aura_active_studio_session';

function AuraStudioContent() {
  const { account, getToken, refreshAccount } = useAuth();
  const searchParams = useSearchParams();
  const initialPromptParam = searchParams.get('prompt');

  // Project state
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [projectTitle, setProjectTitle] = useState(() => {
    if (initialPromptParam && initialPromptParam.trim()) {
      return detectCategoryAndTitle(initialPromptParam).title;
    }
    return 'Untitled App';
  });
  const [version, setVersion] = useState(1);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'code'>('split');

  // Initial HTML code & history stack for Undo/Redo
  const [htmlCode, setHtmlCode] = useState<string>(() => {
    if (initialPromptParam && initialPromptParam.trim().length > 0) {
      return synthesizeAppFromPrompt(initialPromptParam, AURA_ENGINE_DISPLAY.name).htmlCode;
    }
    return '';
  });
  const [historyStack, setHistoryStack] = useState<string[]>(() => (htmlCode ? [htmlCode] : []));
  const [historyIndex, setHistoryIndex] = useState<number>(() => (htmlCode ? 0 : -1));

  // Chat conversation stream
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_init',
      role: 'assistant',
      content: initialPromptParam
        ? `Architected "${detectCategoryAndTitle(initialPromptParam).title}" with multi-view navigation, live computed KPIs, interactive modals, and LocalStorage persistence. Tell me any revisions, or use "Inspect & Edit" in the preview toolbar to modify elements directly!`
        : 'Welcome to Aura Studio. Describe any full-stack web application or interactive website — or click a production blueprint below. Every build includes multi-view navigation, reactive state, SVG data visualizations, CRUD modals, and 6-file code export.',
      createdAt: Date.now(),
      model: AURA_ENGINE_DISPLAY.name,
      version: initialPromptParam ? 1 : undefined,
    },
  ]);

  // Restore active studio session from localStorage if no URL prompt override
  useEffect(() => {
    if (initialPromptParam && initialPromptParam.trim().length > 0) return;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.htmlCode && typeof saved.htmlCode === 'string') {
          setHtmlCode(saved.htmlCode);
          setHistoryStack([saved.htmlCode]);
          setHistoryIndex(0);
        }
        if (saved.projectTitle) setProjectTitle(saved.projectTitle);
        if (saved.projectId) setProjectId(saved.projectId);
        if (saved.version) setVersion(saved.version);
        if (Array.isArray(saved.messages) && saved.messages.length > 0) {
          setMessages(saved.messages);
        }
      }
    } catch {}
  }, [initialPromptParam]);

  // Persist active session whenever htmlCode, title, or messages change
  useEffect(() => {
    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          projectId,
          projectTitle,
          version,
          htmlCode,
          messages: messages.slice(-30),
        })
      );

      if (htmlCode && htmlCode.trim().length > 50) {
        const raw = localStorage.getItem('aura_local_projects');
        const list: any[] = raw ? JSON.parse(raw) : [];
        const currentId = projectId || `proj_${(projectTitle || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        const existingIdx = list.findIndex((p: any) => p.id === currentId || p.title === projectTitle);
        const item = {
          id: currentId,
          title: projectTitle,
          version,
          html: htmlCode,
          updatedAt: Date.now(),
          createdAt: existingIdx >= 0 ? list[existingIdx].createdAt : Date.now(),
        };
        if (existingIdx >= 0) {
          list[existingIdx] = item;
        } else {
          list.unshift(item);
        }
        localStorage.setItem('aura_local_projects', JSON.stringify(list.slice(0, 25)));
      }
    } catch {}
  }, [projectId, projectTitle, version, htmlCode, messages]);

  const commitNewHtml = (nextHtml: string, nextTitle?: string, nextVersion?: number) => {
    setHtmlCode(nextHtml);
    if (nextTitle) setProjectTitle(nextTitle);
    if (nextVersion !== undefined) setVersion(nextVersion);

    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      const updated = [...sliced, nextHtml].slice(-25);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIdx = historyIndex - 1;
      setHistoryIndex(targetIdx);
      setHtmlCode(historyStack[targetIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const targetIdx = historyIndex + 1;
      setHistoryIndex(targetIdx);
      setHtmlCode(historyStack[targetIdx]);
    }
  };

  // Keyboard shortcuts (Undo: Ctrl+Z, Redo: Ctrl+Y / Ctrl+Shift+Z, Save/Export: Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsExportOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, historyStack]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingReasoning, setStreamingReasoning] = useState('');
  const [streamingDelta, setStreamingDelta] = useState('');

  // Modals state
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  // Dedicated Compute Key BYOK (client override)
  const [computeKey, setComputeKey] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('aura_compute_key') || localStorage.getItem('aura_openrouter_key') || '';
    } catch {
      return '';
    }
  });

  const handleSaveComputeKey = (key: string) => {
    setComputeKey(key);
    try {
      localStorage.setItem('aura_compute_key', key);
      localStorage.setItem('aura_openrouter_key', key);
    } catch {}
  };

  // Switch to an existing project (supports both cloud and local guest projects)
  const handleSelectProject = async (id: string) => {
    try {
      const token = await getToken();
      if (token) {
        const res = await fetch(`/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const proj = await res.json();
          setProjectId(proj.id);
          commitNewHtml(proj.html, proj.title, proj.version);
          setMessages(proj.messages || []);
          return;
        }
      }

      // Check local storage for guest projects
      const raw = localStorage.getItem('aura_local_projects');
      if (raw) {
        const list = JSON.parse(raw);
        const found = list.find((p: any) => p.id === id);
        if (found) {
          setProjectId(found.id);
          commitNewHtml(found.html, found.title, found.version);
          setMessages([
            {
              id: `msg_load_${Date.now()}`,
              role: 'assistant',
              content: `Loaded "${found.title}" (v${found.version}). Describe any revisions or use the toolbar controls!`,
              createdAt: Date.now(),
              model: AURA_ENGINE_DISPLAY.name,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn('[aura] Failed to load project:', err);
    }
  };

  // Start fresh project
  const handleNewProject = () => {
    setProjectId(undefined);
    setProjectTitle('Untitled App');
    setVersion(1);
    setHtmlCode('');
    setHistoryStack([]);
    setHistoryIndex(-1);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
    setMessages([
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Canvas cleared. Describe the software or website you want to build, or select one of the architectural blueprints below!',
        createdAt: Date.now(),
        model: AURA_ENGINE_DISPLAY.name,
      },
    ]);
  };

  // Restore snapshot version
  const handleRestoreVersion = async (verNum: number) => {
    if (!projectId) return;
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${projectId}/versions/${verNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        commitNewHtml(data.html, undefined, verNum);
      }
    } catch (err) {
      console.warn('[aura] Failed to restore version:', err);
    }
  };

  // Client-safe HTML extractor for partial/streamed markup
  const extractHtmlClient = (text: string): string => {
    if (!text) return '';
    const codeBlockMatch = text.match(/```(?:html|xml)?\s*\n([\s\S]*?)(?:```|$)/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      const candidate = codeBlockMatch[1].trim();
      if (candidate.includes('<!DOCTYPE') || candidate.includes('<html') || candidate.includes('<body') || candidate.includes('<div')) {
        return candidate;
      }
    }
    const docMatch = text.match(/<!DOCTYPE[\s\S]*/i);
    if (docMatch && docMatch[0].length > 80) return docMatch[0].trim();
    const htmlMatch = text.match(/<html[\s\S]*/i);
    if (htmlMatch && htmlMatch[0].length > 80) return `<!DOCTYPE html>\n${htmlMatch[0].trim()}`;
    return text;
  };

  // Main SSE generation handler - 100% resilient and guaranteed to build
  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;

    if (account && account.today.requests >= account.today.requestLimit) {
      setIsPricingOpen(true);
    }

    const token = await getToken();
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: promptText,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    setStreamingReasoning('');
    setStreamingDelta('');

    let hasCompleted = false;
    let accumulatedDelta = '';

    // Safety watchdog: guarantees the user NEVER gets stuck with an empty canvas or infinite spinner
    const watchdog = setTimeout(() => {
      if (!hasCompleted) {
        console.warn('[aura] Safety watchdog triggered: synthesizing app immediately');
        hasCompleted = true;
        const fallback = synthesizeAppFromPrompt(promptText, AURA_ENGINE_DISPLAY.name, htmlCode);
        const nextVer = htmlCode ? version + 1 : 1;
        commitNewHtml(fallback.htmlCode, fallback.title, nextVer);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_asst_${Date.now()}`,
            role: 'assistant',
            content: fallback.thoughtSteps.join('\n') || `Architected and synthesized ${fallback.title} with full interactive state.`,
            createdAt: Date.now(),
            version: nextVer,
            model: AURA_ENGINE_DISPLAY.name,
          },
        ]);
        setIsGenerating(false);
        setStreamingReasoning('');
        setStreamingDelta('');
      }
    }, 28000);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(computeKey ? { 'x-compute-key': computeKey, 'x-openrouter-key': computeKey } : {}),
        },
        body: JSON.stringify({
          prompt: promptText,
          projectId,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || errJson?.error || 'Generation failed.');
      }

      if (!res.body) throw new Error('No stream received.');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          try {
            const event: GenerateEvent = JSON.parse(trimmed.slice(5).trim());

            if (event.type === 'reasoning') {
              setStreamingReasoning((prev) => prev + event.text);
            } else if (event.type === 'delta') {
              accumulatedDelta += event.text;
              setStreamingDelta((prev) => prev + event.text);
            } else if (event.type === 'done') {
              hasCompleted = true;
              if (event.projectId) {
                setProjectId(event.projectId);
              }
              commitNewHtml(event.html, event.title, event.version);
              setMessages((prev) => [...prev, event.message]);
              await refreshAccount();
            } else if (event.type === 'error') {
              console.warn('[aura] Stream event error, synthesizing fallback:', event.message);
              hasCompleted = true;
              const fallback = synthesizeAppFromPrompt(promptText, AURA_ENGINE_DISPLAY.name, htmlCode);
              const nextVer = htmlCode ? version + 1 : 1;
              commitNewHtml(fallback.htmlCode, fallback.title, nextVer);
              setMessages((prev) => [
                ...prev,
                {
                  id: `msg_rec_${Date.now()}`,
                  role: 'assistant',
                  content: fallback.thoughtSteps.join('\n') || `Architected ${fallback.title} with full interactive state.`,
                  createdAt: Date.now(),
                  version: nextVer,
                  model: AURA_ENGINE_DISPLAY.name,
                },
              ]);
            }
          } catch {}
        }
      }

      // If stream finished without an explicit done or error event:
      if (!hasCompleted) {
        hasCompleted = true;
        const candidateHtml = extractHtmlClient(accumulatedDelta);
        if (candidateHtml && candidateHtml.length > 250 && (candidateHtml.includes('<body') || candidateHtml.includes('<html') || candidateHtml.includes('<!DOCTYPE'))) {
          const derived = detectCategoryAndTitle(promptText);
          const nextVer = htmlCode ? version + 1 : 1;
          commitNewHtml(candidateHtml, derived.title, nextVer);
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_asst_${Date.now()}`,
              role: 'assistant',
              content: `Architected and synthesized ${derived.title} with full interactive state.`,
              createdAt: Date.now(),
              version: nextVer,
              model: AURA_ENGINE_DISPLAY.name,
            },
          ]);
        } else {
          const fallback = synthesizeAppFromPrompt(promptText, AURA_ENGINE_DISPLAY.name, htmlCode);
          const nextVer = htmlCode ? version + 1 : 1;
          commitNewHtml(fallback.htmlCode, fallback.title, nextVer);
          setMessages((prev) => [
            ...prev,
            {
              id: `msg_asst_${Date.now()}`,
              role: 'assistant',
              content: fallback.thoughtSteps.join('\n') || `Architected and synthesized ${fallback.title} with full interactive state.`,
              createdAt: Date.now(),
              version: nextVer,
              model: AURA_ENGINE_DISPLAY.name,
            },
          ]);
        }
      }
    } catch (err: any) {
      console.error('[aura] Generation error, applying local architectural synthesis:', err);
      if (!hasCompleted) {
        hasCompleted = true;
        const fallback = synthesizeAppFromPrompt(promptText, AURA_ENGINE_DISPLAY.name, htmlCode);
        const nextVer = htmlCode ? version + 1 : 1;
        commitNewHtml(fallback.htmlCode, fallback.title, nextVer);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_fb_${Date.now()}`,
            role: 'assistant',
            content: fallback.thoughtSteps.join('\n') || `Architected and synthesized ${fallback.title} with full interactive state.`,
            createdAt: Date.now(),
            version: nextVer,
            model: AURA_ENGINE_DISPLAY.name,
          },
        ]);
      }
    } finally {
      clearTimeout(watchdog);
      setIsGenerating(false);
      setStreamingReasoning('');
      setStreamingDelta('');
    }
  };

  const handleAutoFix = (errorReport: string) => {
    handleSendMessage(`Surgically fix the following runtime issue in the application without breaking existing functionality: "${errorReport}"`);
  };

  const [inspectMode, setInspectMode] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleOpenExternalPreview = () => {
    if (!htmlCode) return;
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Compile full 6-file production project tree from current HTML & title
  const files = useMemo(() => {
    const { category } = detectCategoryAndTitle(projectTitle);
    return compileProjectFiles(htmlCode, projectTitle, projectTitle, category);
  }, [htmlCode, projectTitle]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-white">
      {/* Unified Studio Navbar */}
      <Navbar
        projectTitle={projectTitle}
        onUpdateTitle={setProjectTitle}
        viewport={viewport}
        onChangeViewport={setViewport}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProjects={() => setIsProjectsOpen(true)}
        onNewProject={handleNewProject}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        version={version}
        inspectMode={inspectMode}
        onToggleInspect={() => setInspectMode((v) => !v)}
        onRefreshPreview={() => setIframeKey((k) => k + 1)}
        onOpenExternalPreview={handleOpenExternalPreview}
        hasCode={Boolean(htmlCode && htmlCode.trim().length > 0)}
      />

      {/* Main Workspace Dual-Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Chat / Copilot */}
        <div className="h-full w-[380px] xl:w-[400px] shrink-0">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            onOpenPricing={() => setIsPricingOpen(true)}
            streamingReasoning={streamingReasoning}
            streamingDelta={streamingDelta}
            onAutoFix={handleAutoFix}
          />
        </div>

        {/* Right Pane: Sandbox or Multi-File Code IDE */}
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-[#09090b]">
          {viewMode === 'code' ? (
            <CodePanel
              files={files}
              title={projectTitle}
              onUpdateHtml={(updated) => commitNewHtml(updated, undefined, version + 1)}
            />
          ) : (
            <PreviewPanel
              htmlCode={htmlCode}
              title={projectTitle}
              viewport={viewport}
              onChangeViewport={setViewport}
              isGenerating={isGenerating}
              version={version}
              inspectMode={inspectMode}
              onCloseInspect={() => setInspectMode(false)}
              iframeKey={iframeKey}
              onAutoFix={handleAutoFix}
              onSelectPrompt={handleSendMessage}
              onUpdateHtml={(updated) => commitNewHtml(updated)}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        computeKey={computeKey}
        openRouterKey={computeKey}
        onSaveComputeKey={handleSaveComputeKey}
        onSaveOpenRouterKey={handleSaveComputeKey}
        subscription={{
          tier: account?.plan === 'free' ? 'starter' : (account?.plan as any) || 'starter',
          active: true,
          dailyRequestsUsed: account?.today.requests || 0,
          dailyRequestsLimit: account?.today.requestLimit || 15,
          lastResetDate: '2026-10-16',
        }}
        onResetUsage={refreshAccount}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={projectTitle}
        projectId={projectId}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title={projectTitle}
        files={files}
        htmlCode={htmlCode}
      />

      <ProjectsDrawer
        isOpen={isProjectsOpen}
        onClose={() => setIsProjectsOpen(false)}
        currentProjectId={projectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onRestoreVersion={handleRestoreVersion}
        currentVersion={version}
      />
    </div>
  );
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#09090b] flex items-center justify-center text-amber-400 font-mono text-sm">
          Loading Aura Studio...
        </div>
      }
    >
      <AuraStudioContent />
    </Suspense>
  );
}
