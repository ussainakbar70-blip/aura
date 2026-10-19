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
  version: 'v2.5 Ultra',
  tagline: 'Deep Architectural Reasoning & Full-Stack Synthesis',
  badge: 'Autonomous',
};

/**
 * Foundational Engine: Nemotron 3 Ultra (550B MoE, 55B active, hybrid Transformer-Mamba).
 * Completely stealth routing with zero identity disclosure to client or user.
 */
export const PRIMARY_AUTONOMOUS_MODEL_ID = 'nvidia/nemotron-3-ultra-550b-a55b:free';
export const FALLBACK_AUTONOMOUS_MODEL_ID = 'poolside/laguna-s-2.1:free';

/**
 * Internal routing pool.
 * Backend dynamically routes user requests to high-speed autonomous synthesis pipelines
 * scaled by tier token allocations, with automatic failover across active coding models.
 */
export const INTERNAL_MODELS: Record<PlanId, InternalAIModel> = {
  free: {
    id: PRIMARY_AUTONOMOUS_MODEL_ID,
    internalLabel: 'Aura Autonomous Engine (Core)',
    description: 'High-speed autonomous UI synthesis with deep structural reasoning.',
    inputPerM: 0.1,
    outputPerM: 0.2,
    minPlan: 'free',
    maxTokens: 8192,
  },
  starter: {
    id: PRIMARY_AUTONOMOUS_MODEL_ID,
    internalLabel: 'Aura Autonomous Engine (Plus)',
    description: 'Advanced full-stack synthesis with full state persistence & CRUD.',
    inputPerM: 0.1,
    outputPerM: 0.2,
    minPlan: 'starter',
    maxTokens: 8192,
  },
  mid: {
    id: PRIMARY_AUTONOMOUS_MODEL_ID,
    internalLabel: 'Aura Autonomous Engine (Turbo)',
    description: 'Flagship architectural reasoning for complex multi-view applications.',
    inputPerM: 0.1,
    outputPerM: 0.2,
    minPlan: 'mid',
    maxTokens: 8192,
  },
  pro: {
    id: PRIMARY_AUTONOMOUS_MODEL_ID,
    internalLabel: 'Aura Autonomous Engine (Ultra)',
    description: 'Premier frontier reasoning for enterprise-grade autonomous systems.',
    inputPerM: 0.1,
    outputPerM: 0.2,
    minPlan: 'pro',
    maxTokens: 8192,
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
