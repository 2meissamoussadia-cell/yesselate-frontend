'use client';

import React, { memo } from 'react';
import { Activity } from 'lucide-react';
import type { DashboardActivite } from '@/lib/hooks/dashboard/useDashboardData';

export interface ActivitesRecentesProps {
  activites: DashboardActivite[];
}

export const ActivitesRecentes = memo(function ActivitesRecentes({ activites }: ActivitesRecentesProps) {
  if (!activites?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Aucune activité récente</p>
    );
  }

  return (
    <ul className="space-y-2">
      {activites.slice(0, 6).map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
        >
          <Activity className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-900 dark:text-slate-100">{a.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {a.date}
              {a.auteur ? ` • ${a.auteur}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
});
