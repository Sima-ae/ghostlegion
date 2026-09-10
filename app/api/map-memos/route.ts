import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/app/lib/db';
import { jsonMissingDatabase, jsonDbFailure, jsonUnknownFailure, jsonError } from '@/app/lib/api-response';
import { authOptions } from '@/app/lib/auth';
import { isAdminRole, isStaffRole, requireStaff } from '@/app/lib/require-auth';
import { MAX_MEMO_BODY } from '@/app/types';
import { getClientIP } from '@/app/lib/notification-utils';
import { attachCurrentAuthorNames, authorDisplayName } from '@/app/lib/map-memo-authors';

const PUBLIC_MEMO_SELECT = {
  id: true,
  body: true,
  latitude: true,
  longitude: true,
  createdBy: true,
  createdByName: true,
  updatedBy: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  isPrivate: true,
} as const;

function creatorIp(request: NextRequest): string {
  const ip = getClientIP(request).trim().replace(/^::ffff:/i, '').slice(0, 45);
  return ip || 'unknown';
}

function parseMemoInput(body: unknown) {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;
  const text = typeof data.body === 'string' ? data.body.trim() : '';
  const latitude = Number(data.latitude);
  const longitude = Number(data.longitude);
  if (!text) return { error: 'Write a memo before saving.' } as const;
  if (text.length > MAX_MEMO_BODY) {
    return { error: `Memo is too long (max ${MAX_MEMO_BODY} characters).` } as const;
  }
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { error: 'Invalid map location.' } as const;
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { error: 'Invalid map location.' } as const;
  }
  const isPrivate = data.isPrivate === true;
  return {
    value: {
      body: text,
      latitude: Number(latitude.toFixed(7)),
      longitude: Number(longitude.toFixed(7)),
      isPrivate,
    },
  } as const;
}

export async function GET(request: NextRequest) {
  try {
    const missingDb = jsonMissingDatabase([]);
    if (missingDb) return missingDb;

    const moderation = request.nextUrl.searchParams.get('moderation') === 'true';

    if (moderation) {
      const auth = await requireStaff();
      if (auth.error) return auth.error;
      const memos = await attachCurrentAuthorNames(
        await db.mapMemo.findMany({
          orderBy: { createdAt: 'desc' },
        })
      );
      return NextResponse.json(memos, {
        headers: { 'Cache-Control': 'private, no-store' },
      });
    }

    const session = await getServerSession(authOptions);
    const staff = isStaffRole(session?.user?.role);
    const userId = session?.user?.id;
    const memos = await attachCurrentAuthorNames(
      await db.mapMemo.findMany({
        where: staff
          ? { status: 'APPROVED' }
          : userId
            ? {
                status: 'APPROVED',
                OR: [{ isPrivate: false }, { createdBy: userId }],
              }
            : { status: 'APPROVED', isPrivate: false },
        orderBy: { createdAt: 'desc' },
        select: PUBLIC_MEMO_SELECT,
      })
    );

    return NextResponse.json(memos, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Error fetching map memos:', error);
    if (error instanceof Error) {
      if (
        error.message.includes('DATABASE_URL') ||
        error.message.includes('connection')
      ) {
        return jsonDbFailure();
      }
    }
    return jsonUnknownFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = parseMemoInput(await request.json());
    if (!parsed || 'error' in parsed) {
      return jsonError(400, { error: parsed?.error || 'Invalid memo', code: 'INVALID_MEMO' });
    }

    const session = await getServerSession(authOptions);
    const publishNow = isAdminRole(session?.user?.role);
    const account = session?.user?.id
      ? await db.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true },
        })
      : null;
    const createdByName = session?.user?.id
      ? authorDisplayName(account, session.user.name || session.user.email || 'Member')
      : 'Visitor';
    const memo = await db.mapMemo.create({
      data: {
        ...parsed.value,
        createdBy: session?.user?.id || 'visitor',
        createdByName,
        status: publishNow ? 'APPROVED' : 'PENDING',
        reviewedBy: publishNow ? session?.user?.id : null,
        reviewedAt: publishNow ? new Date() : null,
        createdIp: creatorIp(request),
      },
    });

    return NextResponse.json(memo, { status: 201 });
  } catch (error) {
    console.error('Error creating map memo:', error);
    return jsonUnknownFailure(error);
  }
}
