import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { asStringArray } from '@/app/lib/json-array';
import { getClientIP, getNotificationReadCookie } from '@/app/lib/notification-utils';

// GET /api/notifications - Get notifications for current user or public notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includePending = searchParams.get('includePending') === 'true';

    const ip = getClientIP(request);
    const cookieReadNotifications = getNotificationReadCookie(request);

    let notifications;

    if (session?.user?.id) {
      // For logged-in users, check if they want to include pending notifications (admin only)
      const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
      
      if (includePending && isAdmin) {
        // Admin requesting all notifications including pending ones
        notifications = await db.notification.findMany({
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        });
      } else {
        // Get approved notifications for logged-in user (public + private)
        notifications = await db.notification.findMany({
          where: {
            status: 'APPROVED', // Only show approved notifications
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        });
      }
    } else {
      notifications = await db.notification.findMany({
        where: {
          status: 'APPROVED',
          isPublic: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    }

    const unreadRows = await db.notification.findMany({
      where: session?.user?.id
        ? {
            status: 'APPROVED',
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          }
        : {
            status: 'APPROVED',
            isPublic: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
      select: { id: true, readByUsers: true, readByIPs: true },
    });

    const unreadCount = unreadRows.filter((row) => {
      if (session?.user?.id) {
        return !asStringArray(row.readByUsers).includes(session.user.id);
      }
      return (
        !asStringArray(row.readByIPs).includes(ip) &&
        !cookieReadNotifications.includes(row.id)
      );
    }).length;

    // Add read status to each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      const readByUsers = asStringArray(notification.readByUsers);
      const readByIPs = asStringArray(notification.readByIPs);
      return {
        ...notification,
        targetUsers: asStringArray(notification.targetUsers),
        readByUsers,
        readByIPs,
        isRead: session?.user?.id
          ? readByUsers.includes(session.user.id)
          : readByIPs.includes(ip) || cookieReadNotifications.includes(notification.id),
      };
    });

    return NextResponse.json(
      {
        notifications: notificationsWithReadStatus,
        unreadCount,
        hasMore: notifications.length === limit,
      },
      {
        headers: {
          'Cache-Control': 'private, max-age=10',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create new notification (All users can create, but normal users need approval)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      message,
      type = 'INFO',
      priority = 'MEDIUM',
      isPublic = true,
      targetUsers = [],
      expiresAt
    } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Determine if user is admin/super admin (auto-approve) or normal user (pending approval)
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    
    const notification = await db.notification.create({
      data: {
        title,
        message,
        type: type.toUpperCase(),
        priority: priority.toUpperCase(),
        isPublic,
        targetUsers: Array.isArray(targetUsers) ? targetUsers : [],
        readByUsers: [], // Initialize empty array for user read tracking
        readByIPs: [], // Initialize empty array for IP read tracking
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        // Approval workflow fields
        isApproved: isAdmin, // Auto-approve for admins
        status: isAdmin ? 'APPROVED' : 'PENDING',
        createdBy: session.user.id,
        approvedBy: isAdmin ? session.user.id : null,
        approvedAt: isAdmin ? new Date() : null
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
