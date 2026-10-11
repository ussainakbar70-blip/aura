import type { PlanId } from '@/config/plans';

export type { PlanId };

export interface AccountView {
  uid: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  plan: PlanId;
  planName: string;
  /** Epoch ms when the paid plan ends, null for free. */
  planExpiresAt: number | null;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
  today: {
    credits: number;
    creditCap: number;
    requests: number;
    requestLimit: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  version?: number;
  model?: string;
  credits?: number;
  error?: boolean;
}

export interface ProjectSummary {
  id: string;
  title: string;
  version: number;
  isPublic: boolean;
  updatedAt: number;
}

export interface ProjectDetail extends ProjectSummary {
  html: string;
  model: string | null;
  messages: ChatMessage[];
}

export interface VersionSummary {
  version: number;
  prompt: string;
  model: string | null;
  createdAt: number;
}

export interface ApiErrorBody {
  error: { code: string; message: string };
}

/** Server-sent events emitted by POST /api/generate. */
export type GenerateEvent =
  | { type: 'start'; model: string; maxTokens: number }
  | { type: 'reasoning'; text: string }
  | { type: 'delta'; text: string }
  | {
      type: 'done';
      version: number;
      title: string;
      message: ChatMessage;
      userMessage: ChatMessage;
      html: string;
      account: AccountView;
    }
  | { type: 'error'; code: string; message: string; account?: AccountView };
