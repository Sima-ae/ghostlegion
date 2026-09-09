import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/app/lib/db';
import { jsonMissingDatabase, jsonDbFailure, jsonUnknownFailure } from '@/app/lib/api-response';
import { authOptions } from '@/app/lib/auth';
import { isStaffRole, requireStaff } from '@/app/lib/require-auth';

// GET /api/map-elements — public map only sees visible elements
export async function GET() {
  try {
    const missingDb = jsonMissingDatabase([]);
    if (missingDb) return missingDb;

    const session = await getServerSession(authOptions);
    const staff = isStaffRole(session?.user?.role);

    const mapElements = await db.mapElement.findMany({
      where: staff ? undefined : { visible: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mapElements, {
      headers: {
        'Cache-Control': staff
          ? 'private, no-store'
          : 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Error fetching map elements:', error);
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

// POST /api/map-elements - Create a new map element
export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { type, coordinates, color, size, label, description, risk, category, visible } = body;

    if (!type || !coordinates || !color) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert string type to MapElementType enum
    const mapElementType = type.toUpperCase() as 'POLYGON' | 'POLYLINE' | 'CIRCLE' | 'MARKER';

    const mapElement = await db.mapElement.create({
      data: {
        type: mapElementType,
        coordinates,
        color,
        size,
        label,
        description,
        risk: risk ? risk.toUpperCase() : 'LOW',
        category,
        visible: visible !== false,
        createdBy: auth.session.user.id
      }
    });

    return NextResponse.json(mapElement, { status: 201 });
  } catch (error) {
    console.error('Error creating map element:', error);
    return NextResponse.json(
      { error: 'Failed to create map element' },
      { status: 500 }
    );
  }
}
