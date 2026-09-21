'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, User, Phone, Tag, FileText } from 'lucide-react';
import { normalizeIndianPhone } from '@/lib/phone';

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState('Regular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = normalizeIndianPhone(phone);
    if (!cleanPhone) {
      setError('Please enter a valid 10-digit Indian phone number (e.g., 98221 12345)');
      return;
    }

    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          notes: notes.trim() || undefined,
          tags: [tag],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add customer');
      }

      router.push(`/customers/${data.customer.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] p-4 sm:p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel</span>
          </Link>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
            Quick Add
          </span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-600/30">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50">
              New Customer
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Capture contact for WhatsApp CRM & Khata
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vikram Deshmukh"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>Mobile / WhatsApp Number *</span>
            </label>
            <div className="relative flex rounded-xl border border-slate-200/80 bg-slate-50/60 focus-within:border-emerald-500 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/60 shadow-2xs">
              <span className="flex items-center px-3 text-xs font-bold font-mono text-slate-500 border-r border-slate-200 dark:border-slate-700">
                +91
              </span>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98221 12345"
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-hidden dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span>Category</span>
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            >
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="Inquiry">New WhatsApp Inquiry</option>
              <option value="Package">Package / Member</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Service Preferences & Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Likes trim every 2 weeks, sensitive scalp"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 disabled:opacity-50 transition-all"
          >
            {loading ? 'Creating...' : 'Save & Open Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
