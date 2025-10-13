import { NextRequest, NextResponse } from 'next/server';

// Utility functions for notification tracking
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

export function getNotificationReadCookie(request: NextRequest): string[] {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return [];
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const readNotifications = cookies['read-notifications'];
  return readNotifications ? readNotifications.split(',') : [];
}

export function setNotificationReadCookie(response: NextResponse, notificationIds: string[]): NextResponse {
  const cookieValue = notificationIds.join(',');
  response.headers.set('Set-Cookie', `read-notifications=${cookieValue}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`);
  return response;
}
