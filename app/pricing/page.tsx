import { getTenantSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AppShell } from '@/components/layout/AppShell';
import { PricingTable } from '@/components/billing/PricingTable';
import { Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const session = await getTenantSession();

  let currentTier = 'STARTER';
  if (session) {
    const sub = await prisma.subscription.findUnique({
      where: { organizationId: session.organization.id },
    });
    if (sub) currentTier = sub.tier;
  }

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Fair Indian Business Pricing in INR (₹)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Plans that grow with your local business
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            No per-message WhatsApp API fees. Simple flat monthly subscriptions via Razorpay UPI Autopay.
          </p>
        </div>

        <PricingTable currentTier={currentTier} />
      </div>
    </AppShell>
  );
}
