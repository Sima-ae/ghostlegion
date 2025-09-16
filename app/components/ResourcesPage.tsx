'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MapPin, 
  Filter,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'FOOD' | 'WATER' | 'MEDICAL' | 'FUEL' | 'AMMUNITION' | 'EQUIPMENT' | 'TRANSPORT';
  quantity: number;
  unit: string;
  location: string;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DAMAGED';
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResourceStats {
  totalResources: number;
  availableResources: number;
  lowStockResources: number;
  outOfStockResources: number;
  damagedResources: number;
  totalValue: number;
  expiringSoon: number;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<ResourceStats>({
    totalResources: 0,
    availableResources: 0,
    lowStockResources: 0,
    outOfStockResources: 0,
    damagedResources: 0,
    totalValue: 0,
    expiringSoon: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Load resources from database
  useEffect(() => {
    loadResources();
  }, []);

  // Filter and sort resources
  useEffect(() => {
    let filtered = resources.filter(resource => {
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || resource.type === filterType;
      const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort resources
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'location':
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        case 'expiry':
          aValue = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
          bValue = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredResources(filtered);
  }, [resources, searchTerm, filterType, filterStatus, sortBy, sortOrder]);

  // Calculate stats
  useEffect(() => {
    const newStats: ResourceStats = {
      totalResources: resources.length,
      availableResources: resources.filter(r => r.status === 'AVAILABLE').length,
      lowStockResources: resources.filter(r => r.status === 'LOW_STOCK').length,
      outOfStockResources: resources.filter(r => r.status === 'OUT_OF_STOCK').length,
      damagedResources: resources.filter(r => r.status === 'DAMAGED').length,
      totalValue: resources.reduce((sum, r) => sum + (r.quantity * getResourceValue(r.type)), 0),
      expiringSoon: resources.filter(r => {
        if (!r.expiryDate) return false;
        const expiryDate = new Date(r.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      }).length
    };
    setStats(newStats);
  }, [resources]);

  const loadResources = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resources');
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        console.error('Failed to load resources:', response.status);
        // Use sample data if API fails
        setResources(getSampleResources());
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      // Use sample data if API fails
      setResources(getSampleResources());
    } finally {
      setIsLoading(false);
    }
  };

  const getSampleResources = (): Resource[] => [
    {
      id: '1',
      name: 'Emergency Food Rations',
      type: 'FOOD',
      quantity: 500,
      unit: 'packages',
      location: 'Central Warehouse, Amsterdam',
      status: 'AVAILABLE',
      expiryDate: '2025-12-31',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Bottled Water',
      type: 'WATER',
      quantity: 1000,
      unit: 'liters',
      location: 'Distribution Center, Rotterdam',
      status: 'LOW_STOCK',
      expiryDate: '2026-06-30',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      id: '3',
      name: 'First Aid Kits',
      type: 'MEDICAL',
      quantity: 150,
      unit: 'kits',
      location: 'Medical Supply Depot, Utrecht',
      status: 'AVAILABLE',
      createdAt: '2024-01-05T12:00:00Z',
      updatedAt: '2024-01-05T12:00:00Z'
    },
    {
      id: '4',
      name: 'Diesel Fuel',
      type: 'FUEL',
      quantity: 2000,
      unit: 'liters',
      location: 'Fuel Storage, Den Haag',
      status: 'AVAILABLE',
      createdAt: '2024-01-12T09:00:00Z',
      updatedAt: '2024-01-12T09:00:00Z'
    },
    {
      id: '5',
      name: 'Communication Equipment',
      type: 'EQUIPMENT',
      quantity: 25,
      unit: 'units',
      location: 'Tech Warehouse, Eindhoven',
      status: 'LOW_STOCK',
      createdAt: '2024-01-08T11:00:00Z',
      updatedAt: '2024-01-18T16:45:00Z'
    },
    {
      id: '6',
      name: 'Emergency Vehicles',
      type: 'TRANSPORT',
      quantity: 8,
      unit: 'vehicles',
      location: 'Vehicle Depot, Groningen',
      status: 'AVAILABLE',
      createdAt: '2024-01-03T07:00:00Z',
      updatedAt: '2024-01-03T07:00:00Z'
    },
    {
      id: '7',
      name: 'Medical Supplies',
      type: 'MEDICAL',
      quantity: 0,
      unit: 'units',
      location: 'Medical Supply Depot, Utrecht',
      status: 'OUT_OF_STOCK',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-25T10:00:00Z'
    },
    {
      id: '8',
      name: 'Protective Gear',
      type: 'EQUIPMENT',
      quantity: 75,
      unit: 'sets',
      location: 'Safety Equipment Store, Tilburg',
      status: 'DAMAGED',
      createdAt: '2024-01-20T13:00:00Z',
      updatedAt: '2024-01-22T15:30:00Z'
    }
  ];

  const getResourceValue = (type: string): number => {
    const values: { [key: string]: number } = {
      'FOOD': 5,
      'WATER': 2,
      'MEDICAL': 25,
      'FUEL': 1.5,
      'AMMUNITION': 50,
      'EQUIPMENT': 100,
      'TRANSPORT': 1000
    };
    return values[type] || 10;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'text-green-600 bg-green-100';
      case 'LOW_STOCK': return 'text-yellow-600 bg-yellow-100';
      case 'OUT_OF_STOCK': return 'text-red-600 bg-red-100';
      case 'DAMAGED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FOOD': return '🍽️';
      case 'WATER': return '💧';
      case 'MEDICAL': return '🏥';
      case 'FUEL': return '⛽';
      case 'AMMUNITION': return '🔫';
      case 'EQUIPMENT': return '🔧';
      case 'TRANSPORT': return '🚗';
      default: return '📦';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FOOD': return 'text-orange-600 bg-orange-100';
      case 'WATER': return 'text-blue-600 bg-blue-100';
      case 'MEDICAL': return 'text-red-600 bg-red-100';
      case 'FUEL': return 'text-yellow-600 bg-yellow-100';
      case 'AMMUNITION': return 'text-gray-600 bg-gray-100';
      case 'EQUIPMENT': return 'text-purple-600 bg-purple-100';
      case 'TRANSPORT': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading resources...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Resources Management</h1>
          </div>
          <p className="text-lg text-gray-600">
            Monitor and manage essential supplies and equipment across all locations.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalResources}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableResources}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockResources}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStockResources}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">€{stats.totalValue.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
                <p className="text-xs text-gray-500">Next 30 days</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Damaged Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.damagedResources}</p>
                <p className="text-xs text-gray-500">Needs attention</p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="FOOD">Food</option>
                <option value="WATER">Water</option>
                <option value="MEDICAL">Medical</option>
                <option value="FUEL">Fuel</option>
                <option value="AMMUNITION">Ammunition</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="TRANSPORT">Transport</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="quantity">Sort by Quantity</option>
                <option value="type">Sort by Type</option>
                <option value="status">Sort by Status</option>
                <option value="location">Sort by Location</option>
                <option value="expiry">Sort by Expiry</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <button
                onClick={loadResources}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Resources ({filteredResources.length})
              </h2>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map((resource) => {
                  const daysUntilExpiry = getDaysUntilExpiry(resource.expiryDate);
                  return (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getTypeIcon(resource.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                            <div className="text-sm text-gray-500">ID: {resource.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(resource.type)}`}>
                          {resource.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resource.quantity.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{resource.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(resource.status)}`}>
                          {resource.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{resource.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {resource.expiryDate ? (
                          <div className="text-sm">
                            <div className="text-gray-900">{formatDate(resource.expiryDate)}</div>
                            {daysUntilExpiry !== null && (
                              <div className={`text-xs ${
                                daysUntilExpiry < 0 ? 'text-red-600' :
                                daysUntilExpiry <= 30 ? 'text-yellow-600' :
                                'text-gray-500'
                              }`}>
                                {daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days left`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No expiry</span>
                        )}
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
