/**
 * Navigation secondaire pour Alertes
 * Breadcrumb et sous-onglets - inspiré de Gouvernance/Analytics
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface AlertsSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
  count?: number;
}

// Sous-catégories par catégorie principale
export const alertsSubCategoriesMap: Record<string, AlertsSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'highlights', label: 'Points clés', badge: 5 },
  ],
  critical: [
    { id: 'all', label: 'Toutes', badge: 3, badgeType: 'critical' },
    { id: 'payment', label: 'Paiements', badge: 1, badgeType: 'critical' },
    { id: 'contract', label: 'Contrats', badge: 1, badgeType: 'critical' },
    { id: 'budget', label: 'Budgets', badge: 1, badgeType: 'critical' },
    { id: 'system', label: 'Système' },
  ],
  warning: [
    { id: 'all', label: 'Toutes', badge: 8, badgeType: 'warning' },
    { id: 'payment', label: 'Paiements', badge: 3, badgeType: 'warning' },
    { id: 'contract', label: 'Contrats', badge: 2, badgeType: 'warning' },
    { id: 'budget', label: 'Budgets', badge: 2, badgeType: 'warning' },
    { id: 'resource', label: 'Ressources', badge: 1, badgeType: 'warning' },
  ],
  sla: [
    { id: 'all', label: 'Tous les SLA', badge: 5 },
    { id: 'critical', label: 'Critique (>48h)', badge: 2, badgeType: 'critical' },
    { id: 'warning', label: 'Attention (24-48h)', badge: 3, badgeType: 'warning' },
    { id: 'approaching', label: 'Approchant (<24h)' },
  ],
  blocked: [
    { id: 'all', label: 'Tous' },
    { id: 'validation', label: 'En validation' },
    { id: 'signature', label: 'En signature' },
    { id: 'external', label: 'Dépendance externe' },
  ],
  acknowledged: [
    { id: 'all', label: 'Toutes' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'week', label: 'Cette semaine' },
    { id: 'mine', label: 'Mes acquittements' },
  ],
  resolved: [
    { id: 'all', label: 'Toutes' },
    { id: 'today', label: "Aujourd'hui" },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
  ],
  rules: [
    { id: 'all', label: 'Toutes' },
    { id: 'active', label: 'Actives' },
    { id: 'disabled', label: 'Désactivées' },
    { id: 'custom', label: 'Personnalisées' },
  ],
  history: [
    { id: 'all', label: 'Tout' },
    { id: 'actions', label: 'Actions' },
    { id: 'escalations', label: 'Escalades' },
    { id: 'resolutions', label: 'Résolutions' },
  ],
  favorites: [
    { id: 'all', label: 'Tous' },
    { id: 'pinned', label: 'Épinglés' },
    { id: 'watched', label: 'Surveillés' },
  ],
};

// Filtres de niveau 3
export const alertsFiltersMap: Record<string, AlertsSubCategory[]> = {
  'critical:all': [
    { id: 'last-hour', label: 'Dernière heure', count: 1 },
    { id: 'today', label: "Aujourd'hui", count: 2 },
    { id: 'unassigned', label: 'Non assignées', count: 1 },
  ],
  'warning:all': [
    { id: 'last-hour', label: 'Dernière heure', count: 2 },
    { id: 'today', label: "Aujourd'hui", count: 5 },
    { id: 'unassigned', label: 'Non assignées', count: 3 },
  ],
  'sla:all': [
    { id: 'by-bureau', label: 'Par bureau' },
    { id: 'by-type', label: 'Par type' },
    { id: 'by-priority', label: 'Par priorité' },
  ],
};

interface AlertsSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: AlertsSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: AlertsSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function AlertsSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: AlertsSubNavigationProps) {
  const activeSubLabel = subCategories.find(s => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-500">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Alertes</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{mainCategoryLabel}</span>
        {subCategory && activeSubLabel && subCategory !== 'all' && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">{activeSubLabel}</span>
          </>
        )}
        {activeFilter && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-500 text-xs">
              {filters.find(f => f.id === activeFilter)?.label}
            </span>
          </>
        )}
      </div>

      {/* Sub Categories (Niveau 2) */}
      {subCategories.length > 0 && (
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
          {subCategories.map((sub) => {
            const isActive = subCategory === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => onSubCategoryChange(sub.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-amber-500/15 text-slate-200 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge && (
                  <Badge
                    variant="default"
                    className={cn(
                      'h-4 min-w-4 px-1 text-xs',
                      sub.badgeType === 'critical'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : sub.badgeType === 'warning'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-slate-600/40 text-slate-400 border-slate-600/50'
                    )}
                  >
                    {sub.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Filters (Niveau 3) */}
      {filters.length > 0 && (
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-800/30 border-t border-slate-800/50 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-500 mr-2">Filtrer:</span>
          <button
            onClick={() => onFilterChange?.(null)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
              activeFilter === null
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
            )}
          >
            Tous
          </button>
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;

            return (
              <button
                key={filter.id}
                onClick={() => onFilterChange?.(filter.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                    : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
                )}
              >
                <span>{filter.label}</span>
                {filter.count !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      isActive ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-700/40 text-slate-500'
                    )}
                  >
                    {filter.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

