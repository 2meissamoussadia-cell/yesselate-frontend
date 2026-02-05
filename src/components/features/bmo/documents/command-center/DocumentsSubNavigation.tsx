/**
 * Navigation secondaire pour Documents
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

export interface DocumentsSubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  count?: number;
}

export const documentsSubCategoriesMap: Record<string, DocumentsSubCategory[]> = {
  overview: [
    { id: 'all', label: 'Tout' },
    { id: 'dashboard', label: 'Tableau de bord' },
    { id: 'storage', label: 'Stockage' },
    { id: 'activity', label: 'Activité' },
  ],
  'all-documents': [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'pdf', label: 'PDF', badge: 0 },
    { id: 'word', label: 'Word', badge: 0 },
    { id: 'excel', label: 'Excel', badge: 0 },
    { id: 'images', label: 'Images', badge: 0 },
    { id: 'other', label: 'Autres', badge: 0 },
  ],
  folders: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'projects', label: 'Projets', badge: 0 },
    { id: 'contracts', label: 'Contrats', badge: 0 },
    { id: 'invoices', label: 'Factures', badge: 0 },
    { id: 'reports', label: 'Rapports', badge: 0 },
    { id: 'hr', label: 'RH', badge: 0 },
  ],
  recent: [
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'week', label: 'Cette semaine', badge: 0 },
    { id: 'month', label: 'Ce mois', badge: 0 },
    { id: 'modified', label: 'Modifiés', badge: 0 },
    { id: 'viewed', label: 'Consultés', badge: 0 },
  ],
  shared: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'by-me', label: 'Par moi', badge: 0 },
    { id: 'with-me', label: 'Avec moi', badge: 0 },
    { id: 'public', label: 'Publics', badge: 0 },
    { id: 'private', label: 'Privés', badge: 0 },
  ],
  pending: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'warning' },
    { id: 'approval', label: 'Approbation', badge: 0, badgeType: 'warning' },
    { id: 'signature', label: 'Signature', badge: 0, badgeType: 'warning' },
    { id: 'review', label: 'Révision', badge: 0 },
  ],
  validated: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'success' },
    { id: 'today', label: 'Aujourd\'hui', badge: 0 },
    { id: 'week', label: 'Cette semaine', badge: 0 },
    { id: 'month', label: 'Ce mois', badge: 0 },
  ],
  confidential: [
    { id: 'all', label: 'Tous', badge: 0, badgeType: 'critical' },
    { id: 'top-secret', label: 'Top Secret', badge: 0, badgeType: 'critical' },
    { id: 'restricted', label: 'Restreint', badge: 0, badgeType: 'warning' },
    { id: 'internal', label: 'Interne', badge: 0 },
  ],
  analytics: [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'usage', label: 'Utilisation' },
    { id: 'downloads', label: 'Téléchargements' },
    { id: 'sharing', label: 'Partages' },
    { id: 'storage-stats', label: 'Stats stockage' },
  ],
  trash: [
    { id: 'all', label: 'Tous', badge: 0 },
    { id: 'recent', label: 'Récents', badge: 0 },
    { id: 'old', label: 'Anciens (>30j)', badge: 0, badgeType: 'warning' },
  ],
};

export const documentsFiltersMap: Record<string, DocumentsSubCategory[]> = {
  'all-documents:all': [
    { id: 'large-files', label: 'Fichiers volumineux', count: 0 },
    { id: 'duplicates', label: 'Doublons', count: 0 },
    { id: 'no-tags', label: 'Sans tags', count: 0 },
  ],
  'folders:all': [
    { id: 'empty', label: 'Vides', count: 0 },
    { id: 'shared', label: 'Partagés', count: 0 },
  ],
  'pending:all': [
    { id: 'urgent', label: 'Urgents', count: 0 },
    { id: 'overdue', label: 'En retard', count: 0 },
  ],
};

interface DocumentsSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: DocumentsSubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: DocumentsSubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export function DocumentsSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: DocumentsSubNavigationProps) {
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Maître d'ouvrage</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-400">Documents</span>
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
                    ? 'bg-pink-500/15 text-slate-200 border border-pink-500/30'
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

