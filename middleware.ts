import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Never serve env files, SQL dumps, keys, or git metadata over HTTP. */
function isBlockedSecretPath(pathname: string): boolean {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    /* keep raw pathname */
  }
  const normalized = decoded.replace(/\\/g, '/').toLowerCase();
  const base = normalized.split('/').pop() || '';

  if (base === '.env' || base.startsWith('.env.') || base.endsWith('.pem') || base.endsWith('.key')) {
    return true;
  }
  if (base.endsWith('.sql')) {
    return true;
  }
  if (base === '.htaccess' || base === '.htpasswd') {
    return true;
  }
  if (normalized.includes('/.env') || normalized === '/.env') {
    return true;
  }
  if (normalized.startsWith('/database/') || normalized === '/database') {
    return true;
  }
  if (normalized.startsWith('/.git') || normalized.includes('/.git/')) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  if (isBlockedSecretPath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
