'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="group relative inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white/80 p-2 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-all active:scale-95"
      title={`Current: ${theme} (Click to toggle)`}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Moon className="h-4 w-4 text-emerald-400 transition-transform duration-200 group-hover:rotate-12" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200 group-hover:rotate-45" />
      )}
      {showLabel && (
        <span className="capitalize hidden sm:inline text-[11px] font-semibold">
          {theme}
        </span>
      )}
    </button>
  );
}
