/**
 * Breadcrumbs (fil d'Ariane) - Source unique : Command Center store
 * ✅ Unifié avec la sidebar et subnav pour cohérence totale
 */

'use client';

import { useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import { getNavigationConfig } from '../utils/routeValidation';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

const formatLabel = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const DashboardBreadcrumbs = memo(function DashboardBreadcrumbs({ className }: { className?: string }) {
  // ✅ Source unique : Command Center store
  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const config = useMemo(() => getNavigationConfig(), []);
  const mainConf = config[main || 'overview'];

  const mainLabel = mainConf?.label ?? formatLabel(main || 'overview');
  const subLabel = sub && mainConf?.sub?.[sub] ? mainConf.sub[sub].label : null;
  const leafLabel = leaf && sub && mainConf?.sub?.[sub]?.leaf?.[leaf] ? mainConf.sub[sub].leaf[leaf].label : null;

  const go = (next: { main?: string; sub?: string | null; leaf?: string | null }) => {
    const nextMain = next.main || main || 'overview';
    const nextSub = next.sub !== undefined ? next.sub : (next.main ? null : sub);
    const nextLeaf = next.leaf !== undefined ? next.leaf : (next.sub !== undefined || next.main ? null : leaf);

    navigate(nextMain as any, nextSub, nextLeaf);
  };

  return (
    <nav className={cn('flex items-center gap-1.5 text-xs min-w-0', className)} aria-label="Fil d'Ariane">
      <button
        type="button"
        onClick={() => go({ main: 'overview', sub: null, leaf: null })}
        className={cn(
          'group inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5',
          'text-slate-400 transition-colors hover:bg-slate-900/40 hover:text-slate-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
        )}
        title="Accueil"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Tableau de bord</span>
        <span className="sm:hidden">Accueil</span>
      </button>

      <ChevronRight className="h-3 w-3 text-slate-600" />

      <button
        type="button"
        onClick={() => go({ main })}
        className="rounded-md px-1.5 py-0.5 text-slate-200 transition-colors hover:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 truncate min-w-0"
      >
        {mainLabel}
      </button>

      {subLabel ? (
        <>
          <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
          <button
            type="button"
            onClick={() => go({ main, sub })}
            className="rounded-md px-1.5 py-0.5 text-slate-200 transition-colors hover:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500/40 truncate min-w-0"
          >
            {subLabel}
          </button>
        </>
      ) : null}

      {leafLabel ? (
        <>
          <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
          <span className="rounded-md px-1.5 py-0.5 font-medium text-slate-100 truncate min-w-0">{leafLabel}</span>
        </>
      ) : null}
    </nav>
  );
});
