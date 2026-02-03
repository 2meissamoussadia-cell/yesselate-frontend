'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { FileCheck } from 'lucide-react';
import type { ValidationEnAttente as ValidationType } from '@/lib/hooks/dashboard/useDashboardData';

export interface ValidationEnAttenteProps {
  validations: ValidationType[];
}

function formatMontant(n?: number): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M FCFA`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k FCFA`;
  return `${n} FCFA`;
}

export const ValidationEnAttente = memo(function ValidationEnAttenteWidget({
  validations,
}: ValidationEnAttenteProps) {
  if (!validations?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Aucune validation en attente</p>
    );
  }

  return (
    <ul className="space-y-2">
      {validations.map((v) => (
        <li key={v.id}>
          <Link
            href="/maitre-ouvrage/validation-bc"
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <FileCheck className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {v.reference}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {v.demandeur}
                {v.montant != null ? ` • ${formatMontant(v.montant)}` : ''}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
});
