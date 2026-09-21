'use client';

import { useState } from 'react';
import {
  IndianRupee,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  X,
  CreditCard,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { formatIndianPhoneDisplay, formatINR } from '@/lib/phone';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';

interface PaymentRecord {
  id: string;
  invoiceNumber: string | null;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  paymentMethod: string;
  paidAt: string;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
}

interface TemplateRecord {
  id: string;
  title: string;
  category: string;
  body: string;
}

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
  pendingBalance: number;
}

interface PaymentsClientProps {
  initialPayments: PaymentRecord[];
  templates: TemplateRecord[];
  customerOptions: CustomerOption[];
  totalReceivables: number;
  totalCollected: number;
  businessName: string;
  ownerPhone?: string;
}

export function PaymentsClient({
  initialPayments,
  templates,
  customerOptions,
  totalReceivables,
  totalCollected,
  businessName,
  ownerPhone = '9823012345',
}: PaymentsClientProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeWhatsAppCustomer, setActiveWhatsAppCustomer] = useState<{
    id: string;
    name: string;
    phone: string;
    pendingBalance?: number;
  } | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState(customerOptions[0]?.id || '');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !totalAmount || !paidAmount) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          totalAmount: Number(totalAmount),
          paidAmount: Number(paidAmount),
          paymentMethod,
          notes: notes.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const matched = customerOptions.find((c) => c.id === selectedCustomerId);
        setPayments([
          {
            id: data.payment.id,
            invoiceNumber: data.payment.invoiceNumber,
            totalAmount: Number(data.payment.totalAmount),
            paidAmount: Number(data.payment.paidAmount),
            pendingAmount: Number(data.payment.pendingAmount),
            status: data.payment.status,
            paymentMethod: data.payment.paymentMethod,
            paidAt: data.payment.paidAt,
            notes: data.payment.notes,
            customer: {
              id: selectedCustomerId,
              name: matched?.name || 'Customer',
              phone: matched?.phone || '',
            },
          },
          ...payments,
        ]);
        setTotalAmount('');
        setPaidAmount('');
        setNotes('');
        setIsAddModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <IndianRupee className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            <span>Khata & Payment Ledger</span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Track customer billing, uncollected credit dues, and send 1-tap UPI payment reminders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pending Khata Card */}
        <div className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-red-50/20 p-5 sm:p-6 shadow-xs dark:border-rose-900/50 dark:from-rose-950/25 dark:to-slate-900">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
            Total Uncollected Khata Dues
          </span>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-rose-950 dark:text-rose-100 tabular-nums">
            {formatINR(totalReceivables)}
          </div>
          <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
            Pending receivables owed across all customers. Follow up with 1-click reminders.
          </p>
        </div>

        {/* Collected Revenue Card */}
        <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-teal-50/20 p-5 sm:p-6 shadow-xs dark:border-emerald-900/50 dark:from-emerald-950/25 dark:to-slate-900">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Total Verified Revenue
          </span>
          <div className="mt-2 text-3xl sm:text-4xl font-black text-emerald-950 dark:text-emerald-100 tabular-nums">
            {formatINR(totalCollected)}
          </div>
          <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            Total verified payments received via UPI, Cash, and Cards.
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          Recent Payment Transactions
        </h3>

        {payments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/60 p-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <Wallet className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              No payment transactions recorded yet
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Record customer bills to start tracking received and pending amounts.
            </p>
          </div>
        ) : (
          payments.map((p) => {
            const dateStr = new Date(p.paidAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {p.customer.name}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {p.paymentMethod}
                      </span>
                      {p.pendingAmount > 0 ? (
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60 tabular-nums">
                          PENDING DUE {formatINR(p.pendingAmount)}
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          FULLY PAID
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="font-mono">{dateStr}</span>
                      <span>•</span>
                      <span>Total Bill: <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{formatINR(p.totalAmount)}</strong></span>
                      <span>•</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        Paid: {formatINR(p.paidAmount)}
                      </span>
                    </div>

                    {p.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-1">
                        "{p.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    {p.pendingAmount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveWhatsAppCustomer({
                            id: p.customer.id,
                            name: p.customer.name,
                            phone: p.customer.phone,
                            pendingBalance: p.pendingAmount,
                          })
                        }
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:from-rose-700 hover:to-rose-800 active:scale-95 transition-all"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Send Payment Reminder</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Record Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRecordPayment}
            className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                Record Payment / Khata Bill
              </h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Select Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              >
                {customerOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({formatIndianPhoneDisplay(c.phone)})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Total Bill (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="800"
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Amount Paid (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="NETBANKING">NetBanking</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid ₹500 via GPay, ₹300 remaining due"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WhatsApp Modal */}
      {activeWhatsAppCustomer && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setActiveWhatsAppCustomer(null)}
          customer={activeWhatsAppCustomer}
          templates={templates.filter((t) => t.category === 'KHATA')}
          businessName={businessName}
          ownerPhone={ownerPhone}
        />
      )}
    </div>
  );
}
