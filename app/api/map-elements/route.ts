import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';
import { jsonDbNotConfigured, jsonDbFailure, jsonUnknownFailure } from '@/app/lib/api-response';

// GET /api/map-elements - Get all map elements
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return jsonDbNotConfigured();
    }

    const mapElements = await db.mapElement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mapElements, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, coordinates, color, size, label, description, risk, category } = body;

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
        createdBy: session.user.id
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
