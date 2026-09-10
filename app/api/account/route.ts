import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jsonError, jsonUnknownFailure } from '@/app/lib/api-response';
import { requireUser } from '@/app/lib/require-auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const user = await db.user.findUnique({
      where: { id: auth.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return jsonError(404, { error: 'Not found', code: 'NOT_FOUND' });
    }

    return NextResponse.json(user, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Error loading account:', error);
    return jsonUnknownFailure(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const payload = await request.json();
    const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';

    if (name.length < 2 || name.length > 80) {
      return jsonError(400, { error: 'Name must be between 2 and 80 characters.', code: 'INVALID_NAME' });
    }
    if (!EMAIL_RE.test(email) || email.length > 190) {
      return jsonError(400, { error: 'Enter a valid email address.', code: 'INVALID_EMAIL' });
    }

    const taken = await db.user.findFirst({
      where: { email, NOT: { id: auth.session.user.id } },
      select: { id: true },
    });
    if (taken) {
      return jsonError(409, { error: 'That email is already in use.', code: 'EMAIL_TAKEN' });
    }

    const user = await db.user.update({
      where: { id: auth.session.user.id },
      data: { name, email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await db.mapMemo.updateMany({
      where: { createdBy: auth.session.user.id },
      data: { createdByName: name },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating account:', error);
    return jsonUnknownFailure(error);
  }
}
