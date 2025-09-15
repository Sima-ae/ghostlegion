import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

// GET /api/map-elements - Get all map elements
export async function GET() {
  try {
    const mapElements = await db.mapElement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(mapElements);
  } catch (error) {
    console.error('Error fetching map elements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch map elements' },
      { status: 500 }
    );
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
