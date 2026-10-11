'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';
import { CodePanel } from '@/components/CodePanel';
import { PricingModal } from '@/components/PricingModal';
import { SettingsModal } from '@/components/SettingsModal';
import { ShareModal } from '@/components/ShareModal';
import { ExportModal } from '@/components/ExportModal';
import { FRONTIER_MODELS, DEFAULT_MODEL_ID } from '@/config/models';
import { SUBSCRIPTION_TIERS, DEFAULT_TIER } from '@/config/tiers';
import { synthesizeAppFromPrompt } from '@/lib/templates';
import { SubscriptionTier, UserSubscription, ChatMessage, GeneratedApp } from '@/types';

export default function AuraStudioPage() {
  // State
  const [projectTitle, setProjectTitle] = useState('Apex SaaS Matrix');
  const [version, setVersion] = useState(1);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'code'>('split');
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);

  // Subscription state & Daily Limit FUP (stable default for prerendering)
  const [subscription, setSubscription] = useState<UserSubscription>({
    tier: DEFAULT_TIER,
    active: true,
    dailyRequestsUsed: 1,
    dailyRequestsLimit: SUBSCRIPTION_TIERS.starter.dailyRequestLimit,
    lastResetDate: '2026-10-11',
  });

  // OpenRouter BYOK Key
  const [openRouterKey, setOpenRouterKey] = useState<string>('');

  // Initial generated app
  const initialApp = synthesizeAppFromPrompt('High-conversion SaaS analytics dashboard with revenue metrics and active user breakdown', 'Claude 3.5 Sonnet');
  const [currentApp, setCurrentApp] = useState<GeneratedApp>({
    id: 'app_init',
    title: initialApp.title,
    prompt: 'High-conversion SaaS analytics dashboard with revenue metrics and active user breakdown',
    model: 'Claude 3.5 Sonnet',
    version: 1,
    htmlCode: initialApp.htmlCode,
    files: initialApp.files,
    thoughtSteps: initialApp.thoughtSteps,
    createdAt: '2026-10-11T00:00:00.000Z',
  });

  // Chat conversation stream
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: 'Welcome to Aura. I have scaffolded your initial application workspace with luxury dark tokens, live responsive controls, and interactive mock state. Tell me what to build or modify next!',
      model: 'Claude 3.5 Sonnet',
      thoughtSteps: [
        'Initialized workspace architecture',
        'Configured Tailwind CSS & Lucide icons',
        'Mounted interactive live sandbox',
      ],
      filesAffected: ['App.tsx', 'index.html', 'styles.css'],
      timestamp: '12:00 PM',
    },
  ]);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeThoughtSteps, setActiveThoughtSteps] = useState<string[]>([]);

  // Modals state
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load persisted subscription & keys on client mount
  useEffect(() => {
    try {
      const storedSub = localStorage.getItem('aura_subscription');
      const today = new Date().toISOString().split('T')[0];

      if (storedSub) {
        const parsed: UserSubscription = JSON.parse(storedSub);
        // Reset daily usage if a new day has arrived (FUP reset)
        if (parsed.lastResetDate !== today) {
          parsed.dailyRequestsUsed = 0;
          parsed.lastResetDate = today;
        }
        setSubscription(parsed);
      }

      const storedKey = localStorage.getItem('aura_openrouter_key');
      if (storedKey) setOpenRouterKey(storedKey);
    } catch (e) {
      console.warn('Storage hydration notice:', e);
    }
  }, []);

  // Save subscription updates
  const saveSubscription = (sub: UserSubscription) => {
    setSubscription(sub);
    try {
      localStorage.setItem('aura_subscription', JSON.stringify(sub));
    } catch (e) {
      console.warn('Failed to save subscription:', e);
    }
  };

  const handleSaveOpenRouterKey = (key: string) => {
    setOpenRouterKey(key);
    try {
      localStorage.setItem('aura_openrouter_key', key);
    } catch (e) {
      console.warn('Failed to save API key:', e);
    }
  };

  const handleResetUsage = () => {
    const updated = {
      ...subscription,
      dailyRequestsUsed: 0,
    };
    saveSubscription(updated);
  };

  const handleUpgradeSuccess = (newTier: SubscriptionTier, orderId?: string) => {
    const tierConfig = SUBSCRIPTION_TIERS[newTier];
    const updated: UserSubscription = {
      tier: newTier,
      active: true,
      dailyRequestsUsed: 0,
      dailyRequestsLimit: tierConfig.dailyRequestLimit,
      lastResetDate: new Date().toISOString().split('T')[0],
      orderId,
    };
    saveSubscription(updated);

    // Auto-select tier's best model if current model is not allowed
    const model = FRONTIER_MODELS.find((m) => m.id === selectedModel);
    if (!model || (newTier === 'pro' && selectedModel.includes('haiku'))) {
      setSelectedModel('anthropic/claude-3.7-sonnet');
    }
  };

  // Main prompt dispatch function
  const handleSendMessage = async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;

    // Check Daily Request Limit (Fair Usage Policy)
    if (subscription.dailyRequestsUsed >= subscription.dailyRequestsLimit) {
      setIsPricingOpen(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    // Simulated progressive thought steps for Lovable-style realism
    const initialSteps = [
      'Deconstructing prompt requirements & UI component hierarchy...',
      'Synthesizing state schema and event listeners...',
      'Applying luxury dark mode design tokens & fluid animations...',
    ];
    setActiveThoughtSteps(initialSteps);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(openRouterKey ? { 'x-openrouter-key': openRouterKey } : {}),
        },
        body: JSON.stringify({
          prompt: promptText,
          model: selectedModel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize application');
      }

      const nextVersion = version + 1;
      setVersion(nextVersion);
      if (data.title && !projectTitle.includes('Matrix')) {
        setProjectTitle(data.title);
      }

      // Update active app
      setCurrentApp({
        id: `app_${Date.now()}`,
        title: data.title || projectTitle,
        prompt: promptText,
        model: data.model || 'Claude 3.5 Sonnet',
        version: nextVersion,
        htmlCode: data.htmlCode,
        files: data.files || currentApp.files,
        thoughtSteps: data.thoughtSteps || initialSteps,
        createdAt: new Date().toISOString(),
      });

      // Increment daily limit usage
      const updatedSub: UserSubscription = {
        ...subscription,
        dailyRequestsUsed: subscription.dailyRequestsUsed + 1,
      };
      saveSubscription(updatedSub);

      // Append assistant message
      const assistantMessage: ChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: `I've synthesized the changes for "${promptText}". Live preview has been recompiled with hot reload in the sandbox.`,
        model: data.model,
        thoughtSteps: data.thoughtSteps || initialSteps,
        filesAffected: (data.files || []).map((f: any) => f.name),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Error during generation:', err);
      // Fallback local synthesis
      const fallback = synthesizeAppFromPrompt(promptText, 'Claude 3.5 Sonnet');
      const nextVersion = version + 1;
      setVersion(nextVersion);
      setCurrentApp({
        id: `app_${Date.now()}`,
        title: fallback.title,
        prompt: promptText,
        model: 'Claude 3.5 Sonnet',
        version: nextVersion,
        htmlCode: fallback.htmlCode,
        files: fallback.files,
        thoughtSteps: fallback.thoughtSteps,
        createdAt: new Date().toISOString(),
      });

      const updatedSub: UserSubscription = {
        ...subscription,
        dailyRequestsUsed: subscription.dailyRequestsUsed + 1,
      };
      saveSubscription(updatedSub);

      setMessages((prev) => [
        ...prev,
        {
          id: `msg_asst_${Date.now()}`,
          role: 'assistant',
          content: `Synthesized application based on your prompt: "${promptText}".`,
          model: 'Aura Intelligent Synthesis',
          thoughtSteps: fallback.thoughtSteps,
          filesAffected: fallback.files.map((f) => f.name),
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsGenerating(false);
      setActiveThoughtSteps([]);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-white">
      {/* Top Navigation */}
      <Navbar
        projectTitle={projectTitle}
        onUpdateTitle={setProjectTitle}
        viewport={viewport}
        onChangeViewport={setViewport}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        subscription={subscription}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        version={version}
      />

      {/* Main Workspace Dual-Pane (Lovable layout) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Chat / Generation Copilot */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <div
            className={`h-full transition-all duration-200 ${
              viewMode === 'split' ? 'w-[420px] xl:w-[460px] shrink-0' : 'w-1/3 shrink-0'
            }`}
          >
            <ChatPanel
              messages={messages}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
              subscription={subscription}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              onOpenPricing={() => setIsPricingOpen(true)}
              activeThoughtSteps={activeThoughtSteps}
            />
          </div>
        )}

        {/* Right Pane: Live Interactive Sandbox OR Code Inspector */}
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-black">
          {viewMode === 'code' ? (
            <CodePanel files={currentApp.files} title={currentApp.title} />
          ) : (
            <PreviewPanel
              htmlCode={currentApp.htmlCode}
              title={currentApp.title}
              viewport={viewport}
              onChangeViewport={setViewport}
              isGenerating={isGenerating}
              version={version}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentSubscription={subscription}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        openRouterKey={openRouterKey}
        onSaveOpenRouterKey={handleSaveOpenRouterKey}
        subscription={subscription}
        onResetUsage={handleResetUsage}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={currentApp.title}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title={currentApp.title}
        files={currentApp.files}
        htmlCode={currentApp.htmlCode}
      />
    </div>
  );
}
