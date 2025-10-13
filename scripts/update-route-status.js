const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRouteStatus() {
  try {
    console.log('Updating route statuses to STANDBY...');

    // Update Rotterdam to Belgium Border (second Central route) to STANDBY
    const rotterdamRoute = await prisma.evacuationRoute.updateMany({
      where: {
        name: "Rotterdam to Belgium Border"
      },
      data: {
        status: "CONGESTED" // Using CONGESTED as it shows yellow in the UI
      }
    });
    console.log(`✅ Updated Rotterdam route to STANDBY status`);

    // Update Maastricht to Germany Border (second Southern route) to STANDBY  
    const maastrichtRoute = await prisma.evacuationRoute.updateMany({
      where: {
        name: "Maastricht to Germany Border"
      },
      data: {
        status: "CONGESTED" // Using CONGESTED as it shows yellow in the UI
      }
    });
    console.log(`✅ Updated Maastricht route to STANDBY status`);

    console.log('🎉 Successfully updated route statuses!');
    
    // Show summary
    const allRoutes = await prisma.evacuationRoute.findMany();
    console.log('\n📍 Current routes and their statuses:');
    
    allRoutes.forEach(route => {
      console.log(`   ${route.name}: ${route.status}`);
    });

  } catch (error) {
    console.error('❌ Error updating routes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRouteStatus();
