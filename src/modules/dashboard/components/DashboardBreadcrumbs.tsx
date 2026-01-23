/**
 * Composant Breadcrumbs (Fil d'Ariane) pour la navigation du dashboard
 * Affiche le chemin de navigation actuel : Dashboard > [Main] > [Sub] > [Leaf]
 */

'use client';

import React, { memo, useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardNavigation } from '../context/DashboardNavigationContext';
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
  // Type assertion nécessaire car NavigationConfig n'est pas exporté
  const navConfig = useMemo(() => getNavigationConfig() as Record<string, {
    label: string;
    sub?: Record<string, {
      label: string;
      leaf?: Record<string, { label: string; component: string }>;
    }>;
  }>, []);

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
      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 border-b border-slate-800/60 bg-slate-900/40"
      aria-label="Fil d'Ariane"
    >
      <Home className="h-4 w-4" aria-hidden="true" />
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-600" aria-hidden="true" />
            )}
            <span
              className={cn(
                'transition-colors',
                isLast
                  ? 'text-slate-200 font-medium'
                  : 'text-slate-400 hover:text-slate-300'
              )}
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
