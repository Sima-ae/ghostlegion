import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { db } from '@/app/lib/db';

// GET /api/alerts - Get all alerts
export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create a new alert
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
    const { title, message, severity, type, location, expiresAt } = body;

    if (!title || !message || !severity || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert string values to enums
    const alertSeverity = severity.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    const alertType = type.toUpperCase() as 'SECURITY' | 'EVACUATION' | 'MEDICAL' | 'LOGISTICS' | 'GENERAL';

    const alert = await db.alert.create({
      data: {
        title,
        message,
        severity: alertSeverity,
        type: alertType,
        location: location || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        acknowledgedBy: []
      }
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
