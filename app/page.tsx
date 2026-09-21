import { getStrictTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import LandingPage from './landing/page';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getStrictTenantSession();

  // If unauthenticated visitor, render marketing landing page
  if (!session) {
    return <LandingPage isLoggedIn={false} />;
  }

  const orgId = session.organization.id;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Parallel database queries for maximum performance
  const [
    totalCustomers,
    allPendingFollowups,
    todayAppointmentsCount,
    customersAggregate,
    monthlyPayments,
    todayFollowupsRaw,
    recentCustomersRaw,
    templatesRaw,
  ] = await Promise.all([
    // 1. Total Customers
    prisma.customer.count({
      where: { organizationId: orgId },
    }),

    // 2. Pending Followups for counting overdue & total pending
    prisma.followup.findMany({
      where: {
        organizationId: orgId,
        status: 'PENDING',
      },
      select: { id: true, dueDate: true },
    }),

    // 3. Today's Appointments
    prisma.appointment.count({
      where: {
        organizationId: orgId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),

    // 4. Receivables sum from customers
    prisma.customer.aggregate({
      where: { organizationId: orgId },
      _sum: { pendingBalance: true },
    }),

    // 5. Monthly Revenue sum
    prisma.payment.aggregate({
      where: {
        organizationId: orgId,
        paidAt: { gte: startOfMonth },
      },
      _sum: { paidAmount: true },
    }),

    // 6. Follow-ups to display in agenda (Pending, ordered by dueDate)
    prisma.followup.findMany({
      where: {
        organizationId: orgId,
        status: 'PENDING',
      },
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
      take: 10,
    }),

    // 7. Recent Customers
    prisma.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),

    // 8. Message Templates
    prisma.messageTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { isDefault: 'desc' },
    }),
  ]);

  const overdueCount = allPendingFollowups.filter((f) => f.dueDate < now).length;
  const pendingReceivables = Number(customersAggregate._sum.pendingBalance || 0);
  const revenueThisMonth = Number(monthlyPayments._sum.paidAmount || 0);

  const stats = {
    totalCustomers,
    dueFollowups: allPendingFollowups.length,
    overdueFollowups: overdueCount,
    todayAppointments: todayAppointmentsCount,
    pendingReceivables,
    revenueThisMonth,
  };

  const formattedFollowups = todayFollowupsRaw.map((f) => ({
    id: f.id,
    title: f.title,
    notes: f.notes,
    dueDate: f.dueDate.toISOString(),
    priority: f.priority,
    status: f.status,
    customer: {
      id: f.customer.id,
      name: f.customer.name,
      phone: f.customer.phone,
      pendingBalance: Number(f.customer.pendingBalance),
    },
  }));

  const formattedCustomers = recentCustomersRaw.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    status: c.status,
    totalSpent: Number(c.totalSpent),
    pendingBalance: Number(c.pendingBalance),
    notes: c.notes,
    tags: c.tags,
  }));

  const formattedTemplates = templatesRaw.map((t) => ({
    id: t.id,
    title: t.title,
    category: t.category,
    body: t.body,
  }));

  return (
    <AppShell>
      <DashboardClient
        stats={stats}
        todayFollowups={formattedFollowups}
        recentCustomers={formattedCustomers}
        templates={formattedTemplates}
        businessName={session.organization.name}
        ownerPhone={session.organization.phone}
      />
    </AppShell>
  );
}
