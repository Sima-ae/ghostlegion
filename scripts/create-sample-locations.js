const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleLocations() {
  try {
    console.log('Creating sample locations with visibility settings...');

    // Create public locations
    const publicLocations = [
      {
        name: 'Fort Pampus',
        type: 'FORTRESS',
        coordinates: { lat: 52.4567, lng: 5.1234 },
        description: 'Historic fort in the IJmeer, suitable as command center and evacuation point',
        capacity: 200,
        status: 'ACTIVE',
        facilities: ['Communications', 'Medical Post', 'Storage', 'Sleeping Quarters'],
        contact: '+31 20 1234567',
        isPublic: true
      },
      {
        name: 'Amsterdam RAI Evacuation Center',
        type: 'EVACUATION_CENTER',
        coordinates: { lat: 52.3364, lng: 4.8903 },
        description: 'Large exhibition hall suitable for mass evacuation',
        capacity: 5000,
        status: 'ACTIVE',
        facilities: ['Medical Post', 'Dining Hall', 'Sleeping Quarters', 'Sanitary Facilities'],
        contact: '+31 20 5492222',
        isPublic: true
      },
      {
        name: 'Utrecht Medical Center',
        type: 'MEDICAL_FACILITY',
        coordinates: { lat: 52.0907, lng: 5.1214 },
        description: 'Specialized trauma center for war casualties',
        capacity: 1000,
        status: 'ACTIVE',
        facilities: ['Operating Rooms', 'ICU', 'X-Ray', 'Pharmacy', 'Helipad'],
        contact: '+31 88 7555555',
        isPublic: true
      }
    ];

    // Create private locations
    const privateLocations = [
      {
        name: 'The Hague Bunker Complex',
        type: 'BUNKER',
        coordinates: { lat: 52.0705, lng: 4.3007 },
        description: 'Underground complex under the Binnenhof, protected against nuclear attacks',
        capacity: 500,
        status: 'ACTIVE',
        facilities: ['Command Center', 'Communications', 'Medical Facilities', 'Storage'],
        contact: '+31 70 1234567',
        isPublic: false
      },
      {
        name: 'Maastricht Bunker',
        type: 'BUNKER',
        coordinates: { lat: 50.8514, lng: 5.6910 },
        description: 'Strategic location near German border',
        capacity: 150,
        status: 'ACTIVE',
        facilities: ['Communications', 'Storage', 'Sleeping Quarters'],
        contact: '+31 43 1234567',
        isPublic: false
      }
    ];

    // Create all locations
    const allLocations = [...publicLocations, ...privateLocations];
    
    for (const locationData of allLocations) {
      const location = await prisma.location.create({
        data: locationData
      });
      console.log(`Created ${location.isPublic ? 'PUBLIC' : 'PRIVATE'} location: ${location.name}`);
    }

    console.log(`\n✅ Successfully created ${allLocations.length} sample locations!`);
    console.log(`📊 Public locations: ${publicLocations.length}`);
    console.log(`🔒 Private locations: ${privateLocations.length}`);
    
  } catch (error) {
    console.error('Error creating sample locations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleLocations();
