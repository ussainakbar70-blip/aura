import { requireUser } from '@/lib/server/auth';
import { getAccount, reserveGeneration, settleGeneration } from '@/lib/server/billing';
import { ApiError, errorResponse, readJson } from '@/lib/server/errors';
import { resolveBackendModel, AURA_ENGINE_DISPLAY } from '@/config/models';
import { createProject, getProject, recordIteration } from '@/lib/server/projects';
import { streamOpenRouter } from '@/lib/server/openrouter';
import { usdToCredits } from '@/config/plans';
import type { ChatMessage, GenerateEvent } from '@/types';

interface GenerateBody {
  prompt: string;
  projectId?: string;
}

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await readJson<GenerateBody>(req);

    if (!body.prompt || typeof body.prompt !== 'string' || !body.prompt.trim()) {
      throw new ApiError(400, 'EMPTY_PROMPT', 'Prompt cannot be empty.');
    }

    const promptText = body.prompt.trim();

    // Fetch user account to dynamically resolve internal backend model based on tier
    const account = await getAccount(user);
    const internalModel = resolveBackendModel(account.plan);

    // Check existing project if iterating
    let existingHtml: string | null = null;
    let projectTitle = 'Untitled App';
    if (body.projectId) {
      try {
        const project = await getProject(user.uid, body.projectId);
        existingHtml = project.html;
        projectTitle = project.title;
      } catch (err) {
        if (!(err instanceof ApiError && err.code === 'PROJECT_NOT_FOUND')) {
          throw err;
        }
      }
    }

    const customApiKey = req.headers.get('x-compute-key') || req.headers.get('x-openrouter-key') || undefined;

    // Estimate input tokens for reservation
    const inputTokenEstimate = Math.ceil(
      (promptText.length + (existingHtml?.length ?? 0) + 1200) / 4
    );

    // Atomically reserve generation
    const reservation = await reserveGeneration(user, internalModel, inputTokenEstimate);

    // Create ReadableStream for SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: GenerateEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        const now = Date.now();
        const userMsg: ChatMessage = {
          id: `msg_${now}_user`,
          role: 'user',
          content: promptText,
          createdAt: now,
        };

        sendEvent({
          type: 'start',
          model: AURA_ENGINE_DISPLAY.name,
          maxTokens: reservation.maxTokens,
        });

        try {
          const streamResult = await streamOpenRouter(
            internalModel,
            promptText,
            existingHtml,
            reservation.maxTokens,
            {
              onReasoning: (text) => sendEvent({ type: 'reasoning', text }),
              onDelta: (text) => sendEvent({ type: 'delta', text }),
            },
            customApiKey
          );

          const actualCredits = usdToCredits(streamResult.costUsd);
          const asstNow = Date.now();
          const asstMsg: ChatMessage = {
            id: `msg_${asstNow}_asst`,
            role: 'assistant',
            content: streamResult.reasoningText || `Architected and synthesized ${streamResult.title} with full interactive state.`,
            createdAt: asstNow,
            model: AURA_ENGINE_DISPLAY.name,
            credits: Math.round(actualCredits * 100) / 100,
          };

          // Save to Firestore / local project database
          let finalProjectId = body.projectId;
          let finalVersion = 1;
          let finalTitle = streamResult.title;

          if (body.projectId) {
            const iterResult = await recordIteration(user.uid, body.projectId, {
              html: streamResult.html,
              model: 'aura-engine',
              prompt: promptText,
              userMessage: userMsg,
              assistantMessage: asstMsg,
              newTitle: streamResult.title,
            });
            finalVersion = iterResult.version;
            finalTitle = iterResult.title;
          } else {
            const newProj = await createProject(user.uid, {
              title: streamResult.title,
              html: streamResult.html,
              model: 'aura-engine',
              prompt: promptText,
              userMessage: userMsg,
              assistantMessage: asstMsg,
            });
            finalProjectId = newProj.id;
            finalVersion = 1;
          }

          // Settle the reservation with actual cost
          await settleGeneration({
            reservation,
            actualCredits,
            refundRequest: false,
            ledger: {
              projectId: finalProjectId || 'unknown',
              model: 'aura-engine',
              promptTokens: streamResult.promptTokens,
              completionTokens: streamResult.completionTokens,
              costUsd: streamResult.costUsd,
              estimated: streamResult.estimated,
              outcome: 'saved',
            },
          });

          // Fetch updated account state
          const updatedAccount = await getAccount(user);

          asstMsg.version = finalVersion;

          sendEvent({
            type: 'done',
            version: finalVersion,
            title: finalTitle,
            message: asstMsg,
            userMessage: userMsg,
            html: streamResult.html,
            account: updatedAccount,
          });

          controller.close();
        } catch (genErr: any) {
          console.error('[aura] Generation stream error:', genErr);

          // Refund the hold and request limit slot
          try {
            await settleGeneration({
              reservation,
              actualCredits: 0,
              refundRequest: true,
              ledger: {
                projectId: body.projectId || 'failed',
                model: 'aura-engine',
                promptTokens: inputTokenEstimate,
                completionTokens: 0,
                costUsd: 0,
                estimated: true,
                outcome: 'failed',
              },
            });
          } catch (refundErr) {
            console.error('[aura] Failed to refund reservation:', refundErr);
          }

          const fallbackAccount = await getAccount(user).catch(() => undefined);
          sendEvent({
            type: 'error',
            code: genErr?.code || 'GENERATION_FAILED',
            message: genErr?.message || 'Failed to complete generation. Limits have been refunded.',
            account: fallbackAccount,
          });

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
