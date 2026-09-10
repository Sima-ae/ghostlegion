'use client';

import { useEffect, useLayoutEffect, type MutableRefObject } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location } from '../types';
import {
  MAP_FOCUS_EVENT,
  emitMapFocusSettled,
  peekMapFocus,
  focusZoom,
  type MapFocusTarget,
} from '../lib/map-focus';

type PopupLayer = L.Layer & {
  openPopup: (latlng?: L.LatLngExpression) => this;
  getPopup?: () => L.Popup | undefined;
};

function openPopupOnLayer(map: L.Map, layer: PopupLayer, target: MapFocusTarget) {
  const popup = layer.getPopup?.();
  const previousAutoPan = popup?.options.autoPan;
  if (popup) popup.options.autoPan = false;
  const latlng = L.latLng(target.lat, target.lng);
  try {
    layer.openPopup(latlng);
  } catch {
    layer.openPopup();
  }
  if (popup && previousAutoPan !== undefined) popup.options.autoPan = previousAutoPan;
  map.panTo(latlng, { animate: false });
}

export default function MapFocusFly({
  locations,
  layerRefs,
  onLocationSelect,
}: {
  locations: Location[];
  layerRefs: MutableRefObject<Record<string, L.Layer | null>>;
  onLocationSelect?: (location: Location) => void;
}) {
  const map = useMap();

  useLayoutEffect(() => {
    let generation = 0;
    let safetyTimer = 0;

    const apply = (event: Event) => {
      const target = (event as CustomEvent<MapFocusTarget>).detail;
      if (!target || !Number.isFinite(target.lat) || !Number.isFinite(target.lng)) return;

      const myGen = ++generation;
      let finished = false;
      const dest = L.latLng(target.lat, target.lng);
      const zoom = focusZoom(target.type);
      window.clearTimeout(safetyTimer);

      const finish = () => {
        if (myGen !== generation || finished) return;
        finished = true;
        window.clearTimeout(safetyTimer);
        map.off('moveend', finish);

        if (target.type === 'location') {
          const location = locations.find((item) => item.id === target.id);
          if (location) onLocationSelect?.(location);
        }

        const tryOpen = (attempt: number) => {
          if (myGen !== generation) return;
          if (target.type === 'memo') {
            map.panTo(dest, { animate: false });
            emitMapFocusSettled(target);
            return;
          }
          const layer = layerRefs.current[target.id] as PopupLayer | null;
          if (layer && typeof layer.openPopup === 'function') {
            openPopupOnLayer(map, layer, target);
            emitMapFocusSettled(target);
            return;
          }
          if (attempt < 12) {
            window.setTimeout(() => tryOpen(attempt + 1), 80);
            return;
          }
          map.panTo(dest, { animate: false });
          emitMapFocusSettled(target);
        };

        tryOpen(0);
      };

      map.closePopup();
      map.invalidateSize({ animate: false });

      const alreadyCentered =
        Math.abs(map.getZoom() - zoom) < 0.05 && map.distance(map.getCenter(), dest) < 25;

      if (alreadyCentered) {
        finish();
        return;
      }

      map.on('moveend', finish);
      map.flyTo(dest, zoom, { duration: 0.7, easeLinearity: 0.25 });
      safetyTimer = window.setTimeout(finish, 1100);
    };

    window.addEventListener(MAP_FOCUS_EVENT, apply);
    return () => {
      generation += 1;
      window.clearTimeout(safetyTimer);
      window.removeEventListener(MAP_FOCUS_EVENT, apply);
    };
  }, [map, locations, layerRefs, onLocationSelect]);

  useEffect(() => {
    const pending = peekMapFocus();
    if (!pending) return;
    window.dispatchEvent(new CustomEvent(MAP_FOCUS_EVENT, { detail: pending }));
  }, [map]);

  return null;
}
