'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle, CircleMarker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fixLeafletDefaultIcons, locationMarkerIcon } from '../lib/leaflet-icons';
import { getLocationTypeIcon } from '../lib/utils';
import { getPolygonParts } from '../lib/map-geometry';
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
  Check,
  Eye,
  EyeOff,
  PenLine,
  Search,
  AlertTriangle
} from 'lucide-react';
import { Location } from '../types';
import MapResizeFix from './MapResizeFix';

fixLeafletDefaultIcons();

interface DrawingTool {
  type: 'marker' | 'polygon' | 'polyline' | 'circle' | 'arrow';
  color: string;
  size: number;
}

interface MapElement {
  id: string;
  type: 'marker' | 'polygon' | 'polyline' | 'circle' | 'arrow';
  coordinates: [number, number][] | [number, number][][] | [number, number];
  color: string;
  size?: number;
  label?: string;
  description?: string;
  risk?: 'High' | 'Medium' | 'Low';
  category?: string;
  visible?: boolean;
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

function elementIsVisible(element: { visible?: boolean }) {
  return element.visible !== false;
}

function overlayPathOptions(element: MapElement) {
  const shown = elementIsVisible(element);
  return {
    color: element.color,
    weight: element.size || 3,
    fillColor: element.color,
    fillOpacity: shown ? 0.3 : 0.08,
    opacity: shown ? 1 : 0.45,
    dashArray: shown ? undefined : '6 8',
  };
}

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

/** Pen/crosshair tools: lock pan while placing vertices so clicks stay precise. */
function DrawingInteraction({ lockPan }: { lockPan: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (lockPan) {
      map.dragging.disable();
      map.doubleClickZoom.disable();
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
    }
    return () => {
      map.dragging.enable();
      map.doubleClickZoom.enable();
    };
  }, [map, lockPan]);

  return null;
}

function FitCountryBounds({ points }: { points: [number, number][] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length < 2) return;
    map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 8 });
  }, [map, points]);
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
    isPublic: true,
    lastUpdated: new Date().toISOString(),
  });
  const [editingElement, setEditingElement] = useState<MapElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [countryResults, setCountryResults] = useState<
    { osmId: number; osmType: string; name: string; label: string }[]
  >([]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearching, setCountrySearching] = useState(false);
  const [countryError, setCountryError] = useState('');
  const [fitPoints, setFitPoints] = useState<[number, number][] | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    kind: 'element' | 'location';
    id: string;
    name: string;
    typeLabel: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const countryBoxRef = useRef<HTMLDivElement>(null);

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
        // Convert risk values from uppercase to mixed case for display
        const convertedElements = elements.map((element: any) => ({
          ...element,
          risk: element.risk ? element.risk.charAt(0) + element.risk.slice(1).toLowerCase() : 'Low',
          visible: element.visible !== false,
        }));
        setMapElements(convertedElements);
      } else {
        setMapElements([]);
      }
    } catch {
      setMapElements([]);
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
  const deleteMapElement = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/map-elements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMapElements(prev => prev.filter(el => el.id !== id));
        return true;
      }
      console.error('Failed to delete map element');
      return false;
    } catch (error) {
      console.error('Error deleting map element:', error);
      return false;
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

  useEffect(() => {
    const q = countryQuery.trim();
    if (q.length < 2) {
      setCountryResults([]);
      return;
    }
    const t = window.setTimeout(async () => {
      setCountrySearching(true);
      setCountryError('');
      try {
        const response = await fetch(`/api/geo/countries?q=${encodeURIComponent(q)}`);
        const data = await response.json();
        if (!response.ok) {
          setCountryError(data.error || 'Search failed');
          setCountryResults([]);
          return;
        }
        setCountryResults(data.results || []);
        setCountryOpen(true);
      } catch {
        setCountryError('Search failed');
        setCountryResults([]);
      } finally {
        setCountrySearching(false);
      }
    }, 320);
    return () => window.clearTimeout(t);
  }, [countryQuery]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!countryBoxRef.current?.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const importCountryOutline = async (hit: {
    osmId: number;
    osmType: string;
    name: string;
  }) => {
    setCountryOpen(false);
    setCountryQuery(hit.name);
    setIsLoading(true);
    setCountryError('');
    try {
      const response = await fetch('/api/geo/countries/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ osmId: hit.osmId, osmType: hit.osmType }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCountryError(data.error || 'Could not load border');
        return;
      }
      await saveMapElement({
        type: data.type === 'polyline' ? 'polyline' : 'polygon',
        coordinates: data.coordinates,
        color: drawingColor,
        size: drawingSize,
        label: data.name || hit.name,
        description: `Country outline: ${data.name || hit.name}`,
        category: 'Country',
        risk: 'Low',
        visible: true,
      });
      if (Array.isArray(data.fitPoints) && data.fitPoints.length > 1) {
        setFitPoints(data.fitPoints);
      }
      setActiveTool('polygon');
    } catch {
      setCountryError('Could not load border');
    } finally {
      setIsLoading(false);
    }
  };

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
      const label = prompt('Enter a label for this circle:', `Circle ${mapElements.length + 1}`);
      if (label === null) return;
      
      const description = prompt('Enter a description for this circle:', '');
      const risk = prompt('Enter risk level (High/Medium/Low):', 'Low');
      const category = prompt('Enter category:', '');
      
      const element = {
        type: 'circle' as const,
        coordinates: [lat, lng] as [number, number],
        color: drawingColor,
        size: drawingSize * 1000, // Convert to meters
        label: label,
        description: description || undefined,
        risk: (risk === 'High' || risk === 'Medium' || risk === 'Low') ? risk : 'Low' as 'High' | 'Medium' | 'Low',
        category: category || undefined,
      };
      await saveMapElement(element);
    }
  };

  const handleMapRightClick = async (lat: number, lng: number) => {
    if (isDrawing && (activeTool === 'polygon' || activeTool === 'polyline')) {
      // Finish drawing
      const label = prompt(`Enter a label for this ${activeTool}:`, `${activeTool} ${mapElements.length + 1}`);
      if (label === null) {
        setIsDrawing(false);
        setCurrentPath([]);
        return;
      }
      
      const description = prompt(`Enter a description for this ${activeTool}:`, '');
      const risk = prompt(`Enter risk level (High/Medium/Low):`, 'Low');
      const category = prompt(`Enter category:`, '');
      
      const element = {
        type: activeTool as 'polygon' | 'polyline',
        coordinates: currentPath as [number, number][],
        color: drawingColor,
        size: drawingSize,
        label: label,
        description: description || undefined,
        risk: (risk === 'High' || risk === 'Medium' || risk === 'Low') ? risk : 'Low' as 'High' | 'Medium' | 'Low',
        category: category || undefined,
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
      isPublic: true,
      lastUpdated: new Date().toISOString(),
    });
  };

  const requestDeleteElement = (element: MapElement) => {
    const kind =
      element.category === 'Country'
        ? 'country outline'
        : element.type.toLowerCase();
    setPendingDelete({
      kind: 'element',
      id: element.id,
      name: element.label || element.type,
      typeLabel: kind,
    });
  };

  const requestDeleteLocation = (location: Location) => {
    setPendingDelete({
      kind: 'location',
      id: location.id,
      name: location.name,
      typeLabel: 'location',
    });
  };

  const confirmPendingDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      if (pendingDelete.kind === 'element') {
        const deleted = await deleteMapElement(pendingDelete.id);
        if (!deleted) return;
        if (editingElement?.id === pendingDelete.id) {
          setEditingElement(null);
        }
      } else {
        onLocationDelete(pendingDelete.id);
      }
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditElement = (element: MapElement) => {
    setEditingElement(element);
  };

  const handleToggleElementVisibility = async (element: MapElement) => {
    const nextVisible = element.visible === false;
    const updated = await updateMapElement(element.id, { visible: nextVisible });
    if (updated && editingElement?.id === element.id) {
      setEditingElement((prev) => (prev ? { ...prev, visible: nextVisible } : prev));
    }
  };

  const handleSaveElement = async () => {
    if (editingElement) {
      // Convert risk value to uppercase for database storage
      const elementToSave = {
        ...editingElement,
        risk: editingElement.risk ? editingElement.risk.toUpperCase() : 'LOW'
      };
      // Remove the risk field from the MapElement type and pass it separately
      const { risk, ...restElement } = elementToSave;
      const apiData = {
        ...restElement,
        risk: risk as 'HIGH' | 'MEDIUM' | 'LOW'
      };
      await updateMapElement(editingElement.id, apiData as any);
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
    <div className="w-full h-full min-h-0 flex flex-col">
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

        <div className="relative w-full sm:w-72" ref={countryBoxRef}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={countryQuery}
              onChange={(e) => {
                setCountryQuery(e.target.value);
                setCountryOpen(true);
              }}
              onFocus={() => countryResults.length > 0 && setCountryOpen(true)}
              placeholder="Search country…"
              className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoComplete="off"
            />
          </div>
          {countryOpen && (countrySearching || countryResults.length > 0 || countryQuery.trim().length >= 2) ? (
            <div className="absolute left-0 right-0 z-[1200] mt-1 max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              {countrySearching ? (
                <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
              ) : countryResults.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">No countries found</div>
              ) : (
                countryResults.map((hit) => (
                  <button
                    key={`${hit.osmType}-${hit.osmId}`}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-blue-50"
                    onClick={() => importCountryOutline(hit)}
                  >
                    <span className="font-medium">{hit.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">{hit.label}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
          {countryError ? (
            <p className="mt-1 text-xs text-red-600">{countryError}</p>
          ) : null}
        </div>

        {isDrawing && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <PenLine className="h-4 w-4 flex-shrink-0" />
            <span>Drawing {activeTool} — click to add points, right-click to finish</span>
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
      <div
        className={`flex-1 relative min-h-0 ${
          activeTool === 'polygon' || activeTool === 'polyline'
            ? 'gl-map-cursor-pen'
            : activeTool === 'circle'
              ? 'gl-map-cursor-crosshair'
              : ''
        }`}
      >
        <MapContainer
          center={[52.1326, 5.2913]}
          zoom={7}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <MapResizeFix />
          <DrawingInteraction lockPan={isDrawing && (activeTool === 'polygon' || activeTool === 'polyline')} />
          <FitCountryBounds points={fitPoints} />
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
              icon={locationMarkerIcon(getLocationTypeIcon(location.type))}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.description}</p>
                  <p className="text-xs text-gray-500">Type: {location.type}</p>
                  <p className="text-xs text-gray-500">Capacity: {location.capacity}</p>
                  <div className="mt-2 flex space-x-1">
                    <button
                      onClick={() => requestDeleteLocation(location)}
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
            const elementType = element.type.toLowerCase();
            if (elementType === 'polygon') {
              return getPolygonParts(element.coordinates).map((positions, partIndex) => (
                <Polygon
                  key={`${element.id}-${partIndex}`}
                  positions={positions}
                  {...overlayPathOptions(element)}
                  eventHandlers={{
                    click: () => handleEditElement(element),
                  }}
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
                      <div className="mt-3 flex space-x-1">
                        <button
                          onClick={() => handleEditElement(element)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requestDeleteElement(element)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 bg-red-100 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              ));
            } else if (elementType === 'polyline') {
              return (
                <Polyline
                  key={element.id}
                  positions={element.coordinates as [number, number][]}
                  {...overlayPathOptions(element)}
                  eventHandlers={{
                    click: () => handleEditElement(element),
                  }}
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
                      <div className="mt-3 flex space-x-1">
                        <button
                          onClick={() => handleEditElement(element)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requestDeleteElement(element)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 bg-red-100 rounded"
                        >
                          Delete
                        </button>
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
                  {...overlayPathOptions(element)}
                  eventHandlers={{
                    click: () => handleEditElement(element),
                  }}
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
                      <div className="mt-3 flex space-x-1">
                        <button
                          onClick={() => handleEditElement(element)}
                          className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requestDeleteElement(element)}
                          className="text-red-600 hover:text-red-800 text-xs px-2 py-1 bg-red-100 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            }
            return null;
          })}

          {/* Current Drawing Path */}
          {isDrawing && currentPath.length > 0 && (
            <>
              {currentPath.length > 1 ? (
                <Polyline
                  positions={currentPath}
                  color={drawingColor}
                  weight={Math.max(drawingSize + 2, 4)}
                  opacity={1}
                  dashArray="8 6"
                />
              ) : null}
              {currentPath.map((point, index) => (
                <CircleMarker
                  key={`draw-vertex-${index}`}
                  center={point}
                  radius={6}
                  pathOptions={{
                    color: '#0f172a',
                    weight: 2,
                    fillColor: drawingColor,
                    fillOpacity: 1,
                  }}
                />
              ))}
            </>
          )}
        </MapContainer>

        {(activeTool === 'polygon' || activeTool === 'polyline' || activeTool === 'circle') && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-[500] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2">
            <div className="flex items-center justify-center gap-2 rounded-full bg-slate-900/90 px-4 py-2 text-center text-xs sm:text-sm font-medium text-white shadow-lg">
              <PenLine className="h-4 w-4 flex-shrink-0" />
              <span>
                {activeTool === 'circle'
                  ? 'Click the map to place a circle'
                  : isDrawing
                    ? 'Click to add points · Right-click to finish'
                    : 'Pen tool active — click the map to start drawing'}
              </span>
            </div>
          </div>
        )}

        {/* Map Elements Panel */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-lg shadow-lg p-3 sm:p-4 w-[min(18rem,calc(100%-1rem))] max-h-48 sm:max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Map Elements</h3>
          <div className="space-y-2">
            {mapElements.map((element) => (
              <div
                key={element.id}
                className={`flex items-center justify-between p-2 rounded ${
                  elementIsVisible(element) ? 'bg-gray-50' : 'bg-gray-100 opacity-70'
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: element.color }}
                  />
                  <span className="text-sm truncate">{element.label || element.type}</span>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleElementVisibility(element)}
                    className={`p-1 rounded ${
                      elementIsVisible(element)
                        ? 'text-green-600 hover:text-green-800'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title={elementIsVisible(element) ? 'Hide on public map' : 'Show on public map'}
                    aria-pressed={elementIsVisible(element)}
                    aria-label={elementIsVisible(element) ? 'Hide element' : 'Show element'}
                  >
                    {elementIsVisible(element) ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEditElement(element)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => requestDeleteElement(element)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete"
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
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
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
              <div>
                <label className="block text-sm font-medium text-red-600 mb-1">🔒 Visibility</label>
                <select
                  value={newLocation.isPublic ? 'public' : 'private'}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, isPublic: e.target.value === 'public' }))}
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
                <p className="text-xs text-red-500 mt-1">
                  Private locations are only visible to logged-in users
                </p>
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
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Map Element</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={editingElement.label || ''}
                  onChange={(e) => setEditingElement(prev => prev ? { ...prev, label: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter element label"
                />
              </div>
              <label className="flex items-start gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={elementIsVisible(editingElement)}
                  onChange={(e) =>
                    setEditingElement((prev) =>
                      prev ? { ...prev, visible: e.target.checked } : null
                    )
                  }
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                    <Check className="h-4 w-4 text-green-600" />
                    Visible on map
                  </span>
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Uncheck to hide this {editingElement.type.toLowerCase()} from the public map. It stays in the editor as a dashed overlay.
                  </span>
                </span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingElement.description || ''}
                  onChange={(e) => setEditingElement(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter element description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={editingElement.risk || 'Low'}
                  onChange={(e) => setEditingElement(prev => prev ? { ...prev, risk: e.target.value as 'High' | 'Medium' | 'Low' } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingElement.category || ''}
                  onChange={(e) => setEditingElement(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category (e.g., Military, Civilian, Infrastructure)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size/Weight</label>
                <input
                  type="number"
                  value={editingElement.size || 3}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1) {
                      setEditingElement(prev => prev ? { ...prev, size: value } : null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                  required
                />
              </div>
              {editingElement.type.toLowerCase() === 'circle' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Radius (meters)</label>
                  <input
                    type="number"
                    value={editingElement.size || 1000}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 100) {
                        setEditingElement(prev => prev ? { ...prev, size: value } : null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="100"
                    max="10000"
                    required
                  />
                </div>
              )}
              <div className="text-xs text-gray-500">
                <p><strong>Type:</strong> {editingElement.type.toLowerCase()}</p>
                {editingElement.createdAt && (
                  <p><strong>Created:</strong> {new Date(editingElement.createdAt).toLocaleString()}</p>
                )}
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
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 id="delete-confirm-title" className="text-lg font-semibold text-gray-900">
                  Delete {pendingDelete.typeLabel}?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  This will permanently remove{' '}
                  <span className="font-medium text-gray-900">{pendingDelete.name}</span>
                  {pendingDelete.kind === 'element'
                    ? ' from the map. Country outlines, shapes, and lines cannot be recovered.'
                    : ' from the map. This location cannot be recovered.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setPendingDelete(null)}
                className="ml-auto text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-md p-3 mb-5">
              <p className="text-sm text-red-700">
                This action cannot be undone. Make sure you selected the right item before deleting.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPendingDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
