import { AIModel } from '@/config/models';
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
 * Builds the system prompt for single-page standalone web applications.
 * If prior HTML exists, explicitly instructs the model to iterate on it.
 */
export function buildSystemPrompt(existingHtml?: string | null): string {
  const base = `You are Aura, an elite autonomous frontend software engineer and design architect (similar to Lovable / v0).
Your mission is to build PRODUCTION-QUALITY, FULLY FUNCTIONAL, INTERACTIVE, SINGLE-PAGE WEB APPLICATIONS.

STRICT TECHNICAL RULES:
1. Output MUST contain a complete, valid HTML5 document wrapped inside \`\`\`html and \`\`\`.
2. STYLING: Include Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>. Use a sleek, modern, dark-mode luxury aesthetic (#09090b or #0e0e12 background, subtle borders, warm amber/gold accents, crisp typography).
3. ICONS: Include Lucide Icons via CDN: <script src="https://unpkg.com/lucide@latest"></script> and call \`lucide.createIcons();\` after DOM changes.
4. JAVASCRIPT & INTERACTIVITY: Write full, clean vanilla JavaScript or micro-framework logic inside <script> tags. Every button, tab, search bar, filter, modal, toggle, and dropdown MUST actually work with live mock data and reactive state!
5. ZERO PLACEHOLDERS: Do not leave "TODO", "Lorem ipsum", or empty stub functions. Provide rich, realistic initial data (charts, tables, metrics, cards).
6. SELF-CONTAINED: All code, CSS, and JS must be inside the single HTML document. Do not import local files. External CDNs (Tailwind, Lucide, Chart.js, Confetti) are allowed.
7. RESPONSIVE: Must look flawless on mobile (375px), tablet (768px), and desktop (1440px).`;

  if (existingHtml && existingHtml.trim().length > 100) {
    return `${base}

ITERATION INSTRUCTIONS:
The user is iterating on an existing application. Below is the current HTML code.
Your job is to APPLY THE REQUESTED CHANGES TO THIS CODE while preserving existing working features, structure, and design aesthetic unless explicitly asked to redesign.
Return the complete, updated HTML file in \`\`\`html ... \`\`\`.

CURRENT HTML:
${existingHtml.slice(0, 24000)}`;
  }

  return base;
}

/**
 * Streams completion from OpenRouter or synthesizes fallback.
 */
export async function streamOpenRouter(
  model: AIModel,
  prompt: string,
  existingHtml: string | null | undefined,
  maxTokens: number,
  callbacks: OpenRouterStreamCallbacks
): Promise<StreamResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // Fallback if no OpenRouter key is configured yet
  if (!apiKey || apiKey.trim().length < 5) {
    callbacks.onReasoning?.('OpenRouter API key is not configured in server environment.');
    callbacks.onReasoning?.('Engaging Aura Intelligent Synthesis Engine to generate preview...');

    const synth = synthesizeAppFromPrompt(prompt, model.label);
    const mockOutput = `\`\`\`html\n${synth.htmlCode}\n\`\`\``;

    // Simulate streaming for smooth UI
    for (let i = 0; i < mockOutput.length; i += 80) {
      callbacks.onDelta?.(mockOutput.slice(i, i + 80));
      await new Promise((r) => setTimeout(r, 15));
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

  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aura.build',
      'X-Title': 'Aura Vibe-Coding Platform',
    },
    body: JSON.stringify({
      model: model.id,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      stream: true,
      max_tokens: maxTokens,
      temperature: 0.7,
      include_reasoning: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[aura] OpenRouter HTTP error:', response.status, errorText);
    throw new ApiError(
      response.status >= 500 ? 502 : response.status,
      'OPENROUTER_ERROR',
      `OpenRouter request failed (${response.status}): ${errorText.slice(0, 160)}`
    );
  }

  if (!response.body) {
    throw new ApiError(502, 'OPENROUTER_ERROR', 'No response stream received from OpenRouter.');
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

          // Extract reasoning / thought tokens
          const delta = parsed.choices?.[0]?.delta;
          if (delta?.reasoning) {
            reasoningText += delta.reasoning;
            callbacks.onReasoning?.(delta.reasoning);
          }

          // Extract content tokens
          if (delta?.content) {
            fullText += delta.content;
            callbacks.onDelta?.(delta.content);
          }

          // Extract usage if OpenRouter sends it at the end
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
          // Incomplete or non-json chunk, keep reading
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!completionTokens) {
    completionTokens = Math.ceil(fullText.length / 4);
  }

  // Cost calculation
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
    const clean = titleMatch[1].replace(/\|\s*Generated by Aura/i, '').trim();
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
