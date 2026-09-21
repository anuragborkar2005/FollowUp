import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { PaymentsClient } from '@/components/payments/PaymentsClient';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const session = await getTenantSession();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Tenant not initialized.</p>
      </div>
    );
  }

  const orgId = session.organization.id;

  const [paymentsRaw, templatesRaw, customersRaw, receivablesAgg, collectedAgg] = await Promise.all([
    prisma.payment.findMany({
      where: { organizationId: orgId },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    }),
    prisma.messageTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { isDefault: 'desc' },
    }),
    prisma.customer.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, phone: true, pendingBalance: true },
      orderBy: { name: 'asc' },
    }),
    prisma.customer.aggregate({
      where: { organizationId: orgId },
      _sum: { pendingBalance: true },
    }),
    prisma.payment.aggregate({
      where: { organizationId: orgId },
      _sum: { paidAmount: true },
    }),
  ]);

  const formattedPayments = paymentsRaw.map((p) => ({
    id: p.id,
    invoiceNumber: p.invoiceNumber,
    totalAmount: Number(p.totalAmount),
    paidAmount: Number(p.paidAmount),
    pendingAmount: Number(p.pendingAmount),
    status: p.status,
    paymentMethod: p.paymentMethod,
    paidAt: p.paidAt.toISOString(),
    notes: p.notes,
    customer: {
      id: p.customer.id,
      name: p.customer.name,
      phone: p.customer.phone,
    },
  }));

  const formattedTemplates = templatesRaw.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    body: t.body,
  }));

  const formattedCustomers = customersRaw.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    pendingBalance: Number(c.pendingBalance),
  }));

  const totalReceivables = Number(receivablesAgg._sum.pendingBalance || 0);
  const totalCollected = Number(collectedAgg._sum.paidAmount || 0);

  return (
    <AppShell>
      <PaymentsClient
        initialPayments={formattedPayments}
        templates={formattedTemplates}
        customerOptions={formattedCustomers}
        totalReceivables={totalReceivables}
        totalCollected={totalCollected}
        businessName={session.organization.name}
        ownerPhone={session.organization.phone}
      />
    </AppShell>
  );
}
