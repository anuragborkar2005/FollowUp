'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIndianPhoneDisplay } from '@/lib/phone';

interface CustomerOption {
  id: string;
  name: string;
  phone: string;
}

export function NewFollowupForm({ customers }: { customers: CustomerOption[] }) {
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('HIGH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !title || !dueDate) {
      setError('Please select a customer, title, and due date.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          title: title.trim(),
          dueDate: new Date(dueDate).toISOString(),
          priority,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create follow-up');
      }

      router.push('/followups');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          {error}
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
          Customer *
        </label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({formatIndianPhoneDisplay(c.phone)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
          Follow-up Title / Reason *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Call to confirm bridal slot"
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
            Due Date & Time *
          </label>
          <input
            type="datetime-local"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
          Context Notes (Optional)
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. He wants special discount on package"
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/30 hover:bg-amber-600 active:scale-98 disabled:opacity-50 transition-all"
      >
        {loading ? 'Scheduling...' : 'Set Follow-up Reminder'}
      </button>
    </form>
  );
}
