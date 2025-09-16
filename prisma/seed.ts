import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing resources
  await prisma.resource.deleteMany({});
  console.log('🗑️ Cleared existing resources');

  // Create comprehensive resource data
  const resources = [
    // Food & Water Resources
    {
      id: '0001',
      name: 'Emergency Food Rations',
      type: 'FOOD' as const,
      quantity: 5000,
      unit: 'packages',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2025-12-31'),
    },
    {
      id: '0002',
      name: 'Drinking Water',
      type: 'WATER' as const,
      quantity: 10000,
      unit: 'liters',
      location: 'Distribution Center, Rotterdam',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0003',
      name: 'Canned Food',
      type: 'FOOD' as const,
      quantity: 2000,
      unit: 'cans',
      location: 'Fort Pampus',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2026-06-30'),
    },
    {
      id: '0004',
      name: 'MRE (Meals Ready to Eat)',
      type: 'FOOD' as const,
      quantity: 1500,
      unit: 'meals',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2027-03-15'),
    },
    {
      id: '0005',
      name: 'Water Purification Tablets',
      type: 'WATER' as const,
      quantity: 50000,
      unit: 'tablets',
      location: 'Medical Supply Depot, Utrecht',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2026-12-31'),
    },
    {
      id: '0006',
      name: 'Energy Bars',
      type: 'FOOD' as const,
      quantity: 3000,
      unit: 'bars',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2025-08-31'),
    },
    {
      id: '0007',
      name: 'Dehydrated Meals',
      type: 'FOOD' as const,
      quantity: 800,
      unit: 'meals',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2028-12-31'),
    },
    {
      id: '0008',
      name: 'Water Storage Tanks',
      type: 'WATER' as const,
      quantity: 50,
      unit: 'tanks',
      location: 'Distribution Center, Rotterdam',
      status: 'AVAILABLE' as const,
    },

    // Medical Supplies
    {
      id: '0009',
      name: 'First Aid Kits',
      type: 'MEDICAL' as const,
      quantity: 500,
      unit: 'kits',
      location: 'Medical Supply Depot, Utrecht',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0010',
      name: 'Painkillers (Morphine)',
      type: 'MEDICAL' as const,
      quantity: 2000,
      unit: 'vials',
      location: 'Utrecht Medical Center',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2025-12-31'),
    },
    {
      id: '0011',
      name: 'Antibiotics',
      type: 'MEDICAL' as const,
      quantity: 1000,
      unit: 'packages',
      location: 'Utrecht Medical Center',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2025-08-15'),
    },
    {
      id: '0012',
      name: 'Blood Plasma',
      type: 'MEDICAL' as const,
      quantity: 100,
      unit: 'units',
      location: 'Utrecht Medical Center',
      status: 'LOW_STOCK' as const,
      expiryDate: new Date('2024-12-31'),
    },
    {
      id: '0013',
      name: 'Surgical Instruments',
      type: 'MEDICAL' as const,
      quantity: 50,
      unit: 'sets',
      location: 'Utrecht Medical Center',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0014',
      name: 'Bandages & Dressings',
      type: 'MEDICAL' as const,
      quantity: 10000,
      unit: 'units',
      location: 'Medical Supply Depot, Utrecht',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0015',
      name: 'IV Fluids',
      type: 'MEDICAL' as const,
      quantity: 500,
      unit: 'bags',
      location: 'Utrecht Medical Center',
      status: 'AVAILABLE' as const,
      expiryDate: new Date('2025-06-30'),
    },
    {
      id: '0016',
      name: 'Defibrillators',
      type: 'MEDICAL' as const,
      quantity: 25,
      unit: 'units',
      location: 'Medical Supply Depot, Utrecht',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0017',
      name: 'Oxygen Tanks',
      type: 'MEDICAL' as const,
      quantity: 100,
      unit: 'tanks',
      location: 'Utrecht Medical Center',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0018',
      name: 'Stretchers',
      type: 'MEDICAL' as const,
      quantity: 75,
      unit: 'units',
      location: 'Medical Supply Depot, Utrecht',
      status: 'AVAILABLE' as const,
    },

    // Fuel & Energy
    {
      id: '0019',
      name: 'Diesel Fuel',
      type: 'FUEL' as const,
      quantity: 5000,
      unit: 'liters',
      location: 'Fuel Storage, Den Haag',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0020',
      name: 'Gasoline',
      type: 'FUEL' as const,
      quantity: 3000,
      unit: 'liters',
      location: 'The Hague Bunker Complex',
      status: 'LOW_STOCK' as const,
    },
    {
      id: '0021',
      name: 'Portable Generators',
      type: 'EQUIPMENT' as const,
      quantity: 25,
      unit: 'units',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0022',
      name: 'Batteries (AA/AAA)',
      type: 'EQUIPMENT' as const,
      quantity: 10000,
      unit: 'packs',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0023',
      name: 'Solar Panels',
      type: 'EQUIPMENT' as const,
      quantity: 100,
      unit: 'panels',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0024',
      name: 'Power Banks',
      type: 'EQUIPMENT' as const,
      quantity: 200,
      unit: 'units',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0025',
      name: 'Fuel Cans (20L)',
      type: 'FUEL' as const,
      quantity: 500,
      unit: 'cans',
      location: 'Fuel Storage, Den Haag',
      status: 'AVAILABLE' as const,
    },

    // Communication & Equipment
    {
      id: '0026',
      name: 'Radio Communication Sets',
      type: 'EQUIPMENT' as const,
      quantity: 100,
      unit: 'sets',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0027',
      name: 'Satellite Phones',
      type: 'EQUIPMENT' as const,
      quantity: 20,
      unit: 'units',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0028',
      name: 'Protective Gear Sets',
      type: 'EQUIPMENT' as const,
      quantity: 200,
      unit: 'sets',
      location: 'Safety Equipment Store, Tilburg',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0029',
      name: 'Gas Masks',
      type: 'EQUIPMENT' as const,
      quantity: 500,
      unit: 'units',
      location: 'Safety Equipment Store, Tilburg',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0030',
      name: 'Body Armor',
      type: 'EQUIPMENT' as const,
      quantity: 150,
      unit: 'sets',
      location: 'Safety Equipment Store, Tilburg',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0031',
      name: 'Helmets',
      type: 'EQUIPMENT' as const,
      quantity: 300,
      unit: 'units',
      location: 'Safety Equipment Store, Tilburg',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0032',
      name: 'Night Vision Goggles',
      type: 'EQUIPMENT' as const,
      quantity: 50,
      unit: 'pairs',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0033',
      name: 'Tactical Radios',
      type: 'EQUIPMENT' as const,
      quantity: 75,
      unit: 'units',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0034',
      name: 'GPS Devices',
      type: 'EQUIPMENT' as const,
      quantity: 100,
      unit: 'units',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },

    // Transport & Vehicles
    {
      id: '0035',
      name: 'Emergency Vehicles',
      type: 'TRANSPORT' as const,
      quantity: 15,
      unit: 'vehicles',
      location: 'Vehicle Depot, Groningen',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0036',
      name: 'Military Trucks',
      type: 'TRANSPORT' as const,
      quantity: 8,
      unit: 'vehicles',
      location: 'Vehicle Depot, Groningen',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0037',
      name: 'Ambulances',
      type: 'TRANSPORT' as const,
      quantity: 12,
      unit: 'vehicles',
      location: 'Medical Supply Depot, Utrecht',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0038',
      name: 'Motorcycles',
      type: 'TRANSPORT' as const,
      quantity: 20,
      unit: 'units',
      location: 'Vehicle Depot, Groningen',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0039',
      name: 'ATVs (All-Terrain Vehicles)',
      type: 'TRANSPORT' as const,
      quantity: 15,
      unit: 'units',
      location: 'Vehicle Depot, Groningen',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0040',
      name: 'Boats (Rescue)',
      type: 'TRANSPORT' as const,
      quantity: 8,
      unit: 'boats',
      location: 'Vehicle Depot, Groningen',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0041',
      name: 'Helicopters',
      type: 'TRANSPORT' as const,
      quantity: 3,
      unit: 'units',
      location: 'Vehicle Depot, Groningen',
      status: 'AVAILABLE' as const,
    },

    // Ammunition & Weapons
    {
      id: '0042',
      name: 'Rifle Ammunition (5.56mm)',
      type: 'AMMUNITION' as const,
      quantity: 50000,
      unit: 'rounds',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0043',
      name: 'Pistol Ammunition (9mm)',
      type: 'AMMUNITION' as const,
      quantity: 25000,
      unit: 'rounds',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0044',
      name: 'Grenades (Hand)',
      type: 'AMMUNITION' as const,
      quantity: 500,
      unit: 'units',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0045',
      name: 'Shotgun Shells',
      type: 'AMMUNITION' as const,
      quantity: 10000,
      unit: 'shells',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0046',
      name: 'Sniper Rifle Ammunition',
      type: 'AMMUNITION' as const,
      quantity: 5000,
      unit: 'rounds',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0047',
      name: 'Machine Gun Ammunition',
      type: 'AMMUNITION' as const,
      quantity: 75000,
      unit: 'rounds',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0048',
      name: 'Explosives (C4)',
      type: 'AMMUNITION' as const,
      quantity: 100,
      unit: 'blocks',
      location: 'Military Supply Depot, Den Haag',
      status: 'AVAILABLE' as const,
    },

    // Emergency Shelter & Supplies
    {
      id: '0049',
      name: 'Emergency Blankets',
      type: 'EQUIPMENT' as const,
      quantity: 2000,
      unit: 'units',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0050',
      name: 'Tents (4-person)',
      type: 'EQUIPMENT' as const,
      quantity: 100,
      unit: 'tents',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0051',
      name: 'Sleeping Bags',
      type: 'EQUIPMENT' as const,
      quantity: 500,
      unit: 'units',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0052',
      name: 'Portable Toilets',
      type: 'EQUIPMENT' as const,
      quantity: 50,
      unit: 'units',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0053',
      name: 'Shower Units',
      type: 'EQUIPMENT' as const,
      quantity: 25,
      unit: 'units',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0054',
      name: 'Heating Units',
      type: 'EQUIPMENT' as const,
      quantity: 30,
      unit: 'units',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE' as const,
    },

    // Tools & Maintenance
    {
      id: '0055',
      name: 'Tool Kits (Complete)',
      type: 'EQUIPMENT' as const,
      quantity: 50,
      unit: 'kits',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0056',
      name: 'Rope & Cables',
      type: 'EQUIPMENT' as const,
      quantity: 1000,
      unit: 'meters',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0057',
      name: 'Flashlights',
      type: 'EQUIPMENT' as const,
      quantity: 200,
      unit: 'units',
      location: 'Safety Equipment Store, Tilburg',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0058',
      name: 'Welding Equipment',
      type: 'EQUIPMENT' as const,
      quantity: 15,
      unit: 'sets',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0059',
      name: 'Cutting Tools',
      type: 'EQUIPMENT' as const,
      quantity: 100,
      unit: 'sets',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
    {
      id: '0060',
      name: 'Measuring Equipment',
      type: 'EQUIPMENT' as const,
      quantity: 75,
      unit: 'units',
      location: 'Tech Warehouse, Eindhoven',
      status: 'AVAILABLE' as const,
    },
  ];

  // Insert all resources
  for (const resource of resources) {
    await prisma.resource.create({
      data: resource,
    });
  }

  console.log(`✅ Successfully seeded ${resources.length} resources to the database`);

  // Clear existing alerts
  await prisma.alert.deleteMany({});
  console.log('🗑️ Cleared existing alerts');

  // Create comprehensive alert data
  const alerts = [
    {
      id: 'alert-001',
      title: 'Demo Alert: Security Threat Level Elevated',
      message: 'Security threat level has been elevated to HIGH across all military installations. All personnel are advised to maintain heightened awareness and follow security protocols. Report any suspicious activities immediately to command centers.',
      severity: 'HIGH' as const,
      type: 'SECURITY' as const,
      location: 'All Military Installations',
      expiresAt: new Date('2025-09-15T18:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-002',
      title: 'Demo Alert: Evacuation Route Status Update',
      message: 'Primary evacuation route A1 (Amsterdam to Utrecht) is currently experiencing heavy traffic. Alternative route B2 via Den Haag is recommended. All civilians should follow official evacuation instructions and avoid panic.',
      severity: 'MEDIUM' as const,
      type: 'EVACUATION' as const,
      location: 'Amsterdam-Utrecht Corridor',
      expiresAt: new Date('2025-09-12T12:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-003',
      title: 'Demo Alert: Medical Supply Shortage',
      message: 'Critical shortage of medical supplies reported at Utrecht Medical Center. Blood plasma and surgical instruments are running low. All medical personnel are requested to prioritize essential treatments and coordinate with supply chain management.',
      severity: 'HIGH' as const,
      type: 'MEDICAL' as const,
      location: 'Utrecht Medical Center',
      expiresAt: new Date('2025-09-13T08:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-004',
      title: 'Demo Alert: Fuel Distribution Disruption',
      message: 'Fuel distribution network has been disrupted due to infrastructure damage. Emergency fuel reserves are being activated. All vehicles should conserve fuel and use only essential transportation. Military convoys have priority access.',
      severity: 'CRITICAL' as const,
      type: 'LOGISTICS' as const,
      location: 'National Fuel Distribution Network',
      expiresAt: new Date('2025-09-14T20:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-005',
      title: 'Demo Alert: Communication System Maintenance',
      message: 'Scheduled maintenance on primary communication systems will occur from 02:00 to 04:00. Backup communication channels will be active. All personnel should test backup systems and report any issues to IT support.',
      severity: 'LOW' as const,
      type: 'GENERAL' as const,
      location: 'All Communication Centers',
      expiresAt: new Date('2025-09-11T06:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-006',
      title: 'Demo Alert: Border Infiltration Warning',
      message: 'Intelligence reports indicate potential infiltration attempts along the German border. All border checkpoints are on high alert. Civilians should avoid border areas and report any suspicious activities immediately.',
      severity: 'HIGH' as const,
      type: 'SECURITY' as const,
      location: 'German Border Region',
      expiresAt: new Date('2025-09-16T10:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-007',
      title: 'Demo Alert: Emergency Shelter Capacity',
      message: 'Emergency shelters in Amsterdam and Rotterdam are approaching maximum capacity. Additional shelters are being prepared in Utrecht and Den Haag. Priority will be given to families with children and elderly citizens.',
      severity: 'MEDIUM' as const,
      type: 'EVACUATION' as const,
      location: 'Major Cities',
      expiresAt: new Date('2025-09-13T15:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-008',
      title: 'Demo Alert: Water Treatment Plant Status',
      message: 'Water treatment facilities are operating at reduced capacity due to power fluctuations. Water rationing may be necessary. All citizens are advised to conserve water and boil water before consumption as a precaution.',
      severity: 'MEDIUM' as const,
      type: 'GENERAL' as const,
      location: 'National Water Treatment Network',
      expiresAt: new Date('2025-09-12T18:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-009',
      title: 'Demo Alert: Military Convoy Movement',
      message: 'Large military convoy will be moving through major highways from 14:00 to 16:00. Civilian traffic will be redirected. Please plan your travel accordingly and follow traffic control instructions. Delays are expected.',
      severity: 'LOW' as const,
      type: 'LOGISTICS' as const,
      location: 'A2, A4, A12 Highways',
      expiresAt: new Date('2025-09-11T18:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-010',
      title: 'Demo Alert: Emergency Medical Response',
      message: 'Emergency medical response teams are on standby across all regions. In case of medical emergencies, call 112 immediately. Ambulance services are operating with military escort for security. Response times may be extended.',
      severity: 'HIGH' as const,
      type: 'MEDICAL' as const,
      location: 'All Regions',
      expiresAt: new Date('2025-09-15T12:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-011',
      title: 'Demo Alert: Power Grid Stabilization',
      message: 'Power grid is being stabilized after recent disruptions. Rolling blackouts may occur in some areas. Critical infrastructure has priority power access. Citizens are advised to conserve electricity and use generators if available.',
      severity: 'MEDIUM' as const,
      type: 'GENERAL' as const,
      location: 'National Power Grid',
      expiresAt: new Date('2025-09-12T22:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-012',
      title: 'Demo Alert: Food Distribution Update',
      message: 'Emergency food distribution centers are now operational in all major cities. Ration cards are required for collection. Distribution schedule: 08:00-12:00 and 14:00-18:00 daily. Bring valid identification.',
      severity: 'LOW' as const,
      type: 'LOGISTICS' as const,
      location: 'All Major Cities',
      expiresAt: new Date('2025-09-14T20:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-013',
      title: 'Demo Alert: Intelligence Briefing Required',
      message: 'All intelligence personnel are required to attend emergency briefing at 16:00. Classified information regarding current threat assessment will be discussed. Security clearance level 3 or higher required.',
      severity: 'HIGH' as const,
      type: 'SECURITY' as const,
      location: 'Command Center, Den Haag',
      expiresAt: new Date('2025-09-11T20:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-014',
      title: 'Demo Alert: Evacuation Protocol Activation',
      message: 'Evacuation protocols are now active for Zone 1 (Amsterdam city center). All civilians should proceed to designated assembly points. Follow evacuation routes marked with blue signs. Do not use private vehicles.',
      severity: 'CRITICAL' as const,
      type: 'EVACUATION' as const,
      location: 'Amsterdam City Center',
      expiresAt: new Date('2025-09-16T08:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-015',
      title: 'Demo Alert: Medical Personnel Mobilization',
      message: 'All medical personnel are requested to report to their assigned stations immediately. Emergency medical teams are being mobilized for field operations. Bring personal protective equipment and medical supplies.',
      severity: 'HIGH' as const,
      type: 'MEDICAL' as const,
      location: 'All Medical Facilities',
      expiresAt: new Date('2025-09-13T10:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-016',
      title: 'Demo Alert: Transportation Network Status',
      message: 'Public transportation is operating on emergency schedule. Train services are limited to essential routes only. Bus services are suspended in affected areas. Military transport is available for essential personnel.',
      severity: 'MEDIUM' as const,
      type: 'LOGISTICS' as const,
      location: 'National Transportation Network',
      expiresAt: new Date('2025-09-12T16:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-017',
      title: 'Demo Alert: Civilian Safety Advisory',
      message: 'All civilians are advised to stay indoors during night hours (22:00-06:00) unless absolutely necessary. Curfew is in effect for security reasons. Essential workers should carry identification and travel permits.',
      severity: 'MEDIUM' as const,
      type: 'GENERAL' as const,
      location: 'All Civilian Areas',
      expiresAt: new Date('2025-09-14T06:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-018',
      title: 'Demo Alert: Military Base Lockdown',
      message: 'All military bases are now on lockdown status. Only authorized personnel with valid credentials will be granted access. Family members should contact base command for information. Lockdown will be reviewed every 6 hours.',
      severity: 'HIGH' as const,
      type: 'SECURITY' as const,
      location: 'All Military Bases',
      expiresAt: new Date('2025-09-15T14:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-019',
      title: 'Demo Alert: Emergency Communication Protocol',
      message: 'Emergency communication protocol is now active. Use designated radio frequencies for official communications. Personal mobile devices should be used sparingly to preserve battery life. Report communication failures immediately.',
      severity: 'LOW' as const,
      type: 'GENERAL' as const,
      location: 'All Communication Networks',
      expiresAt: new Date('2025-09-11T24:00:00Z'),
      acknowledgedBy: []
    },
    {
      id: 'alert-020',
      title: 'Demo Alert: Resource Allocation Priority',
      message: 'Resource allocation priority has been established. Medical supplies and food have highest priority, followed by fuel and ammunition. All resource requests must be approved by logistics command. Unauthorized resource usage will be penalized.',
      severity: 'MEDIUM' as const,
      type: 'LOGISTICS' as const,
      location: 'All Resource Distribution Centers',
      expiresAt: new Date('2025-09-13T18:00:00Z'),
      acknowledgedBy: []
    }
  ];

  // Insert all alerts
  for (const alert of alerts) {
    await prisma.alert.create({
      data: alert,
    });
  }

  console.log(`✅ Successfully seeded ${alerts.length} alerts to the database`);
  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
