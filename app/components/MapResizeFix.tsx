'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useMap } from 'react-leaflet';
import { applyLocationPinScale } from '../lib/leaflet-icons';

/** Leaflet must be told when its container size changes (mobile chrome, drawers). */
export default function MapResizeFix() {
  const map = useMap();

  useLayoutEffect(() => {
    applyLocationPinScale(map);
    const syncPins = () => applyLocationPinScale(map);
    map.on('zoom zoomend', syncPins);
    return () => {
      map.off('zoom zoomend', syncPins);
    };
  }, [map]);

  useEffect(() => {
    const sync = () => {
      map.invalidateSize({ animate: false });
    };

    const t1 = window.setTimeout(sync, 50);
    const t2 = window.setTimeout(sync, 350);
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);

    const container = map.getContainer();
    const parent = container.parentElement;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(sync) : null;
    ro?.observe(container);
    if (parent) ro?.observe(parent);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
      ro?.disconnect();
    };
  }, [map]);

  return null;
}
