import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { HeritageEra, HeritageGeometry, HeritagePresence, HeritageDomain } from '@prisma/client';
import { db } from '@/app/lib/db';
import { jsonMissingDatabase, jsonUnknownFailure } from '@/app/lib/api-response';
import { authOptions } from '@/app/lib/auth';
import { isStaffRole, requireStaff } from '@/app/lib/require-auth';

const ERAS = new Set(['WW1', 'WW2', 'COLD_WAR']);
const GEOMETRIES = new Set(['POINT', 'LINE', 'AREA']);
const PRESENCES = new Set(['PRESENT', 'POSSIBLE', 'ABSENT', 'REMNANT', 'GONE', 'UNKNOWN']);
const DOMAINS = new Set(['MILITARY', 'CIVIL', 'COMBINED']);

function asEnum<T extends string>(value: unknown, allowed: Set<string>, fallback?: T): T | undefined {
  if (typeof value !== 'string') return fallback;
  const upper = value.toUpperCase();
  if (allowed.has(upper)) return upper as T;
  return fallback;
}

export async function GET(request: NextRequest) {
  try {
    const missingDb = jsonMissingDatabase([]);
    if (missingDb) return missingDb;

    const eraParam = request.nextUrl.searchParams.get('era')?.toUpperCase();
    const era = asEnum<HeritageEra>(eraParam, ERAS);
    if (!era) {
      return NextResponse.json({ error: 'era must be WW1, WW2 or COLD_WAR' }, { status: 400 });
    }

    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      session = null;
    }
    const staff = isStaffRole(session?.user?.role);

    const features = await db.heritageFeature.findMany({
      where: staff
        ? { era }
        : { era, visible: true, isPublic: true },
      orderBy: [{ geometry: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(features, {
      headers: {
        'Cache-Control': staff
          ? 'private, no-store'
          : 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching heritage features:', error);
    return jsonUnknownFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const body = await request.json();
    const era = asEnum<HeritageEra>(body.era, ERAS);
    const geometry = asEnum<HeritageGeometry>(body.geometry, GEOMETRIES);
    const presence = asEnum<HeritagePresence>(body.presence, PRESENCES, 'UNKNOWN');
    const domain = asEnum<HeritageDomain>(body.domain, DOMAINS);

    if (!era || !geometry || !body.coordinates || !String(body.name || '').trim()) {
      return NextResponse.json(
        { error: 'era, geometry, name, and coordinates are required' },
        { status: 400 }
      );
    }

    const feature = await db.heritageFeature.create({
      data: {
        era,
        geometry,
        coordinates: body.coordinates,
        name: String(body.name).trim(),
        description: body.description ? String(body.description) : null,
        presence: presence || 'UNKNOWN',
        domain: domain || null,
        category: body.category || null,
        function: body.function || null,
        featureType: body.featureType || null,
        lineKind: body.lineKind || null,
        ensemble: body.ensemble || null,
        builder: body.builder || null,
        historicalUser: body.historicalUser || null,
        accessibility: body.accessibility || null,
        visibilityNote: body.visibilityNote || null,
        isPublic: body.isPublic !== false,
        visible: body.visible !== false,
        color: body.color || null,
        size: typeof body.size === 'number' ? body.size : null,
        createdBy: auth.session.user.id,
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error('Error creating heritage feature:', error);
    return jsonUnknownFailure(error);
  }
}
