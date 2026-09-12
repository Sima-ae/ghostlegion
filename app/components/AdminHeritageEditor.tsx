'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
  Polyline,
  useMapEvents,
} from 'react-leaflet';
import { Eye, EyeOff, Plus, Save, Trash2, X } from 'lucide-react';
import type {
  HeritageDomain,
  HeritageEra,
  HeritageFeature,
  HeritageGeometry,
  HeritagePresence,
} from '../types';
import { fixLeafletDefaultIcons, heritagePointIcon, data2ColdWarPinIcon } from '../lib/leaflet-icons';
import MapResizeFix from './MapResizeFix';
import HeritageMapLayers from './HeritageMapLayers';
import {
  COLD_WAR_FEATURE_TYPES,
  COLD_WAR_PRESENCE,
  coldWarPinKind,
  coldWarPinLetter,
  data1PointColor,
  defaultLayerVisibility,
  lineKindLabel,
  linieKindLabel,
  isLinieLineKind,
  lineKindsForEra,
} from '../lib/heritage-styles';
import { useI18n } from '../lib/i18n/I18nProvider';
import { getPolygonParts } from '../lib/map-geometry';

fixLeafletDefaultIcons();

type Draft = {
  id?: string;
  era: HeritageEra;
  geometry: HeritageGeometry;
  name: string;
  description: string;
  presence: HeritagePresence;
  domain: HeritageDomain | '';
  category: string;
  function: string;
  featureType: string;
  lineKind: string;
  ensemble: string;
  builder: string;
  historicalUser: string;
  accessibility: string;
  visibilityNote: string;
  isPublic: boolean;
  visible: boolean;
  path: [number, number][];
};

const emptyDraft = (era: HeritageEra): Draft => ({
  era,
  geometry: 'POINT',
  name: '',
  description: '',
  presence: 'UNKNOWN',
  domain: 'MILITARY',
  category: '',
  function: '',
  featureType: '',
  lineKind: '',
  ensemble: '',
  builder: '',
  historicalUser: '',
  accessibility: '',
  visibilityNote: '',
  isPublic: true,
  visible: true,
  path: [],
});

function ClickCapture({
  geometry,
  onPoint,
}: {
  geometry: HeritageGeometry;
  onPoint: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (event) => {
      onPoint(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

function draftToFeature(draft: Draft): HeritageFeature | null {
  if (!draft.name.trim()) return null;
  let coordinates: HeritageFeature['coordinates'];
  if (draft.geometry === 'POINT') {
    if (draft.path.length < 1) return null;
    coordinates = draft.path[draft.path.length - 1];
  } else if (draft.geometry === 'LINE') {
    if (draft.path.length < 2) return null;
    coordinates = draft.path;
  } else {
    if (draft.path.length < 3) return null;
    coordinates = draft.path;
  }
  return {
    id: draft.id || 'draft',
    era: draft.era,
    geometry: draft.geometry,
    coordinates,
    name: draft.name.trim(),
    description: draft.description || null,
    presence: draft.presence,
    domain: draft.domain || null,
    category: draft.category || null,
    function: draft.function || null,
    featureType: draft.featureType || null,
    lineKind: draft.lineKind || null,
    ensemble: draft.ensemble || null,
    builder: draft.builder || null,
    historicalUser: draft.historicalUser || null,
    accessibility: draft.accessibility || null,
    visibilityNote: draft.visibilityNote || null,
    isPublic: draft.isPublic,
    visible: draft.visible,
    color: null,
    size: null,
    createdBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function featureToDraft(feature: HeritageFeature): Draft {
  let path: [number, number][] = [];
  if (feature.geometry === 'POINT' && Array.isArray(feature.coordinates)) {
    if (typeof feature.coordinates[0] === 'number') {
      path = [feature.coordinates as [number, number]];
    }
  } else {
    const parts = getPolygonParts(feature.coordinates);
    path = parts[0] || (Array.isArray(feature.coordinates[0])
      ? (feature.coordinates as [number, number][])
      : []);
  }
  return {
    id: feature.id,
    era: feature.era,
    geometry: feature.geometry,
    name: feature.name,
    description: feature.description || '',
    presence: feature.presence,
    domain: feature.domain || '',
    category: feature.category || '',
    function: feature.function || '',
    featureType: feature.featureType || '',
    lineKind: feature.lineKind || '',
    ensemble: feature.ensemble || '',
    builder: feature.builder || '',
    historicalUser: feature.historicalUser || '',
    accessibility: feature.accessibility || '',
    visibilityNote: feature.visibilityNote || '',
    isPublic: feature.isPublic,
    visible: feature.visible,
    path,
  };
}

export default function AdminHeritageEditor() {
  const { locale } = useI18n();
  const [era, setEra] = useState<HeritageEra>('WW2');
  const [features, setFeatures] = useState<HeritageFeature[]>([]);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft('WW2'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/heritage-features?era=${era}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await response.json().catch(() => []);
      setFeatures(Array.isArray(data) ? data : []);
    } catch {
      setFeatures([]);
    }
  }, [era]);

  useEffect(() => {
    load();
    setDraft(emptyDraft(era));
    setPlacing(false);
    setError('');
  }, [era, load]);

  const presenceOptions = COLD_WAR_PRESENCE;
  const lineKinds = lineKindsForEra(era);
  const layers = useMemo(() => defaultLayerVisibility(era), [era]);

  const onMapPoint = (lat: number, lng: number) => {
    if (!placing) return;
    setDraft((current) => {
      if (current.geometry === 'POINT') {
        return { ...current, path: [[lat, lng]] };
      }
      return { ...current, path: [...current.path, [lat, lng]] };
    });
  };

  const save = async () => {
    const payload = draftToFeature(draft);
    if (!payload) {
      setError(
        draft.geometry === 'POINT'
          ? 'Click the map to place a point and enter a name.'
          : draft.geometry === 'LINE'
            ? 'Draw at least 2 points and enter a name.'
            : 'Draw at least 3 points and enter a name.'
      );
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        era: payload.era,
        geometry: payload.geometry,
        coordinates: payload.coordinates,
        name: payload.name,
        description: payload.description,
        presence: payload.presence,
        domain: payload.domain || null,
        category: payload.category,
        function: payload.function,
        featureType: payload.featureType,
        lineKind: payload.lineKind,
        ensemble: payload.ensemble,
        builder: payload.builder,
        historicalUser: payload.historicalUser,
        accessibility: payload.accessibility,
        visibilityNote: payload.visibilityNote,
        isPublic: payload.isPublic,
        visible: payload.visible,
      };
      const response = await fetch(
        draft.id ? `/api/heritage-features/${draft.id}` : '/api/heritage-features',
        {
          method: draft.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body),
        }
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error || 'Could not save feature.');
        return;
      }
      setDraft(emptyDraft(era));
      setPlacing(false);
      await load();
    } catch {
      setError('Could not save feature.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this heritage feature?')) return;
    await fetch(`/api/heritage-features/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (draft.id === id) setDraft(emptyDraft(era));
    await load();
  };

  const toggleVisible = async (feature: HeritageFeature) => {
    await fetch(`/api/heritage-features/${feature.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ visible: !feature.visible }),
    });
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-700">
          Era
          <select
            value={era}
            onChange={(event) => setEra(event.target.value as HeritageEra)}
            className="ml-2 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            <option value="WW1">WW1</option>
            <option value="WW2">WW2</option>
            <option value="COLD_WAR">Koude Oorlog</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setDraft(emptyDraft(era));
            setPlacing(true);
            setError('');
          }}
          className="inline-flex items-center gap-1 rounded-md bg-slate-800 text-white px-3 py-1.5 text-sm"
        >
          <Plus className="h-4 w-4" />
          New feature
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem] gap-4">
        <div className="h-[28rem] rounded-lg overflow-hidden border border-gray-200 relative">
          <MapContainer
            center={[52.1326, 5.2913]}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            className="gl-leaflet"
          >
            <MapResizeFix />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <ClickCapture geometry={draft.geometry} onPoint={onMapPoint} />
            <HeritageMapLayers features={features} layers={layers} filters={{}} />
            {draft.geometry === 'POINT' && draft.path[0] ? (
              <Marker
                position={draft.path[0]}
                icon={(() => {
                  const kind = coldWarPinKind({
                    featureType: draft.featureType,
                    category: draft.category,
                    function: draft.function,
                    name: draft.name,
                    domain: draft.domain || null,
                  });
                  if (kind === 'data1') {
                    const shape = draft.domain === 'CIVIL' ? 'triangle' : 'circle';
                    return heritagePointIcon(
                      data1PointColor(draft.presence),
                      shape,
                      draft.presence === 'UNKNOWN' || draft.presence === 'REMNANT'
                    );
                  }
                  return data2ColdWarPinIcon(kind, coldWarPinLetter(kind));
                })()}
              />
            ) : null}
            {draft.geometry === 'LINE' && draft.path.length >= 2 ? (
              <Polyline positions={draft.path} color="#0f172a" weight={3} />
            ) : null}
            {draft.geometry === 'AREA' && draft.path.length >= 3 ? (
              <Polygon positions={draft.path} color="#0f172a" fillOpacity={0.2} />
            ) : null}
          </MapContainer>
          {placing ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-md">
              Click map to{' '}
              {draft.geometry === 'POINT'
                ? 'place point'
                : draft.geometry === 'LINE'
                  ? 'add line vertices'
                  : 'add area vertices'}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3 max-h-[28rem] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">
              {draft.id ? 'Edit feature' : 'Create feature'}
            </h3>
            {draft.id || placing ? (
              <button
                type="button"
                onClick={() => {
                  setDraft(emptyDraft(era));
                  setPlacing(false);
                }}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <label className="block text-xs text-gray-600">
            Geometry
            <select
              value={draft.geometry}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  geometry: event.target.value as HeritageGeometry,
                  path: [],
                  lineKind: '',
                }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="POINT">Point</option>
              <option value="LINE">Line</option>
              <option value="AREA">Area</option>
            </select>
          </label>

          <label className="block text-xs text-gray-600">
            Name
            <input
              value={draft.name}
              onChange={(event) => setDraft((c) => ({ ...c, name: event.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="block text-xs text-gray-600">
            Description
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft((c) => ({ ...c, description: event.target.value }))
              }
              rows={2}
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </label>

          <label className="block text-xs text-gray-600">
            Presence
            <select
              value={draft.presence}
              onChange={(event) =>
                setDraft((c) => ({
                  ...c,
                  presence: event.target.value as HeritagePresence,
                }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              {presenceOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-gray-600">
            Domain
            <select
              value={draft.domain}
              onChange={(event) =>
                setDraft((c) => ({
                  ...c,
                  domain: event.target.value as HeritageDomain | '',
                }))
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="MILITARY">Military</option>
              <option value="CIVIL">Civil</option>
              <option value="COMBINED">Combined</option>
            </select>
          </label>

          {draft.geometry === 'LINE' ? (
            <label className="block text-xs text-gray-600">
              Line kind
              <select
                value={draft.lineKind}
                onChange={(event) =>
                  setDraft((c) => ({ ...c, lineKind: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">Select…</option>
                {lineKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {isLinieLineKind(kind)
                      ? linieKindLabel(kind, era, locale)
                      : lineKindLabel(kind)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block text-xs text-gray-600">
            Feature type
            <select
              value={draft.featureType}
              onChange={(event) => {
                const featureType = event.target.value;
                setDraft((c) => ({
                  ...c,
                  featureType,
                  domain:
                    featureType === 'civiel'
                      ? 'CIVIL'
                      : featureType === 'militair'
                        ? 'MILITARY'
                        : c.domain,
                }));
              }}
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">Select…</option>
              {COLD_WAR_FEATURE_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          {(
            [
              ['category', 'Category'],
              ['function', 'Function'],
              ['ensemble', 'Ensemble'],
              ['builder', 'Builder'],
              ['historicalUser', 'Historical user'],
              ['accessibility', 'Accessibility'],
              ['visibilityNote', 'Visibility note'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-xs text-gray-600">
              {label}
              <input
                value={draft[key]}
                onChange={(event) =>
                  setDraft((c) => ({ ...c, [key]: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </label>
          ))}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={draft.isPublic}
              onChange={(event) =>
                setDraft((c) => ({ ...c, isPublic: event.target.checked }))
              }
            />
            Public
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={draft.visible}
              onChange={(event) =>
                setDraft((c) => ({ ...c, visible: event.target.checked }))
              }
            />
            Visible on map
          </label>

          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPlacing(true);
                setError('');
              }}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            >
              Draw on map
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-100 font-semibold text-sm text-gray-900">
          {era === 'WW1' ? 'WW1' : era === 'WW2' ? 'WW2' : 'Koude Oorlog'} features ({features.length})
        </div>
        <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {features.length === 0 ? (
            <li className="px-3 py-4 text-sm text-gray-500">No features yet for this era.</li>
          ) : (
            features.map((feature) => (
              <li
                key={feature.id}
                className="px-3 py-2 flex items-center gap-2 text-sm"
              >
                <button
                  type="button"
                  onClick={() => {
                    setDraft(featureToDraft(feature));
                    setPlacing(false);
                  }}
                  className="flex-1 text-left min-w-0"
                >
                  <span className="font-medium text-gray-900 truncate block">
                    {feature.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {feature.geometry.toLowerCase()} · {feature.presence.toLowerCase()}
                    {feature.lineKind ? ` · ${feature.lineKind}` : ''}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleVisible(feature)}
                  className="p-1 text-gray-500 hover:text-gray-800"
                  title={feature.visible ? 'Hide' : 'Show'}
                >
                  {feature.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => remove(feature.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
