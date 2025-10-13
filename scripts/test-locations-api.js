const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLocations() {
  try {
    console.log('Testing locations API...');
    
    // Test 1: Check if we can connect to database
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test 2: Count locations
    console.log('2. Counting locations...');
    const count = await prisma.location.count();
    console.log(`✅ Found ${count} locations`);
    
    // Test 3: Fetch public locations only
    console.log('3. Fetching public locations...');
    const publicLocations = await prisma.location.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${publicLocations.length} public locations`);
    
    // Test 4: Fetch all locations
    console.log('4. Fetching all locations...');
    const allLocations = await prisma.location.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${allLocations.length} total locations`);
    
    // Test 5: Check coordinates format
    console.log('5. Checking coordinates format...');
    allLocations.forEach((location, index) => {
      console.log(`Location ${index + 1}: ${location.name}`);
      console.log(`  Coordinates type: ${typeof location.coordinates}`);
      console.log(`  Coordinates value: ${JSON.stringify(location.coordinates)}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocations();
