/**
 * Sidebar de navigation pour le module Centre de Commande – Gouvernance
 * Lit la configuration de navigation et affiche la structure hiérarchique
 * Affiche les badges via le store Zustand
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
const { Search, CalendarClock, ChevronDown, ChevronRight, ChevronLeft } = LucideIcons;
import { gouvernanceNavigation, type GouvernanceNavDomain, getBadgeCount } from './gouvernanceNavigationConfig';
import { useGouvernanceFiltersStore } from '../stores/gouvernanceFiltersStore';

interface GouvernanceSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function GouvernanceSidebar({
  collapsed = false,
  onToggleCollapse,
}: GouvernanceSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { stats } = useGouvernanceFiltersStore();

  // Initialiser avec les domaines avec defaultOpen expandés
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    gouvernanceNavigation.forEach((domain, index) => {
      if (domain.defaultOpen) {
        initial.add(`domain-${index}`);
      }
    });
    return initial;
  });

  // Helper pour obtenir l'icône Lucide
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
  };

  // Toggle expansion d'un domaine
  const toggleDomain = (domainKey: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainKey)) {
        next.delete(domainKey);
      } else {
        next.add(domainKey);
      }
      return next;
    });
  };

  // Vérifier si une route est active
  const isRouteActive = useCallback((route: string | undefined): boolean => {
    if (!route || !pathname) return false;
    return pathname === route || pathname.startsWith(route);
  }, [pathname]);

  // Auto-expand les domaines qui ont un item actif
  useEffect(() => {
    if (!pathname) return;

    const domainsToExpand = new Set<string>();

    gouvernanceNavigation.forEach((domain, domainIndex) => {
      const domainKey = `domain-${domainIndex}`;
      const hasActiveItem = domain.items.some((item) => isRouteActive(item.route));

      if (hasActiveItem) {
        domainsToExpand.add(domainKey);
      }
    });

    setExpandedDomains((prev) => {
      const next = new Set(prev);
      domainsToExpand.forEach((key) => next.add(key));
      return next;
    });
  }, [pathname, isRouteActive]);

  // Rendre un item de navigation
  const renderNavItem = (item: any, domainKey: string): React.ReactNode => {
    const isActive = isRouteActive(item.route);
    const IconComponent = item.icon ? getIcon(item.icon) : null;
    const badgeCount = getBadgeCount(item.badgeKey, stats ? {
      points_attention_count: stats.risques_critiques + stats.validations_en_attente,
      depassements_budget_count: 0,
      retards_critiques_count: stats.jalons_retard,
      ressources_indispo_count: 0,
      escalades_actives: stats.escalades_actives,
      arbitrages_en_attente_count: stats.decisions_en_attente,
    } : null);

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          if (item.route) {
            router.push(item.route);
          }
        }}
        aria-label={`Aller à ${item.label}`}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg transition-all duration-200 text-left focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          'group relative',
          isActive
            ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
            : 'hover:bg-slate-700/40 border border-transparent text-slate-300'
        )}
      >
        {/* Indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-blue-400" aria-hidden />
        )}

        {/* Icon */}
        {IconComponent && (
          <IconComponent
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-all duration-200',
              isActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
            )}
            aria-hidden
          />
        )}

        {/* Label */}
        {!collapsed && (
          <>
            <span
              className={cn(
                'flex-1 transition-colors duration-200 text-sm',
                isActive ? 'text-blue-400' : 'text-slate-300'
              )}
            >
              {item.label}
            </span>

            {/* Badge */}
            {badgeCount !== null && badgeCount > 0 && (
              <Badge
                variant={badgeCount > 10 ? 'urgent' : 'warning'}
                className="h-5 min-w-5 px-1.5 text-xs font-medium"
              >
                {badgeCount}
              </Badge>
            )}
          </>
        )}
      </button>
    );
  };

  // Rendre un domaine
  const renderDomain = (domain: GouvernanceNavDomain, index: number): React.ReactNode => {
    const domainKey = `domain-${index}`;
    const isExpanded = expandedDomains.has(domainKey);
    const DomainIcon = getIcon(domain.icon);
    const hasActiveItem = domain.items.some((item) => isRouteActive(item.route));
    const badgeCount = getBadgeCount(domain.badgeKey, stats ? {
      points_attention_count: stats.risques_critiques + stats.validations_en_attente,
      decisions_en_attente: stats.decisions_en_attente,
    } : null);

    return (
      <div key={domain.id} className="mb-2">
        <button
          type="button"
          onClick={() => toggleDomain(domainKey)}
          aria-label={`${domain.label}${badgeCount !== null && badgeCount > 0 ? `, ${badgeCount} éléments` : ''}`}
          aria-expanded={isExpanded}
          className={cn(
            'w-full flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-left text-sm transition ring-1 ring-transparent focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500',
            hasActiveItem ? 'bg-sky-500/10 ring-sky-500/20' : 'hover:bg-white/5'
          )}
        >
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg ring-1',
                hasActiveItem ? 'bg-sky-500/15 ring-sky-500/20' : 'bg-white/5 ring-white/10'
              )}
            >
              {DomainIcon && <DomainIcon className="h-4 w-4" aria-hidden />}
            </span>
            {!collapsed && (
              <>
                <span className="font-semibold">{domain.label}</span>
                {badgeCount !== null && badgeCount > 0 && (
                  <Badge
                    variant={badgeCount > 10 ? 'urgent' : 'warning'}
                    className="h-5 min-w-5 px-1.5 text-xs font-medium"
                  >
                    {badgeCount}
                  </Badge>
                )}
              </>
            )}
          </span>

          {!collapsed && (
            <span className="text-slate-400">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden />
              )}
            </span>
          )}
        </button>

        {/* Items du domaine */}
        {!collapsed && isExpanded && (
          <div className="mt-1 space-y-1 pl-2">
            {domain.items.map((item) => renderNavItem(item, domainKey))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        'fixed sm:relative z-40 h-full',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-400" aria-hidden />
            <span className="font-semibold text-slate-200 text-sm">
              Centre de Commande
            </span>
          </div>
        )}
        {collapsed && (
          <CalendarClock className="h-5 w-5 text-blue-400 mx-auto" aria-hidden />
        )}
        {onToggleCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
            className="min-h-[44px] min-w-[44px] p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden />
            )}
          </Button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-3 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher…"
              className="w-full rounded-xl bg-white/5 px-3 py-2 pl-8 text-sm text-slate-200 ring-1 ring-white/10 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {gouvernanceNavigation.map((domain, index) => renderDomain(domain, index))}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-slate-700/50 p-3">
          <div className="text-xs text-slate-400 text-center">
            Gouvernance v1.0
          </div>
        </div>
      )}
    </aside>
  );
}

