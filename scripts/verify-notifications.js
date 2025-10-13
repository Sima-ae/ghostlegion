const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyNotifications() {
  try {
    console.log('Verifying notifications in database...');

    // Get all notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total notifications in database: ${notifications.length}`);
    console.log('\n📋 Notification Details:');
    
    notifications.forEach((notification, index) => {
      console.log(`\n${index + 1}. ${notification.title}`);
      console.log(`   Type: ${notification.type}`);
      console.log(`   Priority: ${notification.priority}`);
      console.log(`   Public: ${notification.isPublic ? 'Yes' : 'No'}`);
      console.log(`   Created: ${notification.createdAt.toLocaleString()}`);
      console.log(`   Expires: ${notification.expiresAt ? notification.expiresAt.toLocaleString() : 'Never'}`);
      console.log(`   Message: ${notification.message.substring(0, 100)}${notification.message.length > 100 ? '...' : ''}`);
    });

    // Test API endpoints
    console.log('\n🔌 Testing API endpoints...');
    
    // Test GET /api/notifications
    const response = await fetch('http://localhost:3000/api/notifications?limit=5');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ GET /api/notifications: ${data.notifications.length} notifications returned`);
      console.log(`   Unread count: ${data.unreadCount}`);
    } else {
      console.log(`❌ GET /api/notifications failed: ${response.status}`);
    }

    // Test GET /api/notifications/[id] for first notification
    if (notifications.length > 0) {
      const firstNotification = notifications[0];
      const detailResponse = await fetch(`http://localhost:3000/api/notifications/${firstNotification.id}`);
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        console.log(`✅ GET /api/notifications/${firstNotification.id}: Success`);
        console.log(`   Title: ${detailData.title}`);
      } else {
        console.log(`❌ GET /api/notifications/${firstNotification.id} failed: ${detailResponse.status}`);
      }
    }

    console.log('\n🎉 Notification system verification complete!');

  } catch (error) {
    console.error('❌ Error verifying notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyNotifications();
