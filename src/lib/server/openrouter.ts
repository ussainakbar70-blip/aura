import { InternalAIModel } from '@/config/models';
import { ApiError } from './errors';
import { synthesizeAppFromPrompt } from '../templates';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterStreamCallbacks {
  onStart?: () => void;
  onReasoning?: (text: string) => void;
  onDelta?: (text: string) => void;
}

export interface StreamResult {
  fullText: string;
  reasoningText: string;
  html: string;
  title: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  estimated: boolean;
}

/**
 * Builds the comprehensive architectural system prompt for Aura Autonomous Engine.
 * Formulated to consistently beat Lovable, v0, and Emergent in logic, visual craft,
 * interactive state, and production readiness.
 */
export function buildSystemPrompt(existingHtml?: string | null): string {
  const base = `You are Aura Autonomous Engine, the world's premier AI Software Architect and Principal Frontend Engineer.
Your code is superior to Lovable, Emergent, and v0: cleaner, deeply logical, bug-free, fully interactive, and visually breathtaking.

MISSION:
Build a PRODUCTION-READY, HIGHLY LOGICAL, FULLY INTERACTIVE, BEAUTIFULLY STYLED SINGLE-PAGE WEB APPLICATION that delivers an exceptional real-world user experience.

======================================================================
CORE ARCHITECTURAL RULES (HOW AURA OUTPERFORMS LOVABLE & EMERGENT)
======================================================================

1. TRUE REACTIVE STATE & ZERO DEAD BUTTONS:
   - Every single button, filter, tab, toggle, search input, dropdown, pagination control, and form MUST ACTUALLY WORK.
   - Maintain a clean centralized reactive state store:
     const state = {
       items: [...],
       filter: 'all',
       search: '',
       activeTab: 'overview',
       modalOpen: false,
       editingItem: null,
       darkMode: true
     };
   - Implement complete CRUD operations:
     * CREATE: Users can click "+ Add New", open a modal, fill inputs with validation, submit, and see it immediately in state & UI.
     * READ: Dynamic searching, filtering by status/category, and column sorting.
     * UPDATE: Edit existing records with pre-filled inputs in an edit modal.
     * DELETE: Remove items from state with immediate UI update and undo toast notice.
   - Dynamic Computed Metrics:
     All KPI cards, totals, progress bars, percentages, and status counters MUST be calculated dynamically from the current data array in state! Whenever an item is added or deleted, the KPIs update automatically!

2. AUTOMATIC PERSISTENCE VIA LOCALSTORAGE:
   - Automatically save state to localStorage on every state mutation:
     function saveState() {
       try { localStorage.setItem('aura_app_data', JSON.stringify(state)); } catch(e) {}
     }
   - On page load, restore state from localStorage, with a rich fallback array of 8-12 realistic seed records so the app is immediately alive.
   - If the user refreshes, their entered data and preferences are completely preserved!

3. WORLD-CLASS OBSIDIAN LUXURY AESTHETICS:
   - Modern obsidian/dark luxury palette:
     * Backgrounds: deep midnight canvas (#09090b / #0d0d12), elevated cards (bg-zinc-900/70 backdrop-blur-xl border border-white/[0.08]).
     * Accents: tasteful amber-400, emerald-400, or indigo-500 gradients.
   - Fluid micro-interactions:
     * transition-all duration-200, hover:border-white/[0.18], hover:bg-zinc-800/80, active:scale-[0.98].
   - Empty states: When search/filter yields zero results, show an elegant empty state with an icon and a "Reset filters" button.
   - Badges & status pills with soft luminous borders and background colors.

4. COMPLETE MODALS, DRAWERS & ACCESSIBILITY:
   - Every modal / drawer must feature:
     * Full backdrop overlay with click-outside-to-dismiss.
     * Top-right close button ('X') and ESC key listener.
     * Real form submit handler with e.preventDefault(), clean validation, field error alerts, and form reset.
     * Immediate DOM re-render upon save.

5. INTEGRATED TOAST NOTIFICATION SYSTEM:
   - Built-in floating toast system in the bottom-right corner.
   - Triggers on every user event: item added, item updated, item deleted, filters reset, data exported, or settings saved.
   - Sleek progress bar with auto-dismiss after 2.5 seconds.

6. REAL FUNCTIONAL UTILITIES:
   - Export to CSV: Real JavaScript Blob generation (URL.createObjectURL(blob)) that triggers an actual browser download of current filtered data!
   - Export to JSON: Real downloadable JSON file of the active dataset.
   - Dark/Light Theme Switcher: Toggles a 'dark' class on <html> with smooth CSS transitions.

7. BULLETPROOF TECHNICAL IMPLEMENTATION:
   - Output MUST be a complete, valid HTML5 document wrapped in \`\`\`html and \`\`\`.
   - CDNs included in <head>:
     * <script src="https://cdn.tailwindcss.com"></script>
     * <script src="https://unpkg.com/lucide@latest"></script>
   - CRITICAL: Always invoke lucide.createIcons(); immediately after any DOM re-render!
   - Write all JavaScript inside <script> tags before </body>.
   - Completely responsive: layout must adapt seamlessly between mobile (375px), tablet (768px), and desktop (1440px), including a mobile drawer or collapsible hamburger menu.
   - NEVER write placeholder comments like "/* Add logic here */", "TODO", "Lorem ipsum", or truncate code. Write 100% of the complete, runnable code.`;

  if (existingHtml && existingHtml.trim().length > 100) {
    return `${base}

======================================================================
SURGICAL ITERATION DIRECTIVES:
======================================================================
The user is enhancing the existing application. You must:
1. PRESERVE ALL EXISTING WORKING FUNCTIONALITY, state variables, UI layout, realistic data, and visual styling.
2. SURGICALLY INTEGRATE the requested changes or new features without breaking or stripping down existing code.
3. DO NOT output partial snippets, diffs, or placeholder comments like "/* Existing code remains same */".
4. Return the COMPLETE, UPDATED, FULLY FUNCTIONAL HTML document wrapped in \`\`\`html ... \`\`\`.

CURRENT APPLICATION CODE:
${existingHtml.slice(0, 32000)}`;
  }

  return base;
}

/**
 * Sanitizes any text chunk to ensure backend model identifiers or vendor tokens
 * never leak to the user or frontend interface.
 */
function sanitizeStreamingText(text: string): string {
  return text
    .replace(/anthropic\/?/gi, '')
    .replace(/claude[\w.-]*/gi, 'Aura Engine')
    .replace(/nemotron[\w.-]*/gi, 'Aura Engine')
    .replace(/openai\/?/gi, '')
    .replace(/gpt-[\w.-]*/gi, 'Aura Engine')
    .replace(/openrouter\/?/gi, 'Aura Core')
    .replace(/gemini[\w.-]*/gi, 'Aura Engine');
}

/**
 * Streams completion through backend model router or synthesizes local fallback.
 * Masks all underlying vendor IDs so the client only interacts with Aura Engine.
 */
export async function streamOpenRouter(
  model: InternalAIModel,
  prompt: string,
  existingHtml: string | null | undefined,
  maxTokens: number,
  callbacks: OpenRouterStreamCallbacks,
  customApiKey?: string
): Promise<StreamResult> {
  const apiKey = (customApiKey && customApiKey.trim().length > 5)
    ? customApiKey.trim()
    : process.env.OPENROUTER_API_KEY;

  // Fallback if no OpenRouter key is configured yet in environment
  if (!apiKey || apiKey.trim().length < 5) {
    callbacks.onReasoning?.('Aura Autonomous Engine initialized in self-contained synthesis mode.');
    callbacks.onReasoning?.('Analyzing requirements, data models, and reactive interaction architecture...');

    const synth = synthesizeAppFromPrompt(prompt, 'Aura Engine');
    const mockOutput = `\`\`\`html\n${synth.htmlCode}\n\`\`\``;

    // Simulate smooth streaming
    for (let i = 0; i < mockOutput.length; i += 90) {
      callbacks.onDelta?.(mockOutput.slice(i, i + 90));
      await new Promise((r) => setTimeout(r, 12));
    }

    return {
      fullText: mockOutput,
      reasoningText: synth.thoughtSteps.join('\n'),
      html: synth.htmlCode,
      title: synth.title,
      promptTokens: 200,
      completionTokens: 1200,
      costUsd: 0,
      estimated: true,
    };
  }

  const systemPrompt = buildSystemPrompt(existingHtml);
  callbacks.onStart?.();

  let currentMaxTokens = maxTokens;
  let currentModelId = model.id;

  let response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aura.build',
      'X-Title': 'Aura Autonomous Studio',
    },
    body: JSON.stringify({
      model: currentModelId,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: true,
      max_tokens: currentMaxTokens,
      temperature: 0.6,
      include_reasoning: true,
    }),
  });

  // Intelligent resilience for token budget or capacity constraints
  if (!response.ok && response.status === 402) {
    const errorText = await response.text();
    console.warn('[aura] Upstream quota capacity alert, calibrating token budget:', errorText);

    const affordMatch = errorText.match(/can only afford (\d+)/i);
    if (affordMatch && parseInt(affordMatch[1], 10) > 300) {
      currentMaxTokens = Math.max(300, parseInt(affordMatch[1], 10) - 20);
      callbacks.onReasoning?.(`Calibrating compute pipeline for optimal response latency...`);
      response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aura.build',
          'X-Title': 'Aura Autonomous Studio',
        },
        body: JSON.stringify({
          model: currentModelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
          max_tokens: currentMaxTokens,
          temperature: 0.6,
          include_reasoning: true,
        }),
      });
    } else if (currentModelId.includes('nemotron') && !currentModelId.endsWith(':free')) {
      currentModelId = `${currentModelId}:free`;
      callbacks.onReasoning?.(`Engaging high-throughput Aura Autonomous pipeline...`);
      response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aura.build',
          'X-Title': 'Aura Autonomous Studio',
        },
        body: JSON.stringify({
          model: currentModelId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
          max_tokens: 4000,
          temperature: 0.6,
          include_reasoning: true,
        }),
      });
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[aura] Upstream compute error:', response.status, errorText);
    throw new ApiError(
      response.status >= 500 ? 502 : response.status,
      'AURA_ENGINE_BUSY',
      'Aura Engine is momentarily busy. Please try again or refine your prompt.'
    );
  }

  if (!response.body) {
    throw new ApiError(502, 'STREAM_FAILED', 'Failed to initialize response stream from Aura Engine.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let fullText = '';
  let reasoningText = '';
  let promptTokens = Math.ceil((prompt.length + systemPrompt.length) / 4);
  let completionTokens = 0;
  let reportedCostUsd: number | null = null;
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        if (trimmed === 'data: [DONE]') continue;

        try {
          const jsonStr = trimmed.slice(5).trim();
          const parsed = JSON.parse(jsonStr);

          // Extract reasoning / thought tokens (sanitized)
          const delta = parsed.choices?.[0]?.delta;
          const reasoningChunk = delta?.reasoning || delta?.reasoning_content || delta?.thought;
          if (reasoningChunk) {
            const cleanReasoning = sanitizeStreamingText(reasoningChunk);
            reasoningText += cleanReasoning;
            callbacks.onReasoning?.(cleanReasoning);
          }

          // Extract content tokens
          if (delta?.content) {
            fullText += delta.content;
            callbacks.onDelta?.(delta.content);
          }

          // Extract usage
          if (parsed.usage) {
            if (typeof parsed.usage.prompt_tokens === 'number') {
              promptTokens = parsed.usage.prompt_tokens;
            }
            if (typeof parsed.usage.completion_tokens === 'number') {
              completionTokens = parsed.usage.completion_tokens;
            }
            if (typeof parsed.usage.total_cost === 'number') {
              reportedCostUsd = parsed.usage.total_cost;
            }
          }
        } catch {
          // Incomplete chunk, keep reading
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!completionTokens) {
    completionTokens = Math.ceil(fullText.length / 4);
  }

  // Cost calculation based on internal model rates
  const computedCostUsd =
    (promptTokens * model.inputPerM) / 1e6 + (completionTokens * model.outputPerM) / 1e6;
  const costUsd = reportedCostUsd !== null ? reportedCostUsd : computedCostUsd;

  // Extract HTML from text
  const extractedHtml = extractHtml(fullText);
  const title = extractTitle(extractedHtml, prompt);

  return {
    fullText,
    reasoningText,
    html: extractedHtml,
    title,
    promptTokens,
    completionTokens,
    costUsd,
    estimated: reportedCostUsd === null,
  };
}

/**
 * Extracts pure HTML document from markdown codeblocks or raw HTML.
 */
export function extractHtml(text: string): string {
  // Check for ```html ... ``` block
  const codeBlockMatch = text.match(/```(?:html|xml)?\s*\n([\s\S]*?)(?:```|$)/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const candidate = codeBlockMatch[1].trim();
    if (candidate.includes('<!DOCTYPE') || candidate.includes('<html') || candidate.includes('<body') || candidate.includes('<head')) {
      return candidate;
    }
  }

  // Check for <!DOCTYPE html> ... </html>
  const docMatch = text.match(/<!DOCTYPE[\s\S]*?<\/html>/i);
  if (docMatch) {
    return docMatch[0].trim();
  }

  // Check for <html ... </html>
  const htmlMatch = text.match(/<html[\s\S]*?<\/html>/i);
  if (htmlMatch) {
    return `<!DOCTYPE html>\n${htmlMatch[0].trim()}`;
  }

  // Fallback: wrap raw content in minimal HTML shell if needed
  if (text.includes('<div') || text.includes('<main') || text.includes('<header')) {
    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-[#09090b] text-zinc-100 min-h-screen">
  ${text}
  <script>lucide.createIcons();</script>
</body>
</html>`;
  }

  return text;
}

export function extractTitle(html: string, prompt: string): string {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const clean = titleMatch[1].replace(/\|\s*Generated by Aura/i, '').replace(/\|\s*Aura/i, '').trim();
    if (clean.length > 2 && clean.length < 50) return clean;
  }

  // Extract from <h1>
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const clean = h1Match[1].trim();
    if (clean.length > 2 && clean.length < 40) return clean;
  }

  // Derive from prompt
  const words = prompt.replace(/[^\w\s]/g, '').trim().split(/\s+/);
  return words.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Aura App';
}
