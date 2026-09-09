import { NextResponse } from 'next/server';

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

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

/**
 * When DATABASE_URL is missing, fail clearly.
 * Never return sample/demo rows — local and production both read MariaDB.
 */
export function jsonMissingDatabase<T>(_devFallback?: T) {
  if (isDatabaseConfigured()) return null;
  return jsonDbNotConfigured();
}

export function jsonDbFailure() {
  return jsonError(500, {
    error: 'Service temporarily unavailable',
    code: 'DB_ERROR',
  });
}

export function jsonUnknownFailure(_err: unknown) {
  // Never send Prisma / connection strings / secrets to the client.
  return jsonError(500, { error: 'Service temporarily unavailable', code: 'INTERNAL' });
}
