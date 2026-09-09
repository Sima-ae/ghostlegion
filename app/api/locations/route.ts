import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { jsonMissingDatabase, jsonDbFailure, jsonUnknownFailure } from '@/app/lib/api-response';
import { asStringArray } from '@/app/lib/json-array';
import { requireStaff } from '@/app/lib/require-auth';

// GET /api/locations - Get all locations
export async function GET() {
  try {
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch {
      // Continue without session — public locations only
    }

    const missingDb = jsonMissingDatabase();
    if (missingDb) return missingDb;

    let whereClause: { isPublic?: boolean } | Record<string, never> = {};

    if (!session?.user) {
      whereClause = { isPublic: true };
    } else {
      whereClause = {};
    }

    const locations = await db.location.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // Normalize coordinates format for consistency
    const normalizedLocations = locations.map(location => {
      let coordinates = location.coordinates;
      
      // Convert object format {lat, lng} to array format [lat, lng]
      if (typeof coordinates === 'object' && coordinates !== null && 'lat' in coordinates && 'lng' in coordinates) {
        const coordObj = coordinates as { lat: number; lng: number };
        coordinates = [coordObj.lat, coordObj.lng];
      }
      
      return {
        ...location,
        coordinates,
        facilities: asStringArray(location.facilities),
      };
    });

    const cacheControl = session?.user
      ? 'private, max-age=30'
      : 'public, s-maxage=120, stale-while-revalidate=300';

    return NextResponse.json(normalizedLocations, {
      headers: { 'Cache-Control': cacheControl },
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    if (error instanceof Error) {
      if (
        error.message.includes('DATABASE_URL') ||
        error.message.includes('connection')
      ) {
        return jsonDbFailure();
      }
    }
    return jsonUnknownFailure(error);
  }
}

// POST /api/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { 
      name, 
      type, 
      coordinates, 
      description, 
      capacity, 
      status, 
      facilities, 
      contact, 
      isPublic = true 
    } = body;

    if (!name || !type || !coordinates || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const location = await db.location.create({
      data: {
        name,
        type: type.toUpperCase(),
        coordinates: Array.isArray(coordinates) ? coordinates : [coordinates.lat, coordinates.lng],
        description,
        capacity: capacity ? parseInt(capacity) : null,
        status: status ? status.toUpperCase() : 'ACTIVE',
        facilities: facilities || [],
        contact: contact || null,
        isPublic: isPublic === true || isPublic === 'true'
      }
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
