const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'info@000-it.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'info@000-it.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      }
    });

    console.log('✅ Admin user created successfully:', adminUser.email);

    // Create sample data
    console.log('🌱 Creating sample locations...');
    
    const locations = await prisma.location.createMany({
      data: [
        {
          name: 'Fort Pampus',
          type: 'FORTRESS',
          coordinates: [52.4567, 5.1234],
          description: 'Historisch fort in het IJmeer, geschikt als commandocentrum en evacuatiepunt',
          capacity: 200,
          status: 'ACTIVE',
          facilities: ['Communicatie', 'Medische post', 'Opslag', 'Slapruimte'],
          contact: '+31 20 1234567'
        },
        {
          name: 'Bunkercomplex Den Haag',
          type: 'BUNKER',
          coordinates: [52.0705, 4.3007],
          description: 'Ondergronds complex onder het Binnenhof, beschermt tegen nucleaire aanvallen',
          capacity: 500,
          status: 'ACTIVE',
          facilities: ['Commandocentrum', 'Communicatie', 'Medische faciliteiten', 'Opslag'],
          contact: '+31 70 1234567'
        },
        {
          name: 'Evacuatiecentrum Amsterdam RAI',
          type: 'EVACUATION_CENTER',
          coordinates: [52.3364, 4.8903],
          description: 'Grote tentoonstellingshal geschikt voor massale evacuatie',
          capacity: 5000,
          status: 'ACTIVE',
          facilities: ['Medische post', 'Eetzaal', 'Slapruimte', 'Sanitaire voorzieningen'],
          contact: '+31 20 5492222'
        }
      ]
    });

    console.log('✅ Sample locations created');

    // Create sample personnel
    console.log('🌱 Creating sample personnel...');
    
    const personnel = await prisma.personnel.createMany({
      data: [
        {
          name: 'Generaal van der Berg',
          role: 'COMMANDER',
          department: 'MILITARY',
          status: 'ACTIVE',
          location: 'Fort Pampus',
          skills: ['Strategie', 'Leiderschap', 'Crisisbeheer'],
          contact: '+31 6 12345678',
          clearanceLevel: 'TOP_SECRET'
        },
        {
          name: 'Dr. Sarah Janssen',
          role: 'DOCTOR',
          department: 'MEDICAL',
          status: 'ACTIVE',
          location: 'Medisch Centrum Utrecht',
          skills: ['Traumachirurgie', 'Noodgeneeskunde', 'Mass Casualty'],
          contact: '+31 6 23456789',
          clearanceLevel: 'CONFIDENTIAL'
        },
        {
          name: 'Lisa van Dijk',
          role: 'VOLUNTEER',
          department: 'HUMANITARIAN',
          status: 'ACTIVE',
          location: 'Evacuatiecentrum Amsterdam RAI',
          skills: ['Logistiek', 'Communicatie', 'Eerste hulp'],
          contact: '+31 6 45678901',
          clearanceLevel: 'PUBLIC'
        }
      ]
    });

    console.log('✅ Sample personnel created');

    // Create sample evacuation routes
    console.log('🌱 Creating sample evacuation routes...');
    
    const routes = await prisma.evacuationRoute.createMany({
      data: [
        {
          name: 'Amsterdam naar Utrecht',
          startLocation: 'Amsterdam Centraal',
          endLocation: 'Utrecht Centraal',
          waypoints: [[52.3791, 4.9003], [52.0907, 5.1214]],
          estimatedTime: 30,
          capacity: 1000,
          status: 'OPEN',
          transportType: 'PUBLIC_TRANSPORT',
          priority: 'HIGH'
        },
        {
          name: 'Den Haag naar Rotterdam',
          startLocation: 'Den Haag Centraal',
          endLocation: 'Rotterdam Centraal',
          waypoints: [[52.0705, 4.3007], [51.9244, 4.4777]],
          estimatedTime: 25,
          capacity: 800,
          status: 'OPEN',
          transportType: 'PUBLIC_TRANSPORT',
          priority: 'HIGH'
        }
      ]
    });

    console.log('✅ Sample evacuation routes created');

    // Create sample resources
    console.log('🌱 Creating sample resources...');
    
    const resources = await prisma.resource.createMany({
      data: [
        {
          name: 'Medicijnen - Pijnstillers',
          type: 'MEDICAL',
          quantity: 5000,
          unit: 'stuks',
          location: 'Medisch Centrum Utrecht',
          status: 'AVAILABLE'
        },
        {
          name: 'Drinkwater',
          type: 'WATER',
          quantity: 10000,
          unit: 'liters',
          location: 'Evacuatiecentrum Amsterdam RAI',
          status: 'AVAILABLE'
        },
        {
          name: 'Benzine',
          type: 'FUEL',
          quantity: 5000,
          unit: 'liters',
          location: 'Bunkercomplex Den Haag',
          status: 'LOW_STOCK'
        }
      ]
    });

    console.log('✅ Sample resources created');

    // Create sample alerts
    console.log('🌱 Creating sample alerts...');
    
    const alerts = await prisma.alert.createMany({
      data: [
        {
          title: 'Evacuatie Route A1 Gesloten',
          message: 'De A1 tussen Amsterdam en Utrecht is gesloten vanwege militaire activiteiten. Gebruik alternatieve routes.',
          severity: 'HIGH',
          type: 'EVACUATION',
          location: 'A1 Amsterdam-Utrecht',
          acknowledgedBy: [adminUser.id]
        },
        {
          title: 'Medische Voorraden Laag',
          message: 'Benzine voorraden in Den Haag zijn laag. Nieuwe levering verwacht over 2 uur.',
          severity: 'MEDIUM',
          type: 'LOGISTICS',
          location: 'Bunkercomplex Den Haag',
          acknowledgedBy: [adminUser.id]
        }
      ]
    });

    console.log('✅ Sample alerts created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('📧 Admin credentials: info@000-it.com / Admin123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
