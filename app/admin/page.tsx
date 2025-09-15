'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Users, 
  MapPin, 
  Route, 
  Package, 
  AlertTriangle, 
  Settings, 
  Shield, 
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye,
  Map,
  Layers
} from 'lucide-react';
import dynamic from 'next/dynamic';

const AdminMapEditor = dynamic(() => import('../components/AdminMapEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-gray-500">Loading map editor...</div>
    </div>
  )
});
import { sampleLocations } from '../data/sampleData';
import { Location } from '../types';

interface AdminStats {
  totalUsers: number;
  totalLocations: number;
  totalPersonnel: number;
  totalRoutes: number;
  totalResources: number;
  totalAlerts: number;
  activeUsers: number;
  recentActivity: any[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLocations: 0,
    totalPersonnel: 0,
    totalRoutes: 0,
    totalResources: 0,
    totalAlerts: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>(sampleLocations);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'locations' | 'personnel' | 'routes' | 'resources' | 'alerts'>('overview');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    // Load admin stats
    loadAdminStats();
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not admin
  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  const loadAdminStats = async () => {
    try {
      // This would typically fetch from API endpoints
      // For now, we'll use mock data
      setStats({
        totalUsers: 156,
        totalLocations: locations.length,
        totalPersonnel: 89,
        totalRoutes: 12,
        totalResources: 45,
        totalAlerts: 8,
        activeUsers: 23,
        recentActivity: [
          { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
          { id: 2, action: 'Location updated', user: 'Sarah Smith', time: '5 minutes ago' },
          { id: 3, action: 'Alert created', user: 'Mike Johnson', time: '10 minutes ago' },
        ]
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationAdd = (locationData: Omit<Location, 'id'>) => {
    const newLocation: Location = {
      ...locationData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    setLocations(prev => [...prev, newLocation]);
    setStats(prev => ({ ...prev, totalLocations: prev.totalLocations + 1 }));
  };

  const handleLocationUpdate = (id: string, updates: Partial<Location>) => {
    setLocations(prev => 
      prev.map(loc => 
        loc.id === id 
          ? { ...loc, ...updates, lastUpdated: new Date().toISOString() }
          : loc
      )
    );
  };

  const handleLocationDelete = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
    setStats(prev => ({ ...prev, totalLocations: prev.totalLocations - 1 }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      change: '+12 this week'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Shield,
      color: 'text-green-600 bg-green-100',
      change: '+5 today'
    },
    {
      title: 'Locations',
      value: stats.totalLocations,
      icon: MapPin,
      color: 'text-purple-600 bg-purple-100',
      change: '+2 this month'
    },
    {
      title: 'Personnel',
      value: stats.totalPersonnel,
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      change: '+8 this week'
    },
    {
      title: 'Evacuation Routes',
      value: stats.totalRoutes,
      icon: Route,
      color: 'text-red-600 bg-red-100',
      change: 'All operational'
    },
    {
      title: 'Resources',
      value: stats.totalResources,
      icon: Package,
      color: 'text-indigo-600 bg-indigo-100',
      change: '+15 this week'
    },
    {
      title: 'Active Alerts',
      value: stats.totalAlerts,
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100',
      change: '-3 since yesterday'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Ghost Legion - System Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Back to Main App
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'map', label: 'Map Editor', icon: Map },
                { id: 'locations', label: 'Locations', icon: MapPin },
                { id: 'personnel', label: 'Personnel', icon: Users },
                { id: 'routes', label: 'Routes', icon: Route },
                { id: 'resources', label: 'Resources', icon: Package },
                { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-green-600 font-medium">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <Plus className="h-4 w-4 mr-3" />
                  Add New User
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <MapPin className="h-4 w-4 mr-3" />
                  Manage Locations
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <Users className="h-4 w-4 mr-3" />
                  Manage Personnel
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <Route className="h-4 w-4 mr-3" />
                  Manage Routes
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <Package className="h-4 w-4 mr-3" />
                  Manage Resources
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Manage Alerts
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                  <Settings className="h-4 w-4 mr-3" />
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">JD</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">John Doe</div>
                          <div className="text-sm text-gray-500">john@example.com</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">COMMANDER</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Authentication</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Map Service</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Maintenance</span>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Map Editor Tab */}
        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Strategic Map Editor</h2>
              <p className="text-sm text-gray-600 mt-1">
                Add locations, draw strategic areas, and plan operations on the interactive map.
              </p>
            </div>
            <div className="h-[600px]">
              <AdminMapEditor
                locations={locations}
                onLocationAdd={handleLocationAdd}
                onLocationUpdate={handleLocationUpdate}
                onLocationDelete={handleLocationDelete}
              />
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Manage Locations</h2>
                <button
                  onClick={() => setActiveTab('map')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2 inline" />
                  Add Location
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {locations.map((location) => (
                    <tr key={location.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{location.name}</div>
                          <div className="text-sm text-gray-500">{location.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {location.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          location.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {location.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {location.capacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleLocationDelete(location.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab === 'personnel' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personnel Management</h2>
            <p className="text-gray-600">Personnel management features coming soon...</p>
          </div>
        )}

        {activeTab === 'routes' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Management</h2>
            <p className="text-gray-600">Route management features coming soon...</p>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resource Management</h2>
            <p className="text-gray-600">Resource management features coming soon...</p>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Management</h2>
            <p className="text-gray-600">Alert management features coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
