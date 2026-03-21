import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

/** Generic JSON errors — never include stack traces or DB details in production. */
export function jsonError(
  status: number,
  body: { error: string; code?: string }
) {
  return NextResponse.json(body, { status });
}

export function jsonDbNotConfigured() {
  return jsonError(503, {
    error: 'Service unavailable',
    code: 'DB_NOT_CONFIGURED',
  });
}

export function jsonDbFailure() {
  return jsonError(500, {
    error: 'Service temporarily unavailable',
    code: 'DB_ERROR',
  });
}

export function jsonUnknownFailure(err: unknown) {
  if (isDev && err instanceof Error) {
    return NextResponse.json(
      { error: 'Request failed', message: err.message },
      { status: 500 }
    );
  }
  return jsonError(500, { error: 'Service temporarily unavailable', code: 'INTERNAL' });
}
