export interface Location {
  id: string;
  name: string;
  type: 'bunker' | 'fortress' | 'hiding_place' | 'evacuation_center' | 'medical_facility' | 'command_center' | 'supply_depot';
  coordinates: [number, number]; // [latitude, longitude]
  description: string;
  capacity?: number;
  status: 'active' | 'inactive' | 'damaged' | 'under_construction';
  facilities: string[];
  contact?: string;
  lastUpdated: string;
}

export interface Personnel {
  id: string;
  name: string;
  role: PersonnelRole;
  department: PersonnelDepartment;
  status: 'active' | 'inactive' | 'deployed' | 'injured' | 'missing';
  location?: string;
  skills: string[];
  contact: string;
  clearanceLevel: 'public' | 'restricted' | 'confidential' | 'secret' | 'top_secret';
  lastSeen: string;
}

export type PersonnelRole = 
  | 'soldier' | 'commander' | 'intelligence_analyst' | 'eod_specialist' | 'sniper' | 'tank_crew'
  | 'pilot' | 'naval_force' | 'military_medic' | 'logistics_manager' | 'cybersecurity_expert'
  | 'military_police' | 'psyops_specialist' | 'weapons_engineer' | 'government_leader'
  | 'emergency_coordinator' | 'civil_defense' | 'evacuation_planner' | 'diplomatic_personnel'
  | 'un_personnel' | 'red_cross_worker' | 'ngo_staff' | 'refugee_coordinator' | 'field_medic'
  | 'trauma_counselor' | 'volunteer' | 'translator' | 'social_worker' | 'child_protection'
  | 'doctor' | 'surgeon' | 'paramedic' | 'nurse' | 'pharmacist' | 'mental_health_professional'
  | 'truck_driver' | 'pilot_civilian' | 'warehouse_manager' | 'construction_worker'
  | 'journalist' | 'it_specialist' | 'communication_operator' | 'librarian'
  | 'police_officer' | 'security_guard' | 'border_guard' | 'counterintelligence'
  | 'teacher' | 'religious_leader' | 'business_owner' | 'developer' | 'farmer';

export type PersonnelDepartment = 
  | 'military' | 'government' | 'humanitarian' | 'medical' | 'logistics' 
  | 'communication' | 'law_enforcement' | 'civilian' | 'volunteer';

export interface EvacuationRoute {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  waypoints: [number, number][];
  estimatedTime: number; // in minutes
  capacity: number;
  status: 'open' | 'closed' | 'congested' | 'dangerous';
  transportType: 'foot' | 'vehicle' | 'public_transport' | 'military_vehicle';
  priority: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'food' | 'water' | 'medical' | 'fuel' | 'ammunition' | 'equipment' | 'transport';
  quantity: number;
  unit: string;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'damaged';
  expiryDate?: string;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'evacuation' | 'security' | 'warning' | 'medical' | 'transport';
  location?: string;
  timestamp: string;
  expiresAt?: string;
  acknowledgedBy: string[];
}

export interface CommunityMember {
  id: string;
  name: string;
  role: PersonnelRole;
  department: PersonnelDepartment;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastActivity: string;
  location?: string;
  skills: string[];
  contact: string;
  avatar?: string;
}
