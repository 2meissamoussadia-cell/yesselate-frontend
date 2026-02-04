/**
 * Navigation secondaire pour Blocked Command Center
 * Breadcrumb et sous-onglets - inspiré de Analytics
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import {
  useBlockedCommandCenterStore,
  type BlockedMainCategory,
  type BlockedSubCategory,
} from '@/lib/stores/blockedCommandCenterStore';

interface SubCategory {
  id: BlockedSubCategory;
  label: string;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

// Mapping des catégories principales vers leurs labels
const mainCategoryLabels: Record<BlockedMainCategory, string> = {
  overview: 'Vue d\'ensemble',
  queue: 'Files d\'attente',
  critical: 'Critiques',
  matrix: 'Matrice urgence',
  bureaux: 'Par bureau',
  timeline: 'Timeline',
  decisions: 'Décisions',
  audit: 'Audit',
};

// Sous-catégories par catégorie principale
const subCategoriesMap: Record<BlockedMainCategory, SubCategory[]> = {
  overview: [
    { id: 'summary', label: 'Synthèse' },
    { id: 'kpis', label: 'KPIs' },
    { id: 'trends', label: 'Tendances' },
    { id: 'alerts', label: 'Alertes', badgeType: 'critical' },
  ],
  queue: [
    { id: 'all', label: 'Tous' },
    { id: 'critical', label: 'Critiques', badgeType: 'critical' },
    { id: 'high', label: 'Priorité haute', badgeType: 'warning' },
    { id: 'medium', label: 'Priorité moyenne' },
    { id: 'low', label: 'Priorité basse' },
  ],
  critical: [
    { id: 'urgent', label: 'Urgents', badgeType: 'critical' },
    { id: 'sla', label: 'SLA dépassés', badgeType: 'warning' },
    { id: 'escalated', label: 'Escaladés' },
  ],
  matrix: [
    { id: 'impact', label: 'Par impact' },
    { id: 'delay', label: 'Par délai' },
    { id: 'amount', label: 'Par montant' },
    { id: 'combined', label: 'Combiné' },
  ],
  bureaux: [
    { id: 'all', label: 'Tous les bureaux' },
    { id: 'most', label: 'Plus impactés' },
    { id: 'comparison', label: 'Comparaison' },
  ],
  timeline: [
    { id: 'recent', label: 'Récents' },
    { id: 'week', label: 'Cette semaine' },
    { id: 'month', label: 'Ce mois' },
    { id: 'history', label: 'Historique' },
  ],
  decisions: [
    { id: 'pending', label: 'En attente', badgeType: 'warning' },
    { id: 'resolved', label: 'Résolus' },
    { id: 'escalated', label: 'Escaladés' },
    { id: 'substituted', label: 'Substitués' },
  ],
  audit: [
    { id: 'trail', label: 'Trace audit' },
    { id: 'chain', label: 'Chaîne de hash' },
    { id: 'reports', label: 'Rapports' },
    { id: 'export', label: 'Export' },
  ],
};

interface BlockedSubNavigationProps {
  mainCategory: BlockedMainCategory;
  mainCategoryLabel: string;
  subCategory: BlockedSubCategory | null;
  subCategories: SubCategory[];
  onSubCategoryChange: (subCategory: BlockedSubCategory) => void;
}

export const BlockedSubNavigation = React.memo(function BlockedSubNavigation({
  mainCategory,
  mainCategoryLabel,
  subCategory,
  subCategories,
  onSubCategoryChange,
}: BlockedSubNavigationProps) {
  const { stats } = useBlockedCommandCenterStore();

  const activeSubLabel = subCategories.find((s) => s.id === subCategory)?.label;

  // Enrichir les sous-catégories avec les badges dynamiques
  const enrichedSubCategories = useMemo(() => {
    return subCategories.map((sub) => {
      let badge: number | string | undefined;

      // Compute badges based on stats
      if (mainCategory === 'overview') {
        if (sub.id === 'alerts') badge = stats?.overdueSLA ?? 0;
      } else if (mainCategory === 'queue') {
        if (sub.id === 'all') badge = stats?.total ?? 0;
        else if (sub.id === 'critical') badge = stats?.critical ?? 0;
        else if (sub.id === 'high') badge = stats?.high ?? 0;
        else if (sub.id === 'medium') badge = stats?.medium ?? 0;
        else if (sub.id === 'low') badge = stats?.low ?? 0;
      } else if (mainCategory === 'critical') {
        if (sub.id === 'urgent') badge = stats?.critical ?? 0;
        else if (sub.id === 'sla') badge = stats?.overdueSLA ?? 0;
        else if (sub.id === 'escalated') badge = stats?.escalatedToday ?? 0;
      } else if (mainCategory === 'decisions') {
        if (sub.id === 'pending') badge = 3; // Mock value
        else if (sub.id === 'resolved') badge = stats?.resolvedToday ?? 0;
        else if (sub.id === 'escalated') badge = stats?.escalatedToday ?? 0;
      }

      return { ...sub, badge };
    });
  }, [subCategories, stats, mainCategory]);

  return (
    <div className="bg-slate-900/60 border-b border-slate-700/50">
      {/* Breadcrumb */}
      <div className="px-4 py-2 flex items-center gap-2 text-sm border-b border-slate-800/50">
        <span className="text-slate-400">Blocages</span>
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
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-hide">
        {enrichedSubCategories.map((sub) => {
          const isActive = subCategory === sub.id;

          return (
            <button
              key={sub.id}
              onClick={() => onSubCategoryChange(sub.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-red-500/15 text-slate-200 border border-red-500/30 scale-105'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 border border-transparent hover:scale-[1.02]'
              )}
            >
              <span>{sub.label}</span>
              {sub.badge !== undefined && sub.badge !== 0 && (
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
    </div>
  );
});

// Hook-like component to wire up with store
export function BlockedSubNavigationConnected() {
  const { navigation, navigate, stats } = useBlockedCommandCenterStore();

  const mainCategoryLabel = mainCategoryLabels[navigation.mainCategory];
  const subCategories = subCategoriesMap[navigation.mainCategory] || [];

  const handleSubCategoryChange = (subCategory: BlockedSubCategory) => {
    navigate(navigation.mainCategory, subCategory);
  };

  if (subCategories.length === 0) return null;

  return (
    <BlockedSubNavigation
      mainCategory={navigation.mainCategory}
      mainCategoryLabel={mainCategoryLabel}
      subCategory={navigation.subCategory}
      subCategories={subCategories}
      onSubCategoryChange={handleSubCategoryChange}
    />
  );
}

