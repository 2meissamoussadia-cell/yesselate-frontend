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
      <div className={cn('inline-flex gap-1', borderRadius.md, 'border p-1', colors.border.default, colors.bg.tertiary)}>
        {items.map((it) => {
          const active = it.id === value;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onChange(it.id)}
              className={cn(
                'inline-flex items-center gap-2',
                spacing.paddingX.md,
                spacing.paddingY.sm,
                borderRadius.md,
                typography.body.sm,
                transitions.colorsStandard,
                interactive.focus.combined,
                active
                  ? 'bg-slate-800/70 text-slate-100'
                  : cn(colors.text.tertiary, interactive.hover.bg)
              )}
            >
              <span className="truncate max-w-[16rem]">{it.label}</span>
              {typeof it.badge === 'number' && it.badge > 0 ? (
                <span className={cn('ml-1 rounded-full bg-slate-800', spacing.paddingX.md, 'py-0.5', typography.label.xs, colors.text.secondary)}>
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
