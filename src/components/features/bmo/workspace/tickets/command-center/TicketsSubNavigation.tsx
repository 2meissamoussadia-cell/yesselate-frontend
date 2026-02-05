/**
 * Navigation secondaire et tertiaire pour Tickets
 * Breadcrumb + Sous-onglets contextuels
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { ticketsCategories } from './TicketsCommandSidebar';

export interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Sous-catégories par catégorie principale
export const ticketsSubCategoriesMap: Record<string, SubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'summary', label: 'Résumé' },
    { id: 'highlights', label: 'Points clés', badge: 3 },
  ],
  inbox: [
    { id: 'all', label: 'Tous', badge: 42 },
    { id: 'unread', label: 'Non lus', badge: 15 },
    { id: 'assigned', label: 'Assignés à moi', badge: 8 },
    { id: 'unassigned', label: 'Non assignés', badge: 12, badgeType: 'warning' },
  ],
  critical: [
    { id: 'all', label: 'Tous', badge: 5, badgeType: 'critical' },
    { id: 'sla-breach', label: 'SLA dépassé', badge: 2, badgeType: 'critical' },
    { id: 'escalated', label: 'Escaladés', badge: 3, badgeType: 'warning' },
  ],
  pending: [
    { id: 'all', label: 'Tous', badge: 18 },
    { id: 'waiting-client', label: 'Attente client', badge: 10 },
    { id: 'waiting-internal', label: 'Attente interne', badge: 5 },
    { id: 'scheduled', label: 'Planifiés', badge: 3 },
  ],
  resolved: [
    { id: 'all', label: 'Tous', badge: 156 },
    { id: 'today', label: "Aujourd'hui", badge: 12 },
    { id: 'this-week', label: 'Cette semaine', badge: 45 },
    { id: 'archived', label: 'Archivés' },
  ],
  conversations: [
    { id: 'all', label: 'Toutes', badge: 8 },
    { id: 'active', label: 'Actives', badge: 5 },
    { id: 'recent', label: 'Récentes' },
  ],
  analytics: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'performance', label: 'Performance' },
    { id: 'sla', label: 'SLA' },
    { id: 'trends', label: 'Tendances' },
  ],
  clients: [
    { id: 'all', label: 'Tous' },
    { id: 'active', label: 'Actifs' },
    { id: 'vip', label: 'VIP', badge: 12 },
    { id: 'at-risk', label: 'À risque', badge: 4, badgeType: 'warning' },
  ],
  settings: [
    { id: 'general', label: 'Général' },
    { id: 'categories', label: 'Catégories' },
    { id: 'sla-rules', label: 'Règles SLA' },
    { id: 'templates', label: 'Modèles' },
    { id: 'automations', label: 'Automatisations' },
  ],
};

// Filtres de niveau 3 par sous-catégorie
export const ticketsFiltersMap: Record<string, SubCategory[]> = {
  'inbox:all': [
    { id: 'all-priority', label: 'Toutes priorités' },
    { id: 'critical', label: 'Critique', badge: 2, badgeType: 'critical' },
    { id: 'high', label: 'Haute', badge: 8 },
    { id: 'medium', label: 'Moyenne', badge: 20 },
    { id: 'low', label: 'Basse', badge: 12 },
  ],
  'inbox:assigned': [
    { id: 'all-status', label: 'Tous statuts' },
    { id: 'open', label: 'Ouvert' },
    { id: 'in-progress', label: 'En cours' },
    { id: 'on-hold', label: 'En pause' },
  ],
};

interface TicketsSubNavigationProps {
  mainCategory: string;
  subCategory: string;
  filter?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onFilterChange?: (filter: string) => void;
}

export const TicketsSubNavigation = React.memo(function TicketsSubNavigation({
  mainCategory,
  subCategory,
  filter,
  onSubCategoryChange,
  onFilterChange,
}: TicketsSubNavigationProps) {
  const mainCategoryData = ticketsCategories.find((c) => c.id === mainCategory);
  const subCategories = ticketsSubCategoriesMap[mainCategory] || [];
  const currentSubCategory = subCategories.find((s) => s.id === subCategory);
  const filters = ticketsFiltersMap[`${mainCategory}:${subCategory}`] || [];

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Tickets</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        {mainCategoryData && (
          <>
            <span className="text-slate-300 font-medium">{mainCategoryData.label}</span>
            {currentSubCategory && currentSubCategory.id !== 'all' && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="text-slate-400">{currentSubCategory.label}</span>
              </>
            )}
            {filter && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="text-slate-400 text-xs">
                  {filters.find((f) => f.id === filter)?.label}
                </span>
              </>
            )}
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
                    ? 'bg-purple-500/15 text-slate-200 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge && (
                  <Badge
                    variant="outline"
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
      {filters.length > 0 && onFilterChange && (
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-800/30 border-t border-slate-800/50 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-400 mr-2">Filtrer:</span>
          {filters.map((f) => {
            const isActive = filter === f.id;

            return (
              <button
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                    : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
                )}
              >
                <span>{f.label}</span>
                {f.badge && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      isActive ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-700/40 text-slate-400',
                      f.badgeType === 'critical' && 'bg-red-500/30 text-red-400',
                      f.badgeType === 'warning' && 'bg-amber-500/30 text-amber-400'
                    )}
                  >
                    {f.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

