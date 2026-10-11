import type { ApiErrorBody } from '@/types';

/** An error that is safe to show to the client. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorBody(code: string, message: string): ApiErrorBody {
  return { error: { code, message } };
}

/** Convert any thrown value into a JSON error response without leaking internals. */
export function errorResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json(errorBody(err.code, err.message), { status: err.status });
  }
  // Re-throw Next.js internal bailouts (e.g. NEXT_PRERENDER_INTERRUPTED)
  if (typeof err === 'object' && err !== null && 'digest' in err) {
    throw err;
  }
  console.error('[aura] Unhandled API error:', err);
  return Response.json(errorBody('INTERNAL', 'Something went wrong on our side. Please try again.'), {
    status: 500,
  });
}

export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new ApiError(400, 'BAD_JSON', 'Request body must be valid JSON.');
  }
}
