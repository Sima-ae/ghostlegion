'use client';

import { Location } from '../types';
import { getLocationTypeIcon, getStatusColor, formatDate } from '../lib/utils';
import { MapPin, Users, Phone, Calendar, Shield } from 'lucide-react';

interface LocationCardProps {
  location: Location;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function LocationCard({ location, isSelected, onClick }: LocationCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getLocationTypeIcon(location.type)}</span>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{location.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{location.type.replace('_', ' ')}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
            {location.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{location.description}</p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {location.capacity && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <span>{location.capacity} personen</span>
            </div>
          )}
          
          {location.contact && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span className="truncate">{location.contact}</span>
            </div>
          )}
        </div>

        {/* Facilities */}
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Faciliteiten
          </h4>
          <div className="flex flex-wrap gap-1">
            {location.facilities.slice(0, 3).map((facility, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {facility}
              </span>
            ))}
            {location.facilities.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{location.facilities.length - 3} meer
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Bijgewerkt: {formatDate(location.lastUpdated)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
