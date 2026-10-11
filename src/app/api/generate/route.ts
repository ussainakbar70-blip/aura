import { NextRequest, NextResponse } from 'next/server';
import { synthesizeAppFromPrompt } from '@/lib/templates';
import { FRONTIER_MODELS } from '@/config/models';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model: requestedModel } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const modelId = requestedModel || 'anthropic/claude-3.5-sonnet';
    const modelConfig = FRONTIER_MODELS.find((m) => m.id === modelId) || FRONTIER_MODELS[0];

    // Check OpenRouter API key from headers (BYOK) or server environment
    const userApiKey = req.headers.get('x-openrouter-key');
    const apiKey = userApiKey || process.env.OPENROUTER_API_KEY;

    // If an API key is available, call OpenRouter directly!
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const systemPrompt = `You are Aura, an elite autonomous frontend AI coding engine that acts like Lovable.
When a user gives an app prompt, you architect and build a COMPLETE, SINGLE-PAGE, FULLY INTERACTIVE web application.
Guidelines:
1. Output MUST include valid, standalone HTML with Tailwind CSS (<script src="https://cdn.tailwindcss.com"></script>) and Lucide Icons (<script src="https://unpkg.com/lucide@latest"></script>).
2. The UI must follow a sleek, dark-mode luxury aesthetic (#09090b background, fine borders, glowing accents, glass panels).
3. Include functional JavaScript: buttons, search filter, tab switching, mock data generator, modal interactions.
4. Output your answer in the following format:
---THOUGHT_STEPS---
- Step 1 description
- Step 2 description
- Step 3 description
---TITLE---
Clean App Title
---HTML---
<!DOCTYPE html>
<html>...</html>
---REACT---
import React from 'react'; ...
`;

        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://aura.build',
            'X-Title': 'Aura Vibe-Coding Platform',
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Build this application: ${prompt}` },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (openRouterRes.ok) {
          const completion = await openRouterRes.json();
          const rawContent = completion.choices?.[0]?.message?.content || '';

          // Parse the response
          const thoughtMatch = rawContent.match(/---THOUGHT_STEPS---([\s\S]*?)---TITLE---/);
          const titleMatch = rawContent.match(/---TITLE---([\s\S]*?)---HTML---/);
          const htmlMatch = rawContent.match(/---HTML---([\s\S]*?)(---REACT---|$)/);
          const reactMatch = rawContent.match(/---REACT---([\s\S]*?)$/);

          const thoughtSteps = thoughtMatch
            ? thoughtMatch[1].trim().split('\n').filter(Boolean).map((s: string) => s.replace(/^[-*]\s*/, ''))
            : [
                'Architected layout and components via OpenRouter',
                'Synthesized reactive state and event handlers',
                'Applied luxury dark mode tokens',
              ];

          const title = titleMatch ? titleMatch[1].trim() : 'Generated Application';
          const htmlCode = htmlMatch ? htmlMatch[1].trim() : rawContent;
          const reactCode = reactMatch ? reactMatch[1].trim() : '// React code';

          return NextResponse.json({
            success: true,
            source: 'openrouter',
            model: modelConfig.name,
            modelId,
            title,
            thoughtSteps,
            files: [
              { name: 'App.tsx', language: 'typescript', content: reactCode },
              { name: 'index.html', language: 'html', content: htmlCode },
              { name: 'styles.css', language: 'css', content: '/* Aura Luxury Tailwind Styles */' },
            ],
            htmlCode,
          });
        } else {
          console.warn('OpenRouter API returned error, falling back to local synthesis engine');
        }
      } catch (orErr) {
        console.warn('Error calling OpenRouter API:', orErr);
      }
    }

    // Default high-performance synthesis engine (works instantly with zero API keys required!)
    const synthesized = synthesizeAppFromPrompt(prompt, modelConfig.name);

    return NextResponse.json({
      success: true,
      source: 'aura-synthesis-engine',
      model: modelConfig.name,
      modelId,
      title: synthesized.title,
      thoughtSteps: synthesized.thoughtSteps,
      files: synthesized.files,
      htmlCode: synthesized.htmlCode,
      note: apiKey ? undefined : 'Running on Aura Smart Synthesis. Connect OpenRouter API Key in Settings for live cloud inference.',
    });
  } catch (error: any) {
    console.error('Generation route error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
