import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

// GET /api/map-elements - Get all map elements
export async function GET() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { 
          error: 'Database not configured',
          message: 'DATABASE_URL environment variable is not set. Please configure your database connection.',
        },
        { status: 500 }
      );
    }

    const mapElements = await db.mapElement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(mapElements);
  } catch (error) {
    console.error('Error fetching map elements:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL') || error.message.includes('connection')) {
        return NextResponse.json(
          { 
            error: 'Database connection error',
            message: 'Please ensure DATABASE_URL is set in your environment variables',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch map elements',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
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
