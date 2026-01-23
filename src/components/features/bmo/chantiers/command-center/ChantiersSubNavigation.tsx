/**
 * Navigation secondaire pour Chantiers
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface ChantiersSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const chantiersSubCategoriesMap: Record<string, ChantiersSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'map-view', label: 'Vue carte' },
    { id: 'gantt-view', label: 'Vue Gantt' },
  ],
  active: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'foundation', label: 'Fondations', badge: 0 },
    { id: 'structure', label: 'Structure', badge: 0 },
    { id: 'finishing', label: 'Finitions', badge: 0 },
    { id: 'landscaping', label: 'Aménagements', badge: 0 },
  ],
  planning: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'this-month', label: 'Ce mois', badge: 0 },
    { id: 'next-month', label: 'Mois prochain', badge: 0 },
    { id: 'this-quarter', label: 'Ce trimestre', badge: 0 },
    { id: 'pending-approval', label: 'Validation en attente', badge: 0, badgeType: 'warning' },
  ],
  delayed: [
    { id: 'all', label: 'Tous en retard', badge: 0, badgeType: 'critical' },
    { id: 'minor', label: 'Léger (<7j)', badge: 0, badgeType: 'warning' },
    { id: 'moderate', label: 'Modéré (7-30j)', badge: 0, badgeType: 'warning' },
    { id: 'major', label: 'Important (>30j)', badge: 0, badgeType: 'critical' },
    { id: 'recovery-plan', label: 'Plan rattrapage', badge: 0 },
  ],
  completed: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'week', label: 'Cette semaine', badge: 0 },
    { id: 'month', label: 'Ce mois', badge: 0 },
    { id: 'quarter', label: 'Ce trimestre', badge: 0 },
    { id: 'pending-handover', label: 'Livraison en attente', badge: 0, badgeType: 'warning' },
  ],
  inspection: [
    { id: 'all', label: 'Toutes', badge: 0, badgeType: 'warning' },
    { id: 'scheduled', label: 'Planifiées', badge: 0 },
    { id: 'in-progress', label: 'En cours', badge: 0 },
    { id: 'passed', label: 'Conformes', badge: 0, badgeType: 'success' },
    { id: 'failed', label: 'Non-conformes', badge: 0, badgeType: 'critical' },
  ],
  'by-phase': [
    { id: 'all', label: 'Toutes phases', badge: 0 },
    { id: 'preparation', label: 'Préparation', badge: 0 },
    { id: 'earthworks', label: 'Terrassement', badge: 0 },
    { id: 'construction', label: 'Construction', badge: 0 },
    { id: 'equipment', label: 'Équipements', badge: 0 },
    { id: 'finalization', label: 'Finalisation', badge: 0 },
  ],
  'by-location': [
    { id: 'all', label: 'Toutes localisations', badge: 0 },
    { id: 'burkina-faso', label: 'Burkina Faso', badge: 0 },
    { id: 'mali', label: 'Mali', badge: 0 },
    { id: 'benin', label: 'Bénin', badge: 0 },
    { id: 'cote-ivoire', label: 'Côte d\'Ivoire', badge: 0 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'progress', label: 'Avancement' },
    { id: 'costs', label: 'Coûts' },
    { id: 'quality', label: 'Qualité' },
    { id: 'safety', label: 'Sécurité' },
    { id: 'efficiency', label: 'Efficacité' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'last-year', label: 'Année dernière' },
    { id: 'older', label: 'Plus anciennes' },
  ],
};

export const chantiersFiltersMap: Record<string, ChantiersSubCategory[]> = {
  'active:all': [
    { id: 'on-schedule', label: 'Dans les temps', count: 0 },
    { id: 'at-risk', label: 'À risque', count: 0 },
    { id: 'over-budget', label: 'Dépassement budget', count: 0 },
  ],
  'delayed:all': [
    { id: 'weather', label: 'Météo', count: 0 },
    { id: 'materials', label: 'Matériaux', count: 0 },
    { id: 'workforce', label: 'Main d\'œuvre', count: 0 },
  ],
  'inspection:all': [
    { id: 'urgent', label: 'Urgentes', count: 0 },
    { id: 'regulatory', label: 'Réglementaires', count: 0 },
    { id: 'client', label: 'Client', count: 0 },
  ],
  'by-phase:all': [
    { id: 'behind', label: 'En retard', count: 0 },
    { id: 'ahead', label: 'En avance', count: 0 },
  ],
};

interface ChantiersSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: ChantiersSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: ChantiersSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function ChantiersSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: ChantiersSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-500">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Chantiers</span>
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
                    ? 'bg-teal-500/15 text-slate-200 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge !== undefined && sub.badge !== 0 && (
                  <Badge
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
                  <span className={cn('text-xs px-1.5 py-0.5 rounded', isActive ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-700/40 text-slate-500')}>
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

