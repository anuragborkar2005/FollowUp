'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  CalendarClock,
  Calendar,
  IndianRupee,
  FileText,
  Clock,
  CheckCircle2,
  Tag,
  Plus,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { formatIndianPhoneDisplay, formatINR } from '@/lib/phone';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';

interface ActivityItem {
  id: string;
  actionType: string;
  description: string;
  createdAt: string;
}

interface FollowupItem {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  status: string;
  notes: string | null;
}

interface PaymentItem {
  id: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  paymentMethod: string;
  paidAt: string;
  notes: string | null;
}

interface AppointmentItem {
  id: string;
  serviceName: string;
  startTime: string;
  price: number;
  status: string;
}

interface TemplateOption {
  id: string;
  title: string;
  category: string;
  body: string;
}

interface CustomerDetailClientProps {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    status: string;
    tags: string[];
    notes: string | null;
    totalSpent: number;
    pendingBalance: number;
    createdAt: string;
  };
  timeline: ActivityItem[];
  followups: FollowupItem[];
  payments: PaymentItem[];
  appointments: AppointmentItem[];
  templates: TemplateOption[];
  businessName: string;
  ownerPhone?: string;
}

export function CustomerDetailClient({
  customer,
  timeline: initialTimeline,
  followups: initialFollowups,
  payments: initialPayments,
  appointments: initialAppointments,
  templates,
  businessName,
  ownerPhone = '9823012345',
}: CustomerDetailClientProps) {
  const router = useRouter();
  const [timeline, setTimeline] = useState(initialTimeline);
  const [followups, setFollowups] = useState(initialFollowups);
  const [payments, setPayments] = useState(initialPayments);
  const [appointments, setAppointments] = useState(initialAppointments);

  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'NOTE' | 'FOLLOWUP' | 'PAYMENT' | 'APPOINTMENT' | null>(null);

  const [noteText, setNoteText] = useState('');
  const [followupTitle, setFollowupTitle] = useState('');
  const [followupDate, setFollowupDate] = useState('');
  const [followupPriority, setFollowupPriority] = useState('HIGH');
  const [paymentTotal, setPaymentTotal] = useState('');
  const [paymentPaid, setPaymentPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [serviceName, setServiceName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentPrice, setAppointmentPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setTimeline([
          {
            id: data.log.id,
            actionType: 'NOTE_ADDED',
            description: noteText.trim(),
            createdAt: new Date().toISOString(),
          },
          ...timeline,
        ]);
        setNoteText('');
        setActiveModal(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupTitle.trim() || !followupDate) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          title: followupTitle.trim(),
          dueDate: new Date(followupDate).toISOString(),
          priority: followupPriority,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowups([
          {
            id: data.followup.id,
            title: data.followup.title,
            dueDate: data.followup.dueDate,
            priority: data.followup.priority,
            status: data.followup.status,
            notes: data.followup.notes,
          },
          ...followups,
        ]);
        setTimeline([
          {
            id: 'temp-' + Date.now(),
            actionType: 'FOLLOWUP_SET',
            description: `Scheduled follow-up: "${followupTitle.trim()}"`,
            createdAt: new Date().toISOString(),
          },
          ...timeline,
        ]);
        setFollowupTitle('');
        setFollowupDate('');
        setActiveModal(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTotal || !paymentPaid) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          totalAmount: Number(paymentTotal),
          paidAmount: Number(paymentPaid),
          paymentMethod,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPayments([
          {
            id: data.payment.id,
            totalAmount: Number(data.payment.totalAmount),
            paidAmount: Number(data.payment.paidAmount),
            pendingAmount: Number(data.payment.pendingAmount),
            status: data.payment.status,
            paymentMethod: data.payment.paymentMethod,
            paidAt: data.payment.paidAt,
            notes: data.payment.notes,
          },
          ...payments,
        ]);
        setTimeline([
          {
            id: 'temp-p-' + Date.now(),
            actionType: 'PAYMENT_RECEIVED',
            description: `Logged payment of ₹${paymentPaid} (${paymentMethod})`,
            createdAt: new Date().toISOString(),
          },
          ...timeline,
        ]);
        setPaymentTotal('');
        setPaymentPaid('');
        setActiveModal(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !appointmentDate) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer.id,
          serviceName: serviceName.trim(),
          startTime: new Date(appointmentDate).toISOString(),
          price: Number(appointmentPrice) || 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments([
          {
            id: data.appointment.id,
            serviceName: data.appointment.serviceName,
            startTime: data.appointment.startTime,
            price: Number(data.appointment.price),
            status: data.appointment.status,
          },
          ...appointments,
        ]);
        setTimeline([
          {
            id: 'temp-a-' + Date.now(),
            actionType: 'APPOINTMENT_BOOKED',
            description: `Booked appointment for "${serviceName.trim()}"`,
            createdAt: new Date().toISOString(),
          },
          ...timeline,
        ]);
        setServiceName('');
        setAppointmentDate('');
        setAppointmentPrice('');
        setActiveModal(null);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Customers</span>
        </Link>
        <div className="text-xs font-medium text-slate-400">
          Customer since {new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-xl shadow-md shadow-emerald-600/30">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                  {customer.name}
                </h2>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {customer.status}
                </span>
                {customer.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-1">
                {formatIndianPhoneDisplay(customer.phone)}
              </p>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
            <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-right sm:text-left">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Total Spent
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatINR(customer.totalSpent)}
              </span>
            </div>
            <div className="rounded-2xl bg-rose-50/80 p-3.5 dark:bg-rose-950/30 text-right sm:text-left border border-rose-200 dark:border-rose-900/50">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block uppercase tracking-wider">
                Pending Due
              </span>
              <span className="text-lg font-extrabold text-rose-950 dark:text-rose-200 tabular-nums">
                {formatINR(customer.pendingBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Floating Bar */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsWhatsAppOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-[#25D366]/25 active:scale-95 transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>

          <a
            href={`tel:+91${customer.phone}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <Phone className="h-3.5 w-3.5 text-slate-500" />
            <span>Call</span>
          </a>

          <button
            type="button"
            onClick={() => setActiveModal('FOLLOWUP')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <CalendarClock className="h-3.5 w-3.5 text-amber-500" />
            <span>+ Follow-up</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('NOTE')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            <span>+ Note</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('PAYMENT')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <IndianRupee className="h-3.5 w-3.5 text-rose-500" />
            <span>+ Payment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModal('APPOINTMENT')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
          >
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />
            <span>+ Booking</span>
          </button>
        </div>
      </div>

      {/* Main Split: Details & Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Follow-ups & Notes */}
        <div className="space-y-4">
          {/* Active Follow-ups */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-3">
              <CalendarClock className="h-4 w-4 text-amber-500" />
              <span>Pending Follow-ups</span>
            </h3>
            {followups.filter((f) => f.status === 'PENDING').length === 0 ? (
              <p className="text-xs text-slate-400">No pending follow-ups for this customer.</p>
            ) : (
              <div className="space-y-2">
                {followups
                  .filter((f) => f.status === 'PENDING')
                  .map((f) => (
                    <div
                      key={f.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        {f.title}
                      </span>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <Clock className="h-3 w-3 text-emerald-500" />
                        <span>{new Date(f.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Notes Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Customer Notes</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
              {customer.notes || 'No customer notes recorded yet.'}
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Activity Timeline */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-5">
              <Clock className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              <span>Activity & Interaction Timeline</span>
            </h3>

            {timeline.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No activity recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {timeline.map((act) => {
                  const dateStr = new Date(act.createdAt).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  let dotColor = 'bg-emerald-500 ring-emerald-500/20';
                  if (act.actionType.includes('PAYMENT')) dotColor = 'bg-rose-500 ring-rose-500/20';
                  if (act.actionType.includes('FOLLOWUP')) dotColor = 'bg-amber-500 ring-amber-500/20';
                  if (act.actionType.includes('NOTE')) dotColor = 'bg-blue-500 ring-blue-500/20';

                  return (
                    <div key={act.id} className="relative">
                      <span
                        className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full ring-4 border-2 border-white dark:border-slate-900 ${dotColor}`}
                      />
                      <div className="text-xs font-mono text-slate-400">{dateStr}</div>
                      <p className="mt-1 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {act.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Action Modals */}
      {activeModal === 'NOTE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddNote}
            className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">Add Customer Note</h4>
            <textarea
              required
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Inquired about beard color, prefers herbal products..."
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Followup Modal */}
      {activeModal === 'FOLLOWUP' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddFollowup}
            className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">Schedule Follow-up</h4>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Purpose / Title *
              </label>
              <input
                type="text"
                required
                value={followupTitle}
                onChange={(e) => setFollowupTitle(e.target.value)}
                placeholder="e.g. Call to confirm Saturday slot"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Saving...' : 'Set Follow-up'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Modal */}
      {activeModal === 'PAYMENT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddPayment}
            className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">Record Payment & Khata</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Total Bill (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentTotal}
                  onChange={(e) => setPaymentTotal(e.target.value)}
                  placeholder="1000"
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
                  value={paymentPaid}
                  onChange={(e) => setPaymentPaid(e.target.value)}
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
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
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

      {/* Appointment Modal */}
      {activeModal === 'APPOINTMENT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddAppointment}
            className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">Book Service Appointment</h4>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Hair Spa + Beard Styling"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={appointmentPrice}
                  onChange={(e) => setAppointmentPrice(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* WhatsApp Modal */}
      {isWhatsAppOpen && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setIsWhatsAppOpen(false)}
          customer={{
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            pendingBalance: customer.pendingBalance,
          }}
          templates={templates}
          businessName={businessName}
          ownerPhone={ownerPhone}
        />
      )}
    </div>
  );
}
