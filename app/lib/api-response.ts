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
  return jsonError(503, {
    error:
      process.env.NODE_ENV === 'development'
        ? 'Database is not connected. Keep npm run db:tunnel running, then try again.'
        : 'Could not reach the database. Please try again in a moment.',
    code: 'DB_ERROR',
  });
}

function errorText(err: unknown) {
  if (err instanceof Error) return `${err.name} ${err.message}`;
  return String(err);
}

export function isDatabaseUnreachable(err: unknown) {
  const text = errorText(err);
  return /PrismaClientInitializationError|can't reach database|P1001|P1017|ECONNREFUSED|Server has closed the connection/i.test(
    text
  );
}

export function jsonUnknownFailure(err: unknown) {
  if (isDatabaseUnreachable(err)) return jsonDbFailure();
  const text = errorText(err);
  if (/PrismaClientValidationError|Unknown argument|Unknown column|P2022/i.test(text)) {
    return jsonError(500, {
      error:
        process.env.NODE_ENV === 'development'
          ? 'The app is out of sync with the database. Run prisma db push, restart npm run dev, then try again.'
          : 'Could not save. Please try again.',
      code: 'DB_SCHEMA',
    });
  }
  return jsonError(500, {
    error: 'Could not complete that request. Please try again.',
    code: 'INTERNAL',
  });
}
