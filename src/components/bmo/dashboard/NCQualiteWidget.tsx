'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { NonConformite } from '@/lib/hooks/dashboard/useDashboardData';

export interface NCQualiteWidgetProps {
  nc: NonConformite[];
}

export const NCQualiteWidget = memo(function NCQualiteWidget({ nc }: NCQualiteWidgetProps) {
  if (!nc?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Aucune NC ouverte</p>
    );
  }

  return (
    <ul className="space-y-2">
      {nc.map((n) => (
        <li key={n.id}>
          <Link
            href="/maitre-ouvrage/qualite"
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <AlertTriangle
              className={cn(
                'h-4 w-4 flex-shrink-0 mt-0.5',
                n.criticite === 'critique'
                  ? 'text-rose-500'
                  : n.criticite === 'majeure'
                    ? 'text-amber-500'
                    : 'text-slate-400'
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {n.reference}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {n.chantier} • {n.statut}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
});
