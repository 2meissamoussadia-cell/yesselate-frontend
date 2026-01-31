/**
 * Navigation secondaire et tertiaire pour le module DemandesRH
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import {
  demandesRhNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  type NavNode,
} from './demandesRhNavigationConfig';
import type { DemandesRhMainCategory } from '../types/demandesRhTypes';

interface DemandesRhSubNavigationProps {
  mainCategory: DemandesRhMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: {
    pending?: number;
    inProgress?: number;
    approved?: number;
    rejected?: number;
  };
}

export function DemandesRhSubNavigation({
  mainCategory,
  subCategory,
  subSubCategory,
  onSubCategoryChange,
  onSubSubCategoryChange,
  stats = {},
}: DemandesRhSubNavigationProps) {
  const subCategories = getSubCategories(mainCategory);
  const subSubCategories = subCategory ? getSubSubCategories(mainCategory, subCategory) : [];

  const mainLabel = demandesRhNavigationConfig[mainCategory]?.label || 'Demandes RH';
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  const getBadgeForNode = (node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;
    const badgeMap: Record<string, number> = {
      'pending': stats.pending || 0,
      'in-progress': stats.inProgress || 0,
      'approved': stats.approved || 0,
      'rejected': stats.rejected || 0,
    };
    return badgeMap[node.id] || node.badge;
  };

  const getBadgeTypeForNode = (node: NavNode): 'default' | 'warning' | 'critical' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'urgent' || node.id === 'pending' || node.id === 'critical') return 'critical';
      if (node.id === 'in-progress' || node.id === 'active') return 'warning';
    }
    return node.badgeType || 'default';
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Demandes RH</span>
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
                    ? 'bg-indigo-500/15 text-slate-200 border border-indigo-500/30 scale-105'
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
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
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

