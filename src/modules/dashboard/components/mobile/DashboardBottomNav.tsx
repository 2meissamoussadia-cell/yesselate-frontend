/**
 * Bottom navigation mobile — visible sur petits écrans (< md).
 * Onglets tactiles 44x44px minimum, safe area pour encoche / barre d'accueil.
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BarChart3, CheckCircle, MoreHorizontal } from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import type { DashboardMainCategory } from '../../types/dashboardNavigationTypes';
import { touchTarget } from '../../utils/dashboardDesignTokens';

/** Onglets fusionnés : Cockpit DG = Dashboard (un seul accès "Dashboard" pour la vue pilote). */
const MOBILE_TABS: { id: DashboardMainCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pilotage', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'finance', label: 'KPIs', icon: BarChart3 },
  { id: 'finance', label: 'Validations', icon: CheckCircle },
  { id: 'systeme', label: 'Plus', icon: MoreHorizontal },
];

export function DashboardBottomNav() {
  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);

  const getRouteForTab = (tab: (typeof MOBILE_TABS)[number]) => {
    if (tab.label === 'Dashboard') return { main: 'pilotage' as const, sub: 'dashboard' as const, leaf: 'default' as const };
    if (tab.label === 'KPIs') return { main: 'finance' as const, sub: 'budget', leaf: 'default' };
    if (tab.label === 'Validations') return { main: 'finance' as const, sub: 'validation-paiements', leaf: 'default' };
    if (tab.label === 'Plus') return { main: 'systeme' as const, sub: 'parametres', leaf: 'default' };
    return { main: 'pilotage', sub: 'dashboard', leaf: 'default' };
  };

  const isActive = (tab: (typeof MOBILE_TABS)[number]) => {
    if (tab.label === 'Dashboard') return main === 'pilotage' && sub === 'dashboard';
    if (tab.label === 'KPIs') return main === 'finance' && sub === 'budget';
    if (tab.label === 'Validations') return main === 'finance' && sub === 'validation-paiements';
    if (tab.label === 'Plus') return main === 'systeme' && sub === 'parametres';
    return false;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch justify-around">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);
          const route = getRouteForTab(tab);
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => navigate(route.main as DashboardMainCategory, route.sub, route.leaf)}
              className={cn(
                touchTarget.tap,
                'flex flex-col gap-0.5 text-xs font-medium transition-colors',
                active
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200 active:bg-slate-800/60'
              )}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="truncate max-w-[64px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
