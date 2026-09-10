import { db } from './db';

export function authorDisplayName(
  user: { name?: string | null; email?: string | null } | null | undefined,
  fallback = 'Member'
) {
  const name = user?.name?.trim();
  if (name) return name;
  const email = user?.email?.trim();
  if (email) return email;
  return fallback;
}

export async function attachCurrentAuthorNames<T extends { createdBy: string; createdByName: string | null }>(
  memos: T[]
): Promise<T[]> {
  const ids = [
    ...new Set(memos.map((memo) => memo.createdBy).filter((id) => id && id !== 'visitor')),
  ];
  if (ids.length === 0) return memos;

  const users = await db.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, email: true },
  });
  const names = new Map(users.map((user) => [user.id, authorDisplayName(user)]));

  return memos.map((memo) => {
    const live = names.get(memo.createdBy);
    return live ? { ...memo, createdByName: live } : memo;
  });
}
