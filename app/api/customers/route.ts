import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';
import { normalizeIndianPhone } from '@/lib/phone';

export async function GET(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search')?.trim();
    const status = searchParams.get('status');

    const whereClause: Record<string, unknown> = {
      organizationId: session.organization.id,
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query } },
        { notes: { contains: query, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: {
        followups: {
          where: { status: 'PENDING' },
          orderBy: { dueDate: 'asc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const cleanPhone = normalizeIndianPhone(body.phone);

    if (!cleanPhone) {
      return NextResponse.json(
        { error: 'Invalid Indian phone number. Must be 10 digits starting with 6-9.' },
        { status: 400 }
      );
    }

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Customer name is required.' }, { status: 400 });
    }

    // Check if phone already exists in this tenant
    const existing = await prisma.customer.findUnique({
      where: {
        organizationId_phone: {
          organizationId: session.organization.id,
          phone: cleanPhone,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `A customer with phone +91 ${cleanPhone} already exists: ${existing.name}` },
        { status: 409 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        organizationId: session.organization.id,
        name: body.name.trim(),
        phone: cleanPhone,
        email: body.email?.trim() || null,
        notes: body.notes?.trim() || null,
        tags: body.tags || ['Regular'],
        status: body.status || 'NEW',
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        organizationId: session.organization.id,
        customerId: customer.id,
        actionType: 'CREATED',
        description: `Customer ${customer.name} created`,
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
