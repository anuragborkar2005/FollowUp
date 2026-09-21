'use client';

import { useState } from 'react';
import { X, UserPlus, Phone, User, Tag, FileText } from 'lucide-react';
import { normalizeIndianPhone } from '@/lib/phone';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

export function CreateCustomerModal({
  isOpen,
  onClose,
  onCustomerCreated,
}: CreateCustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState('Regular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = normalizeIndianPhone(phone);
    if (!cleanPhone) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g., 98221 12345)');
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

      setName('');
      setPhone('');
      setNotes('');
      onCustomerCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm shadow-emerald-600/30">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm sm:text-base">
                Add New Customer
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Quick contact capture for WhatsApp CRM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {error}
            </div>
          )}

          {/* Customer Name */}
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
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>WhatsApp / Mobile Number *</span>
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
            <p className="mt-1 text-[11px] text-slate-500 font-medium">10-digit Indian phone number</p>
          </div>

          {/* Customer Tag */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span>Category / Tag</span>
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            >
              <option value="Regular">Regular Customer</option>
              <option value="VIP">VIP</option>
              <option value="Inquiry">New WhatsApp Inquiry</option>
              <option value="Groom Package">Groom / Bridal Package</option>
            </select>
          </div>

          {/* Quick Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Preference / Initial Notes</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Likes skin fade, prefers Saturday morning slot"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            />
          </div>

          <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300/80 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all"
            >
              {loading ? 'Saving...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
