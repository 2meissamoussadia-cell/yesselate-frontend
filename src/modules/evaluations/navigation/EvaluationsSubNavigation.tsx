/**
 * Navigation secondaire et tertiaire pour le module Evaluations
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import {
  evaluationsNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  type NavNode,
} from './evaluationsNavigationConfig';
import type { EvaluationsMainCategory } from '../types/evaluationsTypes';

interface EvaluationsSubNavigationProps {
  mainCategory: EvaluationsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: {
    pending?: number;
    inProgress?: number;
    completed?: number;
  };
}

export function EvaluationsSubNavigation({
  mainCategory,
  subCategory,
  subSubCategory,
  onSubCategoryChange,
  onSubSubCategoryChange,
  stats = {},
}: EvaluationsSubNavigationProps) {
  const subCategories = getSubCategories(mainCategory);
  const subSubCategories = subCategory ? getSubSubCategories(mainCategory, subCategory) : [];

  const mainLabel = evaluationsNavigationConfig[mainCategory]?.label || 'Évaluations';
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  const getBadgeForNode = (node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;
    const badgeMap: Record<string, number> = {
      'pending': stats.pending || 0,
      'in-progress': stats.inProgress || 0,
      'completed': stats.completed || 0,
    };
    return badgeMap[node.id] || node.badge;
  };

  const getBadgeTypeForNode = (node: NavNode): 'default' | 'warning' | 'critical' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'overdue' || node.id === 'at-risk' || node.id === 'critical') return 'critical';
      if (node.id === 'pending' || node.id === 'active') return 'warning';
    }
    return node.badgeType || 'default';
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Évaluations</span>
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

      {subCategories.length > 0 && (
        <div className="flex items-center gap-1 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-hide">
          {subCategories.map((sub) => {
            const isActive = subCategory === sub.id;
            const badge = getBadgeForNode(sub);
            const badgeType = getBadgeTypeForNode(sub);

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
                {badge !== undefined && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'h-4 min-w-4 px-1 text-xs transition-all duration-200',
                      badgeType === 'critical'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : badgeType === 'warning'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        : 'bg-slate-700/50 text-slate-300 border-slate-600/50'
                    )}
                  >
                    {badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}

      {subSubCategories.length > 0 && (
        <div className="flex items-center gap-1 px-2 sm:px-4 py-1.5 overflow-x-auto scrollbar-hide bg-slate-800/30 border-t border-slate-800/50">
          {subSubCategories.map((subSub) => {
            const isActive = subSubCategory === subSub.id;

            return (
              <button
                key={subSub.id}
                onClick={() => onSubSubCategoryChange?.(subSub.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/40 border border-transparent'
                )}
              >
                <span>{subSub.label}</span>
                {subSub.badge !== undefined && (
                  <Badge
                    variant="outline"
                    className="h-3 min-w-3 px-0.5 text-[10px] bg-slate-700/50 text-slate-300 border-slate-600/50"
                  >
                    {subSub.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

