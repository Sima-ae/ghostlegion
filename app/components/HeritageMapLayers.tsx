'use client';

import { useMemo } from 'react';
import { Marker, Popup, Polygon, Polyline } from 'react-leaflet';
import type { HeritageFeature } from '../types';
import { heritagePointIcon, data2ColdWarPinIcon } from '../lib/leaflet-icons';
import { getPolygonParts } from '../lib/map-geometry';
import {
  areaStyle,
  coldWarPinKind,
  coldWarPinLetter,
  data1PointColor,
  featureMatchesFilters,
  featureMatchesLayers,
  isInundatie,
  lineStyle,
  presenceLabel,
  type HeritageFilters,
  type HeritageLayerKey,
} from '../lib/heritage-styles';
import { useI18n } from '../lib/i18n/I18nProvider';

function asPoint(coordinates: HeritageFeature['coordinates']): [number, number] | null {
  if (Array.isArray(coordinates) && typeof coordinates[0] === 'number') {
    const lat = Number(coordinates[0]);
    const lng = Number(coordinates[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }
  return null;
}

function asLine(coordinates: HeritageFeature['coordinates']): [number, number][] | null {
  if (!Array.isArray(coordinates) || typeof coordinates[0] === 'number') return null;
  const first = coordinates[0];
  if (Array.isArray(first) && typeof first[0] === 'number') {
    return coordinates as [number, number][];
  }
  return null;
}

export default function HeritageMapLayers({
  features,
  layers,
  filters,
}: {
  features: HeritageFeature[];
  layers: Record<HeritageLayerKey, boolean>;
  filters: HeritageFilters;
}) {
  const visible = useMemo(
    () =>
      features.filter(
        (feature) =>
          featureMatchesLayers(feature, layers) && featureMatchesFilters(feature, filters)
      ),
    [features, layers, filters]
  );

  return (
    <>
      {visible.map((feature) => {
        if (feature.geometry === 'POINT') {
          const position = asPoint(feature.coordinates);
          if (!position) return null;
          const icon = (() => {
            const kind = coldWarPinKind(feature);
            if (kind === 'data1') {
              const shape = feature.domain === 'CIVIL' ? 'triangle' : 'circle';
              return heritagePointIcon(
                data1PointColor(feature.presence),
                shape,
                feature.presence === 'UNKNOWN' || feature.presence === 'REMNANT'
              );
            }
            return data2ColdWarPinIcon(kind, coldWarPinLetter(kind));
          })();
          return (
            <Marker key={feature.id} position={position} icon={icon}>
              <Popup>
                <HeritagePopup feature={feature} />
              </Popup>
            </Marker>
          );
        }

        if (feature.geometry === 'LINE') {
          const positions = asLine(feature.coordinates);
          if (!positions || positions.length < 2) return null;
          const style = lineStyle(feature);
          return (
            <Polyline
              key={feature.id}
              positions={positions}
              pathOptions={{
                color: style.color,
                weight: style.weight,
                dashArray: style.dashArray,
              }}
            >
              <Popup>
                <HeritagePopup feature={feature} />
              </Popup>
            </Polyline>
          );
        }

        const parts = getPolygonParts(feature.coordinates);
        if (!parts.length) return null;
        const style = areaStyle(feature);
        return parts.map((positions, index) => (
          <Polygon
            key={`${feature.id}-${index}`}
            positions={positions}
            pathOptions={{
              color: style.color,
              fillColor: style.fillColor,
              fillOpacity: style.fillOpacity,
              weight: style.weight,
            }}
          >
            <Popup>
              <HeritagePopup feature={feature} />
            </Popup>
          </Polygon>
        ));
      })}
    </>
  );
}

function HeritagePopup({ feature }: { feature: HeritageFeature }) {
  const { locale, t } = useI18n();
  return (
    <div className="p-1 min-w-[160px]">
      <h3 className="font-bold text-sm">{feature.name}</h3>
      {feature.description ? (
        <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
      ) : null}
      <div className="mt-2 space-y-0.5 text-xs text-gray-700">
        <div>
          <span className="font-medium">{t('legend.filter.presence')}:</span>{' '}
          {presenceLabel(feature.presence, feature.era, locale)}
        </div>
        {feature.domain ? (
          <div>
            <span className="font-medium">Domain:</span> {feature.domain.toLowerCase()}
          </div>
        ) : null}
        {feature.featureType ? (
          <div>
            <span className="font-medium">Type:</span> {feature.featureType}
          </div>
        ) : null}
        {feature.lineKind ? (
          <div>
            <span className="font-medium">Line:</span> {feature.lineKind.replaceAll('_', ' ')}
          </div>
        ) : null}
        {isInundatie(feature) ? (
          <div>
            <span className="font-medium">Layer:</span> inundatie
          </div>
        ) : null}
      </div>
    </div>
  );
}
