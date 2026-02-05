'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory as MainDashboardCategory } from '@/lib/stores/dashboardCommandCenterStore';

export type SubDashboardCategory = string;

interface NavigationButtonProps {
  label: string;
  main: MainDashboardCategory;
  sub?: SubDashboardCategory;
  leaf?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function NavigationButton({
  label,
  main,
  sub,
  leaf,
  icon: Icon,
  className,
}: NavigationButtonProps) {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const navigateTo = useDashboardCommandCenterStore((s) => s.navigateTo);

  const isActive =
    nav?.mainCategory === main &&
    (sub ? nav?.subCategory === sub : true) &&
    (leaf ? nav?.subSubCategory === leaf : true);

  const onClick = () => navigateTo(main, sub, leaf);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40',
        isActive
          ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/70 ring-1 ring-emerald-400/20 text-white shadow-sm'
          : 'bg-slate-900/30 text-slate-200 hover:bg-slate-800/50 ring-1 ring-slate-700/40',
        className
      )}
    >
      {Icon ? (
        <span
          className={cn(
            'grid h-8 w-8 place-items-center rounded-xl',
            isActive
              ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20'
              : 'bg-slate-800/50 ring-1 ring-slate-700/40'
          )}
        >
          <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-200' : 'text-slate-300')} />
        </span>
      ) : null}

      <span className="truncate">{label}</span>

      <span
        className={cn(
          'ml-auto h-1.5 w-1.5 rounded-full transition-opacity',
          isActive ? 'bg-emerald-400 opacity-100' : 'bg-slate-600 opacity-0 group-hover:opacity-60'
        )}
      />
    </button>
  );
}

