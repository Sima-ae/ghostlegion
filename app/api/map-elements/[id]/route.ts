import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

// PUT /api/map-elements/[id] - Update a map element
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, coordinates, color, size, label, description } = body;

    // Convert string type to MapElementType enum if provided
    const updateData: any = {
      coordinates,
      color,
      size,
      label,
      description,
      updatedAt: new Date()
    };

    if (type) {
      updateData.type = type.toUpperCase() as 'POLYGON' | 'POLYLINE' | 'CIRCLE' | 'MARKER';
    }

    const mapElement = await db.mapElement.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(mapElement);
  } catch (error) {
    console.error('Error updating map element:', error);
    return NextResponse.json(
      { error: 'Failed to update map element' },
      { status: 500 }
    );
  }
}

// DELETE /api/map-elements/[id] - Delete a map element
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await db.mapElement.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting map element:', error);
    return NextResponse.json(
      { error: 'Failed to delete map element' },
      { status: 500 }
    );
  }
}
