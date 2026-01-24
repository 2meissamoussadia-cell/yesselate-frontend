/**
 * Composant Breadcrumbs (Fil d'Ariane) pour la navigation du dashboard
 * Affiche le chemin de navigation actuel : Dashboard > [Main] > [Sub] > [Leaf]
 */

'use client';

import React, { memo, useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';
import { getNavigationConfig } from '../utils/routeValidation';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

/**
 * Composant Breadcrumbs pour le dashboard
 * Lit l'état de navigation et affiche un fil d'Ariane cohérent
 */
export const DashboardBreadcrumbs = memo(function DashboardBreadcrumbs() {
  // ✅ Utiliser directement le store pour éviter les problèmes de typage
  const main = useDashboardNavigationStore((state) => state.main);
  const sub = useDashboardNavigationStore((state) => state.sub);
  const leaf = useDashboardNavigationStore((state) => state.leaf);
  
  // ✅ Mémoriser la config pour éviter les recalculs
  // NavigationConfig est maintenant exporté, plus besoin de type assertion
  const navConfig = useMemo(() => getNavigationConfig(), []);

  // ✅ Construire les items du breadcrumb
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Dashboard',
        path: '/maitre-ouvrage/dashboard',
      },
    ];

    // Ajouter main
    if (main && navConfig[main]) {
      items.push({
        label: navConfig[main].label || main,
      });
    }

    // Ajouter sub
    if (main && sub && navConfig[main]?.sub?.[sub]) {
      items.push({
        label: navConfig[main].sub[sub].label || sub,
      });
    }

    // Ajouter leaf
    if (main && sub && leaf && navConfig[main]?.sub?.[sub]?.leaf?.[leaf]) {
      items.push({
        label: navConfig[main].sub[sub].leaf[leaf].label || leaf,
      });
    }

    return items;
  }, [main, sub, leaf, navConfig]);

  // Ne pas afficher si seulement Dashboard
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center gap-2 px-6 py-3 text-sm text-slate-300 border-b border-slate-800/60 bg-slate-900/40 min-w-0 overflow-hidden"
      aria-label="Fil d'Ariane"
    >
      <Home className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" aria-hidden="true" />
            )}
            <span
              className={cn(
                'transition-colors truncate min-w-0',
                isLast
                  ? 'text-slate-100 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.label}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
});

DashboardBreadcrumbs.displayName = 'DashboardBreadcrumbs';
