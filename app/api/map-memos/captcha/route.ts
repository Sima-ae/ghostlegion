import { NextResponse } from 'next/server';
import { jsonError } from '@/app/lib/api-response';
import { createMemoCaptcha } from '@/app/lib/memo-captcha';

export async function GET() {
  try {
    const captcha = createMemoCaptcha();
    return NextResponse.json(captcha, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('Error creating memo captcha:', error);
    return jsonError(500, { error: 'Could not load the math question.', code: 'CAPTCHA' });
  }
}
