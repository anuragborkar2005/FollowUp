import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const followups = await prisma.followup.findMany({
      where: {
        organizationId: session.organization.id,
        ...(status !== 'ALL' ? { status: status as any } : {}),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            pendingBalance: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ followups });
  } catch (error) {
    console.error('Error listing follow-ups:', error);
    return NextResponse.json({ error: 'Failed to list follow-ups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, title, dueDate, priority, notes } = body;

    if (!customerId || !title || !dueDate) {
      return NextResponse.json(
        { error: 'Customer, Title, and Due Date are required.' },
        { status: 400 }
      );
    }

    // Verify tenant owns customer
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: session.organization.id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const followup = await prisma.followup.create({
      data: {
        organizationId: session.organization.id,
        customerId,
        assignedToId: session.user.id,
        title: title.trim(),
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        notes: notes?.trim() || null,
        status: 'PENDING',
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        organizationId: session.organization.id,
        customerId,
        actionType: 'FOLLOWUP_SET',
        description: `Scheduled follow-up: "${title.trim()}" for ${new Date(dueDate).toLocaleString('en-IN')}`,
      },
    });

    return NextResponse.json({ followup }, { status: 201 });
  } catch (error) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json({ error: 'Failed to create follow-up' }, { status: 500 });
  }
}
