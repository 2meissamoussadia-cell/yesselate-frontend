/**
 * Sélecteur de vue pour le module Gouvernance
 */

'use client';

import React from 'react';
import { LayoutDashboard, List, Grid3x3, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGouvernanceFilters } from '../hooks/useGouvernanceFilters';
import type { VueGouvernance } from '../types/gouvernanceTypes';

interface ViewSelectorProps {
  className?: string;
}

const viewOptions: { value: VueGouvernance; label: string; icon: React.ElementType }[] = [
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { value: 'list', label: 'Liste', icon: List },
  { value: 'matrix', label: 'Matrice', icon: Grid3x3 },
  { value: 'timeline', label: 'Timeline', icon: History },
];

export function ViewSelector({ className }: ViewSelectorProps) {
  const { vue, setVue } = useGouvernanceFilters();

  return (
    <div className={cn('inline-flex rounded-xl bg-white/5 p-1 ring-1 ring-white/10', className)}>
      {viewOptions.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setVue(option.value)}
            aria-label={`Vue ${option.label}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 min-h-[44px] text-xs font-medium transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500',
              vue === option.value
                ? 'bg-white/10 text-white'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            )}
            title={option.label}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

