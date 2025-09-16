import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const people = await prisma.people.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const person = await prisma.people.create({
      data: {
        name: body.name,
        role: body.role,
        department: body.department,
        status: body.status || 'ACTIVE',
        location: body.location,
        skills: body.skills || [],
        contact: body.contact,
        clearanceLevel: body.clearanceLevel || 'PUBLIC'
      }
    });

    return NextResponse.json(person);
  } catch (error) {
    console.error('Error creating person:', error);
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    );
  }
}
