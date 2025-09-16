'use client';

import { useState } from 'react';
import { MapPin, Clock, Users, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function EvacuationPlansPage() {
  const [selectedRegion, setSelectedRegion] = useState('north');

  const evacuationRoutes = {
    north: {
      name: 'Northern Netherlands',
      routes: [
        {
          id: 'route-1',
          name: 'Groningen to Germany',
          distance: '45 km',
          duration: '2-3 hours',
          capacity: '15,000 people',
          status: 'active',
          checkpoints: [
            { name: 'Groningen Central Station', type: 'assembly', capacity: '5,000' },
            { name: 'Winschoten Border Crossing', type: 'border', capacity: '2,000' },
            { name: 'Bad Nieuweschans Refugee Center', type: 'shelter', capacity: '8,000' }
          ]
        },
        {
          id: 'route-2',
          name: 'Friesland to Denmark',
          distance: '120 km',
          duration: '4-5 hours',
          capacity: '8,000 people',
          status: 'standby',
          checkpoints: [
            { name: 'Leeuwarden Assembly Point', type: 'assembly', capacity: '3,000' },
            { name: 'Harlingen Port', type: 'port', capacity: '2,000' },
            { name: 'Esbjerg Reception Center', type: 'shelter', capacity: '5,000' }
          ]
        }
      ]
    },
    central: {
      name: 'Central Netherlands',
      routes: [
        {
          id: 'route-3',
          name: 'Amsterdam to Belgium',
          distance: '180 km',
          duration: '3-4 hours',
          capacity: '25,000 people',
          status: 'active',
          checkpoints: [
            { name: 'Amsterdam Arena', type: 'assembly', capacity: '10,000' },
            { name: 'Rotterdam Central', type: 'transit', capacity: '8,000' },
            { name: 'Antwerp Reception Center', type: 'shelter', capacity: '15,000' }
          ]
        }
      ]
    },
    south: {
      name: 'Southern Netherlands',
      routes: [
        {
          id: 'route-4',
          name: 'Eindhoven to France',
          distance: '220 km',
          duration: '4-5 hours',
          capacity: '12,000 people',
          status: 'active',
          checkpoints: [
            { name: 'Eindhoven Airport', type: 'assembly', capacity: '5,000' },
            { name: 'Tilburg Transit Center', type: 'transit', capacity: '3,000' },
            { name: 'Lille Reception Center', type: 'shelter', capacity: '8,000' }
          ]
        }
      ]
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'standby': return 'text-yellow-600 bg-yellow-100';
      case 'closed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Evacuation Plans</h1>
          <p className="text-gray-600">
            Comprehensive evacuation routes and procedures for the Netherlands during crisis situations.
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
            <div key={route.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{route.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                  {route.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{route.distance}</div>
                  <div className="text-sm text-gray-500">Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{route.duration}</div>
                  <div className="text-sm text-gray-500">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{route.capacity}</div>
                  <div className="text-sm text-gray-500">Capacity</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Checkpoints</h4>
                {route.checkpoints.map((checkpoint, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getCheckpointIcon(checkpoint.type)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{checkpoint.name}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {checkpoint.type} • Capacity: {checkpoint.capacity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
