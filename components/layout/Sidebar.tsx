'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Calendar,
  IndianRupee,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Globe,
  LogOut,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface SidebarProps {
  orgName: string;
  orgCategory: string;
  city?: string | null;
  pendingFollowupsCount?: number;
}

export function Sidebar({ orgName, orgCategory, city, pendingFollowupsCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const primaryNav = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customers', label: 'Customers & CRM', icon: Users },
    {
      href: '/followups',
      label: 'Follow-ups & Tasks',
      icon: CalendarClock,
      badge: pendingFollowupsCount > 0 ? pendingFollowupsCount : undefined,
    },
    { href: '/appointments', label: 'Appointments', icon: Calendar },
    { href: '/payments', label: 'Khata & Payments', icon: IndianRupee },
    { href: '/templates', label: 'WhatsApp Templates', icon: MessageSquare },
    { href: '/pricing', label: 'Subscription & Plans', icon: CreditCard },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950">
      {/* Brand & Organization */}
      <div className="flex flex-col border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-black shadow-sm shadow-emerald-600/30">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                  FollowUp
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[150px] font-medium">{orgName}</p>
            </div>
          </Link>

          <Link
            href="/landing"
            title="View Public Landing Page"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="truncate">{orgCategory} {city ? `• ${city}` : ''}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Core Operations
        </div>
        {primaryNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4.5 w-4.5 transition-colors ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-white shadow-2xs">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Subscription Footer & Theme Switcher */}
      <div className="border-t border-slate-200/80 p-4 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</span>
          <ThemeToggle showLabel />
        </div>

        <Link
          href="/pricing"
          className="block rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 p-3.5 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-slate-900 hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Starter Plan (Active)</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">₹299</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            500 customers • Razorpay Autopay
          </p>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200/80 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
