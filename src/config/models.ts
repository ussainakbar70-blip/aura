import { PLAN_RANK, type PlanId } from './plans';

export type Provider = 'anthropic' | 'openai' | 'google';

export interface AIModel {
  /** OpenRouter model id. */
  id: string;
  label: string;
  provider: Provider;
  description: string;
  /** USD per 1M input tokens (OpenRouter list price). */
  inputPerM: number;
  /** USD per 1M output tokens (OpenRouter list price). */
  outputPerM: number;
  minPlan: PlanId;
  reasoningEffort: 'low' | 'medium';
  badge?: string;
}

/**
 * Verified against https://openrouter.ai/api/v1/models (October 2026).
 * Actual billing always uses the cost OpenRouter reports per request;
 * these prices are only used to size the up-front budget reservation.
 */
export const MODELS: AIModel[] = [
  {
    id: 'anthropic/claude-haiku-5.5',
    label: 'Claude Haiku 5.5',
    provider: 'anthropic',
    description: 'Very fast and cheap, good at code.',
    inputPerM: 0.1,
    outputPerM: 0.5,
    minPlan: 'free',
    reasoningEffort: 'low',
    badge: 'Fast',
  },
  {
    id: 'openai/gpt-6-luna',
    label: 'GPT-6 Luna',
    provider: 'openai',
    description: 'Lightweight OpenAI model for quick iterations.',
    inputPerM: 0.1,
    outputPerM: 0.5,
    minPlan: 'free',
    reasoningEffort: 'low',
  },
  {
    id: 'google/gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash Lite',
    provider: 'google',
    description: 'Low-latency Gemini for simple apps.',
    inputPerM: 0.3,
    outputPerM: 2.5,
    minPlan: 'starter',
    reasoningEffort: 'low',
  },
  {
    id: 'google/gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    provider: 'google',
    description: 'Latest Gemini Flash, strong visual design.',
    inputPerM: 0.75,
    outputPerM: 3.75,
    minPlan: 'starter',
    reasoningEffort: 'low',
  },
  {
    id: 'anthropic/claude-sonnet-5.5',
    label: 'Claude Sonnet 5.5',
    provider: 'anthropic',
    description: 'Best balance of quality and speed for apps.',
    inputPerM: 2,
    outputPerM: 10,
    minPlan: 'mid',
    reasoningEffort: 'low',
    badge: 'Best for apps',
  },
  {
    id: 'openai/gpt-6.1-sol',
    label: 'GPT-6.1 Sol',
    provider: 'openai',
    description: 'OpenAI flagship, great reasoning and UI.',
    inputPerM: 2,
    outputPerM: 10,
    minPlan: 'mid',
    reasoningEffort: 'low',
  },
  {
    id: 'google/gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro',
    provider: 'google',
    description: 'Google flagship with huge context.',
    inputPerM: 2,
    outputPerM: 12,
    minPlan: 'mid',
    reasoningEffort: 'low',
  },
  {
    id: 'anthropic/claude-opus-5.5',
    label: 'Claude Opus 5.5',
    provider: 'anthropic',
    description: 'Most capable model for complex apps.',
    inputPerM: 4,
    outputPerM: 20,
    minPlan: 'pro',
    reasoningEffort: 'medium',
    badge: 'Most capable',
  },
];

export const DEFAULT_MODEL_ID = 'anthropic/claude-haiku-5.5';

export const PROVIDER_LABEL: Record<Provider, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
};

export function getModel(id: string | null | undefined): AIModel | undefined {
  return MODELS.find((m) => m.id === id);
}

export function canUseModel(plan: PlanId, model: AIModel): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[model.minPlan];
}

/** The best model a plan can use — used as the default selection. */
export function bestModelFor(plan: PlanId): AIModel {
  const preferred: Record<PlanId, string> = {
    free: 'anthropic/claude-haiku-5.5',
    starter: 'google/gemini-3.8-flash',
    mid: 'anthropic/claude-sonnet-5.5',
    pro: 'anthropic/claude-sonnet-5.5',
  };
  return getModel(preferred[plan]) ?? MODELS[0];
}
