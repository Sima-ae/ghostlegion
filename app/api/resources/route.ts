import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

// GET /api/resources - Get all resources
export async function GET() {
  try {
    const resources = await db.resource.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create a new resource
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
    const { name, type, quantity, unit, location, status, expiryDate } = body;

    if (!name || !type || !quantity || !unit || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert string type to ResourceType enum
    const resourceType = type.toUpperCase() as 'FOOD' | 'WATER' | 'MEDICAL' | 'FUEL' | 'AMMUNITION' | 'EQUIPMENT' | 'TRANSPORT';
    const resourceStatus = status ? status.toUpperCase() as 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DAMAGED' : 'AVAILABLE';

    const resource = await db.resource.create({
      data: {
        name,
        type: resourceType,
        quantity: parseInt(quantity),
        unit,
        location,
        status: resourceStatus,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
