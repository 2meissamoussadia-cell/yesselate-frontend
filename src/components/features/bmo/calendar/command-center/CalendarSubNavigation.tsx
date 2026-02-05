/**
 * Navigation secondaire pour le Calendrier
 * Breadcrumb + Sous-onglets contextuels
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

// ================================
// TYPES
// ================================

export interface CalendarSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

// ================================
// SOUS-CATÉGORIES PAR CATÉGORIE
// ================================

export const calendarSubCategoriesMap: Record<string, CalendarSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'timeline', label: 'Timeline' },
  ],
  today: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'morning', label: 'Matin (8h-12h)', badge: 0 },
    { id: 'afternoon', label: 'Après-midi (12h-18h)', badge: 0 },
    { id: 'evening', label: 'Soirée (18h-23h)', badge: 0 },
  ],
  week: [
    { id: 'all', label: 'Toute la semaine', badge: 0 },
    { id: 'monday', label: 'Lundi', badge: 0 },
    { id: 'tuesday', label: 'Mardi', badge: 0 },
    { id: 'wednesday', label: 'Mercredi', badge: 0 },
    { id: 'thursday', label: 'Jeudi', badge: 0 },
    { id: 'friday', label: 'Vendredi', badge: 0 },
    { id: 'weekend', label: 'Week-end', badge: 0 },
  ],
  month: [
    { id: 'calendar', label: 'Vue calendrier' },
    { id: 'list', label: 'Vue liste' },
    { id: 'gantt', label: 'Vue Gantt' },
    { id: 'stats', label: 'Statistiques' },
  ],
  conflicts: [
    { id: 'all', label: 'Tous les conflits', badge: 0, badgeType: 'critical' },
    { id: 'time', label: 'Conflits horaires', badge: 0, badgeType: 'critical' },
    { id: 'resource', label: 'Conflits ressources', badge: 0, badgeType: 'warning' },
    { id: 'location', label: 'Conflits salles', badge: 0, badgeType: 'warning' },
  ],
  deadlines: [
    { id: 'all', label: 'Toutes les échéances', badge: 0 },
    { id: 'overdue', label: 'En retard', badge: 0, badgeType: 'critical' },
    { id: 'today', label: 'Aujourd\'hui', badge: 0, badgeType: 'warning' },
    { id: 'week', label: 'Cette semaine', badge: 0, badgeType: 'warning' },
    { id: 'upcoming', label: 'À venir', badge: 0 },
  ],
  meetings: [
    { id: 'all', label: 'Toutes les réunions', badge: 0 },
    { id: 'internal', label: 'Internes', badge: 0 },
    { id: 'external', label: 'Externes', badge: 0 },
    { id: 'recurring', label: 'Récurrentes', badge: 0 },
    { id: 'online', label: 'En ligne', badge: 0 },
  ],
  milestones: [
    { id: 'all', label: 'Tous les jalons', badge: 0 },
    { id: 'projects', label: 'Projets', badge: 0 },
    { id: 'phases', label: 'Phases', badge: 0 },
    { id: 'deliverables', label: 'Livrables', badge: 0 },
  ],
  favorites: [
    { id: 'all', label: 'Tous les favoris' },
    { id: 'recent', label: 'Récents' },
    { id: 'pinned', label: 'Épinglés' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'last-week', label: 'Semaine dernière' },
    { id: 'last-month', label: 'Mois dernier' },
    { id: 'last-year', label: 'Année dernière' },
  ],
};

// ================================
// FILTRES NIVEAU 3
// ================================

export const calendarFiltersMap: Record<string, CalendarSubCategory[]> = {
  'today:all': [
    { id: 'priority-high', label: 'Priorité haute', count: 0 },
    { id: 'priority-medium', label: 'Priorité moyenne', count: 0 },
    { id: 'unassigned', label: 'Non assignés', count: 0 },
  ],
  'week:all': [
    { id: 'by-project', label: 'Par projet' },
    { id: 'by-priority', label: 'Par priorité' },
    { id: 'by-participant', label: 'Par participant' },
  ],
  'conflicts:all': [
    { id: 'critical-only', label: 'Critiques uniquement', count: 0 },
    { id: 'resolvable', label: 'Résolvables', count: 0 },
    { id: 'pending', label: 'En attente', count: 0 },
  ],
  'deadlines:overdue': [
    { id: 'by-delay', label: 'Par délai' },
    { id: 'by-impact', label: 'Par impact' },
    { id: 'by-owner', label: 'Par responsable' },
  ],
  'meetings:all': [
    { id: 'with-participants', label: 'Avec participants', count: 0 },
    { id: 'pending-confirmation', label: 'En attente confirmation', count: 0 },
    { id: 'confirmed', label: 'Confirmées', count: 0 },
  ],
};

// ================================
// PROPS
// ================================

interface CalendarSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: CalendarSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: CalendarSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

// ================================
// COMPONENT
// ================================

export function CalendarSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: CalendarSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Calendrier</span>
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
                    ? 'bg-blue-500/15 text-slate-200 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge !== undefined && sub.badge !== 0 && (
                  <Badge
                    variant="gray"
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
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      isActive
                        ? 'bg-slate-600/50 text-slate-300'
                        : 'bg-slate-700/40 text-slate-400'
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

