import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTenantSession } from '@/lib/auth';
import { normalizeIndianPhone } from '@/lib/phone';
import { parseCSV, mapCSVToCustomerRows, ParsedCustomerRow } from '@/lib/csv';
import { SUBSCRIPTION_PLANS } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const session = await getTenantSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let records: ParsedCustomerRow[] = [];

    if (body.csvText && typeof body.csvText === 'string') {
      const parsedRows = parseCSV(body.csvText);
      const mapped = mapCSVToCustomerRows(parsedRows);
      records = mapped.records;
    } else if (Array.isArray(body.customers)) {
      records = body.customers;
    } else {
      return NextResponse.json(
        { error: 'Invalid payload. Provide "csvText" string or "customers" array.' },
        { status: 400 }
      );
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No valid customer rows found in the provided CSV.' },
        { status: 400 }
      );
    }

    // Check organization subscription tier limits
    const sub = await prisma.subscription.findUnique({
      where: { organizationId: session.organization.id },
    });
    const currentTier = sub?.tier || 'FREE';
    const planConfig = SUBSCRIPTION_PLANS[currentTier] || SUBSCRIPTION_PLANS.FREE;
    const customerLimit = planConfig.customerLimit;

    const currentCustomerCount = await prisma.customer.count({
      where: { organizationId: session.organization.id },
    });

    if (typeof customerLimit === 'number' && currentCustomerCount >= customerLimit) {
      return NextResponse.json(
        {
          error: `Your current ${planConfig.name} plan limit of ${customerLimit} customers has been reached. Please upgrade to import more contacts.`,
        },
        { status: 403 }
      );
    }

    // Fetch existing phone numbers in one query for ultra-fast deduplication
    const existingCustomers = await prisma.customer.findMany({
      where: { organizationId: session.organization.id },
      select: { phone: true },
    });
    const existingPhoneSet = new Set(existingCustomers.map((c) => c.phone));

    const imported: { name: string; phone: string }[] = [];
    const skipped: { name: string; phone: string; reason: string }[] = [];
    const errors: { name: string; phone: string; reason: string }[] = [];

    const toCreate: Array<{
      organizationId: string;
      name: string;
      phone: string;
      notes: string | null;
      tags: string[];
      pendingBalance: number;
      status: 'NEW' | 'ACTIVE';
    }> = [];

    for (const record of records) {
      const rawName = record.name?.trim() || '';
      const rawPhone = record.phone?.trim() || '';

      if (!rawName) {
        errors.push({ name: rawName, phone: rawPhone, reason: 'Customer name is missing.' });
        continue;
      }

      const cleanPhone = normalizeIndianPhone(rawPhone);
      if (!cleanPhone) {
        errors.push({
          name: rawName,
          phone: rawPhone,
          reason: 'Invalid Indian phone number. Must be 10 digits starting with 6-9.',
        });
        continue;
      }

      if (existingPhoneSet.has(cleanPhone)) {
        skipped.push({
          name: rawName,
          phone: cleanPhone,
          reason: 'Already exists in your customer directory.',
        });
        continue;
      }

      // Check plan limit capacity during batch
      if (
        typeof customerLimit === 'number' &&
        currentCustomerCount + toCreate.length >= customerLimit
      ) {
        skipped.push({
          name: rawName,
          phone: cleanPhone,
          reason: `Plan limit of ${customerLimit} customers reached.`,
        });
        continue;
      }

      // Mark as seen so duplicates in the same CSV are caught
      existingPhoneSet.add(cleanPhone);

      toCreate.push({
        organizationId: session.organization.id,
        name: rawName,
        phone: cleanPhone,
        notes: record.notes?.trim() || null,
        tags: record.tags && record.tags.length > 0 ? record.tags : ['Imported'],
        pendingBalance: record.pendingBalance && record.pendingBalance > 0 ? record.pendingBalance : 0,
        status: 'NEW',
      });

      imported.push({ name: rawName, phone: cleanPhone });
    }

    if (toCreate.length > 0) {
      await prisma.customer.createMany({
        data: toCreate,
      });

      // Log organization activity
      await prisma.activityLog.create({
        data: {
          organizationId: session.organization.id,
          customerId: null,
          actionType: 'BULK_IMPORT',
          description: `Bulk imported ${toCreate.length} customer(s) from CSV`,
          metadata: {
            importedCount: toCreate.length,
            skippedCount: skipped.length,
            errorCount: errors.length,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      importedCount: toCreate.length,
      skippedCount: skipped.length,
      errorCount: errors.length,
      imported,
      skipped,
      errors,
    });
  } catch (error) {
    console.error('Error importing customers:', error);
    return NextResponse.json({ error: 'Failed to process customer import.' }, { status: 500 });
  }
}
