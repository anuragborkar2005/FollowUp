'use client';

import Link from 'next/link';
import { Bell, Phone, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface NavbarProps {
  orgName: string;
  city?: string | null;
  overdueCount?: number;
}

export function Navbar({ orgName, city, overdueCount = 0 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 md:px-8">
      {/* Mobile Brand / Shop Name */}
      <div className="flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black text-sm shadow-sm shadow-emerald-600/25">
            F
          </div>
        </Link>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span className="truncate max-w-[190px] sm:max-w-none">{orgName}</span>
            {city && (
              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                • {city}
              </span>
            )}
          </h1>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>WhatsApp Mini-CRM</span>
          </p>
        </div>
      </div>

      {/* Top Right Controls & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {overdueCount > 0 && (
          <Link
            href="/followups"
            className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/40 border border-rose-200/80 dark:border-rose-900/60 transition-colors"
          >
            <Bell className="h-3.5 w-3.5 text-rose-600 animate-bounce" />
            <span>{overdueCount} Overdue</span>
          </Link>
        )}

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 px-2.5 py-1 rounded-full font-mono">
          <Phone className="h-3 w-3 text-emerald-500" />
          <span>+91 wa.me</span>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Profile Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 font-bold text-xs dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
          RS
        </div>
      </div>
    </header>
  );
}
