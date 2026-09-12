import { NextRequest, NextResponse } from 'next/server';
import type { HeritageDomain, HeritageEra, HeritageGeometry, HeritagePresence } from '@prisma/client';
import { db } from '@/app/lib/db';
import { jsonUnknownFailure } from '@/app/lib/api-response';
import { requireStaff } from '@/app/lib/require-auth';

const ERAS = new Set(['WW1', 'WW2', 'COLD_WAR']);
const GEOMETRIES = new Set(['POINT', 'LINE', 'AREA']);
const PRESENCES = new Set(['PRESENT', 'POSSIBLE', 'ABSENT', 'REMNANT', 'GONE', 'UNKNOWN']);
const DOMAINS = new Set(['MILITARY', 'CIVIL', 'COMBINED']);

function asEnum<T extends string>(value: unknown, allowed: Set<string>): T | undefined {
  if (typeof value !== 'string') return undefined;
  const upper = value.toUpperCase();
  if (allowed.has(upper)) return upper as T;
  return undefined;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    const era = asEnum<HeritageEra>(body.era, ERAS);
    const geometry = asEnum<HeritageGeometry>(body.geometry, GEOMETRIES);
    const presence = asEnum<HeritagePresence>(body.presence, PRESENCES);
    const domain = asEnum<HeritageDomain>(body.domain, DOMAINS);

    if (era) data.era = era;
    if (geometry) data.geometry = geometry;
    if (presence) data.presence = presence;
    if (body.domain === null || body.domain === '') data.domain = null;
    else if (domain) data.domain = domain;
    if (body.coordinates !== undefined) data.coordinates = body.coordinates;
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.description !== undefined) data.description = body.description || null;
    if (body.category !== undefined) data.category = body.category || null;
    if (body.function !== undefined) data.function = body.function || null;
    if (body.featureType !== undefined) data.featureType = body.featureType || null;
    if (body.lineKind !== undefined) data.lineKind = body.lineKind || null;
    if (body.ensemble !== undefined) data.ensemble = body.ensemble || null;
    if (body.builder !== undefined) data.builder = body.builder || null;
    if (body.historicalUser !== undefined) data.historicalUser = body.historicalUser || null;
    if (body.accessibility !== undefined) data.accessibility = body.accessibility || null;
    if (body.visibilityNote !== undefined) data.visibilityNote = body.visibilityNote || null;
    if (typeof body.isPublic === 'boolean') data.isPublic = body.isPublic;
    if (typeof body.visible === 'boolean') data.visible = body.visible;
    if (body.color !== undefined) data.color = body.color || null;
    if (body.size !== undefined) data.size = typeof body.size === 'number' ? body.size : null;

    const feature = await db.heritageFeature.update({
      where: { id },
      data,
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Error updating heritage feature:', error);
    return jsonUnknownFailure(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { id } = await params;
    await db.heritageFeature.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting heritage feature:', error);
    return jsonUnknownFailure(error);
  }
}
