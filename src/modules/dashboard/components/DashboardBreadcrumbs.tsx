/**
 * Composant Breadcrumbs pour la navigation du Dashboard
 * Affiche le chemin de navigation actuel avec possibilité de naviguer
 */

'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';
import { dashboardNavigationConfig, findNavNodeById } from '../navigation/dashboardNavigationConfig';
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';

interface BreadcrumbItem {
  id: string;
  label: string;
  main?: string;
  sub?: string;
  leaf?: string;
}

export function DashboardBreadcrumbs() {
  const { main, sub, leaf, setMain, setSub, setLeaf } = useDashboardNavigationStore();

  // Construire les breadcrumbs
  const breadcrumbs = React.useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];

    // Accueil (Dashboard)
    items.push({
      id: 'home',
      label: 'Dashboard',
      main: 'overview',
    });

    // Niveau 1: Main category
    const mainNode = dashboardNavigationConfig[main as DashboardMainCategory];
    if (mainNode) {
      items.push({
        id: main,
        label: mainNode.label,
        main: main,
      });
    }

    // Niveau 2: Sub category
    if (sub) {
      const subNode = findNavNodeById(main as DashboardMainCategory, sub);
      if (subNode) {
        items.push({
          id: sub,
          label: subNode.label,
          main: main,
          sub: sub,
        });
      }
    }

    // Niveau 3: Leaf category
    if (leaf) {
      const leafNode = findNavNodeById(main as DashboardMainCategory, sub || undefined, leaf);
      if (leafNode) {
        items.push({
          id: leaf,
          label: leafNode.label,
          main: main,
          sub: sub || undefined,
          leaf: leaf,
        });
      }
    }

    return items;
  }, [main, sub, leaf]);

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.id === 'home') {
      setMain('overview');
      setSub(null);
      setLeaf(null);
    } else if (item.main && !item.sub) {
      setMain(item.main);
      setSub(null);
      setLeaf(null);
    } else if (item.main && item.sub && !item.leaf) {
      setMain(item.main);
      setSub(item.sub);
      setLeaf(null);
    } else if (item.main && item.sub && item.leaf) {
      setMain(item.main);
      setSub(item.sub);
      setLeaf(item.leaf);
    }
  };

  if (breadcrumbs.length <= 1) {
    return null; // Ne pas afficher si on est juste sur l'accueil
  }

  return (
    <nav
      className="flex items-center gap-1.5 px-4 py-2 text-xs text-slate-400 bg-slate-900/30 border-b border-slate-800/50"
      aria-label="Fil d'Ariane"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isClickable = !isLast && item.id !== 'home';

        return (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-slate-600 flex-shrink-0" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(item)}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-1 transition-colors',
                isLast
                  ? 'text-slate-200 font-medium cursor-default'
                  : isClickable
                  ? 'text-slate-400 hover:text-slate-200 hover:underline'
                  : 'text-slate-500 cursor-default',
                item.id === 'home' && 'text-slate-500 hover:text-slate-300'
              )}
              aria-current={isLast ? 'page' : undefined}
            >
              {item.id === 'home' && <Home className="h-3 w-3" aria-hidden="true" />}
              <span>{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

