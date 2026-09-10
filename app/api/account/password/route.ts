import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/app/lib/db';
import { jsonError, jsonUnknownFailure } from '@/app/lib/api-response';
import { requireUser } from '@/app/lib/require-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();
    if (auth.error) return auth.error;

    const payload = await request.json();
    const currentPassword = typeof payload?.currentPassword === 'string' ? payload.currentPassword : '';
    const newPassword = typeof payload?.newPassword === 'string' ? payload.newPassword : '';

    if (!currentPassword || !newPassword) {
      return jsonError(400, { error: 'Current and new password are required.', code: 'INVALID_PASSWORD' });
    }
    if (newPassword.length < 8) {
      return jsonError(400, { error: 'New password must be at least 8 characters.', code: 'WEAK_PASSWORD' });
    }
    if (newPassword.length > 200) {
      return jsonError(400, { error: 'New password is too long.', code: 'WEAK_PASSWORD' });
    }
    if (currentPassword === newPassword) {
      return jsonError(400, { error: 'New password must be different from the current password.', code: 'SAME_PASSWORD' });
    }

    const user = await db.user.findUnique({
      where: { id: auth.session.user.id },
      select: { password: true },
    });
    if (!user?.password) {
      return jsonError(400, { error: 'Password cannot be changed for this account.', code: 'NO_PASSWORD' });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return jsonError(400, { error: 'Current password is incorrect.', code: 'WRONG_PASSWORD' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await db.user.update({
      where: { id: auth.session.user.id },
      data: { password: hash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating password:', error);
    return jsonUnknownFailure(error);
  }
}
