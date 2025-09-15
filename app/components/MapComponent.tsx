'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Location } from '../types';
import { getLocationTypeIcon, getStatusColor } from '../lib/utils';


interface MapElement {
  id: string;
  type: 'marker' | 'polygon' | 'polyline' | 'circle' | 'arrow';
  coordinates: [number, number][] | [number, number];
  color: string;
  size?: number;
  label?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });

interface MapComponentProps {
  locations: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
}

export default function MapComponent({ locations, selectedLocation, onLocationSelect }: MapComponentProps) {
  const [mapElements, setMapElements] = useState<MapElement[]>([]);

  // Load map elements from database
  useEffect(() => {
    const loadMapElements = async () => {
      try {
        const response = await fetch('/api/map-elements');
        if (response.ok) {
          const elements = await response.json();
          setMapElements(elements);
        }
      } catch (error) {
        console.error('Error loading map elements:', error);
      }
    };

    loadMapElements();
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      <MapContainer
        center={[52.1326, 5.2913]} // Center of Netherlands
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates[0], location.coordinates[1]]}
            eventHandlers={{
              click: () => onLocationSelect?.(location),
            }}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{getLocationTypeIcon(location.type)}</span>
                  <h3 className="font-bold text-sm">{location.name}</h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">{location.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <span className="text-xs font-medium mr-2">Type:</span>
                    <span className="text-xs capitalize">{location.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs font-medium mr-2">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(location.status)}`}>
                      {location.status}
                    </span>
                  </div>
                  {location.capacity && (
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">Capaciteit:</span>
                      <span className="text-xs">{location.capacity} personen</span>
                    </div>
                  )}
                  {location.contact && (
                    <div className="flex items-center">
                      <span className="text-xs font-medium mr-2">Contact:</span>
                      <span className="text-xs">{location.contact}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <h4 className="text-xs font-medium mb-1">Faciliteiten:</h4>
                  <div className="flex flex-wrap gap-1">
                    {location.facilities.map((facility, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Map Elements */}
        {mapElements.map((element) => {
          if (element.type === 'polygon') {
            return (
              <Polygon
                key={element.id}
                positions={element.coordinates as [number, number][]}
                color={element.color}
                weight={element.size || 3}
                fillColor={element.color}
                fillOpacity={0.3}
              />
            );
          } else if (element.type === 'polyline') {
            return (
              <Polyline
                key={element.id}
                positions={element.coordinates as [number, number][]}
                color={element.color}
                weight={element.size || 3}
              />
            );
          } else if (element.type === 'circle') {
            return (
              <Circle
                key={element.id}
                center={element.coordinates as [number, number]}
                radius={element.size || 1000}
                color={element.color}
                weight={element.size || 3}
                fillColor={element.color}
                fillOpacity={0.3}
              />
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
