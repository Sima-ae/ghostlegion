import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/app/lib/require-auth';
import { flattenRings, geoJsonToLatLngRings } from '@/app/lib/map-geometry';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'GhostLegion/1.0 (https://ghostlegion.online; country outline search)';

const OSM_PREFIX: Record<string, string> = {
  relation: 'R',
  way: 'W',
  node: 'N',
};

export async function POST(request: NextRequest) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const osmId = Number(body?.osmId);
  const osmType = String(body?.osmType || '').toLowerCase();
  const prefix = OSM_PREFIX[osmType];

  if (!osmId || !prefix) {
    return NextResponse.json({ error: 'Invalid country selection' }, { status: 400 });
  }

  const url = new URL(`${NOMINATIM}/lookup`);
  url.searchParams.set('osm_ids', `${prefix}${osmId}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('polygon_threshold', '0.005');
  url.searchParams.set('accept-language', 'en');

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Could not load country border' },
      { status: 502 }
    );
  }

  const rows = (await response.json()) as Array<{
    display_name?: string;
    name?: string;
    geojson?: { type: string; coordinates: unknown };
  }>;
  const row = rows[0];
  if (!row?.geojson) {
    return NextResponse.json(
      { error: 'No border outline found for this country' },
      { status: 404 }
    );
  }

  const rings = geoJsonToLatLngRings(row.geojson);
  if (rings.length === 0) {
    return NextResponse.json(
      { error: 'No border outline found for this country' },
      { status: 404 }
    );
  }

  const geometryType = row.geojson.type;
  const isLine = geometryType === 'LineString' || geometryType === 'MultiLineString';
  const coordinates = rings.length === 1 ? rings[0] : rings;
  const fitPoints = flattenRings(rings);

  return NextResponse.json({
    name: row.name || row.display_name?.split(',')[0] || 'Country',
    type: isLine ? 'polyline' : 'polygon',
    coordinates,
    fitPoints,
  });
}
