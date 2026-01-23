/**
 * Navigation secondaire pour Equipements
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface EquipementsSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const equipementsSubCategoriesMap: Record<string, EquipementsSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'utilization', label: 'Taux utilisation' },
    { id: 'costs', label: 'Coûts' },
  ],
  'all-equipment': [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'vehicles', label: 'Véhicules', badge: 0 },
    { id: 'tools', label: 'Outils', badge: 0 },
    { id: 'machinery', label: 'Machines', badge: 0 },
    { id: 'electronics', label: 'Électronique', badge: 0 },
    { id: 'furniture', label: 'Mobilier', badge: 0 },
  ],
  available: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'ready', label: 'Prêts à utiliser', badge: 0, badgeType: 'success' },
    { id: 'reserved', label: 'Réservés', badge: 0 },
  ],
  'in-use': [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'on-site', label: 'Sur chantier', badge: 0 },
    { id: 'in-office', label: 'Au bureau', badge: 0 },
    { id: 'rented-out', label: 'En location', badge: 0 },
  ],
  maintenance: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'warning' },
    { id: 'preventive', label: 'Préventive', badge: 0 },
    { id: 'corrective', label: 'Corrective', badge: 0, badgeType: 'warning' },
    { id: 'in-progress', label: 'En cours', badge: 0, badgeType: 'warning' },
    { id: 'completed', label: 'Terminée', badge: 0, badgeType: 'success' },
  ],
  'out-of-service': [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'critical' },
    { id: 'broken', label: 'En panne', badge: 0, badgeType: 'critical' },
    { id: 'awaiting-repair', label: 'Attente réparation', badge: 0, badgeType: 'warning' },
    { id: 'to-replace', label: 'À remplacer', badge: 0, badgeType: 'critical' },
  ],
  scheduled: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'this-week', label: 'Cette semaine', badge: 0, badgeType: 'warning' },
    { id: 'this-month', label: 'Ce mois', badge: 0 },
    { id: 'next-month', label: 'Mois prochain', badge: 0 },
    { id: 'overdue', label: 'En retard', badge: 0, badgeType: 'critical' },
  ],
  'by-location': [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'burkina-faso', label: 'Burkina Faso', badge: 0 },
    { id: 'mali', label: 'Mali', badge: 0 },
    { id: 'benin', label: 'Bénin', badge: 0 },
    { id: 'cote-ivoire', label: 'Côte d\'Ivoire', badge: 0 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'utilization', label: 'Utilisation' },
    { id: 'maintenance-costs', label: 'Coûts maintenance' },
    { id: 'depreciation', label: 'Dépréciation' },
    { id: 'efficiency', label: 'Efficacité' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'sold', label: 'Vendus', badge: 0 },
    { id: 'scrapped', label: 'Mis au rebut', badge: 0 },
  ],
};

export const equipementsFiltersMap: Record<string, EquipementsSubCategory[]> = {
  'all-equipment:all': [
    { id: 'high-value', label: 'Haute valeur', count: 0 },
    { id: 'warranty-expiring', label: 'Garantie expirant', count: 0 },
    { id: 'old', label: 'Anciens (>5ans)', count: 0 },
  ],
  'maintenance:all': [
    { id: 'urgent', label: 'Urgente', count: 0 },
    { id: 'high-cost', label: 'Coût élevé', count: 0 },
  ],
  'scheduled:all': [
    { id: 'critical-equipment', label: 'Équipements critiques', count: 0 },
  ],
};

interface EquipementsSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: EquipementsSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: EquipementsSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function EquipementsSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: EquipementsSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-500">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Équipements</span>
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
                    ? 'bg-lime-500/15 text-slate-200 border border-lime-500/30'
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
