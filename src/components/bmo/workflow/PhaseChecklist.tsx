'use client';

/**
 * PhaseChecklist — Liste de vérification par phase (fil conducteur).
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export interface PhaseChecklistProps {
  items: Array<{ id: string; label: string; checked?: boolean }>;
  onToggle?: (id: string, checked: boolean) => void;
  readOnly?: boolean;
  className?: string;
}

export function PhaseChecklist({
  items,
  onToggle,
  readOnly = false,
  className,
}: PhaseChecklistProps) {
  return (
    <ul className={cn('space-y-2 text-sm text-slate-300', className)} role="list">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
              item.checked
                ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-400'
                : 'border-slate-600 bg-slate-800/60 text-slate-400'
            )}
            aria-hidden
          >
            {item.checked && <Check className="h-3 w-3" />}
          </span>
          <span className={item.checked ? 'text-slate-400 line-through' : ''}>
            {item.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
