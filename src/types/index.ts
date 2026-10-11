export type SubscriptionTier = 'starter' | 'mid' | 'pro';

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  priceUSD: number;
  priceINR: number;
  period: string;
  badge?: string;
  dailyRequestLimit: number;
  estimatedProfitMarginUSD: number;
  computeAllowanceUSD: number;
  description: string;
  allowedModels: string[];
  features: string[];
  popular?: boolean;
}

export interface ModelOption {
  id: string; // OpenRouter model ID
  name: string;
  provider: 'Anthropic' | 'Google' | 'OpenAI';
  description: string;
  badge?: string;
  minTier: SubscriptionTier;
  costPer1kTokens: {
    input: number;
    output: number;
  };
}

export interface GeneratedApp {
  id: string;
  title: string;
  prompt: string;
  model: string;
  version: number;
  htmlCode: string;
  files: {
    name: string;
    language: string;
    content: string;
  }[];
  thoughtSteps: string[];
  createdAt: string;
}

export interface UserSubscription {
  tier: SubscriptionTier;
  active: boolean;
  dailyRequestsUsed: number;
  dailyRequestsLimit: number;
  lastResetDate: string; // YYYY-MM-DD
  expiresAt?: string;
  orderId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  thoughtSteps?: string[];
  filesAffected?: string[];
  appSnapshot?: GeneratedApp;
  timestamp: string;
}
