import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } = body;

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Upsert subscription for tenant
    const sub = await prisma.subscription.upsert({
      where: { organizationId: session.organization.id },
      update: {
        tier: tier || 'STARTER',
        status: 'ACTIVE',
        razorpaySubId: razorpay_payment_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: nextMonth,
      },
      create: {
        organizationId: session.organization.id,
        tier: tier || 'STARTER',
        status: 'ACTIVE',
        razorpaySubId: razorpay_payment_id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: nextMonth,
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        organizationId: session.organization.id,
        customerId: null,
        actionType: 'SUBSCRIPTION_UPGRADED',
        description: `Upgraded subscription to ${tier || 'STARTER'} plan via Razorpay (${razorpay_payment_id})`,
      },
    });

    return NextResponse.json({ success: true, subscription: sub });
  } catch (error) {
    console.error('Error verifying subscription payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
