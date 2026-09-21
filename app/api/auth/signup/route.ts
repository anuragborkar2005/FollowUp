import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { setSessionCookie } from '@/lib/session';
import { normalizeIndianPhone } from '@/lib/phone';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, businessName, businessCategory, businessPhone, city } = body;

    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { error: 'Name, email, password, and business name are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please login.' },
        { status: 409 }
      );
    }

    const cleanPhone = normalizeIndianPhone(businessPhone) || '9823012345';
    const passwordHash = await bcrypt.hash(password, 10);

    // Create unique slug
    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'business';
    let slug = baseSlug;
    let count = 1;
    while (await prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    // Execute transaction to create User, Org, Member, Subscription, and Templates
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          phone: cleanPhone,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: businessName.trim(),
          slug,
          category: businessCategory || 'Service Business',
          phone: cleanPhone,
          city: city?.trim() || null,
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: 'OWNER',
        },
      });

      // Starter subscription
      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          tier: 'FREE',
          status: 'TRIAL',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
        },
      });

      // Default Templates
      await tx.messageTemplate.createMany({
        data: [
          {
            organizationId: organization.id,
            title: 'Appointment Reminder',
            category: 'REMINDER',
            body: 'Namaste {{customer_name}} ji! Reminder from {{business_name}} regarding your appointment for {{service_name}} on {{appointment_date}} at {{appointment_time}}. Please reply YES to confirm.',
            isDefault: true,
          },
          {
            organizationId: organization.id,
            title: 'Payment Due Reminder',
            category: 'KHATA',
            body: 'Namaste {{customer_name}} ji, gentle reminder from {{business_name}}: pending balance of ₹{{pending_amount}} is due. You can pay via UPI to {{owner_phone}}. Thank you!',
            isDefault: true,
          },
          {
            organizationId: organization.id,
            title: 'Re-engagement Follow-up',
            category: 'FOLLOWUP',
            body: 'Hello {{customer_name}}! It has been a while since your last visit to {{business_name}}. Would you like to schedule an appointment this week?',
            isDefault: true,
          },
        ],
      });

      return { user, organization };
    });

    // Set auth session cookie
    await setSessionCookie({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      organizationId: result.organization.id,
      orgSlug: result.organization.slug,
      role: 'OWNER',
    });

    return NextResponse.json({
      success: true,
      user: { id: result.user.id, name: result.user.name, email: result.user.email },
      organization: { id: result.organization.id, name: result.organization.name, slug: result.organization.slug },
    }, { status: 201 });
  } catch (error) {
    console.error('Error during signup:', error);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
