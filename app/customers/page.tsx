import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { CustomersClient } from '@/components/customers/CustomersClient';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const session = await getTenantSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Tenant not initialized.</p>
      </div>
    );
  }

  const orgId = session.organization.id;

  const [customersRaw, templatesRaw] = await Promise.all([
    prisma.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: 'desc' },
      include: {
        followups: {
          where: { status: 'PENDING' },
          orderBy: { dueDate: 'asc' },
          take: 1,
        },
      },
    }),
    prisma.messageTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { isDefault: 'desc' },
    }),
  ]);

  const formattedCustomers = customersRaw.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    status: c.status,
    totalSpent: Number(c.totalSpent),
    pendingBalance: Number(c.pendingBalance),
    notes: c.notes,
    tags: c.tags,
    nextFollowupDate: c.followups?.[0]?.dueDate ? new Date(c.followups[0].dueDate).toISOString() : null,
    nextFollowupTitle: c.followups?.[0]?.title || null,
  }));

  const formattedTemplates = templatesRaw.map((t: any) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    body: t.body,
  }));

  return (
    <AppShell>
      <CustomersClient
        initialCustomers={formattedCustomers}
        templates={formattedTemplates}
        businessName={session.organization.name}
        ownerPhone={session.organization.phone}
      />
    </AppShell>
  );
}
