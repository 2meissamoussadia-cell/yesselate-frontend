'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { DashboardChantier } from '@/lib/hooks/dashboard/useDashboardData';

export interface ChantiersMapProps {
  chantiers: DashboardChantier[];
}

export const ChantiersMap = memo(function ChantiersMap({ chantiers }: ChantiersMapProps) {
  if (!chantiers?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 h-32 flex items-center justify-center">
        Aucun chantier
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {chantiers.map((c) => (
        <Link
          key={c.id}
          href="/maitre-ouvrage/chantiers"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {c.nom}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {c.avancement != null ? `${c.avancement}%` : c.statut || '—'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
});
