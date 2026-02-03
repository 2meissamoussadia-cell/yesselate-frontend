'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight } from 'lucide-react';
import type { DashboardTache } from '@/lib/hooks/dashboard/useDashboardData';

export interface PlanningWidgetProps {
  taches: DashboardTache[];
}

export const PlanningWidget = memo(function PlanningWidget({ taches }: PlanningWidgetProps) {
  if (!taches?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">Aucune tâche cette semaine</p>
    );
  }

  return (
    <ul className="space-y-2">
      {taches.slice(0, 5).map((t) => (
        <li key={t.id}>
          <Link
            href="/maitre-ouvrage/planning"
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
          >
            <Calendar className="h-4 w-4 text-sky-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {t.titre}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.dateDebut} • {t.chantier || '-'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
});
