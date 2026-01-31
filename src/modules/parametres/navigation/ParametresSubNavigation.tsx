/**
 * Navigation secondaire et tertiaire pour le module Paramètres
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { parametresNavigationConfig, getSubCategories, getSubSubCategories, type NavNode } from './parametresNavigationConfig';
import type { ParametresMainCategory } from '../types/parametresNavigationTypes';

interface ParametresSubNavigationProps {
  mainCategory: ParametresMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: Record<string, number>;
}

export function ParametresSubNavigation({ mainCategory, subCategory, subSubCategory, onSubCategoryChange, onSubSubCategoryChange, stats = {} }: ParametresSubNavigationProps) {
  const subCategories = getSubCategories(mainCategory);
  const subSubCategories = subCategory ? getSubSubCategories(mainCategory, subCategory) : [];
  const mainLabel = parametresNavigationConfig[mainCategory]?.label || 'Paramètres';
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  const getBadgeForNode = (node: NavNode): number | string | undefined => stats[node.id] || node.badge;
  const getBadgeTypeForNode = (node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'notifications') return 'warning';
    }
    return node.badgeType || 'default';
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Paramètres</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{mainLabel}</span>
        {subCategory && activeSubLabel && <><ChevronRight className="h-3 w-3 text-slate-600" /><span className="text-slate-400">{activeSubLabel}</span></>}
        {subSubCategory && activeSubSubLabel && <><ChevronRight className="h-3 w-3 text-slate-600" /><span className="text-slate-400 text-xs">{activeSubSubLabel}</span></>}
      </div>
      {subCategories.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-800/50">
          <div className="flex items-center gap-1 overflow-x-auto">
            {subCategories.map((subCat) => {
              const isActive = subCategory === subCat.id;
              const badge = getBadgeForNode(subCat);
              const badgeType = getBadgeTypeForNode(subCat);
              return (
                <button key={subCat.id} onClick={() => onSubCategoryChange(subCat.id)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', isActive ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent')}>
                  {subCat.label}
                  {badge !== undefined && badge !== null && badge !== 0 && <Badge variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'} className="ml-2 h-5 min-w-5 px-1.5 text-xs">{badge}</Badge>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {subSubCategories.length > 0 && subCategory && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-1 overflow-x-auto">
            {subSubCategories.map((subSubCat) => {
              const isActive = subSubCategory === subSubCat.id;
              const badge = getBadgeForNode(subSubCat);
              const badgeType = getBadgeTypeForNode(subSubCat);
              return (
                <button key={subSubCat.id} onClick={() => onSubSubCategoryChange?.(subSubCat.id)} className={cn('px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors', isActive ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30 border border-transparent')}>
                  {subSubCat.label}
                  {badge !== undefined && badge !== null && badge !== 0 && <Badge variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'} className="ml-1.5 h-4 min-w-4 px-1 text-xs">{badge}</Badge>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

