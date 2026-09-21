import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: customerId } = await props.params;
    const body = await request.json();

    if (!body.note || typeof body.note !== 'string') {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    // Verify tenant owns this customer
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId: session.organization.id,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Append to customer notes
    const updatedNotes = customer.notes
      ? `${customer.notes}\n• ${body.note.trim()}`
      : `• ${body.note.trim()}`;

    await prisma.customer.update({
      where: { id: customerId },
      data: { notes: updatedNotes },
    });

    // Record activity log
    const log = await prisma.activityLog.create({
      data: {
        organizationId: session.organization.id,
        customerId,
        actionType: 'NOTE_ADDED',
        description: body.note.trim(),
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json({ error: 'Failed to add note' }, { status: 500 });
  }
}
