const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    console.log('Checking notifications in database...');

    // Get all notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Total notifications in database: ${notifications.length}`);
    
    if (notifications.length > 0) {
      console.log('\n📋 Notification Details:');
      notifications.forEach((notification, index) => {
        console.log(`\n${index + 1}. ${notification.title}`);
        console.log(`   ID: ${notification.id}`);
        console.log(`   Type: ${notification.type}`);
        console.log(`   Priority: ${notification.priority}`);
        console.log(`   Public: ${notification.isPublic}`);
        console.log(`   Created: ${notification.createdAt.toLocaleString()}`);
        console.log(`   Expires: ${notification.expiresAt ? notification.expiresAt.toLocaleString() : 'Never'}`);
        console.log(`   Read by Users: ${notification.readByUsers.length}`);
        console.log(`   Read by IPs: ${notification.readByIPs.length}`);
        console.log(`   Message: ${notification.message.substring(0, 100)}${notification.message.length > 100 ? '...' : ''}`);
      });
    } else {
      console.log('❌ No notifications found in database!');
    }

  } catch (error) {
    console.error('❌ Error checking notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();
