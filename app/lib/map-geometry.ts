export type LatLng = [number, number];

export function isCountryOutline(element: {
  category?: string | null;
  description?: string | null;
}) {
  return (
    element.category === 'Country' ||
    Boolean(element.description?.startsWith('Country outline:'))
  );
}

type RingBox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  area: number;
  cy: number;
  cx: number;
};

function ringBox(ring: LatLng[]): RingBox | null {
  if (!ring?.length) return null;
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  let count = 0;
  for (const point of ring) {
    const lat = Number(point[0]);
    const lng = Number(point[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    count += 1;
  }
  if (count < 3) return null;
  const dLat = Math.max(0, maxLat - minLat);
  const dLng = Math.max(0, maxLng - minLng);
  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    area: dLat * dLng,
    cy: (minLat + maxLat) / 2,
    cx: (minLng + maxLng) / 2,
  };
}

function bboxSeparation(a: RingBox, b: RingBox) {
  const dLat =
    a.maxLat < b.minLat ? b.minLat - a.maxLat : b.maxLat < a.minLat ? a.minLat - b.maxLat : 0;
  const dLng =
    a.maxLng < b.minLng ? b.minLng - a.maxLng : b.maxLng < a.minLng ? a.minLng - b.maxLng : 0;
  return Math.hypot(dLat, dLng);
}

/**
 * Keep the metropolitan country (largest landmass) plus nearby islands,
 * and drop overseas territories / tiny border artifacts.
 */
export function mainlandPolygonParts(coordinates: unknown, maxGapDeg = 4): LatLng[][] {
  const rings = getPolygonParts(coordinates);
  if (rings.length <= 1) return rings;

  const scored = rings
    .map((ring, index) => ({ ring, index, box: ringBox(ring) }))
    .filter((item): item is { ring: LatLng[]; index: number; box: RingBox } => Boolean(item.box));
  if (!scored.length) return rings;

  scored.sort((a, b) => b.box.area - a.box.area);
  const mainland = scored[0];
  const minArea = Math.max(0.02, mainland.box.area * 0.002);
  const kept = [mainland.ring];
  for (const candidate of scored) {
    if (candidate.index === mainland.index) continue;
    if (candidate.ring.length < 8) continue;
    if (candidate.box.area < minArea) continue;
    if (bboxSeparation(candidate.box, mainland.box) <= maxGapDeg) {
      kept.push(candidate.ring);
    }
  }
  return kept;
}

/** Best-effort center point so search can fly the map to an element. */
export function elementFocusLatLng(coordinates: unknown): LatLng | null {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return null;
  const first = coordinates[0];
  if (typeof first === 'number' && typeof coordinates[1] === 'number') {
    const lat = Number(coordinates[0]);
    const lng = Number(coordinates[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }
  const parts = mainlandPolygonParts(coordinates);
  if (!parts.length) return null;
  let best = parts[0];
  let bestArea = -1;
  for (const ring of parts) {
    const box = ringBox(ring);
    if (box && box.area > bestArea) {
      bestArea = box.area;
      best = ring;
    }
  }
  const lat = best.reduce((sum, point) => sum + point[0], 0) / best.length;
  const lng = best.reduce((sum, point) => sum + point[1], 0) / best.length;
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

/** Leaflet rings: one ring, or several outer rings (islands). */
export function getPolygonParts(coordinates: unknown): LatLng[][] {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return [];
  const first = coordinates[0];
  if (Array.isArray(first) && typeof first[0] === 'number') {
    return [coordinates as LatLng[]];
  }
  if (Array.isArray(first) && Array.isArray(first[0]) && typeof first[0][0] === 'number') {
    return coordinates as LatLng[][];
  }
  return [];
}

function lngLatToLatLng(ring: number[][]): LatLng[] {
  return ring
    .filter((pt) => Array.isArray(pt) && pt.length >= 2)
    .map(([lng, lat]) => [lat, lng] as LatLng);
}

function closeRing(ring: LatLng[]): LatLng[] {
  if (ring.length < 3) return ring;
  const a = ring[0];
  const b = ring[ring.length - 1];
  if (a[0] !== b[0] || a[1] !== b[1]) return [...ring, a];
  return ring;
}

function simplifyRing(ring: LatLng[], maxPoints = 1800): LatLng[] {
  const closed = closeRing(ring);
  if (closed.length <= maxPoints) return closed;
  const step = Math.ceil(closed.length / maxPoints);
  const out = closed.filter((_, i) => i % step === 0 || i === closed.length - 1);
  return closeRing(out);
}

type GeoJsonGeometry = {
  type: string;
  coordinates: unknown;
};

export function geoJsonToLatLngRings(geometry: GeoJsonGeometry): LatLng[][] {
  if (!geometry?.type || !geometry.coordinates) return [];

  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates as number[][][];
    if (!rings?.[0]) return [];
    return [simplifyRing(lngLatToLatLng(rings[0]))];
  }

  if (geometry.type === 'MultiPolygon') {
    const polys = geometry.coordinates as number[][][][];
    const rings = polys
      .map((poly) => (poly?.[0] ? simplifyRing(lngLatToLatLng(poly[0])) : null))
      .filter((ring): ring is LatLng[] => Boolean(ring && ring.length >= 4));
    return mainlandPolygonParts(rings);
  }

  if (geometry.type === 'LineString') {
    const line = simplifyRing(lngLatToLatLng(geometry.coordinates as number[][]));
    return line.length >= 2 ? [line] : [];
  }

  if (geometry.type === 'MultiLineString') {
    const lines = geometry.coordinates as number[][][];
    return lines
      .map((line) => simplifyRing(lngLatToLatLng(line)))
      .filter((line) => line.length >= 2);
  }

  return [];
}

export function flattenRings(rings: LatLng[][]): LatLng[] {
  return rings.flat();
}
