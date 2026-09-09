'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface EvacuationRoute {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  waypoints: [number, number][];
  estimatedTime: number;
  status: 'OPEN' | 'CLOSED' | 'CONGESTED' | 'DANGEROUS';
  capacity: number;
  transportType: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  enableNotifications?: boolean;
  isPriorityRoute?: boolean;
  allowReverseDirection?: boolean;
  requiresEscort?: boolean;
  showDemoOverlay?: boolean;
}

export default function EvacuationPlansPage() {
  const [selectedRegion, setSelectedRegion] = useState('north');
  const [routes, setRoutes] = useState<EvacuationRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load routes from API
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/routes');
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      } else {
        setRoutes([]);
      }
    } catch {
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const evacuationRoutes = {
    north: {
      name: 'North',
      routes: routes.filter(route => 
        route.startLocation.toLowerCase().includes('groningen') || 
        route.startLocation.toLowerCase().includes('leeuwarden') ||
        route.startLocation.toLowerCase().includes('friesland') ||
        route.startLocation.toLowerCase().includes('drenthe') ||
        route.startLocation.toLowerCase().includes('harlingen')
      )
    },
    central: {
      name: 'Central',
      routes: routes.filter(route => 
        route.startLocation.toLowerCase().includes('amsterdam') || 
        route.startLocation.toLowerCase().includes('rotterdam') ||
        route.startLocation.toLowerCase().includes('utrecht') ||
        route.startLocation.toLowerCase().includes('den haag') ||
        route.startLocation.toLowerCase().includes('the hague') ||
        route.startLocation.toLowerCase().includes('haarlem') ||
        route.startLocation.toLowerCase().includes('zaandam')
      )
    },
    south: {
      name: 'South',
      routes: routes.filter(route => 
        route.startLocation.toLowerCase().includes('eindhoven') || 
        route.startLocation.toLowerCase().includes('tilburg') ||
        route.startLocation.toLowerCase().includes('breda') ||
        route.startLocation.toLowerCase().includes('maastricht') ||
        route.startLocation.toLowerCase().includes('valkenswaard')
      )
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'text-green-600 bg-green-100';
      case 'CONGESTED': return 'text-yellow-600 bg-yellow-100'; // This will show as STANDBY with yellow
      case 'CLOSED': return 'text-red-600 bg-red-100';
      case 'DANGEROUS': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'ACTIVE';
      case 'CONGESTED': return 'STANDBY'; // Display CONGESTED as STANDBY
      case 'CLOSED': return 'CLOSED';
      case 'DANGEROUS': return 'DANGEROUS';
      default: return status;
    }
  };

  const getCheckpointIcon = (type: string) => {
    switch (type) {
      case 'assembly': return <Users className="h-4 w-4" />;
      case 'border': return <MapPin className="h-4 w-4" />;
      case 'shelter': return <CheckCircle className="h-4 w-4" />;
      case 'port': return <ArrowRight className="h-4 w-4" />;
      case 'transit': return <Clock className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading evacuation routes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evacuation Plans</h1>
          <p className="text-gray-600">
            Comprehensive evacuation routes and procedures during crisis situations.
          </p>
        </div>

        {/* Region Selector */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {Object.keys(evacuationRoutes).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedRegion === region
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {evacuationRoutes[region as keyof typeof evacuationRoutes].name}
              </button>
            ))}
          </div>
        </div>

        {/* Evacuation Routes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {evacuationRoutes[selectedRegion as keyof typeof evacuationRoutes].routes.map((route) => (
            <div key={route.id} className="bg-white rounded-lg shadow-sm border p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{route.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                  {getStatusLabel(route.status)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{route.startLocation} → {route.endLocation}</div>
                  <div className="text-sm text-gray-500">Route</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{route.estimatedTime} min</div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{route.capacity} people</div>
                  <div className="text-sm text-gray-500">Capacity</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Route Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Transport Type</div>
                      <div className="text-sm text-gray-500">{route.transportType}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Priority</div>
                      <div className="text-sm text-gray-500">{route.priority}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* DEMO Overlay */}
              {route.showDemoOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                  <img
                    src="/demo.png"
                    alt="Ghost Legion evacuation planning demo: routes and waypoints"
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-30 rounded-lg"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Emergency Phone Numbers */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-black-800 mb-4">Phone Numbers</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-black-800 text-sm">Emergency Services</h4>
              <p className="text-2xl font-bold text-red-600">112</p>
              <p className="text-xs text-black-600">For life-threatening situations</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-black-800 text-sm">Ministry of Defense</h4>
              <p className="text-2xl font-bold text-red-600">088-9550550</p>
              <p className="text-xs text-black-600">Military command and coordination</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-black-800 text-sm">Police</h4>
              <p className="text-2xl font-bold text-red-600">0900-8844</p>
              <p className="text-xs text-black-600">National Phone Number</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-black-800 text-sm">Red Cross</h4>
              <p className="text-2xl font-bold text-red-600">070-4455678</p>
              <p className="text-xs text-black-600">Humanitarian aid and support</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
