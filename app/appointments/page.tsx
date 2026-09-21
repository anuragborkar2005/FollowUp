import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { AppointmentsClient } from '@/components/appointments/AppointmentsClient';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const session = await getTenantSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Tenant not initialized.</p>
      </div>
    );
  }

  const orgId = session.organization.id;

  const [appointmentsRaw, templatesRaw, customersRaw] = await Promise.all([
    prisma.appointment.findMany({
      where: { organizationId: orgId },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { startTime: 'asc' },
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

  const formattedAppointments = appointmentsRaw.map((a: any) => ({
    id: a.id,
    serviceName: a.serviceName,
    startTime: new Date(a.startTime).toISOString(),
    price: Number(a.price),
    status: a.status,
    notes: a.notes,
    customer: {
      id: a.customer.id,
      name: a.customer.name,
      phone: a.customer.phone,
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
      <AppointmentsClient
        initialAppointments={formattedAppointments}
        templates={formattedTemplates}
        customerOptions={customersRaw}
        businessName={session.organization.name}
        ownerPhone={session.organization.phone}
      />
    </AppShell>
  );
}
