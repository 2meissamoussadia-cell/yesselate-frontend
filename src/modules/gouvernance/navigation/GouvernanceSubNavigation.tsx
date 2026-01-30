/**
 * Navigation secondaire et tertiaire pour le module Gouvernance
 * Gère les niveaux 2 (sub-category) et 3 (sub-sub-category)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import {
  governanceNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  type NavNode,
} from './governanceNavigationConfig';
import type { GovernanceMainCategory } from '../types/governanceNavigationTypes';

interface GovernanceSubNavigationProps {
  mainCategory: GovernanceMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: {
    strategic?: number;
    attention?: number;
    arbitrages?: number;
    instances?: number;
    compliance?: number;
  };
}

export function GovernanceSubNavigation({
  mainCategory,
  subCategory,
  subSubCategory,
  onSubCategoryChange,
  onSubSubCategoryChange,
  stats = {},
}: GovernanceSubNavigationProps) {
  // Récupérer les sous-catégories (niveau 2) depuis la config
  const subCategories = getSubCategories(mainCategory);

  // Récupérer les sous-sous-catégories (niveau 3) depuis la config si une sub-category est active
  const subSubCategories = subCategory
    ? getSubSubCategories(mainCategory, subCategory)
    : [];

  // Labels pour le breadcrumb
  const mainLabel = governanceNavigationConfig[mainCategory]?.label || 'Gouvernance';
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  // Calculer les badges dynamiques
  const getBadgeForNode = (node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;

    const badgeMap: Record<string, number> = {
      strategic: stats.strategic || 0,
      attention: stats.attention || 0,
      arbitrages: stats.arbitrages || 0,
      instances: stats.instances || 0,
      compliance: stats.compliance || 0,
    };

    return badgeMap[node.id] || node.badge;
  };

  const getBadgeTypeForNode = (node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'retards' || node.id === 'critiques' || node.id === 'urgents') return 'critical';
      if (node.id === 'attention' || node.id === 'en-attente' || node.id === 'highlights') return 'warning';
    }
    return node.badgeType || 'default';
  };

  return (
    <div className="shrink-0 border-b border-slate-800/60 bg-slate-950/40">
      {/* Breadcrumb — aligné dashboard */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-500">Gouvernance</span>
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
            <span className="text-slate-500 text-xs">{activeSubSubLabel}</span>
          </>
        )}
      </div>

      {/* Level 2 Navigation - Sub Categories (style dashboard) */}
      {subCategories.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-800/50">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-dashboard">
            {subCategories.map((subCat) => {
              const isActive = subCategory === subCat.id;
              const badge = getBadgeForNode(subCat);
              const badgeType = getBadgeTypeForNode(subCat);

              return (
                <button
                  key={subCat.id}
                  onClick={() => onSubCategoryChange(subCat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-sky-500/15 text-sky-100 border border-sky-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  )}
                >
                  {subCat.label}
                  {badge !== undefined && badge !== null && badge !== 0 && (
                    <Badge
                      variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                      className="ml-2 h-5 min-w-5 px-1.5 text-xs"
                    >
                      {badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Level 3 Navigation - Sub Sub Categories */}
      {subSubCategories.length > 0 && subCategory && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {subSubCategories.map((subSubCat) => {
              const isActive = subSubCategory === subSubCat.id;
              const badge = getBadgeForNode(subSubCat);
              const badgeType = getBadgeTypeForNode(subSubCat);

              return (
                <button
                  key={subSubCat.id}
                  onClick={() => onSubSubCategoryChange?.(subSubCat.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-sky-500/15 text-sky-100 border border-sky-500/30'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent'
                  )}
                >
                  {subSubCat.label}
                  {badge !== undefined && badge !== null && badge !== 0 && (
                    <Badge
                      variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                      className="ml-1.5 h-4 min-w-4 px-1 text-xs"
                    >
                      {badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

