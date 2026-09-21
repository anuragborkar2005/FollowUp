'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, User, Mail, Lock, Phone, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { normalizeIndianPhone } from '@/lib/phone';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Salon & Grooming');
  const [businessPhone, setBusinessPhone] = useState('');
  const [city, setCity] = useState('Nagpur');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = normalizeIndianPhone(businessPhone);
    if (!cleanPhone) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          businessName: businessName.trim(),
          businessCategory,
          businessPhone: cleanPhone,
          city: city.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create business account');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-150">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link href="/landing" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black shadow-sm shadow-emerald-600/30">
            F
          </div>
          <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
            FollowUp
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <Sparkles className="h-3 w-3" />
            <span>14-Day Free Trial Included</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            Register your Business
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Get your WhatsApp CRM setup in less than 2 minutes.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Store className="h-3.5 w-3.5 text-slate-400" />
                <span>Shop / Business *</span>
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Nagpur Salon"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Category *
              </label>
              <select
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
              >
                <option value="Salon & Grooming">Salon & Grooming</option>
                <option value="Clinic & Healthcare">Clinic & Health</option>
                <option value="Repair Shop">Repair Shop</option>
                <option value="Tailor & Boutique">Tailor & Boutique</option>
                <option value="Tutor / Coaching">Tutor & Classes</option>
                <option value="Local Services">Other Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Owner Name *</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>City *</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Nagpur"
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              <span>WhatsApp / Contact Number *</span>
            </label>
            <div className="relative flex rounded-xl border border-slate-200/80 bg-slate-50/60 focus-within:border-emerald-500 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800/60 shadow-2xs">
              <span className="flex items-center px-3 text-xs font-bold font-mono text-slate-500 border-r border-slate-200 dark:border-slate-700">
                +91
              </span>
              <input
                type="tel"
                required
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="98230 12345"
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 focus:outline-hidden dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@mybusiness.com"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              <span>Set Password *</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100 shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Creating Business CRM...' : 'Start Free 14-Day Trial'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
