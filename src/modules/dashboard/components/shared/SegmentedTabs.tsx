/**
 * SegmentedTabs
 * Composant d'onglets segmentés "produit" - Style SaaS propre
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedTabsItem {
  id: string;
  label: string;
  badge?: number;
}

interface SegmentedTabsProps {
  items: SegmentedTabsItem[];
  value: string | null;
  onChange: (id: string) => void;
  className?: string;
}

export const SegmentedTabs = memo(function SegmentedTabs({
  items,
  value,
  onChange,
  className,
}: SegmentedTabsProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div className={cn('inline-flex gap-1 rounded-2xl border border-slate-800/60 bg-slate-950/30 p-1')}>
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              className={cn(
                'relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40 shadow-sm shadow-blue-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60'
              )}
            >
              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-400 rounded-full" />
              )}
              <span className={cn('truncate max-w-[16rem]', active && 'relative z-10')}>{it.label}</span>
              {typeof it.badge === 'number' && it.badge > 0 ? (
                <span className={cn(
                  'ml-1 rounded-lg px-2 py-0.5 text-[11px] tabular-nums relative z-10',
                  active ? 'bg-blue-500/30 text-blue-200 border border-blue-500/40' : 'bg-slate-900/30 text-slate-400'
                )}>
                  {it.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
});
