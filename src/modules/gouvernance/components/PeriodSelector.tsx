/**
 * Sélecteur de période pour le module Gouvernance
 */

'use client';

import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useGouvernanceFilters } from '../hooks/useGouvernanceFilters';
import type { PeriodeGouvernance } from '../types/gouvernanceTypes';

interface PeriodSelectorProps {
  className?: string;
}

const periodOptions: { value: PeriodeGouvernance; label: string }[] = [
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'quarter', label: 'Trimestre' },
];

export function PeriodSelector({ className }: PeriodSelectorProps) {
  const { periode, setPeriode } = useGouvernanceFilters();

  return (
    <div className={cn('inline-flex rounded-xl bg-white/5 p-1 ring-1 ring-white/10', className)}>
      {periodOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setPeriode(option.value)}
          aria-label={`Période : ${option.label}`}
          className={cn(
            'rounded-lg px-3 py-2 min-h-[44px] text-xs font-medium transition focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500',
            periode === option.value
              ? 'bg-white/10 text-white'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

