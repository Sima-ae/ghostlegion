'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Location, type HeritageFeature, type MapViewMode } from '../types';
import { getLocationTypeIcon, getStatusColor } from '../lib/utils';
import { fixLeafletDefaultIcons, locationMarkerIcon } from '../lib/leaflet-icons';
import { getPolygonParts, isCountryOutline, mainlandPolygonParts } from '../lib/map-geometry';
import {
  defaultLayerVisibility,
  eraFromMode,
  type HeritageFilters,
} from '../lib/heritage-styles';
import MapResizeFix from './MapResizeFix';
import MapMemos from './MapMemos';
import MapFocusFly from './MapFocusFly';
import CetTodayDate from './CetTodayDate';
import MapModeSwitcher from './MapModeSwitcher';
import MapLegendaPanel from './MapLegendaPanel';
import HeritageMapLayers from './HeritageMapLayers';
import { useI18n } from '../lib/i18n/I18nProvider';

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

interface MapComponentProps {
  locations: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
}

export default function MapComponent({ locations, selectedLocation, onLocationSelect }: MapComponentProps) {
  const { t } = useI18n();
  const [mapElements, setMapElements] = useState<MapElement[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [mode, setMode] = useState<MapViewMode>('operations');
  const [heritageFeatures, setHeritageFeatures] = useState<HeritageFeature[]>([]);
  const [layers, setLayers] = useState(() => defaultLayerVisibility('WW2'));
  const [filters, setFilters] = useState<HeritageFilters>({});
  const layerRefs = useRef<Record<string, L.Layer | null>>({});
  const heritageMode = mode === 'ww1' || mode === 'ww2' || mode === 'cold_war';
  const heritageEra = heritageMode ? eraFromMode(mode) : null;
  const legendEra = mode === 'operations' ? 'OPERATIONS' : heritageEra;

  useEffect(() => {
    fixLeafletDefaultIcons();
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadMapElements = async () => {
      try {
        const response = await fetch('/api/map-elements');
        if (response.ok) {
          const elements = await response.json();
          const convertedElements = elements.map((element: any) => ({
            ...element,
            risk: element.risk
              ? element.risk.charAt(0) + element.risk.slice(1).toLowerCase()
              : 'Low',
          }));
          setMapElements(convertedElements);
        } else {
          setMapElements([]);
        }
      } catch {
        setMapElements([]);
      }
    };

    if (isClient) loadMapElements();
  }, [isClient]);

  useEffect(() => {
    if (!heritageEra) {
      setHeritageFeatures([]);
      if (mode === 'operations') {
        setLayers(defaultLayerVisibility('OPERATIONS'));
        setFilters({});
      }
      return;
    }
    setLayers(defaultLayerVisibility(heritageEra));
    setFilters({});
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`/api/heritage-features?era=${heritageEra}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = await response.json().catch(() => []);
        if (!cancelled) setHeritageFeatures(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setHeritageFeatures([]);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [heritageEra, mode]);

  if (!isClient) {
    return (
      <div className="gl-map-root bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div>{t('map.loading')}</div>
        </div>
      </div>
    );
  }

  const showOpsLocations = mode === 'operations';
  const showNonCountryElements = mode === 'operations';

  return (
    <div className="gl-map-root relative">
      <MapModeSwitcher mode={mode} onChange={setMode} />
      {legendEra ? (
        <MapLegendaPanel
          era={legendEra}
          features={heritageFeatures}
          layers={layers}
          filters={filters}
          onLayersChange={setLayers}
          onFiltersChange={setFilters}
        />
      ) : null}
      {heritageMode ? (
        <div className="absolute z-[1100] bottom-3 left-1/2 -translate-x-1/2 pointer-events-none px-3">
          <p className="rounded-md bg-slate-900/80 text-white text-[10px] sm:text-xs px-2.5 py-1.5 text-center max-w-md">
            {`Ghost Legion © ${new Date().getFullYear()}`}
          </p>
        </div>
      ) : null}

      <MapContainer
        center={[52.1326, 5.2913]}
        zoom={8}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
        className="gl-leaflet"
      >
        <MapResizeFix />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapMemos />
        <MapFocusFly
          locations={locations}
          layerRefs={layerRefs}
          onLocationSelect={onLocationSelect}
        />

        {heritageEra ? (
          <HeritageMapLayers
            features={heritageFeatures}
            layers={layers}
            filters={filters}
          />
        ) : null}

        {showOpsLocations
          ? locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.coordinates[0], location.coordinates[1]]}
                icon={locationMarkerIcon(getLocationTypeIcon(location.type))}
                eventHandlers={{
                  click: () => onLocationSelect?.(location),
                  add: (event) => {
                    layerRefs.current[location.id] = event.target;
                  },
                  remove: () => {
                    delete layerRefs.current[location.id];
                  },
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
                        <span className="text-xs capitalize">
                          {location.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Status:</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${getStatusColor(location.status)}`}
                        >
                          {location.status}
                        </span>
                      </div>
                      {location.capacity ? (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Capaciteit:</span>
                          <span className="text-xs">{location.capacity} personen</span>
                        </div>
                      ) : null}
                      {location.contact ? (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Contact:</span>
                          <span className="text-xs">{location.contact}</span>
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs font-medium mb-1">Faciliteiten:</h4>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(location.facilities) ? location.facilities : []).map(
                          (facility, index) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {facility}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))
          : null}

        {mapElements.map((element) => {
          if (element.visible === false) return null;
          const country = isCountryOutline(element);
          if (!country && !showNonCountryElements) return null;
          const elementType = element.type.toLowerCase();
          if (elementType === 'polygon') {
            return (country
              ? mainlandPolygonParts(element.coordinates)
              : getPolygonParts(element.coordinates)
            ).map((positions, partIndex) => (
              <Polygon
                key={`${element.id}-${partIndex}`}
                positions={positions}
                color={element.color}
                weight={element.size || 3}
                fillColor={element.color}
                fillOpacity={0.3}
                eventHandlers={{
                  add: (event) => {
                    if (partIndex === 0) layerRefs.current[element.id] = event.target;
                  },
                  remove: () => {
                    if (partIndex === 0) delete layerRefs.current[element.id];
                  },
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center mb-2">
                      {!country ? (
                        <div
                          className="w-4 h-4 rounded mr-2"
                          style={{ backgroundColor: element.color }}
                        />
                      ) : null}
                      <h3 className="font-bold text-sm">{element.label || 'Polygon'}</h3>
                    </div>
                    {!country ? (
                      <p className="text-xs text-gray-600 mb-2">
                        {element.description || 'No description provided'}
                      </p>
                    ) : null}
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-xs font-medium mr-2">Risk:</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            element.risk === 'High'
                              ? 'bg-red-100 text-red-800'
                              : element.risk === 'Medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {element.risk || 'Low'}
                        </span>
                      </div>
                      {!country ? (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Category:</span>
                          <span className="text-xs">
                            {element.category || 'Uncategorized'}
                          </span>
                        </div>
                      ) : null}
                      {country ? (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Updated:</span>
                          <span className="text-xs">
                            <CetTodayDate />
                          </span>
                        </div>
                      ) : element.createdAt ? (
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Created:</span>
                          <span className="text-xs">
                            {new Date(element.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            ));
          }
          if (!showNonCountryElements) return null;
          if (elementType === 'polyline') {
            return (
              <Polyline
                key={element.id}
                positions={element.coordinates as [number, number][]}
                color={element.color}
                weight={element.size || 3}
                eventHandlers={{
                  add: (event) => {
                    layerRefs.current[element.id] = event.target;
                  },
                  remove: () => {
                    delete layerRefs.current[element.id];
                  },
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-sm">{element.label || 'Polyline'}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {element.description || 'No description provided'}
                    </p>
                  </div>
                </Popup>
              </Polyline>
            );
          }
          if (elementType === 'circle') {
            return (
              <Circle
                key={element.id}
                center={element.coordinates as [number, number]}
                radius={element.size || 1000}
                color={element.color}
                weight={element.size || 3}
                fillColor={element.color}
                fillOpacity={0.3}
                eventHandlers={{
                  add: (event) => {
                    layerRefs.current[element.id] = event.target;
                  },
                  remove: () => {
                    delete layerRefs.current[element.id];
                  },
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-sm">{element.label || 'Circle'}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {element.description || 'No description provided'}
                    </p>
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
