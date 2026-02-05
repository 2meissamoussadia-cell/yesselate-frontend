/**
 * Navigation secondaire pour Finances
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface FinancesSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const financesSubCategoriesMap: Record<string, FinancesSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'cashflow', label: 'Trésorerie' },
    { id: 'forecast', label: 'Prévisions' },
  ],
  revenue: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'invoices', label: 'Factures', badge: 0 },
    { id: 'payments-received', label: 'Encaissements', badge: 0 },
    { id: 'recurring', label: 'Récurrents', badge: 0 },
    { id: 'one-time', label: 'Ponctuels', badge: 0 },
  ],
  expenses: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'operational', label: 'Opérationnelles', badge: 0 },
    { id: 'salary', label: 'Salaires', badge: 0 },
    { id: 'equipment', label: 'Équipement', badge: 0 },
    { id: 'services', label: 'Services', badge: 0 },
  ],
  budget: [
    { id: 'all', label: 'Tous les budgets', badge: 0 },
    { id: 'within', label: 'Dans les limites', badge: 0, badgeType: 'success' },
    { id: 'warning', label: 'Proche limite (>80%)', badge: 0, badgeType: 'warning' },
    { id: 'exceeded', label: 'Dépassés', badge: 0, badgeType: 'critical' },
    { id: 'by-project', label: 'Par projet', badge: 0 },
  ],
  pending: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'warning' },
    { id: 'approval', label: 'En approbation', badge: 0 },
    { id: 'processing', label: 'En traitement', badge: 0 },
    { id: 'reconciliation', label: 'À rapprocher', badge: 0 },
  ],
  overdue: [
    { id: 'all', label: 'Tous les impayés', badge: 0, badgeType: 'critical' },
    { id: 'critical', label: 'Critique (>60j)', badge: 0, badgeType: 'critical' },
    { id: 'high', label: 'Important (30-60j)', badge: 0, badgeType: 'warning' },
    { id: 'medium', label: 'Moyen (15-30j)', badge: 0, badgeType: 'warning' },
    { id: 'recent', label: 'Récent (<15j)', badge: 0 },
  ],
  validated: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'week', label: 'Cette semaine', badge: 0 },
    { id: 'month', label: 'Ce mois', badge: 0 },
  ],
  reports: [
    { id: 'all', label: 'Tous les rapports' },
    { id: 'monthly', label: 'Mensuels' },
    { id: 'quarterly', label: 'Trimestriels' },
    { id: 'annual', label: 'Annuels' },
    { id: 'custom', label: 'Personnalisés' },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'trends', label: 'Tendances' },
    { id: 'comparison', label: 'Comparatifs' },
    { id: 'projections', label: 'Projections' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'last-year', label: 'Année dernière' },
    { id: 'older', label: 'Plus anciennes' },
  ],
};

export const financesFiltersMap: Record<string, FinancesSubCategory[]> = {
  'revenue:all': [
    { id: 'high-value', label: 'Haute valeur (>10K)', count: 0 },
    { id: 'paid', label: 'Payés', count: 0 },
    { id: 'unpaid', label: 'Non payés', count: 0 },
  ],
  'expenses:all': [
    { id: 'approved', label: 'Approuvées', count: 0 },
    { id: 'pending-approval', label: 'En attente', count: 0 },
    { id: 'rejected', label: 'Refusées', count: 0 },
  ],
  'budget:all': [
    { id: 'by-category', label: 'Par catégorie' },
    { id: 'by-bureau', label: 'Par bureau' },
    { id: 'by-quarter', label: 'Par trimestre' },
  ],
  'overdue:all': [
    { id: 'by-client', label: 'Par client' },
    { id: 'by-amount', label: 'Par montant' },
    { id: 'by-age', label: 'Par ancienneté' },
  ],
};

interface FinancesSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: FinancesSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: FinancesSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function FinancesSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: FinancesSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Finances</span>
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
                    ? 'bg-cyan-500/15 text-slate-200 border border-cyan-500/30'
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

