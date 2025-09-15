'use client';

import { EvacuationRoute } from '../types';
import { getStatusColor, formatDate } from '../lib/utils';
import { MapPin, Clock, Users, Car, Train, Plane, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface EvacuationPlanProps {
  routes: EvacuationRoute[];
}

export default function EvacuationPlan({ routes }: EvacuationPlanProps) {
  const [selectedRoute, setSelectedRoute] = useState<EvacuationRoute | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'foot': return '🚶';
      case 'vehicle': return '🚗';
      case 'public_transport': return '🚆';
      case 'military_vehicle': return '🚛';
      default: return '🚗';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRoutes = filterStatus === 'all' 
    ? routes 
    : routes.filter(route => route.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evacuatieplannen Nederland</h2>
            <p className="text-gray-600">Overzicht van alle beschikbare evacuatieroutes tijdens crisis</p>
          </div>
          <div className="flex space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Alle Status</option>
              <option value="open">Open</option>
              <option value="closed">Gesloten</option>
              <option value="congested">Druk</option>
              <option value="dangerous">Gevaarlijk</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-800">Open Routes</p>
                <p className="text-2xl font-bold text-green-900">
                  {routes.filter(r => r.status === 'open').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Gesloten Routes</p>
                <p className="text-2xl font-bold text-red-900">
                  {routes.filter(r => r.status === 'closed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Totale Capaciteit</p>
                <p className="text-2xl font-bold text-blue-900">
                  {routes.reduce((sum, r) => sum + r.capacity, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Gem. Reistijd</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {Math.round(routes.reduce((sum, r) => sum + r.estimatedTime, 0) / routes.length)} min
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRoutes.map((route) => (
          <div
            key={route.id}
            className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
              selectedRoute?.id === route.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedRoute(route)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                  <p className="text-sm text-gray-600">
                    {route.startLocation} → {route.endLocation}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(route.status)}`}>
                    {route.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(route.priority)}`}>
                    {route.priority} prioriteit
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{route.estimatedTime} minuten</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{route.capacity.toLocaleString()} personen</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-lg mr-2">{getTransportIcon(route.transportType)}</span>
                  <span className="capitalize">{route.transportType.replace('_', ' ')}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{route.waypoints.length} waypoints</span>
                </div>
              </div>

              {/* Waypoints */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Route Waypoints:</h4>
                <div className="space-y-1">
                  {route.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>{waypoint[0].toFixed(4)}, {waypoint[1].toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                <span>Bijgewerkt: {formatDate(route.lastUpdated)}</span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                    Bekijk Route
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                    Start Evacuatie
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Route Details */}
      {selectedRoute && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Gedetailleerde Route Informatie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Route Details</h4>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Start:</span> {selectedRoute.startLocation}</div>
                <div><span className="font-medium">Eind:</span> {selectedRoute.endLocation}</div>
                <div><span className="font-medium">Reistijd:</span> {selectedRoute.estimatedTime} minuten</div>
                <div><span className="font-medium">Capaciteit:</span> {selectedRoute.capacity.toLocaleString()} personen</div>
                <div><span className="font-medium">Transport:</span> {selectedRoute.transportType.replace('_', ' ')}</div>
                <div><span className="font-medium">Status:</span> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedRoute.status)}`}>
                    {selectedRoute.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Waypoints</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedRoute.waypoints.map((waypoint, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </div>
                    <span>{waypoint[0].toFixed(6)}, {waypoint[1].toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
