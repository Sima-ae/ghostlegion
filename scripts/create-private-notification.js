const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createPrivateNotification() {
  try {
    console.log('Creating private notification...');

    const notification = await prisma.notification.create({
      data: {
        title: 'Private System Update',
        message: 'This is a private notification that should only be visible to logged-in users. It contains sensitive information about system updates.',
        type: 'SYSTEM',
        priority: 'HIGH',
        isPublic: false, // This makes it private
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
        readByUsers: [],
        readByIPs: []
      }
    });

    console.log('✅ Created private notification:', notification.title);
    console.log('📋 Notification ID:', notification.id);
    console.log('🔒 Is Public:', notification.isPublic);
    console.log('📅 Expires:', notification.expiresAt);

  } catch (error) {
    console.error('❌ Error creating private notification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPrivateNotification();
