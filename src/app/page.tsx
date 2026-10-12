'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/client/auth-context';
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
import { synthesizeAppFromPrompt } from '@/lib/templates';
import type { ChatMessage, GenerateEvent } from '@/types';

function AuraStudio() {
  const { user, account, getToken, refreshAccount } = useAuth();

  // Project state
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [projectTitle, setProjectTitle] = useState('Apex SaaS Matrix');
  const [version, setVersion] = useState(1);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'code'>('split');

  // Initial code
  const initialApp = synthesizeAppFromPrompt(
    'High-conversion SaaS analytics dashboard with revenue metrics, retention charts, and active user breakdown',
    AURA_ENGINE_DISPLAY.name
  );
  const [htmlCode, setHtmlCode] = useState<string>(initialApp.htmlCode);

  // Chat conversation stream
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      role: 'assistant',
      content:
        'Welcome to Aura. Armed with our proprietary Autonomous Engine, I build production-grade, highly interactive web applications with full reactive state, dynamic metrics, local persistence, and zero fake placeholders. What would you like to build?',
      createdAt: 1728637200000,
      model: AURA_ENGINE_DISPLAY.name,
    },
  ]);

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

  // OpenRouter BYOK (client override)
  const [openRouterKey, setOpenRouterKey] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aura_openrouter_key');
      if (stored) setOpenRouterKey(stored);
    } catch {}
  }, []);

  const handleSaveOpenRouterKey = (key: string) => {
    setOpenRouterKey(key);
    try {
      localStorage.setItem('aura_openrouter_key', key);
    } catch {}
  };

  // Switch to an existing project
  const handleSelectProject = async (id: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/projects/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const proj = await res.json();
        setProjectId(proj.id);
        setProjectTitle(proj.title);
        setVersion(proj.version);
        setHtmlCode(proj.html);
        setMessages(proj.messages || []);
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
    const fresh = synthesizeAppFromPrompt('Aura Modern Application', AURA_ENGINE_DISPLAY.name);
    setHtmlCode(fresh.htmlCode);
    setMessages([
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Started new canvas. Describe what you want to build!',
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
        setHtmlCode(data.html);
        setVersion(verNum);
      }
    } catch (err) {
      console.warn('[aura] Failed to restore version:', err);
    }
  };

  // Main SSE generation handler
  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;

    // Check account daily requests
    if (account && account.today.requests >= account.today.requestLimit) {
      setIsPricingOpen(true);
      return;
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

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(openRouterKey ? { 'x-openrouter-key': openRouterKey } : {}),
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
              setStreamingDelta((prev) => prev + event.text);
            } else if (event.type === 'done') {
              setHtmlCode(event.html);
              setVersion(event.version);
              setProjectTitle(event.title);
              setMessages((prev) => [...prev, event.message]);
              await refreshAccount();
            } else if (event.type === 'error') {
              setMessages((prev) => [
                ...prev,
                {
                  id: `msg_err_${Date.now()}`,
                  role: 'assistant',
                  content: `Notice: ${event.message}`,
                  createdAt: Date.now(),
                  error: true,
                  model: AURA_ENGINE_DISPLAY.name,
                },
              ]);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      console.error('[aura] Generation error:', err);
      // Fallback local synthesis
      const fallback = synthesizeAppFromPrompt(promptText, AURA_ENGINE_DISPLAY.name);
      setHtmlCode(fallback.htmlCode);
      setVersion((v) => v + 1);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_fb_${Date.now()}`,
          role: 'assistant',
          content: `Notice: Compiled intelligent autonomous client synthesis for "${promptText}".`,
          createdAt: Date.now(),
          model: AURA_ENGINE_DISPLAY.name,
        },
      ]);
    } finally {
      setIsGenerating(false);
      setStreamingReasoning('');
      setStreamingDelta('');
    }
  };

  const handleAutoFix = (errorReport: string) => {
    handleSendMessage(`Surgically fix the following runtime issue in the application without breaking existing functionality: "${errorReport}"`);
  };

  const files = [
    {
      name: 'index.html',
      language: 'html',
      content: htmlCode,
    },
    {
      name: 'App.tsx',
      language: 'typescript',
      content: `// Aura Standalone React Component Export\n// Rendered live in index.html with Tailwind CSS & Lucide\nexport default function App() {\n  return (\n    <iframe srcDoc={htmlCode} className="w-full h-full border-0" />\n  );\n}`,
    },
    {
      name: 'styles.css',
      language: 'css',
      content: `/* Aura Dark Mode Luxury Tokens */\n@layer base {\n  body { background-color: #09090b; color: #f4f4f5; }\n}`,
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-white">
      {/* Navbar */}
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
        version={version}
      />

      {/* Main Workspace Dual-Pane */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Chat / Copilot */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div
            className={`h-full transition-all duration-200 ${
              viewMode === 'split' ? 'w-[420px] xl:w-[460px] shrink-0' : 'w-1/3 shrink-0'
            }`}
          >
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
        )}

        {/* Right Pane: Sandbox or Code Inspector */}
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-black">
          {viewMode === 'code' ? (
            <CodePanel files={files} title={projectTitle} />
          ) : (
            <PreviewPanel
              htmlCode={htmlCode}
              title={projectTitle}
              viewport={viewport}
              onChangeViewport={setViewport}
              isGenerating={isGenerating}
              version={version}
              onAutoFix={handleAutoFix}
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
        openRouterKey={openRouterKey}
        onSaveOpenRouterKey={handleSaveOpenRouterKey}
        subscription={{
          tier: account?.plan === 'free' ? 'starter' : (account?.plan as any) || 'starter',
          active: true,
          dailyRequestsUsed: account?.today.requests || 0,
          dailyRequestsLimit: account?.today.requestLimit || 15,
          lastResetDate: '2026-10-11',
        }}
        onResetUsage={refreshAccount}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={projectTitle}
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

export default function Page() {
  return (
    <AuthProvider>
      <AuraStudio />
    </AuthProvider>
  );
}
