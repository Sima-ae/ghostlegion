import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jsonMissingDatabase } from '@/app/lib/api-response';
import { requireStaff } from '@/app/lib/require-auth';

// GET /api/alerts - Get all alerts
export async function GET() {
  try {
    const missingDb = jsonMissingDatabase([]);
    if (missingDb) return missingDb;

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
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { 
      title, 
      message, 
      severity, 
      type, 
      location, 
      expiresAt,
      notifyUsers,
      isUrgent,
      autoResolve,
      requiresAcknowledgment,
      showDemoOverlay
    } = body;

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
        acknowledgedBy: [],
        notifyUsers: notifyUsers || false,
        isUrgent: isUrgent || false,
        autoResolve: autoResolve || false,
        requiresAcknowledgment: requiresAcknowledgment || false,
        showDemoOverlay: showDemoOverlay || false
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
