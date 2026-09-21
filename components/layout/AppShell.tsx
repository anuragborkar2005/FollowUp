import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getTenantSession();

  let orgName = "Rahul Men's Salon & Spa";
  let orgCategory = 'Salon & Grooming';
  let city = 'Nagpur';
  let pendingFollowups = 0;
  let overdueFollowups = 0;

  if (session) {
    orgName = session.organization.name;
    orgCategory = session.organization.category;
    city = session.organization.city || '';

    // Fetch live alert counts for this tenant
    const now = new Date();
    const followups = await prisma.followup.findMany({
      where: {
        organizationId: session.organization.id,
        status: 'PENDING',
      },
      select: {
        dueDate: true,
      },
    });

    pendingFollowups = followups.length;
    overdueFollowups = followups.filter((f) => f.dueDate < now).length;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-150">
      {/* Desktop Sidebar */}
      <Sidebar
        orgName={orgName}
        orgCategory={orgCategory}
        city={city}
        pendingFollowupsCount={pendingFollowups}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Navbar
          orgName={orgName}
          city={city}
          overdueCount={overdueFollowups}
        />
        <main className="flex-1 pb-20 md:pb-10">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav pendingFollowupsCount={pendingFollowups} />
    </div>
  );
}
