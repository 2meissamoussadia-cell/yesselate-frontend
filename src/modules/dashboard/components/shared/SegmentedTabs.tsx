/**
 * SegmentedTabs
 * Composant d'onglets segmentés "produit" - Style SaaS propre
 * Support optionnel : icon, pillClassName, underlineClassName pour un rendu épuré
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
interface SegmentedTabsItem {
  id: string;
  label: string;
  badge?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SegmentedTabsProps {
  items: SegmentedTabsItem[];
  value: string | null;
  onChange: (id: string) => void;
  className?: string;
  /** Override des classes du conteneur des pills (ex: h-9 text-[11px]) */
  pillClassName?: string;
  /** Override des classes du pill actif/inactif (data-state=active|inactive) */
  pillItemClassName?: string;
  /** Override de la barre d’underline sous l’onglet actif */
  underlineClassName?: string;
}

export const SegmentedTabs = memo(function SegmentedTabs({
  items,
  value,
  onChange,
  className,
  pillClassName,
  pillItemClassName,
  underlineClassName,
}: SegmentedTabsProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <div
        className={cn(
          'inline-flex gap-1 rounded-2xl border border-slate-800/60 bg-slate-950/30 p-1',
          pillClassName
        )}
      >
        {items.map((it) => {
          const active = it.id === value;
          const Icon = it.icon;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              data-state={active ? 'active' : 'inactive'}
              className={cn(
                'relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
                !pillItemClassName &&
                  (active
                    ? 'bg-blue-500/20 text-blue-200 border border-blue-500/40 shadow-sm shadow-blue-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'),
                pillItemClassName,
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60'
              )}
            >
              {active && (
                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-400',
                    underlineClassName
                  )}
                />
              )}
              {Icon && (
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                  <Icon className="h-3.5 w-3.5 min-h-0 min-w-0 max-h-full max-w-full" aria-hidden />
                </span>
              )}
              <span className={cn('truncate max-w-[16rem]', active && 'relative z-10')}>{it.label}</span>
              {typeof it.badge === 'number' && it.badge > 0 ? (
                <span
                  className={cn(
                    'ml-1 rounded-lg px-2 py-0.5 text-[11px] tabular-nums relative z-10',
                    active ? 'bg-blue-500/30 text-blue-200 border border-blue-500/40' : 'bg-slate-900/30 text-slate-400'
                  )}
                >
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
