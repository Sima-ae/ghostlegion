'use client';

import { useState } from 'react';
import { MapPin, Users, Route, Package, AlertTriangle, Activity, Shield, Heart } from 'lucide-react';
import { sampleLocations, samplePersonnel, sampleEvacuationRoutes, sampleResources, sampleAlerts, sampleCommunityMembers } from '../data/sampleData';
import { getStatusColor, getSeverityColor, formatTimeAgo } from '../lib/utils';

export default function Dashboard() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const stats = [
    {
      title: 'Actieve Locaties',
      value: sampleLocations.filter(l => l.status === 'active').length,
      total: sampleLocations.length,
      icon: MapPin,
      color: 'text-green-600 bg-green-100',
      change: '+2 deze week'
    },
    {
      title: 'Personeel Online',
      value: samplePersonnel.filter(p => p.status === 'active').length,
      total: samplePersonnel.length,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      change: '+5 vandaag'
    },
    {
      title: 'Evacuatie Routes',
      value: sampleEvacuationRoutes.filter(r => r.status === 'open').length,
      total: sampleEvacuationRoutes.length,
      icon: Route,
      color: 'text-purple-600 bg-purple-100',
      change: 'Alle operationeel'
    },
    {
      title: 'Kritieke Waarschuwingen',
      value: sampleAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length,
      total: sampleAlerts.length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
      change: '-1 sinds gisteren'
    }
  ];

  const recentAlerts = sampleAlerts
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const onlinePersonnel = sampleCommunityMembers
    .filter(p => p.status === 'online')
    .slice(0, 8);

  const lowStockResources = sampleResources
    .filter(r => r.status === 'low_stock' || r.status === 'out_of_stock')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ghost Legion Dashboard</h1>
        <p className="text-gray-600">Overzicht van militaire paraatheid en gemeenschapsbeheer voor Nederland</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">van {stat.total} totaal</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recente Waarschuwingen</h2>
              <span className="text-sm text-gray-500">{recentAlerts.length} items</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{alert.message}</p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span>{formatTimeAgo(alert.timestamp)}</span>
                      {alert.location && <span>• {alert.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                Alle waarschuwingen bekijken
              </button>
            </div>
          </div>
        </div>

        {/* Online Personnel */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Online Personeel</h2>
              <span className="text-sm text-gray-500">{onlinePersonnel.length} online</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {onlinePersonnel.map((person) => (
                <div key={person.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm">{person.avatar}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {person.role.replace('_', ' ')} • {person.department}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                Alle personeel bekijken
              </button>
            </div>
          </div>
        </div>

        {/* Resource Status */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Voorraad Status</h2>
              <span className="text-sm text-gray-500">{lowStockResources.length} kritiek</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {lowStockResources.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{resource.name}</p>
                    <p className="text-xs text-gray-500">{resource.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {resource.quantity} {resource.unit}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                      {resource.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                Alle voorraden bekijken
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Snelle Acties</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Nieuwe Locatie</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Personeel Toevoegen</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Route className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Evacuatie Starten</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Waarschuwing Versturen</span>
          </button>
        </div>
      </div>
    </div>
  );
}
