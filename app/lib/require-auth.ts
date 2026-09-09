import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { jsonError } from '@/app/lib/api-response';

const STAFF_ROLES = new Set(['ADMIN', 'COMMANDER', 'SUPER_ADMIN']);

export function isStaffRole(role?: string | null) {
  return Boolean(role && STAFF_ROLES.has(role));
}

export async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      session: null,
      error: jsonError(401, { error: 'Unauthorized', code: 'UNAUTHORIZED' }),
    };
  }
  if (!isStaffRole(session.user.role)) {
    return {
      session,
      error: jsonError(403, { error: 'Forbidden', code: 'FORBIDDEN' }),
    };
  }
  return { session, error: null };
}
