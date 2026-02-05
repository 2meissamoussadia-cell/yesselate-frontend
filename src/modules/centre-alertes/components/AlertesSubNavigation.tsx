/**
 * Navigation secondaire pour Centre d'Alerte
 * Sous-onglets et breadcrumb
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { findNavNodeById, type AlerteNavItem } from '../navigation/alertesNavigationConfig';

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
  onSubCategoryChange: (subCategory: string) => void;
  stats?: {
    critical?: number;
    warning?: number;
    sla?: number;
    blocked?: number;
    acknowledged?: number;
    resolved?: number;
  };
}

export function AlertesSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  onSubCategoryChange,
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

  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Centre d'Alertes</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-slate-300 font-medium">{mainCategoryLabel}</span>
        {subCategory && activeSubLabel && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-600" />
            <span className="text-slate-400">{activeSubLabel}</span>
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
    </div>
  );
}

