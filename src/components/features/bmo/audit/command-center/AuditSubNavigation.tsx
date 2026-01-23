/**
 * Navigation secondaire pour Audit
 * Breadcrumb et sous-onglets - inspiré de la page Analytics
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';

interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

interface AuditSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subCategories: SubCategory[];
  onSubCategoryChange: (subCategory: string) => void;
  filters?: SubCategory[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

export const AuditSubNavigation = React.memo(function AuditSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
  filters = [],
  activeFilter = null,
  onFilterChange,
}: AuditSubNavigationProps) {
  const activeSubLabel = subCategories.find(s => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-500">Audit</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{mainCategoryLabel}</span>
        {subCategory && activeSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">{activeSubLabel}</span>
          </>
        )}
        {activeFilter && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-500 text-xs">
              {filters.find(f => f.id === activeFilter)?.label}
            </span>
          </>
        )}
      </div>

      {/* Sub Categories (Niveau 2) */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
        {subCategories.map((sub) => {
          const isActive = subCategory === sub.id;

          return (
            <button
              key={sub.id}
              onClick={() => onSubCategoryChange(sub.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-cyan-500/15 text-slate-200 border border-cyan-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent hover:scale-[1.02]'
              )}
            >
              <span>{sub.label}</span>
              {sub.badge && (
                <Badge
                  variant="gray"
                  className={cn(
                    'h-4 min-w-4 px-1 text-xs transition-all duration-200',
                    sub.badgeType === 'critical'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : sub.badgeType === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-600/40 text-slate-400 border-slate-600/50',
                    isActive && 'scale-110'
                  )}
                >
                  {sub.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

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
                {filter.badge !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      isActive ? 'bg-slate-600/50 text-slate-300' : 'bg-slate-700/40 text-slate-500'
                    )}
                  >
                    {filter.badge}
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

