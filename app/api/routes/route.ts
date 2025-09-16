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
    
    const route = await prisma.evacuationRoute.create({
      data: {
        name: body.name,
        startLocation: body.startLocation,
        endLocation: body.endLocation,
        waypoints: body.waypoints || [],
        estimatedTime: body.estimatedTime,
        status: body.status || 'OPEN',
        capacity: body.capacity,
        transportType: body.transportType || 'VEHICLE',
        priority: body.priority || 'MEDIUM'
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
