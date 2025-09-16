import { Location, People, EvacuationRoute, Resource, Alert, CommunityMember } from '../types';

export const sampleLocations: Location[] = [
  {
    id: '1',
    name: 'Fort Pampus',
    type: 'fortress',
    coordinates: [52.4567, 5.1234],
    description: 'Historic fort in the IJmeer, suitable as command center and evacuation point',
    capacity: 200,
    status: 'active',
    facilities: ['Communications', 'Medical Post', 'Storage', 'Sleeping Quarters'],
    contact: '+31 20 1234567',
    lastUpdated: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'The Hague Bunker Complex',
    type: 'bunker',
    coordinates: [52.0705, 4.3007],
    description: 'Underground complex under the Binnenhof, protected against nuclear attacks',
    capacity: 500,
    status: 'active',
    facilities: ['Command Center', 'Communications', 'Medical Facilities', 'Storage'],
    contact: '+31 70 1234567',
    lastUpdated: '2024-01-15T09:15:00Z'
  },
  {
    id: '3',
    name: 'Amsterdam RAI Evacuation Center',
    type: 'evacuation_center',
    coordinates: [52.3364, 4.8903],
    description: 'Large exhibition hall suitable for mass evacuation',
    capacity: 5000,
    status: 'active',
    facilities: ['Medical Post', 'Dining Hall', 'Sleeping Quarters', 'Sanitary Facilities'],
    contact: '+31 20 5492222',
    lastUpdated: '2024-01-15T11:00:00Z'
  },
  {
    id: '4',
    name: 'Utrecht Medical Center',
    type: 'medical_facility',
    coordinates: [52.0907, 5.1214],
    description: 'Specialized trauma center for war casualties',
    capacity: 1000,
    status: 'active',
    facilities: ['Operating Rooms', 'ICU', 'X-Ray', 'Pharmacy', 'Helipad'],
    contact: '+31 88 7555555',
    lastUpdated: '2024-01-15T08:45:00Z'
  },
  {
    id: '5',
    name: 'Maastricht Bunker',
    type: 'bunker',
    coordinates: [50.8514, 5.6910],
    description: 'Strategic location near German border',
    capacity: 150,
    status: 'active',
    facilities: ['Communications', 'Storage', 'Sleeping Quarters'],
    contact: '+31 43 1234567',
    lastUpdated: '2024-01-15T07:30:00Z'
  }
];

export const samplePeople: People[] = [
  {
    id: '1',
    name: 'General van der Berg',
    role: 'commander',
    department: 'military',
    status: 'active',
    location: 'Fort Pampus',
    skills: ['Strategy', 'Leadership', 'Crisis Management'],
    contact: '+31 6 12345678',
    clearanceLevel: 'top_secret',
    lastSeen: '2024-01-15T12:00:00Z'
  },
  {
    id: '2',
    name: 'Dr. Sarah Janssen',
    role: 'doctor',
    department: 'medical',
    status: 'active',
    location: 'Utrecht Medical Center',
    skills: ['Trauma Surgery', 'Emergency Medicine', 'Mass Casualty'],
    contact: '+31 6 23456789',
    clearanceLevel: 'confidential',
    lastSeen: '2024-01-15T11:45:00Z'
  },
  {
    id: '3',
    name: 'Captain Pietersen',
    role: 'soldier',
    department: 'military',
    status: 'deployed',
    location: 'The Hague Bunker Complex',
    skills: ['Infantry', 'EOD', 'Communications'],
    contact: '+31 6 34567890',
    clearanceLevel: 'secret',
    lastSeen: '2024-01-15T10:30:00Z'
  },
  {
    id: '4',
    name: 'Lisa van Dijk',
    role: 'volunteer',
    department: 'humanitarian',
    status: 'active',
    location: 'Amsterdam RAI Evacuation Center',
    skills: ['Logistics', 'Communications', 'First Aid'],
    contact: '+31 6 45678901',
    clearanceLevel: 'public',
    lastSeen: '2024-01-15T12:15:00Z'
  }
];

export const sampleEvacuationRoutes: EvacuationRoute[] = [
  {
    id: '1',
    name: 'Amsterdam to Utrecht',
    startLocation: 'Amsterdam Central',
    endLocation: 'Utrecht Central',
    waypoints: [[52.3791, 4.9003], [52.0907, 5.1214]],
    estimatedTime: 30,
    capacity: 1000,
    status: 'open',
    transportType: 'public_transport',
    priority: 'high',
    lastUpdated: '2024-01-15T12:00:00Z'
  },
  {
    id: '2',
    name: 'The Hague to Rotterdam',
    startLocation: 'The Hague Central',
    endLocation: 'Rotterdam Central',
    waypoints: [[52.0705, 4.3007], [51.9244, 4.4777]],
    estimatedTime: 25,
    capacity: 800,
    status: 'open',
    transportType: 'public_transport',
    priority: 'high',
    lastUpdated: '2024-01-15T11:30:00Z'
  },
  {
    id: '3',
    name: 'Groningen to Germany',
    startLocation: 'Groningen Central',
    endLocation: 'Bad Nieuweschans',
    waypoints: [[53.2194, 6.5665], [53.1800, 7.2000]],
    estimatedTime: 45,
    capacity: 500,
    status: 'open',
    transportType: 'military_vehicle',
    priority: 'medium',
    lastUpdated: '2024-01-15T10:45:00Z'
  }
];

export const sampleResources: Resource[] = [
  // Food & Water Resources
  {
    id: '0001',
    name: 'Emergency Food Rations',
    type: 'food',
    quantity: 5000,
    unit: 'packages',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    expiryDate: '2025-12-31',
    lastUpdated: '2024-01-15T10:00:00Z'
  },
  {
    id: '0002',
    name: 'Drinking Water',
    type: 'water',
    quantity: 10000,
    unit: 'liters',
    location: 'Distribution Center, Rotterdam',
    status: 'available',
    lastUpdated: '2024-01-15T08:30:00Z'
  },
  {
    id: '0003',
    name: 'Canned Food',
    type: 'food',
    quantity: 2000,
    unit: 'cans',
    location: 'Fort Pampus',
    status: 'available',
    expiryDate: '2026-06-30',
    lastUpdated: '2024-01-15T06:45:00Z'
  },
  {
    id: '0004',
    name: 'MRE (Meals Ready to Eat)',
    type: 'food',
    quantity: 1500,
    unit: 'meals',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    expiryDate: '2027-03-15',
    lastUpdated: '2024-01-15T11:15:00Z'
  },
  {
    id: '0005',
    name: 'Water Purification Tablets',
    type: 'water',
    quantity: 50000,
    unit: 'tablets',
    location: 'Medical Supply Depot, Utrecht',
    status: 'available',
    expiryDate: '2026-12-31',
    lastUpdated: '2024-01-15T09:30:00Z'
  },
  {
    id: '0006',
    name: 'Energy Bars',
    type: 'food',
    quantity: 3000,
    unit: 'bars',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    expiryDate: '2025-08-31',
    lastUpdated: '2024-01-15T08:15:00Z'
  },
  {
    id: '0007',
    name: 'Dehydrated Meals',
    type: 'food',
    quantity: 800,
    unit: 'meals',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    expiryDate: '2028-12-31',
    lastUpdated: '2024-01-15T07:45:00Z'
  },
  {
    id: '0008',
    name: 'Water Storage Tanks',
    type: 'water',
    quantity: 50,
    unit: 'tanks',
    location: 'Distribution Center, Rotterdam',
    status: 'available',
    lastUpdated: '2024-01-15T06:30:00Z'
  },

  // Medical Supplies
  {
    id: '0009',
    name: 'First Aid Kits',
    type: 'medical',
    quantity: 500,
    unit: 'kits',
    location: 'Medical Supply Depot, Utrecht',
    status: 'available',
    lastUpdated: '2024-01-05T12:00:00Z'
  },
  {
    id: '0010',
    name: 'Painkillers (Morphine)',
    type: 'medical',
    quantity: 2000,
    unit: 'vials',
    location: 'Utrecht Medical Center',
    status: 'available',
    expiryDate: '2025-12-31',
    lastUpdated: '2024-01-15T09:00:00Z'
  },
  {
    id: '0011',
    name: 'Antibiotics',
    type: 'medical',
    quantity: 1000,
    unit: 'packages',
    location: 'Utrecht Medical Center',
    status: 'available',
    expiryDate: '2025-08-15',
    lastUpdated: '2024-01-15T08:45:00Z'
  },
  {
    id: '0012',
    name: 'Blood Plasma',
    type: 'medical',
    quantity: 100,
    unit: 'units',
    location: 'Utrecht Medical Center',
    status: 'low_stock',
    expiryDate: '2024-12-31',
    lastUpdated: '2024-01-15T07:20:00Z'
  },
  {
    id: '0013',
    name: 'Surgical Instruments',
    type: 'medical',
    quantity: 50,
    unit: 'sets',
    location: 'Utrecht Medical Center',
    status: 'available',
    lastUpdated: '2024-01-15T06:30:00Z'
  },
  {
    id: '0014',
    name: 'Bandages & Dressings',
    type: 'medical',
    quantity: 10000,
    unit: 'units',
    location: 'Medical Supply Depot, Utrecht',
    status: 'available',
    lastUpdated: '2024-01-15T05:45:00Z'
  },
  {
    id: '0015',
    name: 'IV Fluids',
    type: 'medical',
    quantity: 500,
    unit: 'bags',
    location: 'Utrecht Medical Center',
    status: 'available',
    expiryDate: '2025-06-30',
    lastUpdated: '2024-01-15T04:30:00Z'
  },
  {
    id: '0016',
    name: 'Defibrillators',
    type: 'medical',
    quantity: 25,
    unit: 'units',
    location: 'Medical Supply Depot, Utrecht',
    status: 'available',
    lastUpdated: '2024-01-15T03:15:00Z'
  },
  {
    id: '0017',
    name: 'Oxygen Tanks',
    type: 'medical',
    quantity: 100,
    unit: 'tanks',
    location: 'Utrecht Medical Center',
    status: 'available',
    lastUpdated: '2024-01-15T02:00:00Z'
  },
  {
    id: '0018',
    name: 'Stretchers',
    type: 'medical',
    quantity: 75,
    unit: 'units',
    location: 'Medical Supply Depot, Utrecht',
    status: 'available',
    lastUpdated: '2024-01-15T01:30:00Z'
  },

  // Fuel & Energy
  {
    id: '0019',
    name: 'Diesel Fuel',
    type: 'fuel',
    quantity: 5000,
    unit: 'liters',
    location: 'Fuel Storage, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-15T07:15:00Z'
  },
  {
    id: '0020',
    name: 'Gasoline',
    type: 'fuel',
    quantity: 3000,
    unit: 'liters',
    location: 'The Hague Bunker Complex',
    status: 'low_stock',
    lastUpdated: '2024-01-15T07:15:00Z'
  },
  {
    id: '0021',
    name: 'Portable Generators',
    type: 'equipment',
    quantity: 25,
    unit: 'units',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-15T05:45:00Z'
  },
  {
    id: '0022',
    name: 'Batteries (AA/AAA)',
    type: 'equipment',
    quantity: 10000,
    unit: 'packs',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-15T04:20:00Z'
  },
  {
    id: '0023',
    name: 'Solar Panels',
    type: 'equipment',
    quantity: 100,
    unit: 'panels',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-15T03:45:00Z'
  },
  {
    id: '0024',
    name: 'Power Banks',
    type: 'equipment',
    quantity: 200,
    unit: 'units',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-15T02:30:00Z'
  },
  {
    id: '0025',
    name: 'Fuel Cans (20L)',
    type: 'fuel',
    quantity: 500,
    unit: 'cans',
    location: 'Fuel Storage, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-15T01:15:00Z'
  },

  // Communication & Equipment
  {
    id: '0026',
    name: 'Radio Communication Sets',
    type: 'equipment',
    quantity: 100,
    unit: 'sets',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-15T03:15:00Z'
  },
  {
    id: '0027',
    name: 'Satellite Phones',
    type: 'equipment',
    quantity: 20,
    unit: 'units',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-15T02:30:00Z'
  },
  {
    id: '0028',
    name: 'Protective Gear Sets',
    type: 'equipment',
    quantity: 200,
    unit: 'sets',
    location: 'Safety Equipment Store, Tilburg',
    status: 'available',
    lastUpdated: '2024-01-15T01:45:00Z'
  },
  {
    id: '0029',
    name: 'Gas Masks',
    type: 'equipment',
    quantity: 500,
    unit: 'units',
    location: 'Safety Equipment Store, Tilburg',
    status: 'available',
    lastUpdated: '2024-01-15T00:30:00Z'
  },
  {
    id: '0030',
    name: 'Body Armor',
    type: 'equipment',
    quantity: 150,
    unit: 'sets',
    location: 'Safety Equipment Store, Tilburg',
    status: 'available',
    lastUpdated: '2024-01-14T23:45:00Z'
  },
  {
    id: '0031',
    name: 'Helmets',
    type: 'equipment',
    quantity: 300,
    unit: 'units',
    location: 'Safety Equipment Store, Tilburg',
    status: 'available',
    lastUpdated: '2024-01-14T22:30:00Z'
  },
  {
    id: '0032',
    name: 'Night Vision Goggles',
    type: 'equipment',
    quantity: 50,
    unit: 'pairs',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T21:15:00Z'
  },
  {
    id: '0033',
    name: 'Tactical Radios',
    type: 'equipment',
    quantity: 75,
    unit: 'units',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T20:00:00Z'
  },
  {
    id: '0034',
    name: 'GPS Devices',
    type: 'equipment',
    quantity: 100,
    unit: 'units',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T18:45:00Z'
  },

  // Transport & Vehicles
  {
    id: '0035',
    name: 'Emergency Vehicles',
    type: 'transport',
    quantity: 15,
    unit: 'vehicles',
    location: 'Vehicle Depot, Groningen',
    status: 'available',
    lastUpdated: '2024-01-14T23:15:00Z'
  },
  {
    id: '0036',
    name: 'Military Trucks',
    type: 'transport',
    quantity: 8,
    unit: 'vehicles',
    location: 'Vehicle Depot, Groningen',
    status: 'available',
    lastUpdated: '2024-01-14T22:00:00Z'
  },
  {
    id: '0037',
    name: 'Ambulances',
    type: 'transport',
    quantity: 12,
    unit: 'vehicles',
    location: 'Medical Supply Depot, Utrecht',
    status: 'available',
    lastUpdated: '2024-01-14T21:30:00Z'
  },
  {
    id: '0038',
    name: 'Motorcycles',
    type: 'transport',
    quantity: 20,
    unit: 'units',
    location: 'Vehicle Depot, Groningen',
    status: 'available',
    lastUpdated: '2024-01-14T20:15:00Z'
  },
  {
    id: '0039',
    name: 'ATVs (All-Terrain Vehicles)',
    type: 'transport',
    quantity: 15,
    unit: 'units',
    location: 'Vehicle Depot, Groningen',
    status: 'available',
    lastUpdated: '2024-01-14T19:00:00Z'
  },
  {
    id: '0040',
    name: 'Boats (Rescue)',
    type: 'transport',
    quantity: 8,
    unit: 'boats',
    location: 'Vehicle Depot, Groningen',
    status: 'available',
    lastUpdated: '2024-01-14T17:45:00Z'
  },
  {
    id: '0041',
    name: 'Helicopters',
    type: 'transport',
    quantity: 3,
    unit: 'units',
    location: 'Vehicle Depot, Groningen',
    status: 'available',
    lastUpdated: '2024-01-14T16:30:00Z'
  },

  // Ammunition & Weapons
  {
    id: '0042',
    name: 'Rifle Ammunition (5.56mm)',
    type: 'ammunition',
    quantity: 50000,
    unit: 'rounds',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-14T20:45:00Z'
  },
  {
    id: '0043',
    name: 'Pistol Ammunition (9mm)',
    type: 'ammunition',
    quantity: 25000,
    unit: 'rounds',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-14T19:30:00Z'
  },
  {
    id: '0044',
    name: 'Grenades (Hand)',
    type: 'ammunition',
    quantity: 500,
    unit: 'units',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-14T18:15:00Z'
  },
  {
    id: '0045',
    name: 'Shotgun Shells',
    type: 'ammunition',
    quantity: 10000,
    unit: 'shells',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-14T17:00:00Z'
  },
  {
    id: '0046',
    name: 'Sniper Rifle Ammunition',
    type: 'ammunition',
    quantity: 5000,
    unit: 'rounds',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-14T15:45:00Z'
  },
  {
    id: '0047',
    name: 'Machine Gun Ammunition',
    type: 'ammunition',
    quantity: 75000,
    unit: 'rounds',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-14T14:30:00Z'
  },
  {
    id: '0048',
    name: 'Explosives (C4)',
    type: 'ammunition',
    quantity: 100,
    unit: 'blocks',
    location: 'Military Supply Depot, Den Haag',
    status: 'available',
    lastUpdated: '2024-01-14T13:15:00Z'
  },

  // Emergency Shelter & Supplies
  {
    id: '0049',
    name: 'Emergency Blankets',
    type: 'equipment',
    quantity: 2000,
    unit: 'units',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    lastUpdated: '2024-01-14T17:00:00Z'
  },
  {
    id: '0050',
    name: 'Tents (4-person)',
    type: 'equipment',
    quantity: 100,
    unit: 'tents',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    lastUpdated: '2024-01-14T16:30:00Z'
  },
  {
    id: '0051',
    name: 'Sleeping Bags',
    type: 'equipment',
    quantity: 500,
    unit: 'units',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    lastUpdated: '2024-01-14T15:45:00Z'
  },
  {
    id: '0052',
    name: 'Portable Toilets',
    type: 'equipment',
    quantity: 50,
    unit: 'units',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    lastUpdated: '2024-01-14T14:30:00Z'
  },
  {
    id: '0053',
    name: 'Shower Units',
    type: 'equipment',
    quantity: 25,
    unit: 'units',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    lastUpdated: '2024-01-14T13:15:00Z'
  },
  {
    id: '0054',
    name: 'Heating Units',
    type: 'equipment',
    quantity: 30,
    unit: 'units',
    location: 'Central Warehouse, Amsterdam',
    status: 'available',
    lastUpdated: '2024-01-14T12:00:00Z'
  },

  // Tools & Maintenance
  {
    id: '0055',
    name: 'Tool Kits (Complete)',
    type: 'equipment',
    quantity: 50,
    unit: 'kits',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T14:20:00Z'
  },
  {
    id: '0056',
    name: 'Rope & Cables',
    type: 'equipment',
    quantity: 1000,
    unit: 'meters',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T13:15:00Z'
  },
  {
    id: '0057',
    name: 'Flashlights',
    type: 'equipment',
    quantity: 200,
    unit: 'units',
    location: 'Safety Equipment Store, Tilburg',
    status: 'available',
    lastUpdated: '2024-01-14T12:00:00Z'
  },
  {
    id: '0058',
    name: 'Welding Equipment',
    type: 'equipment',
    quantity: 15,
    unit: 'sets',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T11:00:00Z'
  },
  {
    id: '0059',
    name: 'Cutting Tools',
    type: 'equipment',
    quantity: 100,
    unit: 'sets',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T10:30:00Z'
  },
  {
    id: '0060',
    name: 'Measuring Equipment',
    type: 'equipment',
    quantity: 75,
    unit: 'units',
    location: 'Tech Warehouse, Eindhoven',
    status: 'available',
    lastUpdated: '2024-01-14T09:15:00Z'
  }
];

export const sampleAlerts: Alert[] = [
  {
    id: '1',
    title: 'Demo Alert: Evacuation Route A1 Closed',
    message: 'The A1 between Amsterdam and Utrecht is closed due to military activities. Use alternative routes.',
    severity: 'HIGH',
    type: 'warning',
    location: 'A1 Amsterdam-Utrecht',
    createdAt: '2025-09-11T12:30:00Z',
    updatedAt: '2025-09-11T12:30:00Z',
    status: 'active',
    affectedAreas: ['Amsterdam', 'Utrecht'],
    acknowledgedBy: ['1', '2']
  },
  {
    id: '2',
    title: 'Demo Alert: Security Alert - Suspicious Activity',
    message: 'Reported suspicious activity near The Hague Bunker Complex. Security personnel investigating.',
    severity: 'MEDIUM',
    type: 'security',
    location: 'The Hague Bunker Complex',
    createdAt: '2025-09-11T11:45:00Z',
    updatedAt: '2025-09-11T11:45:00Z',
    status: 'active',
    affectedAreas: ['The Hague'],
    acknowledgedBy: ['1']
  },
  {
    id: '3',
    title: 'Demo Alert: Border Infiltration Warning',
    message: 'Suspected infiltration activity detected along the German border near Maastricht. Military units deployed to investigate.',
    severity: 'HIGH',
    type: 'warning',
    location: 'German Border - Maastricht Area',
    createdAt: '2025-09-11T11:00:00Z',
    updatedAt: '2025-09-11T11:00:00Z',
    status: 'active',
    affectedAreas: ['Maastricht'],
    acknowledgedBy: []
  },
  {
    id: '4',
    title: 'Demo Alert: Medical Emergency - Mass Casualty',
    message: 'Multiple casualties reported at Utrecht Medical Center. Additional medical personnel requested.',
    severity: 'HIGH',
    type: 'medical',
    location: 'Utrecht Medical Center',
    createdAt: '2025-09-11T10:30:00Z',
    updatedAt: '2025-09-11T10:30:00Z',
    status: 'active',
    affectedAreas: ['Utrecht'],
    acknowledgedBy: ['2']
  },
  {
    id: '5',
    title: 'Demo Alert: Transport Disruption - Public Transport',
    message: 'Public transport services suspended in Amsterdam due to security concerns.',
    severity: 'MEDIUM',
    type: 'transport',
    location: 'Amsterdam',
    createdAt: '2025-09-11T10:00:00Z',
    updatedAt: '2025-09-11T10:00:00Z',
    status: 'active',
    affectedAreas: ['Amsterdam'],
    acknowledgedBy: []
  },
  {
    id: '6',
    title: 'Demo Alert: Evacuation Order - Rotterdam Area',
    message: 'Immediate evacuation ordered for Rotterdam city center. Follow designated routes.',
    severity: 'HIGH',
    type: 'warning',
    location: 'Rotterdam City Center',
    createdAt: '2025-09-11T09:45:00Z',
    updatedAt: '2025-09-11T09:45:00Z',
    status: 'active',
    affectedAreas: ['Rotterdam'],
    acknowledgedBy: ['1', '3']
  }
];

export const sampleCommunityMembers: CommunityMember[] = [
  {
    id: '1',
    name: 'General van der Berg',
    role: 'commander',
    department: 'military',
    status: 'online',
    lastActivity: '2024-01-15T12:00:00Z',
    location: 'Fort Pampus',
    skills: ['Strategy', 'Leadership', 'Crisis Management'],
    contact: '+31 6 12345678',
    avatar: '👨‍💼'
  },
  {
    id: '2',
    name: 'Dr. Sarah Janssen',
    role: 'doctor',
    department: 'medical',
    status: 'busy',
    lastActivity: '2024-01-15T11:45:00Z',
    location: 'Utrecht Medical Center',
    skills: ['Trauma Surgery', 'Emergency Medicine'],
    contact: '+31 6 23456789',
    avatar: '👩‍⚕️'
  },
  {
    id: '3',
    name: 'Lisa van Dijk',
    role: 'volunteer',
    department: 'humanitarian',
    status: 'online',
    lastActivity: '2024-01-15T12:15:00Z',
    location: 'Amsterdam RAI Evacuation Center',
    skills: ['Logistics', 'Communications'],
    contact: '+31 6 45678901',
    avatar: '👩‍💼'
  },
  {
    id: '4',
    name: 'Captain Pietersen',
    role: 'soldier',
    department: 'military',
    status: 'away',
    lastActivity: '2024-01-15T10:30:00Z',
    location: 'The Hague Bunker Complex',
    skills: ['Infantry', 'EOD'],
    contact: '+31 6 34567890',
    avatar: '👨‍✈️'
  }
];
