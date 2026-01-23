/**
 * Navigation secondaire pour Projets en Cours
 * Breadcrumb + Sous-onglets contextuels
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

// ================================
// TYPES
// ================================

export interface ProjetsSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

// ================================
// SOUS-CATÉGORIES PAR CATÉGORIE
// ================================

export const projetsSubCategoriesMap: Record<string, ProjetsSubCategory[]> = {
  overview: [
    { id: 'summary', label: 'Résumé' },
    { id: 'kpis', label: 'KPIs' },
    { id: 'trends', label: 'Tendances' },
    { id: 'alerts', label: 'Alertes' },
  ],
  active: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'execution', label: 'En exécution', badge: 0, badgeType: 'success' },
    { id: 'review', label: 'En révision', badge: 0 },
    { id: 'testing', label: 'Tests', badge: 0 },
    { id: 'at-risk', label: 'À risque', badge: 0, badgeType: 'warning' },
  ],
  planning: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'conception', label: 'Conception', badge: 0 },
    { id: 'estimation', label: 'Estimation', badge: 0 },
    { id: 'validation', label: 'En validation', badge: 0 },
    { id: 'scheduled', label: 'Planifiés', badge: 0 },
  ],
  delayed: [
    { id: 'all', label: 'Tous les retards', badge: 0, badgeType: 'critical' },
    { id: 'critical', label: 'Critique (>30j)', badge: 0, badgeType: 'critical' },
    { id: 'high', label: 'Important (15-30j)', badge: 0, badgeType: 'warning' },
    { id: 'medium', label: 'Moyen (7-15j)', badge: 0, badgeType: 'warning' },
    { id: 'recovery', label: 'Plan de rattrapage', badge: 0 },
  ],
  completed: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'this-month', label: 'Ce mois', badge: 0 },
    { id: 'this-quarter', label: 'Ce trimestre', badge: 0 },
    { id: 'this-year', label: 'Cette année', badge: 0 },
    { id: 'success', label: 'Succès', badge: 0, badgeType: 'success' },
  ],
  kanban: [
    { id: 'all', label: 'Tous' },
    { id: 'by-status', label: 'Par statut' },
    { id: 'by-priority', label: 'Par priorité' },
  ],
  timeline: [
    { id: 'recent', label: 'Récent' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'milestones', label: 'Jalons' },
  ],
  'by-bureau': [
    { id: 'all', label: 'Tous les bureaux' },
    { id: 'bf', label: 'Burkina Faso', badge: 0 },
    { id: 'bm', label: 'Mali', badge: 0 },
    { id: 'bj', label: 'Bénin', badge: 0 },
    { id: 'bct', label: 'Côte d\'Ivoire', badge: 0 },
    { id: 'comparison', label: 'Comparaison' },
  ],
  'by-team': [
    { id: 'all', label: 'Toutes les équipes' },
    { id: 'dev', label: 'Développement', badge: 0 },
    { id: 'infra', label: 'Infrastructure', badge: 0 },
    { id: 'business', label: 'Business', badge: 0 },
    { id: 'support', label: 'Support', badge: 0 },
  ],
  priority: [
    { id: 'all', label: 'Tous prioritaires', badge: 0, badgeType: 'warning' },
    { id: 'strategic', label: 'Stratégiques', badge: 0, badgeType: 'critical' },
    { id: 'urgent', label: 'Urgents', badge: 0, badgeType: 'warning' },
    { id: 'client', label: 'Demande client', badge: 0 },
  ],
  budget: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'consumption', label: 'Consommation' },
    { id: 'forecast', label: 'Prévisions' },
    { id: 'alerts', label: 'Alertes' },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'performance', label: 'Performance' },
    { id: 'budget', label: 'Budget' },
    { id: 'resources', label: 'Ressources' },
    { id: 'risks', label: 'Risques' },
  ],
};

// ================================
// FILTRES NIVEAU 3
// ================================

export const projetsFiltersMap: Record<string, ProjetsSubCategory[]> = {
  'active:all': [
    { id: 'on-time', label: 'Dans les temps', count: 0 },
    { id: 'at-risk', label: 'À risque', count: 0 },
    { id: 'over-budget', label: 'Dépassement budget', count: 0 },
  ],
  'delayed:all': [
    { id: 'by-impact', label: 'Par impact' },
    { id: 'by-duration', label: 'Par durée retard' },
    { id: 'by-budget', label: 'Par dépassement' },
  ],
  'by-bureau:all': [
    { id: 'active-only', label: 'Actifs uniquement', count: 0 },
    { id: 'with-delays', label: 'Avec retards', count: 0 },
    { id: 'high-value', label: 'Haute valeur', count: 0 },
  ],
  'priority:all': [
    { id: 'needs-attention', label: 'Nécessite attention', count: 0 },
    { id: 'escalated', label: 'Escaladés', count: 0 },
    { id: 'blocked', label: 'Bloqués', count: 0 },
  ],
  'budget:overview': [
    { id: 'over-budget', label: 'Dépassement', count: 0 },
    { id: 'under-utilized', label: 'Sous-utilisé', count: 0 },
    { id: 'on-track', label: 'Conforme', count: 0 },
  ],
};

// ================================
// PROPS
// ================================

interface ProjetsSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: ProjetsSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: ProjetsSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

// ================================
// COMPONENT
// ================================

export function ProjetsSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: ProjetsSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-500">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Projets</span>
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
                    ? 'bg-emerald-500/15 text-slate-200 border border-emerald-500/30'
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
                      isActive
                        ? 'bg-slate-600/50 text-slate-300'
                        : 'bg-slate-700/40 text-slate-500'
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

