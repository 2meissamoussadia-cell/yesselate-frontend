/**
 * Navigation secondaire et tertiaire pour le module Alerts
 * Gère les niveaux 2 (sub-category) et 3 (sub-sub-category)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import {
  alertsNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  findNavNodeById,
  type NavNode,
} from './alertsNavigationConfig';
import type { AlertsMainCategory } from '../types/alertsNavigationTypes';

interface AlertsSubNavigationProps {
  mainCategory: AlertsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: Record<string, number>;
}

export function AlertsSubNavigation({
  mainCategory,
  subCategory,
  subSubCategory,
  onSubCategoryChange,
  onSubSubCategoryChange,
  stats = {},
}: AlertsSubNavigationProps) {
  // Récupérer les sous-catégories (niveau 2) depuis la config
  const subCategories = getSubCategories(mainCategory);

  // Récupérer les sous-sous-catégories (niveau 3) depuis la config si une sub-category est active
  const subSubCategories = subCategory
    ? getSubSubCategories(mainCategory, subCategory)
    : [];

  // Labels pour le breadcrumb
  const mainLabel = alertsNavigationConfig[mainCategory]?.label || 'Alertes';
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  // Calculer les badges dynamiques
  const getBadgeForNode = (node: NavNode): number | string | undefined => {
    if (!stats || Object.keys(stats).length === 0) return node.badge;
    return stats[node.id] || node.badge;
  };

  const getBadgeTypeForNode = (node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'critiques' || node.id.includes('critique')) return 'critical';
      if (node.id === 'sla' || node.id.includes('sla')) return 'warning';
    }
    return node.badgeType || 'default';
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Alertes</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{mainLabel}</span>
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

      {/* Level 2: Sub-categories tabs */}
      {subCategories.length > 0 && (
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
          {subCategories.map((subCat) => {
            const badge = getBadgeForNode(subCat);
            const badgeType = getBadgeTypeForNode(subCat);
            const isActive = subCategory === subCat.id;

            return (
              <Button
                key={subCat.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onSubCategoryChange(subCat.id)}
                className={cn(
                  'h-8 px-3 text-xs whitespace-nowrap',
                  isActive
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                {subCat.label}
                {badge !== undefined && (
                  <Badge
                    variant={badgeType}
                    className={cn(
                      'ml-2 text-[10px] px-1.5 py-0',
                      badgeType === 'critical' &&
                        'bg-red-500/20 text-red-400 border-red-500/30',
                      badgeType === 'warning' &&
                        'bg-amber-500/20 text-amber-400 border-amber-500/30',
                      badgeType === 'success' &&
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                      badgeType === 'default' && 'bg-slate-700 text-slate-300 border-slate-600'
                    )}
                  >
                    {badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      )}

      {/* Level 3: Sub-sub-categories filters */}
      {subSubCategories.length > 0 && (
        <div className="flex items-center gap-1 px-4 pb-2 overflow-x-auto border-t border-slate-800/50">
          <span className="text-xs text-slate-400 mr-2 whitespace-nowrap">Filtres:</span>
          {subSubCategories.map((subSubCat) => {
            const isActive = subSubCategory === subSubCat.id;

            return (
              <Button
                key={subSubCat.id}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onSubSubCategoryChange?.(subSubCat.id)}
                className={cn(
                  'h-7 px-2.5 text-[11px] whitespace-nowrap',
                  isActive
                    ? 'bg-slate-800/80 text-slate-200 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                )}
              >
                {subSubCat.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

