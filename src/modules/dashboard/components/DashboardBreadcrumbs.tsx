/**
 * Breadcrumbs (fil d'Ariane) - Source unique : Command Center store
 * Labels : config TS (sidebar) en priorité, fallback navigation.config.json
 */

'use client';

import { useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getBreadcrumbLabels } from '../utils/navigationLabels';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

const identity = (key: string) => key;

export const DashboardBreadcrumbs = memo(function DashboardBreadcrumbs({ className }: { className?: string }) {
  const i18n = useI18n();
  const t = i18n?.t ?? identity;
  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const { mainLabel, subLabel, leafLabel } = useMemo(
    () => getBreadcrumbLabels(main || 'overview', sub, leaf),
    [main, sub, leaf]
  );

  // Uniquement navigate() (Store). URL mise à jour par useDashboardCommandCenterUrlSync.
  const go = (next: { main?: string; sub?: string | null; leaf?: string | null }) => {
    const nextMain = next.main || main || 'overview';
    const nextSub = next.sub !== undefined ? next.sub : (next.main ? null : sub);
    const nextLeaf = next.leaf !== undefined ? next.leaf : (next.sub !== undefined || next.main ? null : leaf);

    navigate(nextMain as any, nextSub, nextLeaf);
  };

  const crumbButtonClass = cn(
    'rounded-md px-2 py-1.5 min-h-[32px] inline-flex items-center',
    'text-slate-200 transition-colors duration-150',
    'hover:bg-slate-800/50 hover:text-slate-100',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
    'truncate min-w-0'
  );

  return (
    <nav className={cn('flex items-center gap-1.5 text-xs min-w-0', className)} aria-label="Fil d'Ariane">
      <button
        type="button"
        onClick={() => go({ main: 'overview', sub: null, leaf: null })}
        className={cn(
          'group inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 min-h-[32px]',
          'text-slate-400 transition-colors duration-150 hover:bg-slate-800/50 hover:text-slate-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
        )}
        title="Accueil"
      >
        <Home className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="hidden sm:inline">Tableau de bord</span>
        <span className="sm:hidden">Accueil</span>
      </button>

      <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" aria-hidden />

      <button type="button" onClick={() => go({ main })} className={crumbButtonClass}>
        {t(mainLabel)}
      </button>

      {subLabel ? (
        <>
          <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" aria-hidden />
          <button type="button" onClick={() => go({ main, sub })} className={crumbButtonClass}>
            {t(subLabel)}
          </button>
        </>
      ) : null}

      {leafLabel ? (
        <>
          <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" aria-hidden />
          <span className="rounded-md px-2 py-1.5 min-h-[32px] inline-flex items-center font-medium text-slate-100 truncate min-w-0">
            {t(leafLabel)}
          </span>
        </>
      ) : null}
    </nav>
  );
});
