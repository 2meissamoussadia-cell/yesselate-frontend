/**
 * Navigation secondaire pour Tickets Clients
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface TicketsSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const ticketsSubCategoriesMap: Record<string, TicketsSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'sla-status', label: 'Statut SLA' },
    { id: 'team-performance', label: 'Performance équipe' },
  ],
  new: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'warning' },
    { id: 'unassigned', label: 'Non assignés', badge: 0, badgeType: 'critical' },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'last-24h', label: 'Dernières 24h', badge: 0 },
  ],
  'in-progress': [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'investigating', label: 'Investigation', badge: 0 },
    { id: 'in-development', label: 'En développement', badge: 0 },
    { id: 'testing', label: 'Tests', badge: 0 },
    { id: 'pending-release', label: 'Attente release', badge: 0 },
  ],
  'waiting-customer': [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'info-requested', label: 'Info demandée', badge: 0 },
    { id: 'approval-needed', label: 'Validation nécessaire', badge: 0 },
    { id: 'overdue-response', label: 'Réponse en retard', badge: 0, badgeType: 'warning' },
  ],
  escalated: [
    { id: 'all', label: 'Tous escaladés', badge: 0, badgeType: 'critical' },
    { id: 'level-2', label: 'Niveau 2', badge: 0, badgeType: 'warning' },
    { id: 'level-3', label: 'Niveau 3', badge: 0, badgeType: 'critical' },
    { id: 'management', label: 'Management', badge: 0, badgeType: 'critical' },
  ],
  resolved: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'week', label: 'Cette semaine', badge: 0 },
    { id: 'month', label: 'Ce mois', badge: 0 },
    { id: 'pending-feedback', label: 'Attente feedback', badge: 0 },
  ],
  closed: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'satisfied', label: 'Client satisfait', badge: 0, badgeType: 'success' },
    { id: 'unsatisfied', label: 'Client insatisfait', badge: 0, badgeType: 'warning' },
    { id: 'no-feedback', label: 'Sans feedback', badge: 0 },
  ],
  'by-priority': [
    { id: 'all', label: 'Toutes priorités', badge: 0 },
    { id: 'critical', label: 'Critique', badge: 0, badgeType: 'critical' },
    { id: 'high', label: 'Haute', badge: 0, badgeType: 'warning' },
    { id: 'medium', label: 'Moyenne', badge: 0 },
    { id: 'low', label: 'Basse', badge: 0 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'response-times', label: 'Temps de réponse' },
    { id: 'resolution-times', label: 'Temps de résolution' },
    { id: 'satisfaction', label: 'Satisfaction' },
    { id: 'trends', label: 'Tendances' },
    { id: 'categories', label: 'Par catégorie' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'last-quarter', label: 'Trimestre dernier' },
    { id: 'last-year', label: 'Année dernière' },
    { id: 'older', label: 'Plus anciens' },
  ],
};

export const ticketsFiltersMap: Record<string, TicketsSubCategory[]> = {
  'new:all': [
    { id: 'vip-clients', label: 'Clients VIP', count: 0 },
    { id: 'sla-at-risk', label: 'SLA à risque', count: 0 },
    { id: 'bug-reports', label: 'Bugs signalés', count: 0 },
  ],
  'in-progress:all': [
    { id: 'blocked', label: 'Bloqués', count: 0 },
    { id: 'near-deadline', label: 'Près deadline', count: 0 },
    { id: 'overdue', label: 'En retard', count: 0 },
  ],
  'escalated:all': [
    { id: 'sla-breach', label: 'Dépassement SLA', count: 0 },
    { id: 'customer-vip', label: 'Clients VIP', count: 0 },
    { id: 'high-impact', label: 'Impact élevé', count: 0 },
  ],
  'by-priority:all': [
    { id: 'sla-expiring', label: 'SLA expirant', count: 0 },
    { id: 'reopened', label: 'Réouverts', count: 0 },
  ],
};

interface TicketsSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: TicketsSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: TicketsSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function TicketsSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: TicketsSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Tickets</span>
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
                    ? 'bg-orange-500/15 text-slate-200 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge !== undefined && sub.badge !== 0 && (
                  <Badge
                    variant="outline"
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

