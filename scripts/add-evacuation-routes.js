const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addEvacuationRoutes() {
  try {
    console.log('Adding evacuation routes to database...');

    // Northern Netherlands Routes
    const northernRoutes = [
      {
        name: "Groningen to Germany Border",
        startLocation: "Groningen Centraal",
        endLocation: "Bad Nieuweschans Border Crossing",
        waypoints: [[53.2194, 6.5665], [53.1694, 7.0165], [53.1194, 7.1665]],
        estimatedTime: 45,
        capacity: 15000,
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
        name: "Friesland to Denmark Ferry",
        startLocation: "Leeuwarden Central",
        endLocation: "Harlingen Ferry Port",
        waypoints: [[53.2012, 5.8081], [53.1750, 5.4250], [53.1747, 5.4250]],
        estimatedTime: 60,
        capacity: 8000,
        status: "OPEN",
        transportType: "PUBLIC_TRANSPORT",
        priority: "MEDIUM",
        enableNotifications: true,
        isPriorityRoute: false,
        allowReverseDirection: true,
        requiresEscort: false,
        showDemoOverlay: true
      }
    ];

    // Southern Netherlands Routes
    const southernRoutes = [
      {
        name: "Eindhoven to Belgium Border",
        startLocation: "Eindhoven Central Station",
        endLocation: "Valkenswaard Border Crossing",
        waypoints: [[51.4416, 5.4697], [51.3500, 5.3500], [51.3000, 5.2000]],
        estimatedTime: 35,
        capacity: 12000,
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
        name: "Maastricht to Germany Border",
        startLocation: "Maastricht Central",
        endLocation: "Aachen Border Crossing",
        waypoints: [[50.8514, 5.6910], [50.8000, 5.6000], [50.7500, 5.5000]],
        estimatedTime: 25,
        capacity: 10000,
        status: "OPEN",
        transportType: "PUBLIC_TRANSPORT",
        priority: "MEDIUM",
        enableNotifications: true,
        isPriorityRoute: false,
        allowReverseDirection: true,
        requiresEscort: false,
        showDemoOverlay: true
      }
    ];

    // Add Northern routes
    for (const route of northernRoutes) {
      const createdRoute = await prisma.evacuationRoute.create({
        data: route
      });
      console.log(`✅ Created Northern route: ${createdRoute.name}`);
    }

    // Add Southern routes
    for (const route of southernRoutes) {
      const createdRoute = await prisma.evacuationRoute.create({
        data: route
      });
      console.log(`✅ Created Southern route: ${createdRoute.name}`);
    }

    console.log('🎉 Successfully added all evacuation routes!');
    
    // Show summary
    const totalRoutes = await prisma.evacuationRoute.count();
    console.log(`📊 Total routes in database: ${totalRoutes}`);

  } catch (error) {
    console.error('❌ Error adding routes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEvacuationRoutes();
