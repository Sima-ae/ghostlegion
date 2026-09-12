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
  isPublic?: boolean;
  lastUpdated: string;
}

export interface People {
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
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: 'security' | 'medical' | 'weather' | 'warning' | 'transport' | 'infrastructure';
  status: 'active' | 'resolved' | 'cancelled';
  location?: string;
  affectedAreas: string[];
  createdAt: string;
  updatedAt: string;
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

export const MAX_MEMO_BODY = 1000;
export const ANONYMOUS_LABEL = 'Anonymous';

export interface MapMemo {
  id: string;
  body: string;
  latitude: number;
  longitude: number;
  createdBy: string;
  createdByName?: string | null;
  updatedBy?: string | null;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdIp?: string | null;
  isPrivate?: boolean;
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HeritageEra = 'WW1' | 'WW2' | 'COLD_WAR';
export type HeritageGeometry = 'POINT' | 'LINE' | 'AREA';
export type HeritagePresence =
  | 'PRESENT'
  | 'POSSIBLE'
  | 'ABSENT'
  | 'REMNANT'
  | 'GONE'
  | 'UNKNOWN';
export type HeritageDomain = 'MILITARY' | 'CIVIL' | 'COMBINED';

export type MapViewMode = 'operations' | 'ww1' | 'ww2' | 'cold_war';

export interface HeritageFeature {
  id: string;
  era: HeritageEra;
  geometry: HeritageGeometry;
  coordinates: [number, number] | [number, number][] | [number, number][][];
  name: string;
  description?: string | null;
  presence: HeritagePresence;
  domain?: HeritageDomain | null;
  category?: string | null;
  function?: string | null;
  featureType?: string | null;
  lineKind?: string | null;
  ensemble?: string | null;
  builder?: string | null;
  historicalUser?: string | null;
  accessibility?: string | null;
  visibilityNote?: string | null;
  isPublic: boolean;
  visible: boolean;
  color?: string | null;
  size?: number | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}
