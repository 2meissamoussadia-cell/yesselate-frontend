/**
 * Navigation secondaire pour Demandes
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface DemandesSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const demandesSubCategoriesMap: Record<string, DemandesSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'statistics', label: 'Statistiques' },
    { id: 'trends', label: 'Tendances' },
  ],
  inbox: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'unread', label: 'Non lues', badge: 0, badgeType: 'warning' },
    { id: 'flagged', label: 'Marquées', badge: 0 },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
  ],
  pending: [
    { id: 'all', label: 'Toutes', badge: 0, badgeType: 'warning' },
    { id: 'awaiting-info', label: 'En attente d\'info', badge: 0 },
    { id: 'awaiting-approval', label: 'En attente validation', badge: 0 },
    { id: 'awaiting-payment', label: 'En attente paiement', badge: 0 },
    { id: 'blocked', label: 'Bloquées', badge: 0, badgeType: 'critical' },
  ],
  urgent: [
    { id: 'all', label: 'Toutes urgentes', badge: 0, badgeType: 'critical' },
    { id: 'critical', label: 'Critiques', badge: 0, badgeType: 'critical' },
    { id: 'high', label: 'Haute priorité', badge: 0, badgeType: 'warning' },
    { id: 'escalated', label: 'Escaladées', badge: 0, badgeType: 'critical' },
  ],
  'in-progress': [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'being-processed', label: 'En traitement', badge: 0 },
    { id: 'under-review', label: 'En révision', badge: 0 },
    { id: 'validation', label: 'En validation', badge: 0 },
    { id: 'implementation', label: 'En implémentation', badge: 0 },
  ],
  approved: [
    { id: 'all', label: 'Toutes', badge: 0, badgeType: 'success' },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'week', label: 'Cette semaine', badge: 0 },
    { id: 'month', label: 'Ce mois', badge: 0 },
    { id: 'to-implement', label: 'À implémenter', badge: 0 },
  ],
  rejected: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'out-of-scope', label: 'Hors périmètre', badge: 0 },
    { id: 'duplicate', label: 'Doublons', badge: 0 },
    { id: 'insufficient-info', label: 'Info insuffisante', badge: 0 },
    { id: 'other', label: 'Autres raisons', badge: 0 },
  ],
  assigned: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'my-team', label: 'Mon équipe', badge: 0 },
    { id: 'by-bureau', label: 'Par bureau', badge: 0 },
    { id: 'by-priority', label: 'Par priorité', badge: 0 },
    { id: 'unassigned', label: 'Non assignées', badge: 0, badgeType: 'warning' },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'performance', label: 'Performance' },
    { id: 'response-time', label: 'Temps de réponse' },
    { id: 'satisfaction', label: 'Satisfaction' },
    { id: 'categories', label: 'Par catégorie' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'completed', label: 'Terminées' },
    { id: 'canceled', label: 'Annulées' },
    { id: 'last-year', label: 'Année dernière' },
  ],
};

export const demandesFiltersMap: Record<string, DemandesSubCategory[]> = {
  'inbox:all': [
    { id: 'high-priority', label: 'Haute priorité', count: 0 },
    { id: 'from-vip', label: 'Clients VIP', count: 0 },
    { id: 'overdue', label: 'En retard', count: 0 },
  ],
  'pending:all': [
    { id: 'by-age', label: 'Par ancienneté' },
    { id: 'by-type', label: 'Par type' },
    { id: 'by-bureau', label: 'Par bureau' },
  ],
  'urgent:all': [
    { id: 'sla-at-risk', label: 'SLA à risque', count: 0 },
    { id: 'overdue', label: 'En retard', count: 0 },
    { id: 'needs-attention', label: 'Nécessite attention', count: 0 },
  ],
  'assigned:all': [
    { id: 'overloaded', label: 'Équipes surchargées', count: 0 },
    { id: 'available', label: 'Équipes disponibles', count: 0 },
  ],
};

interface DemandesSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: DemandesSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: DemandesSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function DemandesSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: DemandesSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Demandes</span>
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
                    ? 'bg-purple-500/15 text-slate-200 border border-purple-500/30'
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
