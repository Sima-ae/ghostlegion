'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import React from 'react';
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
  Layers,
  X,
  Check
} from 'lucide-react';
import dynamic from 'next/dynamic';

import AdminMapEditor from '../components/AdminMapEditorWrapper';
import PeopleManagement from '../components/PeopleManagement';
import RoutesManagement from '../components/RoutesManagement';
import ResourcesManagement from '../components/ResourcesManagement';
import AlertsManagement from '../components/AlertsManagement';
import { sampleLocations } from '../data/sampleData';
import { Location } from '../types';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdminMapEditor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[600px] bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Map Editor Error</div>
            <div className="text-sm text-red-500 mb-4">
              Failed to load map editor. Please refresh the page.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface AdminStats {
  totalUsers: number;
  totalLocations: number;
  totalPeople: number;
  totalRoutes: number;
  totalResources: number;
  totalAlerts: number;
  activeUsers: number;
  recentActivity: any[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    joinedAt: string;
  }[];
  systemStatus: {
    name: string;
    status: string;
    uptime: string;
    lastCheck: string;
  }[];
  // Change indicators
  usersChange: string;
  peopleChange: string;
  locationsChange: string;
  activeUsersChange: string;
  resourcesChange: string;
  alertsChange: string;
  routesStatus: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalLocations: 0,
    totalPeople: 0,
    totalRoutes: 0,
    totalResources: 0,
    totalAlerts: 0,
    activeUsers: 0,
    recentActivity: [],
    recentUsers: [],
    systemStatus: [],
    usersChange: '0 this week',
    peopleChange: '0 this week',
    locationsChange: '0 this month',
    activeUsersChange: '0 today',
    resourcesChange: '0 this week',
    alertsChange: '0 since yesterday',
    routesStatus: 'No routes'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>(sampleLocations);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'locations' | 'people' | 'routes' | 'resources' | 'alerts'>('overview');
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Location>>({});

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
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const realStats = await response.json();
        setStats(realStats);
      } else {
        // Fallback to mock data if API fails
        setStats({
          totalUsers: 156,
          totalLocations: locations.length,
          totalPeople: 89,
          totalRoutes: 12,
          totalResources: 45,
          totalAlerts: 8,
          activeUsers: 23,
          recentActivity: [
            { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
            { id: 2, action: 'Location updated', user: 'Sarah Smith', time: '5 minutes ago' },
            { id: 3, action: 'Alert created', user: 'Mike Johnson', time: '10 minutes ago' },
          ],
          recentUsers: [],
          systemStatus: [],
          usersChange: '0 this week',
          peopleChange: '0 this week',
          locationsChange: '0 this month',
          activeUsersChange: '0 today',
          resourcesChange: '0 this week',
          alertsChange: '0 since yesterday',
          routesStatus: 'All operational'
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Fallback to mock data
      setStats({
        totalUsers: 156,
        totalLocations: locations.length,
        totalPeople: 89,
        totalRoutes: 12,
        totalResources: 45,
        totalAlerts: 8,
        activeUsers: 23,
        recentActivity: [
          { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
          { id: 2, action: 'Location updated', user: 'Sarah Smith', time: '5 minutes ago' },
          { id: 3, action: 'Alert created', user: 'Mike Johnson', time: '10 minutes ago' },
        ],
        recentUsers: [],
        systemStatus: [],
        usersChange: '0 this week',
        peopleChange: '0 this week',
        locationsChange: '0 this month',
        activeUsersChange: '0 today',
        resourcesChange: '0 this week',
        alertsChange: '0 since yesterday',
        routesStatus: 'All operational'
      });
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

  const handleViewLocation = (location: Location) => {
    setSelectedLocation(location);
    setViewModalOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setEditFormData({
      name: location.name,
      description: location.description,
      type: location.type,
      status: location.status,
      capacity: location.capacity,
      coordinates: location.coordinates,
      facilities: location.facilities,
      contact: location.contact
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedLocation && editFormData) {
      const updatedLocation: Location = {
        ...selectedLocation,
        ...editFormData,
        lastUpdated: new Date().toISOString()
      };
      
      setLocations(prev => 
        prev.map(loc => 
          loc.id === selectedLocation.id ? updatedLocation : loc
        )
      );
      
      setEditModalOpen(false);
      setSelectedLocation(null);
      setEditFormData({});
    }
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setSelectedLocation(null);
    setEditFormData({});
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
      title: 'People',
      value: stats.totalPeople,
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      change: stats.peopleChange
    },
    {
      title: 'Locations',
      value: stats.totalLocations,
      icon: MapPin,
      color: 'text-purple-600 bg-purple-100',
      change: stats.locationsChange
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 bg-blue-100',
      change: stats.usersChange
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: Shield,
      color: 'text-green-600 bg-green-100',
      change: stats.activeUsersChange
    },
    {
      title: 'Evacuation Routes',
      value: stats.totalRoutes,
      icon: Route,
      color: 'text-yellow-600 bg-yellow-100',
      change: stats.routesStatus
    },
    {
      title: 'Resources',
      value: stats.totalResources,
      icon: Package,
      color: 'text-indigo-600 bg-indigo-100',
      change: stats.resourcesChange
    },
    {
      title: 'Active Alerts',
      value: stats.totalAlerts,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
      change: stats.alertsChange
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
                { id: 'people', label: 'People', icon: Users },
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
                <button 
                  onClick={() => setActiveTab('overview')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4 mr-3" />
                  Add New User
                </button>
                <button 
                  onClick={() => setActiveTab('locations')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-3" />
                  Manage Locations
                </button>
                <button 
                  onClick={() => setActiveTab('people')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Users className="h-4 w-4 mr-3" />
                  Manage People
                </button>
                <button 
                  onClick={() => setActiveTab('routes')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Route className="h-4 w-4 mr-3" />
                  Manage Routes
                </button>
                <button 
                  onClick={() => setActiveTab('resources')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Package className="h-4 w-4 mr-3" />
                  Manage Resources
                </button>
                <button 
                  onClick={() => setActiveTab('alerts')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Manage Alerts
                </button>
                <button 
                  onClick={() => alert('System Settings - Coming Soon')}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
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
                  {stats.recentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
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
                  ))}
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
              {stats.systemStatus.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">{service.name}</span>
                    <div className="text-xs text-gray-400">Uptime: {service.uptime}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    service.status === 'operational' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {service.status}
                  </span>
                </div>
              ))}
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
              <ErrorBoundary>
                <AdminMapEditor
                  locations={locations}
                  onLocationAdd={handleLocationAdd}
                  onLocationUpdate={handleLocationUpdate}
                  onLocationDelete={handleLocationDelete}
                />
              </ErrorBoundary>
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
                          <button 
                            onClick={() => handleViewLocation(location)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditLocation(location)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Edit Location"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleLocationDelete(location.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete Location"
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

        {/* People Management */}
        {activeTab === 'people' && (
          <PeopleManagement />
        )}

        {/* Routes Management */}
        {activeTab === 'routes' && (
          <RoutesManagement />
        )}

        {/* Resources Management */}
        {activeTab === 'resources' && (
          <ResourcesManagement />
        )}

        {/* Alerts Management */}
        {activeTab === 'alerts' && (
          <AlertsManagement />
        )}
      </div>

      {/* View Location Modal */}
      {viewModalOpen && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
                <button
                  onClick={handleCloseModals}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLocation.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLocation.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLocation.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLocation.status.toUpperCase()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLocation.capacity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedLocation.contact || 'N/A'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedLocation.facilities && selectedLocation.facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.facilities.map((facility, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {facility}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No facilities listed</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coordinates</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {selectedLocation.coordinates ? 
                    `Lat: ${selectedLocation.coordinates[0]}, Lng: ${selectedLocation.coordinates[1]}` : 
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {new Date(selectedLocation.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editModalOpen && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Location</h3>
                <button
                  onClick={handleCloseModals}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter location description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={editFormData.type || ''}
                    onChange={(e) => setEditFormData({...editFormData, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bunker">Bunker</option>
                    <option value="fortress">Fortress</option>
                    <option value="hiding_place">Hiding Place</option>
                    <option value="evacuation_center">Evacuation Center</option>
                    <option value="medical_facility">Medical Facility</option>
                    <option value="command_center">Command Center</option>
                    <option value="supply_depot">Supply Depot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={editFormData.status || ''}
                    onChange={(e) => setEditFormData({...editFormData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="damaged">Damaged</option>
                    <option value="under_construction">Under Construction</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    value={editFormData.capacity || ''}
                    onChange={(e) => setEditFormData({...editFormData, capacity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter capacity"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={editFormData.contact || ''}
                    onChange={(e) => setEditFormData({...editFormData, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter contact information"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilities</label>
                <input
                  type="text"
                  value={editFormData.facilities?.join(', ') || ''}
                  onChange={(e) => setEditFormData({...editFormData, facilities: e.target.value.split(',').map(f => f.trim()).filter(f => f)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter facilities (comma separated)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple facilities with commas</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={editFormData.coordinates?.[0] || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData, 
                      coordinates: [parseFloat(e.target.value) || 0, editFormData.coordinates?.[1] || 0]
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter latitude"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={editFormData.coordinates?.[1] || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData, 
                      coordinates: [editFormData.coordinates?.[0] || 0, parseFloat(e.target.value) || 0]
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter longitude"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
