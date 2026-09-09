import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jsonMissingDatabase } from '@/app/lib/api-response';
import { requireStaff } from '@/app/lib/require-auth';

// GET /api/resources - Get all resources
export async function GET() {
  try {
    const missingDb = jsonMissingDatabase([]);
    if (missingDb) return missingDb;

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
    const auth = await requireStaff();
    if (auth.error) return auth.error;

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
