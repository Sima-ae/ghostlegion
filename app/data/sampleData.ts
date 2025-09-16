import { Location, Personnel, EvacuationRoute, Resource, Alert, CommunityMember } from '../types';

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

export const samplePersonnel: Personnel[] = [
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
  {
    id: '1',
    name: 'Medicines - Painkillers',
    type: 'medical',
    quantity: 5000,
    unit: 'units',
    location: 'Utrecht Medical Center',
    status: 'available',
    expiryDate: '2025-12-31',
    lastUpdated: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    name: 'Drinking Water',
    type: 'water',
    quantity: 10000,
    unit: 'liters',
    location: 'Amsterdam RAI Evacuation Center',
    status: 'available',
    lastUpdated: '2024-01-15T08:30:00Z'
  },
  {
    id: '3',
    name: 'Gasoline',
    type: 'fuel',
    quantity: 5000,
    unit: 'liters',
    location: 'The Hague Bunker Complex',
    status: 'low_stock',
    lastUpdated: '2024-01-15T07:15:00Z'
  },
  {
    id: '4',
    name: 'Canned Food',
    type: 'food',
    quantity: 2000,
    unit: 'cans',
    location: 'Fort Pampus',
    status: 'available',
    expiryDate: '2026-06-30',
    lastUpdated: '2024-01-15T06:45:00Z'
  }
];

export const sampleAlerts: Alert[] = [
  {
    id: '1',
    title: 'Demo Alert: Evacuation Route A1 Closed',
    message: 'The A1 between Amsterdam and Utrecht is closed due to military activities. Use alternative routes.',
    severity: 'high',
    type: 'evacuation',
    location: 'A1 Amsterdam-Utrecht',
    timestamp: '2024-01-15T12:30:00Z',
    expiresAt: '2024-01-15T18:00:00Z',
    acknowledgedBy: ['1', '2']
  },
  {
    id: '2',
    title: 'Demo Alert: Security Alert - Suspicious Activity',
    message: 'Reported suspicious activity near The Hague Bunker Complex. Security personnel investigating.',
    severity: 'medium',
    type: 'security',
    location: 'The Hague Bunker Complex',
    timestamp: '2024-01-15T11:45:00Z',
    acknowledgedBy: ['1']
  },
  {
    id: '3',
    title: 'Demo Alert: Severe Weather Warning',
    message: 'Heavy storms expected in the northern regions. Take necessary precautions.',
    severity: 'high',
    type: 'weather',
    location: 'Northern Netherlands',
    timestamp: '2024-01-15T11:00:00Z',
    expiresAt: '2024-01-16T06:00:00Z',
    acknowledgedBy: []
  },
  {
    id: '4',
    title: 'Demo Alert: Medical Emergency - Mass Casualty',
    message: 'Multiple casualties reported at Utrecht Medical Center. Additional medical personnel requested.',
    severity: 'high',
    type: 'medical',
    location: 'Utrecht Medical Center',
    timestamp: '2024-01-15T10:30:00Z',
    acknowledgedBy: ['2']
  },
  {
    id: '5',
    title: 'Demo Alert: Transport Disruption - Public Transport',
    message: 'Public transport services suspended in Amsterdam due to security concerns.',
    severity: 'medium',
    type: 'transport',
    location: 'Amsterdam',
    timestamp: '2024-01-15T10:00:00Z',
    expiresAt: '2024-01-15T16:00:00Z',
    acknowledgedBy: []
  },
  {
    id: '6',
    title: 'Demo Alert: Evacuation Order - Rotterdam Area',
    message: 'Immediate evacuation ordered for Rotterdam city center. Follow designated routes.',
    severity: 'high',
    type: 'evacuation',
    location: 'Rotterdam City Center',
    timestamp: '2024-01-15T09:45:00Z',
    expiresAt: '2024-01-15T20:00:00Z',
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
