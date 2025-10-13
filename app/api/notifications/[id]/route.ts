import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getClientIP, getNotificationReadCookie, setNotificationReadCookie } from '@/app/lib/notification-utils';

const prisma = new PrismaClient();

// GET /api/notifications/[id] - Get specific notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Get client IP address and cookie data
    const ip = getClientIP(request);
    const cookieReadNotifications = getNotificationReadCookie(request);

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Check if user can access this notification
    if (!notification.isPublic && !session?.user?.id) {
      return NextResponse.json(
        { error: 'Access denied. Private notifications require login.' },
        { status: 403 }
      );
    }

    // Only show approved notifications to public users
    if (!session?.user?.id && notification.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // For logged-in users, they can see their own pending notifications and all approved ones
    if (session?.user?.id && notification.status !== 'APPROVED' && notification.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Check if notification has expired
    if (notification.expiresAt && notification.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Notification has expired' },
        { status: 410 }
      );
    }

    // Add read status based on user, IP, or cookies
    const notificationWithReadStatus = {
      ...notification,
      isRead: session?.user?.id 
        ? notification.readByUsers.includes(session.user.id)
        : notification.readByIPs.includes(ip) || cookieReadNotifications.includes(notification.id)
    };

    return NextResponse.json(notificationWithReadStatus);
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/[id] - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Check if this is an update request (has title/message), approval request, or mark-as-read request
    const isUpdateRequest = body.title || body.message || body.type || body.priority !== undefined;
    const isApprovalRequest = body.action === 'approve' || body.action === 'reject';

    if (isUpdateRequest) {
      // Handle notification update (Admin/Super Admin only)
      if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      // Update notification
      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: {
          title: body.title,
          message: body.message,
          type: body.type,
          priority: body.priority,
          isPublic: body.isPublic,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
          updatedAt: new Date()
        }
      });

      return NextResponse.json(updatedNotification);
    } else if (isApprovalRequest) {
      // Handle approval/rejection (Admin/Super Admin only)
      if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      // Update notification status
      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: {
          status: body.action === 'approve' ? 'APPROVED' : 'REJECTED',
          isApproved: body.action === 'approve',
          approvedBy: session.user.id,
          approvedAt: new Date(),
          updatedAt: new Date()
        }
      });

      return NextResponse.json(updatedNotification);
    } else {
      // Handle mark-as-read request
      // Get client IP address and cookie data
      const ip = getClientIP(request);
      const cookieReadNotifications = getNotificationReadCookie(request);

      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      // Check if user can access this notification
      if (!notification.isPublic && !session?.user?.id) {
        return NextResponse.json(
          { error: 'Access denied. Private notifications require login.' },
          { status: 403 }
        );
      }

      // Only allow marking approved notifications as read
      if (notification.status !== 'APPROVED') {
        return NextResponse.json(
          { error: 'Can only mark approved notifications as read' },
          { status: 403 }
        );
      }

      // Update read status based on user, IP, or cookies
      let updateData: any = {};
      let response = NextResponse.json({});
      
      if (session?.user?.id) {
        // For logged-in users, add to readByUsers array
        if (!notification.readByUsers.includes(session.user.id)) {
          updateData.readByUsers = [...notification.readByUsers, session.user.id];
        }
      } else {
        // For anonymous users, add to readByIPs array and update cookies
        if (!notification.readByIPs.includes(ip)) {
          updateData.readByIPs = [...notification.readByIPs, ip];
        }
        
        // Update cookie with read notification
        if (!cookieReadNotifications.includes(notification.id)) {
          const updatedCookieReadNotifications = [...cookieReadNotifications, notification.id];
          response = setNotificationReadCookie(response, updatedCookieReadNotifications);
        }
      }

      // Only update if there's something to update
      if (Object.keys(updateData).length > 0) {
        const updatedNotification = await prisma.notification.update({
          where: { id },
          data: updateData
        });

        const notificationWithReadStatus = {
          ...updatedNotification,
          isRead: session?.user?.id 
            ? updatedNotification.readByUsers.includes(session.user.id)
            : updatedNotification.readByIPs.includes(ip) || cookieReadNotifications.includes(updatedNotification.id)
        };

        return NextResponse.json(notificationWithReadStatus, { 
          status: 200,
          headers: response.headers 
        });
      }

      // Return current notification if already read
      const notificationWithReadStatus = {
        ...notification,
        isRead: session?.user?.id 
          ? notification.readByUsers.includes(session.user.id)
          : notification.readByIPs.includes(ip) || cookieReadNotifications.includes(notification.id)
      };

      return NextResponse.json(notificationWithReadStatus, { 
        status: 200,
        headers: response.headers 
      });
    }
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification (Admin/Super Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin or super admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await prisma.notification.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
