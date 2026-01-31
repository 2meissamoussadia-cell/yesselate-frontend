/**
 * Navigation secondaire pour Missions Terrain
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface MissionsSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const missionsSubCategoriesMap: Record<string, MissionsSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'map-view', label: 'Vue carte' },
    { id: 'calendar-view', label: 'Vue calendrier' },
  ],
  planned: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'this-week', label: 'Cette semaine', badge: 0 },
    { id: 'next-week', label: 'Semaine prochaine', badge: 0 },
    { id: 'needs-assignment', label: 'À assigner', badge: 0, badgeType: 'warning' },
  ],
  'in-progress': [
    { id: 'all', label: 'Toutes', badge: 0, badgeType: 'success' },
    { id: 'preparation', label: 'Préparation', badge: 0 },
    { id: 'travel', label: 'En déplacement', badge: 0 },
    { id: 'on-hold', label: 'En pause', badge: 0, badgeType: 'warning' },
  ],
  'on-site': [
    { id: 'all', label: 'Toutes sur site', badge: 0, badgeType: 'success' },
    { id: 'installation', label: 'Installation', badge: 0 },
    { id: 'maintenance', label: 'Maintenance', badge: 0 },
    { id: 'inspection', label: 'Inspection', badge: 0 },
    { id: 'training', label: 'Formation', badge: 0 },
  ],
  delayed: [
    { id: 'all', label: 'Toutes en retard', badge: 0, badgeType: 'critical' },
    { id: 'weather', label: 'Météo', badge: 0, badgeType: 'warning' },
    { id: 'logistics', label: 'Logistique', badge: 0, badgeType: 'warning' },
    { id: 'resources', label: 'Manque ressources', badge: 0, badgeType: 'critical' },
    { id: 'other', label: 'Autres causes', badge: 0 },
  ],
  completed: [
    { id: 'all', label: 'Toutes', badge: 0, badgeType: 'success' },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'week', label: 'Cette semaine', badge: 0 },
    { id: 'month', label: 'Ce mois', badge: 0 },
    { id: 'pending-report', label: 'Rapport en attente', badge: 0, badgeType: 'warning' },
  ],
  canceled: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'client-request', label: 'Demande client', badge: 0 },
    { id: 'weather', label: 'Conditions météo', badge: 0 },
    { id: 'technical', label: 'Problème technique', badge: 0 },
    { id: 'other', label: 'Autres raisons', badge: 0 },
  ],
  'by-region': [
    { id: 'all', label: 'Toutes régions', badge: 0 },
    { id: 'burkina-faso', label: 'Burkina Faso', badge: 0 },
    { id: 'mali', label: 'Mali', badge: 0 },
    { id: 'benin', label: 'Bénin', badge: 0 },
    { id: 'cote-ivoire', label: 'Côte d\'Ivoire', badge: 0 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'performance', label: 'Performance' },
    { id: 'costs', label: 'Coûts' },
    { id: 'efficiency', label: 'Efficacité' },
    { id: 'team-stats', label: 'Stats équipes' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'last-quarter', label: 'Trimestre dernier' },
    { id: 'last-year', label: 'Année dernière' },
    { id: 'older', label: 'Plus anciennes' },
  ],
};

export const missionsFiltersMap: Record<string, MissionsSubCategory[]> = {
  'planned:all': [
    { id: 'high-priority', label: 'Haute priorité', count: 0 },
    { id: 'vip-clients', label: 'Clients VIP', count: 0 },
    { id: 'urgent', label: 'Urgentes', count: 0 },
  ],
  'in-progress:all': [
    { id: 'at-risk', label: 'À risque', count: 0 },
    { id: 'needs-support', label: 'Nécessite support', count: 0 },
  ],
  'on-site:all': [
    { id: 'first-day', label: 'Premier jour', count: 0 },
    { id: 'multi-day', label: 'Plusieurs jours', count: 0 },
    { id: 'extended', label: 'Prolongées', count: 0 },
  ],
  'delayed:all': [
    { id: 'critical-impact', label: 'Impact critique', count: 0 },
    { id: 'client-waiting', label: 'Client en attente', count: 0 },
  ],
};

interface MissionsSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: MissionsSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: MissionsSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function MissionsSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: MissionsSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Missions</span>
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
            <span className="text-slate-400 text-xs">
              {filters.find((f) => f.id === activeFilter)?.label}
            </span>
          </>
        )}
      </div>

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
                    ? 'bg-indigo-500/15 text-slate-200 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge !== undefined && sub.badge !== 0 && (
                  <Badge
                    variant="default"
                    className={cn(
                      'h-4 min-w-4 px-1 text-xs',
                      sub.badgeType === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        : sub.badgeType === 'warning'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : sub.badgeType === 'success'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
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

      {filters.length > 0 && (
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-800/30 border-t border-slate-800/50 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-400 mr-2">Filtrer:</span>
          <button
            onClick={() => onFilterChange?.(null)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
              activeFilter === null
                ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
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
                    : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
                )}
              >
                <span>{filter.label}</span>
                {filter.count !== undefined && (
                  <span className={cn('text-xs px-1.5 py-0.5 rounded', isActive ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-700/40 text-slate-400')}>
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

