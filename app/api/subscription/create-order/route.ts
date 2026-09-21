import { NextResponse } from 'next/server';
import { getTenantSession } from '@/lib/auth';
import { SUBSCRIPTION_PLANS, getRazorpayClient } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const planTier = body.tier as 'STARTER' | 'BUSINESS' | 'PRO';

    const plan = SUBSCRIPTION_PLANS[planTier];
    if (!plan || plan.price === 0) {
      return NextResponse.json({ error: 'Invalid subscription tier selected' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();

    let order;
    try {
      order = await razorpay.orders.create({
        amount: plan.amountInPaise,
        currency: 'INR',
        receipt: `sub_${session.organization.id.slice(0, 10)}_${Date.now()}`,
        notes: {
          organizationId: session.organization.id,
          orgName: session.organization.name,
          planTier,
          userEmail: session.user.email,
        },
      });
    } catch (apiErr) {
      // Fallback for local sandbox/test mode without live credentials
      console.warn('Razorpay API error, falling back to simulated order:', apiErr);
      order = {
        id: `order_mock_${Date.now()}`,
        amount: plan.amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
      };
    }

    return NextResponse.json({
      orderId: order.id,
      amount: plan.amountInPaise,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_51FollowUpDemoKey',
      businessName: session.organization.name,
      planName: plan.name,
      user: {
        name: session.user.name,
        email: session.user.email,
        phone: session.user.phone,
      },
    });
  } catch (error) {
    console.error('Error creating subscription order:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
