import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await request.json();

    const followup = await prisma.followup.findFirst({
      where: {
        id,
        organizationId: session.organization.id,
      },
    });

    if (!followup) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    }

    const updated = await prisma.followup.update({
      where: { id },
      data: {
        status: body.status || 'COMPLETED',
        completedAt: body.status === 'COMPLETED' ? new Date() : null,
      },
    });

    // Record activity log
    await prisma.activityLog.create({
      data: {
        organizationId: session.organization.id,
        customerId: followup.customerId,
        actionType: 'FOLLOWUP_COMPLETED',
        description: `Marked follow-up "${followup.title}" as ${body.status || 'COMPLETED'}`,
      },
    });

    return NextResponse.json({ followup: updated });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json({ error: 'Failed to update follow-up' }, { status: 500 });
  }
}
