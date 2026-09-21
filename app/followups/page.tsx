import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { FollowupsClient } from '@/components/followups/FollowupsClient';

export const dynamic = 'force-dynamic';

export default async function FollowupsPage() {
  const session = await getTenantSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Tenant not initialized.</p>
      </div>
    );
  }

  const orgId = session.organization.id;

  const [followupsRaw, templatesRaw, customersRaw] = await Promise.all([
    prisma.followup.findMany({
      where: { organizationId: orgId },
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
    }),
    prisma.messageTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { isDefault: 'desc' },
    }),
    prisma.customer.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, phone: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const formattedFollowups = followupsRaw.map((f: any) => ({
    id: f.id,
    title: f.title,
    dueDate: new Date(f.dueDate).toISOString(),
    priority: f.priority,
    status: f.status,
    notes: f.notes,
    customer: {
      id: f.customer.id,
      name: f.customer.name,
      phone: f.customer.phone,
      pendingBalance: Number(f.customer.pendingBalance),
    },
  }));

  const formattedTemplates = templatesRaw.map((t: any) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    body: t.body,
  }));

  return (
    <AppShell>
      <FollowupsClient
        initialFollowups={formattedFollowups}
        templates={formattedTemplates}
        customerOptions={customersRaw}
        businessName={session.organization.name}
        ownerPhone={session.organization.phone}
      />
    </AppShell>
  );
}
