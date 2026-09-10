import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jsonUnknownFailure, jsonError } from '@/app/lib/api-response';
import { isStaffRole, requireAdmin, requireStaff, requireUser } from '@/app/lib/require-auth';
import { MAX_MEMO_BODY } from '@/app/types';
import { attachCurrentAuthorNames } from '@/app/lib/map-memo-authors';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const existing = await db.mapMemo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (payload?.action === 'approve' || payload?.action === 'reject') {
      const auth = await requireStaff();
      if (auth.error) return auth.error;

      const memo = await db.mapMemo.update({
        where: { id },
        data: {
          status: payload.action === 'approve' ? 'APPROVED' : 'REJECTED',
          reviewedBy: auth.session.user.id,
          reviewedAt: new Date(),
        },
      });
      const [named] = await attachCurrentAuthorNames([memo]);
      return NextResponse.json(named);
    }

    if (payload?.action === 'set-private') {
      const auth = await requireStaff();
      if (auth.error) return auth.error;
      const memo = await db.mapMemo.update({
        where: { id },
        data: {
          isPrivate: payload.isPrivate === true,
          updatedBy: auth.session.user.id,
        },
      });
      const [named] = await attachCurrentAuthorNames([memo]);
      return NextResponse.json(named);
    }

    const auth = await requireUser();
    if (auth.error) return auth.error;

    const isOwner = existing.createdBy === auth.session.user.id;
    if (!isStaffRole(auth.session.user.role) && !isOwner) {
      return jsonError(403, { error: 'Forbidden', code: 'FORBIDDEN' });
    }

    const text = typeof payload?.body === 'string' ? payload.body.trim() : '';
    if (!text) {
      return jsonError(400, { error: 'Write a memo before saving.', code: 'INVALID_MEMO' });
    }
    if (text.length > MAX_MEMO_BODY) {
      return jsonError(400, {
        error: `Memo is too long (max ${MAX_MEMO_BODY} characters).`,
        code: 'INVALID_MEMO',
      });
    }

    const memo = await db.mapMemo.update({
      where: { id },
      data: {
        body: text,
        isPrivate: typeof payload?.isPrivate === 'boolean' ? payload.isPrivate : existing.isPrivate,
        updatedBy: auth.session.user.id,
      },
    });

    const [named] = await attachCurrentAuthorNames([memo]);
    return NextResponse.json(named);
  } catch (error) {
    console.error('Error updating map memo:', error);
    return jsonUnknownFailure(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const existing = await db.mapMemo.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.mapMemo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting map memo:', error);
    return jsonUnknownFailure(error);
  }
}
