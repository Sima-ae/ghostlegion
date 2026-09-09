import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '../../../lib/prisma';
import { authOptions } from '@/app/lib/auth';
import { jsonMissingDatabase } from '@/app/lib/api-response';
import { isStaffRole, requireStaff } from '@/app/lib/require-auth';

export async function GET() {
  try {
    const missingDb = jsonMissingDatabase([]);
    if (missingDb) return missingDb;

    const session = await getServerSession(authOptions);
    const staff = isStaffRole(session?.user?.role);

    const people = await prisma.people.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(
      people.map((person) => ({
        ...person,
        skills: Array.isArray(person.skills) ? person.skills : [],
        contact: staff ? person.contact : null,
      }))
    );
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
    const auth = await requireStaff();
    if (auth.error) return auth.error;

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
