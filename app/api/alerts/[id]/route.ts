import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// PUT /api/alerts/[id] - Update an alert
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, message, severity, type, location, expiresAt } = body;

    // Convert string values to enums if provided
    const updateData: any = {
      title,
      message,
      location,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      updatedAt: new Date()
    };

    if (severity) {
      updateData.severity = severity.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }

    if (type) {
      updateData.type = type.toUpperCase() as 'SECURITY' | 'MEDICAL' | 'WEATHER' | 'WARNING' | 'TRANSPORT' | 'INFRASTRUCTURE';
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

// DELETE /api/alerts/[id] - Delete an alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.alert.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}
