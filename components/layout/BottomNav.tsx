'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarClock, Calendar, IndianRupee } from 'lucide-react';

interface BottomNavProps {
  pendingFollowupsCount?: number;
}

export function BottomNav({ pendingFollowupsCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/customers', label: 'Customers', icon: Users },
    {
      href: '/followups',
      label: 'Follow-ups',
      icon: CalendarClock,
      badge: pendingFollowupsCount > 0 ? pendingFollowupsCount : undefined,
    },
    { href: '/appointments', label: 'Bookings', icon: Calendar },
    { href: '/payments', label: 'Khata', icon: IndianRupee },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95 md:hidden shadow-lg pb-safe">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 text-[11px] font-semibold transition-all active:scale-95 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-6 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
