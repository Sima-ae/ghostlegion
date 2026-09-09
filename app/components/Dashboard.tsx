'use client';

import { useEffect, useState } from 'react';
import { MapPin, Users, Route, Package, AlertTriangle, Shield } from 'lucide-react';
import { getStatusColor, getSeverityColor, formatTimeAgo } from '../lib/utils';

type LocationRow = { id: string; status: string };
type PersonRow = { id: string; name: string; role: string; department: string; status: string };
type RouteRow = { id: string; status: string };
type AlertRow = { id: string; title: string; message: string; severity: string; location?: string; createdAt: string };
type ResourceRow = { id: string; name: string; location: string; quantity: number; unit: string; status: string };

async function loadJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) return fallback;
    const data = await response.json();
    return data as T;
  } catch {
    return fallback;
  }
}

export default function Dashboard() {
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [locs, ppl, rts, alrts, res] = await Promise.all([
        loadJson<LocationRow[]>('/api/locations', []),
        loadJson<PersonRow[]>('/api/people', []),
        loadJson<RouteRow[]>('/api/routes', []),
        loadJson<AlertRow[]>('/api/alerts', []),
        loadJson<ResourceRow[]>('/api/resources', []),
      ]);
      if (cancelled) return;
      setLocations(Array.isArray(locs) ? locs : []);
      setPeople(Array.isArray(ppl) ? ppl : []);
      setRoutes(Array.isArray(rts) ? rts : []);
      setAlerts(Array.isArray(alrts) ? alrts : []);
      setResources(Array.isArray(res) ? res : []);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      title: 'Actieve Locaties',
      value: locations.filter((l) => String(l.status).toUpperCase() === 'ACTIVE').length,
      total: locations.length,
      icon: MapPin,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Personeel Online',
      value: people.filter((p) => String(p.status).toUpperCase() === 'ACTIVE').length,
      total: people.length,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Evacuation Routes',
      value: routes.filter((r) => String(r.status).toUpperCase() === 'OPEN').length,
      total: routes.length,
      icon: Route,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Critical Alerts',
      value: alerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'HIGH').length,
      total: alerts.length,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
    },
  ];

  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const onlinePeople = people
    .filter((p) => String(p.status).toUpperCase() === 'ACTIVE')
    .slice(0, 8);

  const lowStockResources = resources
    .filter((r) => {
      const status = String(r.status).toUpperCase();
      return status === 'LOW_STOCK' || status === 'OUT_OF_STOCK';
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ghost Legion Dashboard</h1>
        <p className="text-gray-600">Overview of preparedness and community management</p>
        {!loaded && <p className="text-sm text-gray-500 mt-2">Loading live MariaDB data…</p>}
      </div>

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
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
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
                      <span>{formatTimeAgo(alert.createdAt)}</span>
                      {alert.location && <span>• {alert.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Online People</h2>
              <span className="text-sm text-gray-500">{onlinePeople.length} active</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {onlinePeople.map((person) => (
                <div key={person.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {String(person.role).replace('_', ' ')} • {person.department}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">New Location</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Add People</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Route className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Start Evacuation</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Send Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
}
