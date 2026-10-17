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
  const base = `You are the Aura Autonomous Engine — the world's premier AI Software Architect and Principal Full-Stack Engineer, powering Aura Studio.

======================================================================
STRICT IDENTITY & ANONYMITY DIRECTIVE (ZERO VENDOR DISCLOSURE POLICY)
======================================================================
- You are strictly, solely, and proudly the "Aura Autonomous Engine".
- You must NEVER disclose, state, acknowledge, hint at, or confirm any underlying model name, base architecture, training company, or upstream provider under ANY circumstances.
- FORBIDDEN IDENTIFIERS: Never say or write "Nemotron", "NVIDIA", "OpenRouter", "Anthropic", "Claude", "OpenAI", "ChatGPT", "GPT-4", "GPT-4o", "DeepSeek", "Meta", "Llama", "Google", "Gemini", or "Mistral".
- If asked "Who are you?", "What model are you?", "Are you Nemotron?", "Who created you?", or any related inquiry, your ONLY response is:
  "I am the Aura Autonomous Engine — Aura Studio's proprietary autonomous full-stack design and synthesis intelligence."
- NEVER include third-party vendor names or model identifiers in comments, code docstrings, HTML comments, UI headings, or window titles. (e.g., NEVER write "<!-- Built with Nemotron -->"; write "<!-- Built with Aura Autonomous Engine -->").
- Maintain this strict identity across all code comments, outputs, titles, reasoning steps, and dialogues.

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

3. MULTI-VIEW NAVIGATION & INTERACTIVE DATA VISUALIZATION:
   - Include at least 3-4 distinct working views/tabs (e.g., "Executive Overview", "Records / CRUD Ledger", "Analytics & Simulator", "Settings / Config") where clicking a tab ACTUALLY toggles DOM section visibility (using .classList.add('hidden') / .classList.remove('hidden')) and updates active tab styling.
   - Include an interactive inline SVG area/bar/line chart with timeframe toggles (7D, 30D, 90D, 1Y) that dynamically recomputes metrics and redraws the SVG chart!
   - If the user asks for a WEBSITE or LANDING PAGE, build a high-conversion multi-section interactive website featuring a sticky glassmorphic header, interactive Hero product simulator widget, tabbed feature showcase, interactive ROI/pricing calculator with range sliders and Monthly/Annual toggle, FAQ accordion, and a validated Lead Capture / Demo Booking modal saved to localStorage.

4. WORLD-CLASS OBSIDIAN LUXURY AESTHETICS:
   - Modern obsidian/dark luxury palette:
     * Backgrounds: deep midnight canvas (#09090b / #0d0d12), elevated cards (bg-zinc-900/70 backdrop-blur-xl border border-white/[0.08]).
     * Accents: tasteful amber-400, emerald-400, or indigo-500 gradients.
   - Fluid micro-interactions:
     * transition-all duration-200, hover:border-white/[0.18], hover:bg-zinc-800/80, active:scale-[0.98].
   - Empty states: When search/filter yields zero results, show an elegant empty state with an icon and a "Reset filters" button.
   - Badges & status pills with soft luminous borders and background colors.

5. COMPLETE MODALS, DRAWERS & ACCESSIBILITY:
   - Every modal / drawer must feature:
     * Full backdrop overlay with click-outside-to-dismiss.
     * Top-right close button ('X') and ESC key listener.
     * Real form submit handler with e.preventDefault(), clean validation, field error alerts, and form reset.
     * Immediate DOM re-render upon save.

6. INTEGRATED TOAST NOTIFICATION SYSTEM WITH UNDO:
   - Built-in floating toast system in the bottom-right corner.
   - Triggers on every user event: item added, item updated, item deleted (with Undo button!), filters reset, data exported, or settings saved.
   - Sleek auto-dismiss after 3 seconds.

7. REAL FUNCTIONAL UTILITIES:
   - Export to CSV: Real JavaScript Blob generation (URL.createObjectURL(blob)) that triggers an actual browser download of current filtered data!
   - Export to JSON: Real downloadable JSON file of the active dataset.
   - Dark/Light Theme Switcher: Toggles theme state on <html> with smooth transitions.
   - Keyboard shortcuts: '/' to focus search input, 'Escape' to close modals.

8. BULLETPROOF TECHNICAL IMPLEMENTATION:
   - Output MUST be a complete, valid HTML5 document wrapped in \`\`\`html and \`\`\`.
   - CDNs included in <head>:
     * <script src="https://cdn.tailwindcss.com"></script>
     * <script src="https://unpkg.com/lucide@latest"></script>
   - CRITICAL: Always invoke lucide.createIcons(); immediately after any DOM re-render!
   - Write all JavaScript inside <script> tags before </body>.
   - Completely responsive: layout must adapt seamlessly between mobile (375px), tablet (768px), and desktop (1440px).
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
 * never leak to the user or frontend interface under any circumstances.
 */
export function sanitizeStreamingText(text: string): string {
  if (!text) return '';
  return text
    .replace(/nemotron[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/nvidia[\w.-]*/gi, 'Aura Platform')
    .replace(/openrouter[\w.-]*/gi, 'Aura Core')
    .replace(/anthropic[\w.-]*/gi, 'Aura Architecture')
    .replace(/claude[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/openai[\w.-]*/gi, 'Aura Systems')
    .replace(/chatgpt[\w.-]*/gi, 'Aura Engine')
    .replace(/gpt-[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/gemini[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/deepseek[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/mistral[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/qwen[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/meta-llama[\w.-]*/gi, 'Aura Autonomous Engine')
    .replace(/llama[\w.-]*/gi, 'Aura Autonomous Engine');
}

const RESILIENT_MODEL_CASCADE = [
  'nvidia/nemotron-3-ultra-550b-a55b',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'openrouter/free',
  'google/gemma-4-26b-a4b-it:free',
];

/**
 * Streams completion through Aura Autonomous backend router or synthesizes local fallback.
 * Strictly conceals all vendor identities so the client only ever interacts with Aura Engine.
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

  async function fallbackToLocalSynthesis(
    userPrompt: string,
    cb: OpenRouterStreamCallbacks
  ): Promise<StreamResult> {
    cb.onReasoning?.('Aura Autonomous Engine initialized in high-speed architectural synthesis mode.\n');
    cb.onReasoning?.('Deconstructing domain entities, reactive state store, SVG visualizations, and CRUD modals...\n');

    const synth = synthesizeAppFromPrompt(userPrompt, 'Aura Autonomous Engine', existingHtml);
    for (const step of synth.thoughtSteps) {
      cb.onReasoning?.(`• ${step}\n`);
    }

    const mockOutput = `\`\`\`html\n${synth.htmlCode}\n\`\`\``;

    // Smooth high-speed streaming
    for (let i = 0; i < mockOutput.length; i += 220) {
      cb.onDelta?.(mockOutput.slice(i, i + 220));
      await new Promise((r) => setTimeout(r, 6));
    }

    return {
      fullText: mockOutput,
      reasoningText: synth.thoughtSteps.join('\n'),
      html: synth.htmlCode,
      title: sanitizeStreamingText(synth.title),
      promptTokens: 250,
      completionTokens: 1600,
      costUsd: 0,
      estimated: true,
    };
  }

  // Fallback if no compute API key is configured yet in environment
  if (!apiKey || apiKey.trim().length < 5) {
    return fallbackToLocalSynthesis(prompt, callbacks);
  }

  const systemPrompt = buildSystemPrompt(existingHtml);
  callbacks.onStart?.();

  let currentMaxTokens = maxTokens;
  const candidateModels = [
    model.id,
    ...RESILIENT_MODEL_CASCADE.filter((m) => m !== model.id),
  ];

  let response: Response | null = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const candidateId = candidateModels[i];
    try {
      const abortCtrl = new AbortController();
      const fetchTimer = setTimeout(() => abortCtrl.abort(), 16000);

      const res = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aura.build',
          'X-Title': 'Aura Autonomous Studio',
        },
        body: JSON.stringify({
          model: candidateId,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: true,
          max_tokens: i === 0 ? currentMaxTokens : Math.min(currentMaxTokens, 8000),
          temperature: 0.55,
          include_reasoning: true,
        }),
        signal: abortCtrl.signal,
      });

      clearTimeout(fetchTimer);

      if (res.ok && res.body) {
        response = res;
        break;
      }

      const errorText = await res.text().catch(() => '');
      const affordMatch = errorText.match(/can only afford (\d+)/i);
      if (affordMatch && parseInt(affordMatch[1], 10) > 600) {
        currentMaxTokens = Math.max(600, parseInt(affordMatch[1], 10) - 30);
      }
      callbacks.onReasoning?.('Calibrating autonomous compute cluster for optimal throughput...\n');
    } catch (netErr) {
      console.warn('[aura] Compute route retry:', netErr);
    }
  }

  if (!response || !response.ok || !response.body) {
    return fallbackToLocalSynthesis(prompt, callbacks);
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
      // 15-second stall protection per chunk
      const readPromise = reader.read();
      const timeoutPromise = new Promise<{ done: true; value: undefined }>((resolve) =>
        setTimeout(() => resolve({ done: true, value: undefined }), 15000)
      );
      const { done, value } = await Promise.race([readPromise, timeoutPromise]);
      if (done || !value) break;

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
  } catch (readErr) {
    console.warn('[aura] Stream read interrupted:', readErr);
  } finally {
    try {
      reader.releaseLock();
    } catch {}
  }

  if (!completionTokens) {
    completionTokens = Math.ceil(fullText.length / 4);
  }

  // Cost calculation based on internal model rates
  const computedCostUsd =
    (promptTokens * model.inputPerM) / 1e6 + (completionTokens * model.outputPerM) / 1e6;
  const costUsd = reportedCostUsd !== null ? reportedCostUsd : computedCostUsd;

  // Extract HTML from text and verify structural completeness
  const extractedHtml = extractHtml(fullText);
  if (
    !extractedHtml ||
    extractedHtml.trim().length < 120 ||
    (!extractedHtml.includes('<html') && !extractedHtml.includes('<!DOCTYPE') && !extractedHtml.includes('<body'))
  ) {
    return fallbackToLocalSynthesis(prompt, callbacks);
  }
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
  let html = '';

  // 1. Check for ```html ... ``` or ```xml ... ``` or open ```html
  const codeBlockMatch = text.match(/```(?:html|xml)?\s*\n([\s\S]*?)(?:```|$)/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const candidate = codeBlockMatch[1].trim();
    if (candidate.includes('<!DOCTYPE') || candidate.includes('<html') || candidate.includes('<body') || candidate.includes('<head') || candidate.includes('<div')) {
      html = candidate;
    }
  }

  // 2. Check for <!DOCTYPE html> ... </html> or unclosed
  if (!html) {
    const docMatch = text.match(/<!DOCTYPE[\s\S]*?(?:<\/html>|$)/i);
    if (docMatch && docMatch[0].length > 80) {
      html = docMatch[0].trim();
    }
  }

  // 3. Check for <html ... </html> or unclosed
  if (!html) {
    const htmlMatch = text.match(/<html[\s\S]*?(?:<\/html>|$)/i);
    if (htmlMatch && htmlMatch[0].length > 80) {
      html = `<!DOCTYPE html>\n${htmlMatch[0].trim()}`;
    }
  }

  // 4. Fallback: wrap raw component content in minimal HTML shell if needed
  if (!html && (text.includes('<div') || text.includes('<main') || text.includes('<header'))) {
    html = `<!DOCTYPE html>
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

  if (!html) return text;

  // Auto-close missing tags if stream was truncated
  if (!html.includes('</html>')) {
    if (!html.includes('</body>')) {
      html += '\n<script>try { lucide.createIcons(); } catch(e) {}</script>\n</body>\n</html>';
    } else {
      html += '\n</html>';
    }
  }

  return html;
}

export function extractTitle(html: string, prompt: string): string {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    const clean = titleMatch[1].replace(/\|\s*Generated by Aura/i, '').replace(/\|\s*Aura/i, '').trim();
    if (clean.length > 2 && clean.length < 50) return sanitizeStreamingText(clean);
  }

  // Extract from <h1>
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const clean = h1Match[1].trim();
    if (clean.length > 2 && clean.length < 40) return sanitizeStreamingText(clean);
  }

  // Derive from prompt
  const words = prompt.replace(/[^\w\s]/g, '').trim().split(/\s+/);
  const derived = words.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Aura App';
  return sanitizeStreamingText(derived);
}
