/**
 * Navigation secondaire pour Alertes & Risques
 * Sous-onglets et sous-sous-onglets
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import {
  alertesNavigationConfig,
  findNavNodeById,
  getNavNodePath,
} from './alertesNavigationConfig';

interface SubCategory {
  id: string;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

interface AlertesSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  subSubCategory?: string | null;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: {
    critical?: number;
    warning?: number;
    sla?: number;
    blocked?: number;
    acknowledged?: number;
    resolved?: number;
  };
}

export const AlertesSubNavigation = React.memo(function AlertesSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subSubCategory,
  onSubCategoryChange,
  onSubSubCategoryChange,
  stats = {},
}: AlertesSubNavigationProps) {
  // Trouver le nœud principal
  const mainNode = findNavNodeById(mainCategory);
  const subCategories: SubCategory[] = mainNode?.children?.map((child) => ({
    id: child.id,
    label: child.label,
    badge: child.badge,
    badgeType: child.badgeType,
  })) || [];

  // Trouver le nœud sous-catégorie actif
  const subNode = subCategory ? findNavNodeById(subCategory, mainNode?.children) : null;
  const subSubCategories: SubCategory[] = subNode?.children?.map((child) => ({
    id: child.id,
    label: child.label,
    badge: child.badge,
    badgeType: child.badgeType,
  })) || [];

  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  // Obtenir le chemin complet pour le breadcrumb
  const path = subCategory
    ? getNavNodePath(
        findNavNodeById(subCategory, mainNode?.children)?.route || '',
        mainNode?.children
      )
    : [];

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Alertes & Risques</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{mainCategoryLabel}</span>
        {subCategory && activeSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">{activeSubLabel}</span>
          </>
        )}
        {subSubCategory && activeSubSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400 text-xs">{activeSubSubLabel}</span>
          </>
        )}
      </div>

      {/* Sub Categories (Niveau 2) */}
      {subCategories.length > 0 && (
        <div className="flex items-center gap-1 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-hide">
          {subCategories.map((sub) => {
            const isActive = subCategory === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => onSubCategoryChange(sub.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-amber-500/15 text-slate-200 border border-amber-500/30 scale-105'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent hover:scale-[1.02]'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge && (
                  <Badge
                    variant="outline"
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
      )}

      {/* Sub-Sub Categories (Niveau 3) */}
      {subSubCategories.length > 0 && onSubSubCategoryChange && (
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-800/30 border-t border-slate-800/50 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-400 mr-2">Détails:</span>
          {subSubCategories.map((subSub) => {
            const isActive = subSubCategory === subSub.id;

            return (
              <button
                key={subSub.id}
                onClick={() => onSubSubCategoryChange(subSub.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-slate-700/60 text-slate-200 border border-slate-600/50'
                    : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/40 border border-transparent'
                )}
              >
                <span>{subSub.label}</span>
                {subSub.badge !== undefined && (
                  <span
                    className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      isActive
                        ? 'bg-slate-600/50 text-slate-300'
                        : 'bg-slate-700/40 text-slate-400'
                    )}
                  >
                    {subSub.badge}
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

