import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

// GET /api/locations - Get all locations
export async function GET(request: NextRequest) {
  try {
    let session = null;
    try {
      session = await getServerSession(authOptions);
    } catch (sessionError) {
      console.log('Session error (continuing without session):', sessionError);
      // Continue without session - will show only public locations
    }
    
    const url = new URL(request.url);
    const includePrivate = url.searchParams.get('includePrivate') === 'true';
    
    console.log('API Debug - Session:', session?.user?.id || 'No session');
    console.log('API Debug - IncludePrivate:', includePrivate);

    let whereClause: any = {};

    // If user is not logged in, only show public locations
    if (!session?.user) {
      whereClause.isPublic = true;
      console.log('API Debug - Showing only public locations');
    } else {
      console.log('API Debug - Showing all locations for logged-in user');
    }
    
    // Temporary fix: if includePrivate=true, show all locations regardless of session
    if (includePrivate) {
      whereClause = {};
      console.log('API Debug - Force showing all locations due to includePrivate=true');
    }

    const locations = await db.location.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('API Debug - Found locations:', locations.length);

    // Normalize coordinates format for consistency
    const normalizedLocations = locations.map(location => {
      let coordinates = location.coordinates;
      
      // Convert object format {lat, lng} to array format [lat, lng]
      if (typeof coordinates === 'object' && coordinates !== null && 'lat' in coordinates && 'lng' in coordinates) {
        const coordObj = coordinates as { lat: number; lng: number };
        coordinates = [coordObj.lat, coordObj.lng];
      }
      
      return {
        ...location,
        coordinates
      };
    });

    return NextResponse.json(normalizedLocations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}

// POST /api/locations - Create a new location
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
    const { 
      name, 
      type, 
      coordinates, 
      description, 
      capacity, 
      status, 
      facilities, 
      contact, 
      isPublic = true 
    } = body;

    if (!name || !type || !coordinates || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const location = await db.location.create({
      data: {
        name,
        type: type.toUpperCase(),
        coordinates: Array.isArray(coordinates) ? coordinates : [coordinates.lat, coordinates.lng],
        description,
        capacity: capacity ? parseInt(capacity) : null,
        status: status ? status.toUpperCase() : 'ACTIVE',
        facilities: facilities || [],
        contact: contact || null,
        isPublic: isPublic === true || isPublic === 'true'
      }
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}
