export type LatLng = [number, number];

export function isCountryOutline(element: { category?: string; description?: string }) {
  return (
    element.category === 'Country' ||
    Boolean(element.description?.startsWith('Country outline:'))
  );
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
    return polys
      .map((poly) => (poly?.[0] ? simplifyRing(lngLatToLatLng(poly[0])) : null))
      .filter((ring): ring is LatLng[] => Boolean(ring && ring.length >= 4));
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
