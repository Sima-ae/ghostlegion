'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Square, 
  Circle as CircleIcon, 
  Minus, 
  ArrowRight, 
  Palette, 
  Save, 
  Trash2, 
  Edit3,
  X,
  Check
} from 'lucide-react';
import { Location } from '../types';

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
  iconUrl: 'leaflet/images/marker-icon.png',
  shadowUrl: 'leaflet/images/marker-shadow.png',
});

interface DrawingTool {
  type: 'marker' | 'polygon' | 'polyline' | 'circle' | 'arrow';
  color: string;
  size: number;
}

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

interface AdminMapEditorProps {
  locations: Location[];
  onLocationAdd: (location: Omit<Location, 'id'>) => void;
  onLocationUpdate: (id: string, location: Partial<Location>) => void;
  onLocationDelete: (id: string) => void;
}

// Map event handler component
function MapEventHandler({ onMapClick, onMapRightClick }: { onMapClick: (lat: number, lng: number) => void; onMapRightClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    contextmenu: (e) => {
      onMapRightClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function AdminMapEditor({ 
  locations, 
  onLocationAdd, 
  onLocationUpdate, 
  onLocationDelete 
}: AdminMapEditorProps) {
  const [isClient, setIsClient] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool['type']>('marker');
  const [drawingColor, setDrawingColor] = useState('#3B82F6');
  const [drawingSize, setDrawingSize] = useState(3);
  const [mapElements, setMapElements] = useState<MapElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<[number, number][]>([]);
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'bunker' as const,
    coordinates: [0, 0] as [number, number],
    description: '',
    capacity: 100,
    status: 'active' as const,
    facilities: [] as string[],
    contact: '',
  });
  const [editingElement, setEditingElement] = useState<MapElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  // Load map elements from database
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

  // Save map element to database
  const saveMapElement = async (element: Omit<MapElement, 'id'>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/map-elements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(element),
      });

      if (response.ok) {
        const savedElement = await response.json();
        setMapElements(prev => [...prev, savedElement]);
        return savedElement;
      } else {
        console.error('Failed to save map element');
      }
    } catch (error) {
      console.error('Error saving map element:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update map element in database
  const updateMapElement = async (id: string, updates: Partial<MapElement>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/map-elements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedElement = await response.json();
        setMapElements(prev => 
          prev.map(el => el.id === id ? updatedElement : el)
        );
        return updatedElement;
      } else {
        console.error('Failed to update map element');
      }
    } catch (error) {
      console.error('Error updating map element:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete map element from database
  const deleteMapElement = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/map-elements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMapElements(prev => prev.filter(el => el.id !== id));
      } else {
        console.error('Failed to delete map element');
      }
    } catch (error) {
      console.error('Error deleting map element:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load map elements on component mount
  useEffect(() => {
    loadMapElements();
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMapClick = async (lat: number, lng: number) => {
    if (activeTool === 'marker') {
      setNewLocation(prev => ({ ...prev, coordinates: [lat, lng] }));
      setShowAddLocationForm(true);
    } else if (activeTool === 'polygon' || activeTool === 'polyline') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentPath([[lat, lng]]);
      } else {
        setCurrentPath(prev => [...prev, [lat, lng]]);
      }
    } else if (activeTool === 'circle') {
      const element = {
        type: 'circle',
        coordinates: [lat, lng],
        color: drawingColor,
        size: drawingSize * 1000, // Convert to meters
        label: `Circle ${mapElements.length + 1}`,
      };
      await saveMapElement(element);
    }
  };

  const handleMapRightClick = async (lat: number, lng: number) => {
    if (isDrawing && (activeTool === 'polygon' || activeTool === 'polyline')) {
      // Finish drawing
      const element = {
        type: activeTool,
        coordinates: currentPath,
        color: drawingColor,
        size: drawingSize,
        label: `${activeTool} ${mapElements.length + 1}`,
      };
      await saveMapElement(element);
      setIsDrawing(false);
      setCurrentPath([]);
    }
  };

  const handleAddLocation = () => {
    onLocationAdd(newLocation);
    setShowAddLocationForm(false);
    setNewLocation({
      name: '',
      type: 'bunker',
      coordinates: [0, 0],
      description: '',
      capacity: 100,
      status: 'active',
      facilities: [],
      contact: '',
    });
  };

  const handleDeleteElement = async (id: string) => {
    await deleteMapElement(id);
  };

  const handleEditElement = (element: MapElement) => {
    setEditingElement(element);
  };

  const handleSaveElement = async () => {
    if (editingElement) {
      await updateMapElement(editingElement.id, editingElement);
      setEditingElement(null);
    }
  };

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Map is loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Tools:</span>
          <button
            onClick={() => setActiveTool('marker')}
            className={`p-2 rounded-md ${activeTool === 'marker' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Add Location"
          >
            <MapPin className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('polygon')}
            className={`p-2 rounded-md ${activeTool === 'polygon' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Draw Polygon"
          >
            <Square className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('polyline')}
            className={`p-2 rounded-md ${activeTool === 'polyline' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Draw Line"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('circle')}
            className={`p-2 rounded-md ${activeTool === 'circle' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Draw Circle"
          >
            <CircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Color:</span>
          <div className="flex space-x-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setDrawingColor(color)}
                className={`w-6 h-6 rounded-full border-2 ${
                  drawingColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Size:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={drawingSize}
            onChange={(e) => setDrawingSize(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-gray-500">{drawingSize}</span>
        </div>

        {isDrawing && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <span>Drawing {activeTool} - Right click to finish</span>
            <button
              onClick={() => {
                setIsDrawing(false);
                setCurrentPath([]);
              }}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[52.1326, 5.2913]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapEventHandler onMapClick={handleMapClick} onMapRightClick={handleMapRightClick} />

          {/* Existing Locations */}
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.coordinates[0], location.coordinates[1]]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.description}</p>
                  <p className="text-xs text-gray-500">Type: {location.type}</p>
                  <p className="text-xs text-gray-500">Capacity: {location.capacity}</p>
                  <div className="mt-2 flex space-x-1">
                    <button
                      onClick={() => onLocationDelete(location.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Drawing Elements */}
          {mapElements.map((element) => {
            if (element.type === 'polygon') {
              return (
                <Polygon
                  key={element.id}
                  positions={element.coordinates as [number, number][]}
                  color={element.color}
                  weight={element.size}
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
                  weight={element.size}
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

          {/* Current Drawing Path */}
          {isDrawing && currentPath.length > 1 && (
            <Polyline
              positions={currentPath}
              color={drawingColor}
              weight={drawingSize}
              dashArray="5, 5"
            />
          )}
        </MapContainer>

        {/* Map Elements Panel */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Map Elements</h3>
          <div className="space-y-2">
            {mapElements.map((element) => (
              <div key={element.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: element.color }}
                  />
                  <span className="text-sm">{element.label || element.type}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditElement(element)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteElement(element.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Location Modal */}
      {showAddLocationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newLocation.type}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bunker">Bunker</option>
                  <option value="fortress">Fortress</option>
                  <option value="shelter">Shelter</option>
                  <option value="command_center">Command Center</option>
                  <option value="medical_facility">Medical Facility</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newLocation.description}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  value={newLocation.capacity}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                <input
                  type="text"
                  value={newLocation.contact}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, contact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddLocationForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Element Modal */}
      {editingElement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Element</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={editingElement.label || ''}
                  onChange={(e) => setEditingElement(prev => prev ? { ...prev, label: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex space-x-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditingElement(prev => prev ? { ...prev, color } : null)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingElement?.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setEditingElement(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveElement}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
