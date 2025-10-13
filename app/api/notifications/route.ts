import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { getClientIP, getNotificationReadCookie, setNotificationReadCookie } from '@/app/lib/notification-utils';

// GET /api/notifications - Get notifications for current user or public notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includePending = searchParams.get('includePending') === 'true';

    // Get client IP address and cookie data
    const ip = getClientIP(request);
    const cookieReadNotifications = getNotificationReadCookie(request);
    
    console.log('API Debug - IP:', ip);
    console.log('API Debug - Session:', session?.user?.id || 'No session');
    console.log('API Debug - Cookie notifications:', cookieReadNotifications);

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
      // Get only approved public notifications for non-logged-in users
      notifications = await db.notification.findMany({
        where: {
          status: 'APPROVED', // Only show approved notifications
          isPublic: true,
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

    // Calculate unread count based on user or IP
    let unreadCount = 0;
    if (session?.user?.id) {
      // For logged-in users, check if they've read the notification (all approved notifications - public and private)
      unreadCount = await db.notification.count({
        where: {
          status: 'APPROVED', // Only count approved notifications
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ],
          NOT: { readByUsers: { has: session.user.id } }
        }
      });
    } else {
      // For anonymous users, check if their IP or cookies have read the notification
      const allNotifications = await db.notification.findMany({
        where: {
          status: 'APPROVED', // Only count approved notifications
          isPublic: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });
      
      // Count notifications not read by IP or cookies
      unreadCount = allNotifications.filter(notification => 
        !notification.readByIPs.includes(ip) && 
        !cookieReadNotifications.includes(notification.id)
      ).length;
    }

    // Add read status to each notification
    const notificationsWithReadStatus = notifications.map(notification => ({
      ...notification,
      isRead: session?.user?.id 
        ? notification.readByUsers.includes(session.user.id)
        : notification.readByIPs.includes(ip) || cookieReadNotifications.includes(notification.id)
    }));

    console.log('API Debug - Unread count:', unreadCount);
    console.log('API Debug - Notifications found:', notifications.length);
    console.log('API Debug - Notifications with read status:', notificationsWithReadStatus.map(n => ({ id: n.id, title: n.title, isRead: n.isRead })));

    return NextResponse.json({
      notifications: notificationsWithReadStatus,
      unreadCount,
      hasMore: notifications.length === limit
    });
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
