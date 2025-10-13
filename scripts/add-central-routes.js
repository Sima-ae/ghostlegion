const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCentralNetherlandsRoutes() {
  try {
    console.log('Adding Central Netherlands evacuation routes to database...');

    // Central Netherlands Routes
    const centralRoutes = [
      {
        name: "Amsterdam to Germany Border",
        startLocation: "Amsterdam Centraal",
        endLocation: "Arnhem Border Crossing",
        waypoints: [[52.3676, 4.9041], [52.2000, 5.0000], [52.0000, 5.2000]],
        estimatedTime: 90,
        capacity: 25000,
        status: "OPEN",
        transportType: "PUBLIC_TRANSPORT",
        priority: "HIGH",
        enableNotifications: true,
        isPriorityRoute: true,
        allowReverseDirection: false,
        requiresEscort: false,
        showDemoOverlay: true
      },
      {
        name: "Rotterdam to Belgium Border",
        startLocation: "Rotterdam Centraal",
        endLocation: "Roosendaal Border Crossing",
        waypoints: [[51.9244, 4.4777], [51.8000, 4.5000], [51.6000, 4.4000]],
        estimatedTime: 75,
        capacity: 20000,
        status: "OPEN",
        transportType: "PUBLIC_TRANSPORT",
        priority: "HIGH",
        enableNotifications: true,
        isPriorityRoute: true,
        allowReverseDirection: false,
        requiresEscort: false,
        showDemoOverlay: true
      }
    ];

    // Add Central routes
    for (const route of centralRoutes) {
      const createdRoute = await prisma.evacuationRoute.create({
        data: route
      });
      console.log(`✅ Created Central route: ${createdRoute.name}`);
    }

    console.log('🎉 Successfully added Central Netherlands routes!');
    
    // Show summary
    const totalRoutes = await prisma.evacuationRoute.count();
    console.log(`📊 Total routes in database: ${totalRoutes}`);

    // Show routes by region
    const allRoutes = await prisma.evacuationRoute.findMany();
    console.log('\n📍 Routes by region:');
    
    const northRoutes = allRoutes.filter(route => 
      route.startLocation.toLowerCase().includes('groningen') || 
      route.startLocation.toLowerCase().includes('leeuwarden') ||
      route.startLocation.toLowerCase().includes('harlingen')
    );
    
    const centralRoutesInDb = allRoutes.filter(route => 
      route.startLocation.toLowerCase().includes('amsterdam') || 
      route.startLocation.toLowerCase().includes('rotterdam')
    );
    
    const southRoutes = allRoutes.filter(route => 
      route.startLocation.toLowerCase().includes('eindhoven') || 
      route.startLocation.toLowerCase().includes('maastricht')
    );
    
    console.log(`   Northern: ${northRoutes.length} routes`);
    console.log(`   Central: ${centralRoutesInDb.length} routes`);
    console.log(`   Southern: ${southRoutes.length} routes`);

  } catch (error) {
    console.error('❌ Error adding routes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCentralNetherlandsRoutes();
