import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

// PUT /api/resources/[id] - Update a resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, type, quantity, unit, location, status, expiryDate } = body;

    // Convert string type to ResourceType enum if provided
    const updateData: any = {
      name,
      quantity: quantity ? parseInt(quantity) : undefined,
      unit,
      location,
      updatedAt: new Date()
    };

    if (type) {
      updateData.type = type.toUpperCase() as 'FOOD' | 'WATER' | 'MEDICAL' | 'FUEL' | 'AMMUNITION' | 'EQUIPMENT' | 'TRANSPORT';
    }

    if (status) {
      updateData.status = status.toUpperCase() as 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DAMAGED';
    }

    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    }

    const resource = await db.resource.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Error updating resource:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[id] - Delete a resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await db.resource.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
