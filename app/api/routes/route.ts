import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const routes = await prisma.evacuationRoute.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch routes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      startLocation,
      endLocation,
      waypoints,
      estimatedTime,
      status,
      capacity,
      transportType,
      priority,
      enableNotifications,
      isPriorityRoute,
      allowReverseDirection,
      requiresEscort,
      showDemoOverlay
    } = body;
    
    const route = await prisma.evacuationRoute.create({
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
        enableNotifications: enableNotifications || false,
        isPriorityRoute: isPriorityRoute || false,
        allowReverseDirection: allowReverseDirection || false,
        requiresEscort: requiresEscort || false,
        showDemoOverlay: showDemoOverlay || false
      }
    });

    return NextResponse.json(route);
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json(
      { error: 'Failed to create route' },
      { status: 500 }
    );
  }
}
