import { ModelOption } from '@/types';

export const FRONTIER_MODELS: ModelOption[] = [
  // Anthropic Claude
  {
    id: 'anthropic/claude-3.7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Anthropic flagship coding model with hybrid reasoning and architectural depth.',
    badge: 'State of the Art',
    minTier: 'pro',
    costPer1kTokens: { input: 0.003, output: 0.015 },
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Industry benchmark for frontend code synthesis, micro-animations, and clean UI.',
    badge: 'Popular',
    minTier: 'mid',
    costPer1kTokens: { input: 0.003, output: 0.015 },
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    description: 'Blazing-fast model with impressive coding abilities at ultra-low latency.',
    badge: 'Fast & Budget',
    minTier: 'starter',
    costPer1kTokens: { input: 0.0008, output: 0.004 },
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Maximum depth reasoning model for complex algorithm and full-stack architecture.',
    badge: 'Heavy Reasoning',
    minTier: 'pro',
    costPer1kTokens: { input: 0.015, output: 0.075 },
  },

  // OpenAI
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'OpenAI flagship versatile multimodal model with strong design intuition.',
    badge: 'Flagship',
    minTier: 'mid',
    costPer1kTokens: { input: 0.0025, output: 0.01 },
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o-mini',
    provider: 'OpenAI',
    description: 'Lightweight high-efficiency model ideal for rapid UI component prototyping.',
    badge: 'Fast',
    minTier: 'starter',
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
  },
  {
    id: 'openai/o1',
    name: 'OpenAI o1',
    provider: 'OpenAI',
    description: 'Chain-of-thought frontier reasoning model for complex mathematical and state logic.',
    badge: 'Deep Logic',
    minTier: 'pro',
    costPer1kTokens: { input: 0.015, output: 0.06 },
  },

  // Google Gemini
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Next-gen real-time speed with high visual accuracy and responsive formatting.',
    badge: 'Ultra Fast',
    minTier: 'starter',
    costPer1kTokens: { input: 0.0001, output: 0.0004 },
  },
  {
    id: 'google/gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    description: '2M token context window ideal for inspecting full-scale enterprise codebases.',
    badge: 'Large Context',
    minTier: 'mid',
    costPer1kTokens: { input: 0.00125, output: 0.005 },
  },
];

export const DEFAULT_MODEL_ID = 'anthropic/claude-3.5-sonnet';
