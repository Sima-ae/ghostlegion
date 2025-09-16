import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// PUT /api/routes/[id] - Update a route
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, startLocation, endLocation, waypoints, estimatedTime, status, capacity, transportType, priority } = body;

    const route = await prisma.evacuationRoute.update({
      where: { id },
      data: {
        name,
        startLocation,
        endLocation,
        waypoints: waypoints || [],
        estimatedTime,
        status: status || 'OPEN',
        capacity,
        transportType: transportType || 'VEHICLE',
        priority: priority || 'MEDIUM',
        updatedAt: new Date()
      }
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error('Error updating route:', error);
    return NextResponse.json(
      { error: 'Failed to update route' },
      { status: 500 }
    );
  }
}

// DELETE /api/routes/[id] - Delete a route
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.evacuationRoute.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting route:', error);
    return NextResponse.json(
      { error: 'Failed to delete route' },
      { status: 500 }
    );
  }
}
