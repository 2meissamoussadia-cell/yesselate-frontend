/**
 * Navigation secondaire du Dashboard (sous-onglets)
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  useDashboardCommandCenterStore,
  type DashboardMainCategory,
  type DashboardSubCategory,
} from '@/lib/stores/dashboardCommandCenterStore';

interface SubNavItem {
  id: DashboardSubCategory;
  label: string;
  badge?: number;
  badgeVariant?: 'default' | 'warning' | 'critical' | 'success';
}

const subCategoriesMap: Record<DashboardMainCategory, SubNavItem[]> = {
  overview: [
    { id: 'summary', label: 'Synthèse' },
    { id: 'kpis', label: 'KPIs' },
    { id: 'bureaux', label: 'Bureaux' },
    { id: 'trends', label: 'Tendances' },
  ],
  performance: [
    { id: 'validation', label: 'Validations' },
    { id: 'budget', label: 'Budget' },
    { id: 'delays', label: 'Délais' },
    { id: 'comparison', label: 'Comparaison' },
  ],
  actions: [
    { id: 'all', label: 'Toutes', badge: 24 },
    { id: 'urgent', label: 'Urgentes', badge: 5, badgeVariant: 'critical' },
    { id: 'blocked', label: 'Bloquées', badge: 3, badgeVariant: 'warning' },
    { id: 'pending', label: 'En attente', badge: 12 },
    { id: 'completed', label: 'Terminées' },
  ],
  risks: [
    { id: 'critical', label: 'Critiques', badge: 3, badgeVariant: 'critical' },
    { id: 'warnings', label: 'Avertissements', badge: 8, badgeVariant: 'warning' },
    { id: 'blocages', label: 'Blocages', badge: 5 },
    { id: 'payments', label: 'Paiements', badge: 2 },
    { id: 'contracts', label: 'Contrats', badge: 4 },
  ],
  decisions: [
    { id: 'pending', label: 'En attente', badge: 8, badgeVariant: 'warning' },
    { id: 'executed', label: 'Exécutées' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'audit', label: 'Audit' },
  ],
  realtime: [
    { id: 'live', label: 'Live' },
    { id: 'alerts', label: 'Alertes', badge: 3, badgeVariant: 'warning' },
    { id: 'notifications', label: 'Notifications', badge: 5 },
    { id: 'sync', label: 'Sync' },
  ],
  administration: [
    { id: 'summary', label: 'Paramètres' },
    { id: 'kpis', label: 'KPIs' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'sync', label: 'Sync' },
  ],
};

export function DashboardSubNavigation() {
  const { navigation, navigate } = useDashboardCommandCenterStore();

  const subCategories = subCategoriesMap[navigation.mainCategory] || [];

  if (subCategories.length === 0) return null;

  return (
    <div className="border-b border-slate-800/50 bg-slate-900/30">
      <div className="flex items-center gap-1 px-4 py-1.5 overflow-x-auto">
        {subCategories.map((sub) => {
          const isActive = navigation.subCategory === sub.id;

          return (
            <button
              key={sub.id}
              onClick={() => navigate(navigation.mainCategory, sub.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                isActive
                  ? 'bg-slate-800/80 text-slate-200'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
              )}
            >
              <span>{sub.label}</span>
              {sub.badge !== undefined && (
                <Badge
                  variant={
                    sub.badgeVariant === 'critical'
                      ? 'destructive'
                      : sub.badgeVariant === 'warning'
                      ? 'warning'
                      : sub.badgeVariant === 'success'
                      ? 'success'
                      : 'default'
                  }
                  className="text-xs px-1.5 py-0"
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
}

