/**
 * Navigation secondaire et tertiaire pour le module Validation-Contrats
 * Gère les niveaux 2 (sub-category) et 3 (sub-sub-category)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import {
  contratsNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  findNavNodeById,
  type NavNode,
} from './contratsNavigationConfig';
import type { ContratsMainCategory } from '../types/contratsTypes';

interface ContratsSubNavigationProps {
  mainCategory: ContratsMainCategory;
  subCategory?: string;
  subSubCategory?: string;
  onSubCategoryChange: (subCategory: string) => void;
  onSubSubCategoryChange?: (subSubCategory: string) => void;
  stats?: {
    enAttente?: number;
    urgents?: number;
    valides?: number;
    rejetes?: number;
    negociation?: number;
  };
}

export function ContratsSubNavigation({
  mainCategory,
  subCategory,
  subSubCategory,
  onSubCategoryChange,
  onSubSubCategoryChange,
  stats = {},
}: ContratsSubNavigationProps) {
  // Récupérer les sous-catégories (niveau 2) depuis la config
  const subCategories = getSubCategories(mainCategory);

  // Récupérer les sous-sous-catégories (niveau 3) depuis la config si une sub-category est active
  const subSubCategories = subCategory
    ? getSubSubCategories(mainCategory, subCategory)
    : [];

  // Labels pour le breadcrumb
  const mainLabel = contratsNavigationConfig[mainCategory]?.label || 'Validation Contrats';
  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;
  const activeSubSubLabel = subSubCategories.find((s) => s.id === subSubCategory)?.label;

  // Calculer les badges dynamiques
  const getBadgeForNode = (node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;

    const badgeMap: Record<string, number> = {
      'en-attente': stats.enAttente || 0,
      'urgents': stats.urgents || 0,
      'valides': stats.valides || 0,
      'rejetes': stats.rejetes || 0,
      'negociation': stats.negociation || 0,
    };

    return badgeMap[node.id] || node.badge;
  };

  const getBadgeTypeForNode = (node: NavNode): 'default' | 'warning' | 'critical' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'urgents' || node.id === 'critiques') return 'critical';
      if (node.id === 'en-attente' || node.id === 'moyens') return 'warning';
    }
    return node.badgeType || 'default';
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Validation Contrats</span>
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

      {/* Sub Categories (Niveau 2) */}
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
                    ? 'bg-purple-500/15 text-slate-200 border border-purple-500/30 scale-105'
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

      {/* Sub-Sub Categories (Niveau 3) */}
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
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
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

