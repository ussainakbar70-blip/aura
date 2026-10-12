import { PLAN_RANK, type PlanId } from './plans';

export interface InternalAIModel {
  /** Internal OpenRouter model id. */
  id: string;
  internalLabel: string;
  description: string;
  inputPerM: number;
  outputPerM: number;
  minPlan: PlanId;
  maxTokens: number;
}

/**
 * Unified Public Display for Aura's Proprietary Intelligence Engine.
 * The end user and client never see the underlying model identifiers.
 */
export const AURA_ENGINE_DISPLAY = {
  name: 'Aura Autonomous Engine',
  version: 'v2.5 Pro',
  tagline: 'Deep Architectural Reasoning & Full-Stack Synthesis',
  badge: 'Autonomous',
};

/**
 * Internal routing pool.
 * Backend dynamically routes user requests to the highest-fidelity frontier model
 * available for their tier, with automatic failover and budget preservation.
 */
export const INTERNAL_MODELS: Record<PlanId, InternalAIModel> = {
  free: {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    internalLabel: 'Nemotron 3 Ultra',
    description: 'High-speed autonomous UI synthesis with deep reasoning.',
    inputPerM: 0.6,
    outputPerM: 2.4,
    minPlan: 'free',
    maxTokens: 8000,
  },
  starter: {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    internalLabel: 'Nemotron 3 Ultra',
    description: 'Advanced full-stack synthesis with full state persistence.',
    inputPerM: 0.6,
    outputPerM: 2.4,
    minPlan: 'starter',
    maxTokens: 12000,
  },
  mid: {
    id: 'anthropic/claude-sonnet-5.5',
    internalLabel: 'Claude Sonnet 5.5',
    description: 'Flagship reasoning for complex multi-view applications.',
    inputPerM: 2.0,
    outputPerM: 10.0,
    minPlan: 'mid',
    maxTokens: 16000,
  },
  pro: {
    id: 'anthropic/claude-opus-5.5',
    internalLabel: 'Claude Opus 5.5',
    description: 'Premier frontier reasoning for enterprise full-stack systems.',
    inputPerM: 4.0,
    outputPerM: 20.0,
    minPlan: 'pro',
    maxTokens: 20000,
  },
};

/** Backward compatibility alias */
export type AIModel = InternalAIModel;

/**
 * Resolves the internal model configuration based on the user's active tier.
 * Keeps the underlying model completely hidden from external visibility.
 */
export function resolveBackendModel(plan: PlanId = 'free'): InternalAIModel {
  return INTERNAL_MODELS[plan] || INTERNAL_MODELS.free;
}

export function canUseModel(plan: PlanId, model: InternalAIModel): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK[model.minPlan];
}

/** Legacy lookup helper safely returning fallback internal model */
export function getModel(id?: string | null): InternalAIModel {
  if (id && id in INTERNAL_MODELS) {
    return INTERNAL_MODELS[id as PlanId];
  }
  return INTERNAL_MODELS.starter;
}
