/**
 * Navigation secondaire pour Ressources (RH)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface RessourcesSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const ressourcesSubCategoriesMap: Record<string, RessourcesSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'org-chart', label: 'Organigramme' },
    { id: 'headcount', label: 'Effectifs' },
  ],
  employees: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'active', label: 'Actifs', badge: 0, badgeType: 'success' },
    { id: 'on-leave', label: 'En congé', badge: 0 },
    { id: 'probation', label: 'Période d\'essai', badge: 0, badgeType: 'warning' },
    { id: 'contract-ending', label: 'Fin de contrat proche', badge: 0, badgeType: 'warning' },
  ],
  recruitment: [
    { id: 'all', label: 'Tous les postes', badge: 0 },
    { id: 'open-positions', label: 'Postes ouverts', badge: 0, badgeType: 'warning' },
    { id: 'in-progress', label: 'Recrutements en cours', badge: 0 },
    { id: 'candidates', label: 'Candidats', badge: 0 },
    { id: 'interviews', label: 'Entretiens', badge: 0 },
  ],
  leave: [
    { id: 'all', label: 'Toutes', badge: 0, badgeType: 'warning' },
    { id: 'pending', label: 'En attente validation', badge: 0, badgeType: 'warning' },
    { id: 'approved', label: 'Approuvées', badge: 0 },
    { id: 'rejected', label: 'Refusées', badge: 0 },
    { id: 'current', label: 'En cours', badge: 0, badgeType: 'success' },
    { id: 'sick-leave', label: 'Arrêts maladie', badge: 0 },
  ],
  training: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'scheduled', label: 'Planifiées', badge: 0 },
    { id: 'in-progress', label: 'En cours', badge: 0, badgeType: 'success' },
    { id: 'completed', label: 'Terminées', badge: 0 },
    { id: 'mandatory', label: 'Obligatoires', badge: 0, badgeType: 'warning' },
  ],
  evaluations: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'pending', label: 'À réaliser', badge: 0, badgeType: 'warning' },
    { id: 'in-progress', label: 'En cours', badge: 0 },
    { id: 'completed', label: 'Terminées', badge: 0, badgeType: 'success' },
    { id: 'annual', label: 'Annuelles', badge: 0 },
    { id: 'mid-year', label: 'Mi-parcours', badge: 0 },
  ],
  contracts: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'permanent', label: 'CDI', badge: 0 },
    { id: 'fixed-term', label: 'CDD', badge: 0 },
    { id: 'freelance', label: 'Freelance', badge: 0 },
    { id: 'expiring', label: 'Expirant bientôt', badge: 0, badgeType: 'warning' },
  ],
  teams: [
    { id: 'all', label: 'Toutes', badge: 0 },
    { id: 'by-department', label: 'Par département', badge: 0 },
    { id: 'by-location', label: 'Par localisation', badge: 0 },
    { id: 'by-project', label: 'Par projet', badge: 0 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'turnover', label: 'Turnover' },
    { id: 'attendance', label: 'Présence' },
    { id: 'performance', label: 'Performance' },
    { id: 'costs', label: 'Coûts RH' },
    { id: 'diversity', label: 'Diversité' },
  ],
  archive: [
    { id: 'all', label: 'Toutes les archives' },
    { id: 'former-employees', label: 'Anciens employés' },
    { id: 'last-year', label: 'Année dernière' },
  ],
};

export const ressourcesFiltersMap: Record<string, RessourcesSubCategory[]> = {
  'employees:all': [
    { id: 'by-department', label: 'Par département', count: 0 },
    { id: 'by-role', label: 'Par poste', count: 0 },
    { id: 'by-location', label: 'Par localisation', count: 0 },
  ],
  'recruitment:all': [
    { id: 'urgent', label: 'Urgentes', count: 0 },
    { id: 'high-priority', label: 'Haute priorité', count: 0 },
  ],
  'leave:all': [
    { id: 'overdue', label: 'En retard validation', count: 0 },
    { id: 'conflicts', label: 'Conflits planning', count: 0 },
  ],
  'training:all': [
    { id: 'overdue', label: 'En retard', count: 0 },
    { id: 'high-value', label: 'Haute valeur', count: 0 },
  ],
};

interface RessourcesSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: RessourcesSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: RessourcesSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function RessourcesSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: RessourcesSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Ressources</span>
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
                    ? 'bg-violet-500/15 text-slate-200 border border-violet-500/30'
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

