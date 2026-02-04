/**
 * Navigation secondaire pour Validation-BC
 * Sous-onglets et breadcrumb
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { findNavNodeById, type ValidationNavItem } from '../navigation/validationNavigationConfig';
import { useValidationStats } from '../hooks';

interface ValidationSubNavigationProps {
  mainCategory: string;
  mainCategoryLabel: string;
  subCategory: string | null;
  onSubCategoryChange: (subCategory: string) => void;
  stats?: {
    enAttente?: number;
    valides?: number;
    rejetes?: number;
    urgents?: number;
    bc?: number;
    factures?: number;
    avenants?: number;
  };
}

export function ValidationSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  onSubCategoryChange,
  stats = {},
}: ValidationSubNavigationProps) {
  const router = useRouter();
  const { data: statsData } = useValidationStats();

  // Trouver le nœud principal
  const mainNode = findNavNodeById(mainCategory);
  const subCategories = mainNode?.children?.map((child) => {
    // Calculer les badges dynamiques
    let badge = child.badge;
    if (statsData) {
      const badgeMap: Record<string, number> = {
        'en-attente': statsData.enAttente || 0,
        'valides': statsData.valides || 0,
        'rejetes': statsData.rejetes || 0,
        'urgents': statsData.urgents || 0,
        'bc': statsData.parType?.BC || 0,
        'factures': statsData.parType?.FACTURE || 0,
        'avenants': statsData.parType?.AVENANT || 0,
      };
      badge = badgeMap[child.id] || child.badge;
    }

    return {
      id: child.id,
      label: child.label,
      route: child.route,
      badge,
      badgeType: child.badgeType,
    };
  }) || [];

  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  const handleSubCategoryClick = (subId: string, route?: string) => {
    onSubCategoryChange(subId);
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Validation-BC</span>
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
                onClick={() => handleSubCategoryClick(sub.id, sub.route)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-amber-500/15 text-slate-200 border border-amber-500/30 scale-105'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent hover:scale-[1.02]'
                )}
              >
                <span>{sub.label}</span>
                {sub.badge !== undefined && sub.badge !== null && (
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

