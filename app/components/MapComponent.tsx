'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle } from 'react-leaflet';
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
  risk?: 'High' | 'Medium' | 'Low';
  category?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MapComponentProps {
  locations: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
}

export default function MapComponent({ locations, selectedLocation, onLocationSelect }: MapComponentProps) {
  const [mapElements, setMapElements] = useState<MapElement[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Force map re-render when window resizes (e.g., sidebar collapse)
  useEffect(() => {
    const handleResize = () => {
      setMapKey(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load map elements from database
  useEffect(() => {
    const loadMapElements = async () => {
      try {
        console.log('Loading map elements...');
        const response = await fetch('/api/map-elements');
        if (response.ok) {
          const elements = await response.json();
          console.log('Loaded map elements:', elements);
          // Convert risk values from uppercase to mixed case for display
          const convertedElements = elements.map((element: any) => ({
            ...element,
            risk: element.risk ? element.risk.charAt(0) + element.risk.slice(1).toLowerCase() : 'Low'
          }));
          setMapElements(convertedElements);
        } else {
          console.error('Failed to load map elements:', response.status, response.statusText);
          // Set empty array on error to prevent map rendering issues
          setMapElements([]);
        }
      } catch (error) {
        console.error('Error loading map elements:', error);
        // Set empty array on error to prevent map rendering issues
        setMapElements([]);
      }
    };

    if (isClient) {
      loadMapElements();
    }
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div>Map is loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
      <MapContainer
        key={mapKey}
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
          const elementType = element.type.toLowerCase();
          if (elementType === 'polygon') {
            return (
              <Polygon
                key={element.id}
                positions={element.coordinates as [number, number][]}
                color={element.color}
                weight={element.size || 3}
                fillColor={element.color}
                fillOpacity={0.3}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center mb-2">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: element.color }}
                      />
                      <h3 className="font-bold text-sm">{element.label || 'Polygon'}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{element.description || 'No description provided'}</p>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Risk:</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          element.risk === 'High' ? 'bg-red-100 text-red-800' :
                          element.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {element.risk || 'Low'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Category:</span>
                        <span className="text-xs">{element.category || 'Uncategorized'}</span>
                      </div>
                      {element.createdAt && (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Created:</span>
                          <span className="text-xs">{new Date(element.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          } else if (elementType === 'polyline') {
            return (
              <Polyline
                key={element.id}
                positions={element.coordinates as [number, number][]}
                color={element.color}
                weight={element.size || 3}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center mb-2">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: element.color }}
                      />
                      <h3 className="font-bold text-sm">{element.label || 'Polyline'}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{element.description || 'No description provided'}</p>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Risk:</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          element.risk === 'High' ? 'bg-red-100 text-red-800' :
                          element.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {element.risk || 'Low'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Category:</span>
                        <span className="text-xs">{element.category || 'Uncategorized'}</span>
                      </div>
                      {element.createdAt && (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Created:</span>
                          <span className="text-xs">{new Date(element.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          } else if (elementType === 'circle') {
            return (
              <Circle
                key={element.id}
                center={element.coordinates as [number, number]}
                radius={element.size || 1000}
                color={element.color}
                weight={element.size || 3}
                fillColor={element.color}
                fillOpacity={0.3}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center mb-2">
                      <div
                        className="w-4 h-4 rounded mr-2"
                        style={{ backgroundColor: element.color }}
                      />
                      <h3 className="font-bold text-sm">{element.label || 'Circle'}</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{element.description || 'No description provided'}</p>
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Risk:</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          element.risk === 'High' ? 'bg-red-100 text-red-800' :
                          element.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {element.risk || 'Low'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Category:</span>
                        <span className="text-xs">{element.category || 'Uncategorized'}</span>
                      </div>
                      {element.createdAt && (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Created:</span>
                          <span className="text-xs">{new Date(element.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Circle>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}
