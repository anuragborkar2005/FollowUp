import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { organizationId: session.organization.id },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, totalAmount, paidAmount, paymentMethod, notes } = body;

    const total = Number(totalAmount) || 0;
    const paid = Number(paidAmount) || 0;
    const pending = Math.max(0, total - paid);

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, organizationId: session.organization.id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Determine status
    let status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' = 'PAID';
    if (paid === 0) status = 'PENDING';
    else if (pending > 0) status = 'PARTIALLY_PAID';

    // Create payment in transaction
    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          organizationId: session.organization.id,
          customerId,
          totalAmount: total,
          paidAmount: paid,
          pendingAmount: pending,
          status,
          paymentMethod: paymentMethod || 'UPI',
          notes: notes?.trim() || null,
        },
      }),
      // Update customer totalSpent and pendingBalance
      prisma.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: { increment: paid },
          pendingBalance: {
            increment: pending,
          },
        },
      }),
      // Create activity log
      prisma.activityLog.create({
        data: {
          organizationId: session.organization.id,
          customerId,
          actionType: 'PAYMENT_RECEIVED',
          description: `Logged payment of ₹${paid} (${paymentMethod || 'UPI'})${
            pending > 0 ? `, pending balance ₹${pending}` : ''
          }`,
        },
      }),
    ]);

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
