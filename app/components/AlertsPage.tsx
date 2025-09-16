'use client';

import { useState } from 'react';
import { AlertTriangle, Clock, MapPin, Users, Shield, Bell } from 'lucide-react';
import { sampleAlerts } from '../data/sampleData';

export default function AlertsPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const alertTypes = [
    { type: 'evacuation', label: 'Evacuation', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { type: 'security', label: 'Security', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { type: 'weather', label: 'Weather', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { type: 'medical', label: 'Medical', color: 'bg-green-100 text-green-800 border-green-200' },
    { type: 'transport', label: 'Transport', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'evacuation':
        return <Users className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'weather':
        return <AlertTriangle className="h-5 w-5" />;
      case 'medical':
        return <Bell className="h-5 w-5" />;
      case 'transport':
        return <MapPin className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter alerts based on selected filter
  const filteredAlerts = selectedFilter === 'all' 
    ? sampleAlerts 
    : sampleAlerts.filter(alert => alert.type === selectedFilter);

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Alert Center</h2>
          <p className="text-gray-700">
            Stay informed about current alerts, warnings, and emergency notifications across the Netherlands.
          </p>
        </div>

        {/* Phone Numbers - Full Width */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-black-800 text-sm">Emergency Services</h4>
              <p className="text-2xl font-bold text-red-600">112</p>
              <p className="text-xs text-black-600">For life-threatening situations</p>
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

        {/* Overview and Filter - Full Width Combined */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-x-6">
              {/* Alert Statistics - Overview */}
              <div className="lg:col-span-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-gray-600">Active</p>
                      <p className="text-lg font-bold text-gray-900">{sampleAlerts.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-gray-600">High Priority</p>
                      <p className="text-lg font-bold text-gray-900">
                        {sampleAlerts.filter(alert => alert.severity === 'high').length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-gray-600">Areas</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Set(sampleAlerts.map(alert => alert.location)).size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-2">
                      <p className="text-xs font-medium text-gray-600">Resolved</p>
                      <p className="text-lg font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alert Types Filter */}
              <div className="lg:col-span-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Alert Type</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center justify-center ${
                      selectedFilter === 'all' 
                        ? 'bg-gray-100 text-gray-800 border-gray-300' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    All Alerts
                  </button>
                  {alertTypes.map((alertType) => (
                    <button
                      key={alertType.type}
                      onClick={() => setSelectedFilter(alertType.type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors flex items-center justify-center ${
                        selectedFilter === alertType.type 
                          ? alertType.color 
                          : `${alertType.color} hover:opacity-80`
                      }`}
                    >
                      {getAlertIcon(alertType.type)}
                      <span className="ml-2">{alertType.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Alert Messages ({filteredAlerts.length})
            </h3>
          </div>
          <div className="p-6">
            {filteredAlerts.length > 0 ? (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="bg-gray-50 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-lg ${alertTypes.find(t => t.type === alert.type)?.color || 'bg-gray-100 text-gray-800'}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{alert.title}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {alert.location}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatTimestamp(alert.timestamp)}
                            </div>
                            {alert.expiresAt && (
                              <div className="flex items-center">
                                <Bell className="h-4 w-4 mr-1" />
                                Expires: {formatTimestamp(alert.expiresAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
                <p className="text-gray-500">No alerts match the selected filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}