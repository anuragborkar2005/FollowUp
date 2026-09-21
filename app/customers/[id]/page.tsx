import { notFound } from 'next/navigation';
import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { CustomerDetailClient } from '@/components/customers/CustomerDetailClient';

export const dynamic = 'force-dynamic';

export default async function CustomerDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getTenantSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Tenant not initialized.</p>
      </div>
    );
  }

  const { id } = await props.params;

  // Strict tenant boundary: customer must belong to session organizationId
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      organizationId: session.organization.id,
    },
    include: {
      timeline: {
        orderBy: { createdAt: 'desc' },
      },
      followups: {
        orderBy: { dueDate: 'asc' },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
      appointments: {
        orderBy: { startTime: 'desc' },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const templates = await prisma.messageTemplate.findMany({
    where: { organizationId: session.organization.id },
    orderBy: { isDefault: 'desc' },
  });

  const formattedCustomer = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    status: customer.status,
    tags: customer.tags,
    notes: customer.notes,
    totalSpent: Number(customer.totalSpent),
    pendingBalance: Number(customer.pendingBalance),
    createdAt: customer.createdAt.toISOString(),
  };

  const formattedTimeline = customer.timeline.map((t) => ({
    id: t.id,
    actionType: t.actionType,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  const formattedFollowups = customer.followups.map((f) => ({
    id: f.id,
    title: f.title,
    dueDate: f.dueDate.toISOString(),
    priority: f.priority,
    status: f.status,
    notes: f.notes,
  }));

  const formattedPayments = customer.payments.map((p) => ({
    id: p.id,
    totalAmount: Number(p.totalAmount),
    paidAmount: Number(p.paidAmount),
    pendingAmount: Number(p.pendingAmount),
    status: p.status,
    paymentMethod: p.paymentMethod,
    paidAt: p.paidAt.toISOString(),
    notes: p.notes,
  }));

  const formattedAppointments = customer.appointments.map((a) => ({
    id: a.id,
    serviceName: a.serviceName,
    startTime: a.startTime.toISOString(),
    price: Number(a.price),
    status: a.status,
  }));

  const formattedTemplates = templates.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    body: t.body,
  }));

  return (
    <AppShell>
      <CustomerDetailClient
        customer={formattedCustomer}
        timeline={formattedTimeline}
        followups={formattedFollowups}
        payments={formattedPayments}
        appointments={formattedAppointments}
        templates={formattedTemplates}
        businessName={session.organization.name}
        ownerPhone={session.organization.phone}
      />
    </AppShell>
  );
}
