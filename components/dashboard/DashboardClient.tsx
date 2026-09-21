'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CalendarClock,
  Calendar,
  IndianRupee,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Sparkles,
  Phone,
  Flame,
} from 'lucide-react';
import { formatIndianPhoneDisplay, formatINR } from '@/lib/phone';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';

interface DashboardStats {
  totalCustomers: number;
  dueFollowups: number;
  overdueFollowups: number;
  todayAppointments: number;
  pendingReceivables: number;
  revenueThisMonth: number;
}

interface FollowupItem {
  id: string;
  title: string;
  notes: string | null;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    pendingBalance: number;
  };
}

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  status: string;
  totalSpent: number;
  pendingBalance: number;
  notes: string | null;
  tags: string[];
}

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  body: string;
}

interface DashboardClientProps {
  stats: DashboardStats;
  todayFollowups: FollowupItem[];
  recentCustomers: CustomerItem[];
  templates: TemplateItem[];
  businessName: string;
  ownerPhone?: string;
}

export function DashboardClient({
  stats,
  todayFollowups: initialFollowups,
  recentCustomers,
  templates,
  businessName,
  ownerPhone = '9823012345',
}: DashboardClientProps) {
  const [followups, setFollowups] = useState(initialFollowups);
  const [activeWhatsAppCustomer, setActiveWhatsAppCustomer] = useState<{
    id: string;
    name: string;
    phone: string;
    pendingBalance?: number;
    initialContext?: {
      appointmentDate?: string;
      appointmentTime?: string;
      serviceName?: string;
    };
  } | null>(null);

  const handleMarkFollowupDone = async (id: string) => {
    // Optimistic update
    setFollowups((prev) => prev.filter((f) => f.id !== id));
    try {
      await fetch(`/api/followups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
    } catch (e) {
      console.error('Failed to mark followup as completed', e);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Daily Operations Command</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Welcome, Rahul 👋
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {stats.dueFollowups > 0
              ? `You have ${stats.dueFollowups} customer follow-ups waiting for your attention today.`
              : 'All follow-ups are completed for today. Excellent work!'}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/customers/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </Link>
          <Link
            href="/followups/new"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-2xs transition-colors"
          >
            <CalendarClock className="h-4 w-4 text-amber-500" />
            <span>+ Follow-up</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90 transition-all hover:border-emerald-300 dark:hover:border-emerald-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              {stats.totalCustomers}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
              In CRM
            </span>
          </div>
        </div>

        {/* Due Follow-ups */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/20 p-4 sm:p-5 shadow-xs dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-900 transition-all hover:border-amber-400 dark:hover:border-amber-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Due Follow-ups
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <CalendarClock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-950 dark:text-amber-100 tabular-nums">
              {stats.dueFollowups}
            </span>
            {stats.overdueFollowups > 0 && (
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Flame className="h-3 w-3 text-rose-600 animate-pulse" /> {stats.overdueFollowups} Overdue
              </span>
            )}
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90 transition-all hover:border-indigo-300 dark:hover:border-indigo-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Bookings
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Calendar className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums">
              {stats.todayAppointments}
            </span>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded-md">
              Slots
            </span>
          </div>
        </div>

        {/* Pending Khata (Receivables) */}
        <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/60 to-red-50/20 p-4 sm:p-5 shadow-xs dark:border-rose-900/40 dark:from-rose-950/20 dark:to-slate-900 transition-all hover:border-rose-400 dark:hover:border-rose-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Pending Khata
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <IndianRupee className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-950 dark:text-rose-100 tabular-nums">
              {formatINR(stats.pendingReceivables)}
            </span>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-1.5 py-0.5 rounded-md">
              Uncollected
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Tasks & Follow-up Agenda */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Today's Follow-up Agenda
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calls, reminders, and confirmations due today
                </p>
              </div>
            </div>
            <Link
              href="/followups"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {followups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/60 p-10 text-center dark:border-slate-800 dark:bg-slate-900/60">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                You're all caught up for today!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No pending customer follow-ups remaining. Schedule follow-ups with inquiries or customers who promised to visit soon.
              </p>
              <Link
                href="/followups/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Schedule Follow-up
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {followups.map((task) => {
                const dateObj = new Date(task.dueDate);
                const timeStr = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const isOverdue = dateObj < new Date();

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-2xs transition-all dark:bg-slate-900 ${
                      isOverdue
                        ? 'border-l-4 border-l-rose-500 border-t-slate-200/80 border-r-slate-200/80 border-b-slate-200/80 dark:border-slate-800 dark:border-l-rose-500 bg-gradient-to-r from-rose-50/20 to-white dark:from-rose-950/10 dark:to-slate-900'
                        : 'border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3 text-emerald-500" /> {timeStr}
                          </span>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          {isOverdue && (
                            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5">
                              <AlertCircle className="h-3 w-3" /> OVERDUE
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-200">
                            {task.customer.name}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">
                            {formatIndianPhoneDisplay(task.customer.phone)}
                          </span>
                          {task.customer.pendingBalance > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                                Owe: {formatINR(task.customer.pendingBalance)}
                              </span>
                            </>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-2">
                            "{task.notes}"
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveWhatsAppCustomer({
                              id: task.customer.id,
                              name: task.customer.name,
                              phone: task.customer.phone,
                              pendingBalance: task.customer.pendingBalance,
                              initialContext: {
                                serviceName: task.title,
                              },
                            })
                          }
                          className="flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-[#25D366]/25 active:scale-95 transition-all"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkFollowupDone(task.id)}
                          className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shadow-2xs transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Recent Customers & Quick WhatsApp */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              <span>Recent Customers</span>
            </h3>
            <Link
              href="/customers"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 hover:underline"
            >
              <span>Directory</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentCustomers.map((cust) => (
              <div key={cust.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs dark:bg-emerald-950 dark:text-emerald-300">
                      {cust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        href={`/customers/${cust.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-600 dark:text-slate-100 dark:hover:text-emerald-400 transition-colors"
                      >
                        {cust.name}
                      </Link>
                      <p className="text-xs font-mono text-slate-500">
                        {formatIndianPhoneDisplay(cust.phone)}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {cust.status}
                        </span>
                        {cust.pendingBalance > 0 && (
                          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60">
                            Due {formatINR(cust.pendingBalance)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveWhatsAppCustomer({
                        id: cust.id,
                        name: cust.name,
                        phone: cust.phone,
                        pendingBalance: cust.pendingBalance,
                      })
                    }
                    className="p-2 rounded-xl text-[#25D366] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 transition-colors"
                    title={`Send WhatsApp message to ${cust.name}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Direct Messaging Feature Highlight */}
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-4 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-slate-900">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-Cost WhatsApp Engine</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Uses instant deep-linking. Works directly from your personal or business WhatsApp number with zero API charges.
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp Modal Trigger */}
      {activeWhatsAppCustomer && (
        <WhatsAppModal
          isOpen={true}
          onClose={() => setActiveWhatsAppCustomer(null)}
          customer={activeWhatsAppCustomer}
          templates={templates}
          businessName={businessName}
          ownerPhone={ownerPhone}
          initialContext={activeWhatsAppCustomer.initialContext}
        />
      )}
    </div>
  );
}
