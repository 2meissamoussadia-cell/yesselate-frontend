/**
 * Sub-navigation verticale — sous-catégories du bloc actif uniquement.
 * Pas d’« Accès rapide » : la sidebar principale suffit pour changer de bloc.
 */

'use client';

import React, { useCallback, useMemo, memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getSubCategories, dashboardNavigationConfig } from './dashboardNavigationConfig';
import { getDefaultLeafForSub } from '../utils/routeValidation';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { nodeAllowed } from './permissions';
import { useDashboardPermissions } from '../hooks/useDashboardPermissions';
import { useDashboardPermissionsStore } from '@/lib/stores/dashboardPermissionsStore';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

export const DashboardSubSidebar = memo(function DashboardSubSidebar() {
  const [expanded, setExpanded] = useState(false);
  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  useDashboardPermissions();
  const permissions = useDashboardPermissionsStore((s) => s.permissions);
  const userContext = useMemo(
    () => ({
      perms: permissions.permissions,
      flags: permissions.featureFlags,
      roles: permissions.roles,
    }),
    [permissions.permissions, permissions.featureFlags, permissions.roles]
  );

  const currentMain = (typeof main === 'string' ? main.toLowerCase() : 'pilotage') as DashboardMainCategory;
  const allSubCategories = getSubCategories(currentMain) || [];
  // Sections "systeme" (Échanges, Conférences, Audit, Journal, Logs, IA, Paramètres) sont dans la sidebar principale BMO — ne pas les dupliquer ici
  const subCategories = useMemo(
    () =>
      currentMain === 'systeme'
        ? []
        : allSubCategories.filter((subCat) => nodeAllowed(userContext, subCat.requires)),
    [currentMain, allSubCategories, userContext]
  );

  const handleSubClick = useCallback(
    (subId: string) => {
      const defaultLeaf = getDefaultLeafForSub(currentMain, subId);
      navigate(currentMain as any, subId, defaultLeaf);
    },
    [currentMain, navigate]
  );

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={cn(
        'shrink-0 flex flex-col border-r border-slate-800/70 bg-slate-950/60 overflow-y-auto overflow-x-hidden scrollbar-dashboard transition-[width] duration-200 ease-out',
        expanded ? 'w-52' : 'w-14'
      )}
      aria-label="Sub-navigation"
      aria-expanded={expanded}
    >
      {/* Sous-catégories du bloc actif (Pilotage, Chantiers, Finance, etc.) */}
      <div className="py-3 px-2">
        <nav
          className="space-y-0.5"
          aria-label={dashboardNavigationConfig[currentMain] ? `Sections ${dashboardNavigationConfig[currentMain].label}` : 'Sections'}
        >
          {subCategories.map((subCat) => {
            const active = subCat.id === sub;
            const Icon = subCat.icon;
            const btn = (
              <button
                key={subCat.id}
                type="button"
                onClick={() => handleSubClick(subCat.id)}
                className={cn(
                  'w-full flex items-center gap-2 rounded-lg py-2 text-left text-sm transition-colors min-h-[36px]',
                  expanded ? 'px-3 justify-start' : 'px-2 justify-center',
                  active
                    ? 'bg-sky-500/15 text-sky-100 border-l-2 border-sky-500'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border-l-2 border-transparent'
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={subCat.label}
              >
                {Icon && (
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                    <Icon className="h-3 w-3 min-h-0 min-w-0 max-h-full max-w-full" aria-hidden />
                  </span>
                )}
                {expanded && <span className="truncate">{subCat.label}</span>}
              </button>
            );
            return expanded ? (
              btn
            ) : (
              <Tooltip key={subCat.id} delayDuration={300}>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {subCat.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </aside>
  );
});
