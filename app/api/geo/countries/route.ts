import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/app/lib/require-auth';

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const UA = 'GhostLegion/1.0 (https://ghostlegion.online; country outline search)';

type NominatimHit = {
  osm_id: number;
  osm_type: string;
  display_name: string;
  name?: string;
  type?: string;
  class?: string;
  addresstype?: string;
  lat: string;
  lon: string;
};

const searchCache = new Map<string, { at: number; body: unknown }>();
const CACHE_MS = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const key = q.toLowerCase();
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json(cached.body);
  }

  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '8');
  url.searchParams.set('addressdetails', '0');
  url.searchParams.set('featureType', 'country');
  url.searchParams.set('accept-language', 'en');

  const response = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Country search is temporarily unavailable' },
      { status: 502 }
    );
  }

  const hits = (await response.json()) as NominatimHit[];
  let filtered = hits.filter(
    (hit) =>
      hit.addresstype === 'country' ||
      hit.type === 'administrative' ||
      hit.type === 'country' ||
      hit.class === 'boundary' ||
      hit.class === 'place'
  );

  if (filtered.length === 0) {
    const fallbackUrl = new URL(`${NOMINATIM}/search`);
    fallbackUrl.searchParams.set('format', 'jsonv2');
    fallbackUrl.searchParams.set('q', `${q} country`);
    fallbackUrl.searchParams.set('limit', '8');
    fallbackUrl.searchParams.set('accept-language', 'en');
    const fallbackRes = await fetch(fallbackUrl.toString(), {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    });
    if (fallbackRes.ok) {
      filtered = (await fallbackRes.json()) as NominatimHit[];
    }
  }

  const results = filtered.slice(0, 8).map((hit) => ({
    osmId: hit.osm_id,
    osmType: hit.osm_type,
    name: hit.name || hit.display_name.split(',')[0],
    label: hit.display_name,
  }));

  const body = { results };
  searchCache.set(key, { at: Date.now(), body });
  return NextResponse.json(body);
}
