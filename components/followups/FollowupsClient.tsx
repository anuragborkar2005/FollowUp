'use client';

import { useState } from 'react';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Plus,
  Filter,
  Check,
  X,
  Phone,
  Flame,
} from 'lucide-react';
import { formatIndianPhoneDisplay, formatINR } from '@/lib/phone';
import { WhatsAppModal } from '@/components/whatsapp/WhatsAppModal';

interface FollowupRecord {
  id: string;
  title: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes: string | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    pendingBalance: number;
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
}

interface FollowupsClientProps {
  initialFollowups: FollowupRecord[];
  templates: TemplateRecord[];
  customerOptions: CustomerOption[];
  businessName: string;
  ownerPhone?: string;
}

export function FollowupsClient({
  initialFollowups,
  templates,
  customerOptions,
  businessName,
  ownerPhone = '9823012345',
}: FollowupsClientProps) {
  const [followups, setFollowups] = useState(initialFollowups);
  const [filterTab, setFilterTab] = useState<'PENDING' | 'OVERDUE' | 'COMPLETED' | 'ALL'>('PENDING');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeWhatsAppCustomer, setActiveWhatsAppCustomer] = useState<{
    id: string;
    name: string;
    phone: string;
    pendingBalance?: number;
    initialContext?: { serviceName?: string };
  } | null>(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState(customerOptions[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleMarkDone = async (id: string) => {
    setFollowups((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'COMPLETED' as const } : f))
    );
    try {
      await fetch(`/api/followups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !newTitle || !newDueDate) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          title: newTitle.trim(),
          dueDate: new Date(newDueDate).toISOString(),
          priority: newPriority,
          notes: newNotes.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const matchedCustomer = customerOptions.find((c) => c.id === selectedCustomerId);
        setFollowups([
          {
            id: data.followup.id,
            title: data.followup.title,
            dueDate: data.followup.dueDate,
            priority: data.followup.priority,
            status: data.followup.status,
            notes: data.followup.notes,
            customer: {
              id: selectedCustomerId,
              name: matchedCustomer?.name || 'Customer',
              phone: matchedCustomer?.phone || '',
              pendingBalance: 0,
            },
          },
          ...followups,
        ]);
        setNewTitle('');
        setNewDueDate('');
        setNewNotes('');
        setIsAddModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();

  const filtered = followups.filter((f) => {
    const isOverdue = new Date(f.dueDate) < now && f.status === 'PENDING';
    if (filterTab === 'OVERDUE') return isOverdue;
    if (filterTab === 'PENDING') return f.status === 'PENDING';
    if (filterTab === 'COMPLETED') return f.status === 'COMPLETED';
    return true;
  });

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5">
            <CalendarClock className="h-7 w-7 text-amber-500" />
            <span>Follow-up Management</span>
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Never miss a customer inquiry. Set reminders and message back with 1-tap.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/25 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Follow-up</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-slate-200/80 pb-3 dark:border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setFilterTab('PENDING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'PENDING'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Pending ({followups.filter((f) => f.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilterTab('OVERDUE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'OVERDUE'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Overdue ({followups.filter((f) => new Date(f.dueDate) < now && f.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilterTab('COMPLETED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'COMPLETED'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            filterTab === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          All ({followups.length})
        </button>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/60 p-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              No follow-ups matching this filter
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Select another tab or schedule a new reminder.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const dateObj = new Date(item.dueDate);
            const isOverdue = dateObj < now && item.status === 'PENDING';
            const isDone = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-2xs transition-all dark:bg-slate-900 ${
                  isOverdue
                    ? 'border-l-4 border-l-rose-500 border-t-slate-200/80 border-r-slate-200/80 border-b-slate-200/80 dark:border-slate-800 dark:border-l-rose-500 bg-gradient-to-r from-rose-50/20 to-white dark:from-rose-950/10 dark:to-slate-900'
                    : 'border-slate-200/80 dark:border-slate-800'
                } ${isDone ? 'opacity-65' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3.5 w-3.5 text-emerald-500" />
                        {dateObj.toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                      {isOverdue && (
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-0.5">
                          <Flame className="h-3 w-3 text-rose-600" /> OVERDUE
                        </span>
                      )}
                      {isDone && (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <h4
                      className={`font-bold text-base text-slate-900 dark:text-slate-100 ${
                        isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        {item.customer.name}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">
                        {formatIndianPhoneDisplay(item.customer.phone)}
                      </span>
                      {item.customer.pendingBalance > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded tabular-nums">
                            Due: {formatINR(item.customer.pendingBalance)}
                          </span>
                        </>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mt-1">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveWhatsAppCustomer({
                          id: item.customer.id,
                          name: item.customer.name,
                          phone: item.customer.phone,
                          pendingBalance: item.customer.pendingBalance,
                          initialContext: { serviceName: item.title },
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-[#25D366]/25 active:scale-95 transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {!isDone && (
                      <button
                        type="button"
                        onClick={() => handleMarkDone(item.id)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors shadow-2xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Done</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Follow-up Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateFollowup}
            className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                Schedule New Follow-up
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

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Follow-up Title / Purpose *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Call to confirm bridal slot"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                Context Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. He said he would let us know after checking with his brother"
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
                {submitting ? 'Creating...' : 'Create Follow-up'}
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
          templates={templates}
          businessName={businessName}
          ownerPhone={ownerPhone}
          initialContext={activeWhatsAppCustomer.initialContext}
        />
      )}
    </div>
  );
}
