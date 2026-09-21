import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, CalendarClock } from 'lucide-react';
import { formatIndianPhoneDisplay } from '@/lib/phone';
import { NewFollowupForm } from './NewFollowupForm';

export const dynamic = 'force-dynamic';

export default async function NewFollowupPage() {
  const session = await getTenantSession();

  if (!session) {
    return <div>Tenant not initialized.</div>;
  }

  const customers = await prisma.customer.findMany({
    where: { organizationId: session.organization.id },
    select: { id: true, name: true, phone: true },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] p-4 sm:p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/followups"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Link>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-200/60 dark:border-amber-800/60">
            Follow-up
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
              Schedule Follow-up
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Set a reminder for timely customer communication
            </p>
          </div>
        </div>

        <NewFollowupForm customers={customers} />
      </div>
    </div>
  );
}
