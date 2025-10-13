const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleNotifications() {
  try {
    console.log('Creating sample notifications...');

    const sampleNotifications = [
      {
        title: "System Maintenance Scheduled",
        message: "The Ghost Legion system will undergo scheduled maintenance on January 15th from 2:00 AM to 4:00 AM UTC. During this time, some features may be temporarily unavailable. We apologize for any inconvenience.",
        type: "SYSTEM",
        priority: "MEDIUM",
        isPublic: true,
        targetUsers: [],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      },
      {
        title: "Emergency Alert: Severe Weather Warning",
        message: "A severe weather warning has been issued for Northern Netherlands. High winds and heavy rainfall are expected. Please stay indoors and avoid unnecessary travel. Emergency services are on standby.",
        type: "EMERGENCY",
        priority: "CRITICAL",
        isPublic: true,
        targetUsers: [],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
      },
      {
        title: "New Evacuation Routes Available",
        message: "Two new evacuation routes have been added to the system: Amsterdam to Germany Border and Rotterdam to Belgium Border. These routes are now active and available for use. Please review the evacuation plans page for more details.",
        type: "INFO",
        priority: "MEDIUM",
        isPublic: true,
        targetUsers: [],
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expires in 30 days
      },
      {
        title: "Security Update Required",
        message: "All users are required to update their passwords by January 20th. This is a mandatory security update to ensure the safety of our systems. Please log in and follow the password update prompts.",
        type: "WARNING",
        priority: "HIGH",
        isPublic: true,
        targetUsers: [],
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Expires in 14 days
      },
      {
        title: "Welcome to Ghost Legion",
        message: "Welcome to the Ghost Legion emergency management system. This platform provides real-time alerts, evacuation plans, and resource management tools. Explore the different sections to familiarize yourself with the available features.",
        type: "INFO",
        priority: "LOW",
        isPublic: true,
        targetUsers: [],
        expiresAt: null // No expiration
      }
    ];

    // Create notifications
    for (const notification of sampleNotifications) {
      const createdNotification = await prisma.notification.create({
        data: notification
      });
      console.log(`✅ Created notification: ${createdNotification.title}`);
    }

    console.log('🎉 Successfully created sample notifications!');
    
    // Show summary
    const totalNotifications = await prisma.notification.count();
    console.log(`📊 Total notifications in database: ${totalNotifications}`);

  } catch (error) {
    console.error('❌ Error creating sample notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleNotifications();
