import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { organizationId: session.organization.id },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, serviceName, startTime, price, notes } = body;

    if (!customerId || !serviceName || !startTime) {
      return NextResponse.json(
        { error: 'Customer, Service, and Start Time are required.' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: session.organization.id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const appointment = await prisma.appointment.create({
      data: {
        organizationId: session.organization.id,
        customerId,
        assignedToId: session.user.id,
        serviceName: serviceName.trim(),
        startTime: new Date(startTime),
        price: Number(price) || 0,
        notes: notes?.trim() || null,
        status: 'SCHEDULED',
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        organizationId: session.organization.id,
        customerId,
        actionType: 'APPOINTMENT_BOOKED',
        description: `Booked appointment for "${serviceName.trim()}" on ${new Date(startTime).toLocaleString('en-IN')}`,
      },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
