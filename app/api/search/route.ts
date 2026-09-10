import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { LocationType, Prisma } from '@prisma/client';
import { db } from '@/app/lib/db';
import { jsonMissingDatabase, jsonUnknownFailure } from '@/app/lib/api-response';
import { authOptions } from '@/app/lib/auth';
import { isStaffRole } from '@/app/lib/require-auth';
import { ANONYMOUS_LABEL } from '@/app/types';
import { elementFocusLatLng, isCountryOutline } from '@/app/lib/map-geometry';
import type { SearchHit, SearchHitType } from '@/app/lib/search';
import { placeMatchScore, searchNeedles } from '@/app/lib/search';

export type { SearchHit, SearchHitType };

const LOCATION_TYPES = [
  'BUNKER',
  'FORTRESS',
  'HIDING_PLACE',
  'EVACUATION_CENTER',
  'MEDICAL_FACILITY',
  'COMMAND_CENTER',
  'SUPPLY_DEPOT',
] as const;

function asLatLng(coordinates: unknown): [number, number] | null {
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const lat = Number(coordinates[0]);
    const lng = Number(coordinates[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }
  if (coordinates && typeof coordinates === 'object') {
    const rec = coordinates as { lat?: unknown; lng?: unknown };
    const lat = Number(rec.lat);
    const lng = Number(rec.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
  }
  return null;
}

function snippet(text: string, max = 72) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export async function GET(request: NextRequest) {
  try {
    const missingDb = jsonMissingDatabase({ results: [] });
    if (missingDb) return missingDb;

    const q = request.nextUrl.searchParams.get('q')?.trim() || '';
    if (q.length < 2) {
      return NextResponse.json({ results: [] as SearchHit[] });
    }

    const needles = searchNeedles(q);
    const matchedTypes = LOCATION_TYPES.filter((type) => {
      const label = type.replaceAll('_', ' ').toLowerCase();
      return needles.some(
        (needle) => label.includes(needle.toLowerCase()) || type.toLowerCase().includes(needle.toLowerCase())
      );
    });

    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      session = null;
    }
    const staff = isStaffRole(session?.user?.role);
    const userId = session?.user?.id;
    const results: SearchHit[] = [];

    const locationOr: Prisma.LocationWhereInput[] = needles.flatMap((needle) => [
      { name: { contains: needle } },
      { description: { contains: needle } },
      { contact: { contains: needle } },
    ]);
    if (matchedTypes.length) {
      locationOr.push({ type: { in: [...matchedTypes] as LocationType[] } });
    }

    const elementOr: Prisma.MapElementWhereInput[] = needles.flatMap((needle) => [
      { label: { contains: needle } },
      { description: { contains: needle } },
    ]);

    const [locations, elements, memos] = await Promise.all([
      db.location.findMany({
        where: {
          AND: [
            session?.user ? {} : { isPublic: true },
            { OR: locationOr },
          ],
        },
        take: 20,
        orderBy: { name: 'asc' },
      }),
      db.mapElement.findMany({
        where: {
          AND: [
            staff ? {} : { visible: true },
            { OR: elementOr },
          ],
        },
        take: 60,
        orderBy: { label: 'asc' },
      }),
      db.mapMemo.findMany({
        where: {
          AND: [
            { status: 'APPROVED' },
            staff
              ? {}
              : userId
                ? { OR: [{ isPrivate: false }, { createdBy: userId }] }
                : { isPrivate: false },
            {
              OR: [
                { body: { contains: q } },
                staff
                  ? { createdByName: { contains: q } }
                  : { AND: [{ isAnonymous: false }, { createdByName: { contains: q } }] },
              ],
            },
          ],
        },
        take: 12,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let locationCount = 0;
    let countryCount = 0;
    let elementCount = 0;
    let memoCount = 0;

    for (const location of locations) {
      const coords = asLatLng(location.coordinates);
      if (!coords) continue;
      const typeLabel = String(location.type || '').replaceAll('_', ' ').toLowerCase();
      results.push({
        type: 'location',
        id: location.id,
        title: location.name,
        subtitle: typeLabel || 'Location',
        lat: coords[0],
        lng: coords[1],
      });
      locationCount += 1;
      if (locationCount >= 6) break;
    }

    for (const element of elements) {
      const country = isCountryOutline(element);
      const name = element.label || element.description?.replace(/^Country outline:\s*/i, '') || '';
      const score = placeMatchScore(name, q);
      if (score > 4) continue;
      if (country && countryCount >= 6) continue;
      if (!country && elementCount >= 4) continue;
      const coords = elementFocusLatLng(element.coordinates);
      if (!coords) continue;
      const label = element.label || (country ? 'Country' : 'Map element');
      results.push({
        type: country ? 'country' : 'element',
        id: element.id,
        title: label,
        subtitle: country ? 'Country' : element.category || element.type.toLowerCase(),
        lat: coords[0],
        lng: coords[1],
      });
      if (country) countryCount += 1;
      else elementCount += 1;
    }

    for (const memo of memos) {
      const author = memo.isAnonymous
        ? ANONYMOUS_LABEL
        : memo.createdByName || (memo.createdBy === 'visitor' ? 'Visitor' : 'Member');
      results.push({
        type: 'memo',
        id: memo.id,
        title: snippet(memo.body),
        subtitle: author,
        lat: memo.latitude,
        lng: memo.longitude,
      });
      memoCount += 1;
      if (memoCount >= 6) break;
    }

    const order: SearchHitType[] = ['country', 'location', 'memo', 'element'];
    results.sort((a, b) => {
      const byType = order.indexOf(a.type) - order.indexOf(b.type);
      if (byType !== 0) return byType;
      const byScore = placeMatchScore(a.title, q) - placeMatchScore(b.title, q);
      if (byScore !== 0) return byScore;
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json(
      { results: results.slice(0, 16) },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('Error searching:', error);
    return jsonUnknownFailure(error);
  }
}
