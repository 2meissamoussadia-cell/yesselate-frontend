/**
 * Barre "Modules métier" type 3P
 * Toujours visible sous le header : 6 modules (Accueil, Performance, Actions, Risques, Décisions, Temps réel)
 * Chaque module est cliquable et navigue vers la section correspondante.
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  TrendingUp,
  Zap,
  AlertTriangle,
  Scale,
  Activity,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardApps, type DashboardMainCategory } from '../config/dashboardApps';

const MODULE_ICONS: Record<DashboardMainCategory, React.ComponentType<{ className?: string }>> = {
  overview: Home,
  performance: TrendingUp,
  actions: Zap,
  risks: AlertTriangle,
  decisions: Scale,
  realtime: Activity,
};

export function DashboardModulesBar() {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const modules = useMemo(() => Object.values(dashboardApps), []);

  return (
    <div
      className="min-w-0 overflow-x-hidden border-b border-slate-800/60 bg-slate-900/30 px-4 sm:px-6 py-2"
      role="navigation"
      aria-label="Modules métier"
    >
      <div className="flex items-center gap-1 mb-1.5 min-w-0">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
          Solutions métier (3P)
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {modules.map((app) => {
          const isActive = nav.mainCategory === app.id;
          const Icon = MODULE_ICONS[app.id];
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => navigate(app.id, null, null)}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-blue-500/60 bg-blue-500/15 text-blue-200'
                  : 'border-slate-800/70 bg-slate-950/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700/60 hover:text-slate-100'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span>{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
