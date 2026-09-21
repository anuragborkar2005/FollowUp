'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/razorpay';
import { formatINR } from '@/lib/phone';

interface PricingTableProps {
  currentTier?: string;
}

export function PricingTable({ currentTier = 'STARTER' }: PricingTableProps) {
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.id === 'FREE') return;
    setLoadingTier(plan.id);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Create order on backend
      const res = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: plan.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

      // 2. Check if Razorpay SDK is loaded on window
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: 'FollowUp CRM',
          description: `Subscription to ${plan.name}`,
          order_id: data.orderId,
          prefill: {
            name: data.user.name,
            email: data.user.email,
            contact: data.user.phone,
          },
          theme: { color: '#059669' },
          handler: async (response: any) => {
            const verifyRes = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                tier: plan.id,
              }),
            });
            if (verifyRes.ok) {
              setSuccessMsg(`Successfully upgraded to ${plan.name}!`);
              router.refresh();
            }
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Instant Sandbox Verification in local development
        const verifyRes = await fetch('/api/subscription/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: `pay_test_bypass_${Date.now()}`,
            razorpay_signature: 'sandbox_test_signature',
            tier: plan.id,
          }),
        });
        if (verifyRes.ok) {
          setSuccessMsg(`Plan activated! Your organization is now on ${plan.name}.`);
          router.refresh();
        }
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoadingTier(null);
    }
  };

  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div className="space-y-8">
      {/* Alert Banners */}
      {successMsg && (
        <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => {
          const isCurrent = currentTier === plan.id;
          const isRecommended = plan.recommended;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all border ${
                isRecommended
                  ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 shadow-2xs'
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 text-[11px] font-extrabold text-white shadow-xs uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Current
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[34px] leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-50 tabular-nums">
                    {formatINR(plan.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/month</span>
                </div>

                <div className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {typeof plan.customerLimit === 'number'
                    ? `Up to ${plan.customerLimit} customers`
                    : 'Unlimited customers'}
                </div>

                <div className="mt-6 space-y-2.5 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                {plan.id === 'FREE' ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    Free Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isCurrent || loadingTier !== null}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                        : isRecommended
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 active:scale-98'
                        : 'border border-slate-300/80 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {loadingTier === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing Razorpay...</span>
                      </>
                    ) : isCurrent ? (
                      'Active Plan'
                    ) : (
                      <>
                        <span>Upgrade with Razorpay</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-center dark:border-slate-800 dark:bg-slate-900/60 text-xs text-slate-500 flex items-center justify-center gap-4 flex-wrap">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Razorpay Billing
        </span>
        <span>•</span>
        <span>Supports UPI, GPay, PhonePe, Paytm & Cards</span>
        <span>•</span>
        <span>Cancel or switch anytime</span>
      </div>
    </div>
  );
}
