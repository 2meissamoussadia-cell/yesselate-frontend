/**
 * Sidebar de navigation pour le module Dashboard
 * Refactor Phase 4 : utilise SidebarHeader, SidebarItem (design YESSALATE BMO)
 * Navigation unifiée via Command Center store
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight, Star } from 'lucide-react';
import { dashboardNavigationConfig, type NavNode } from './dashboardNavigationConfig';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';
import { getDefaultLeafForSub, isValidRoute, normalizeRoute } from '../utils/routeValidation';
import { dashboardRegistry } from '../registry';
import { navToKey, keyToNav, type NavKey } from '../types/dashboard';
import { getBreadcrumbLabels } from '../utils/navigationLabels';
import { hasViewAccess } from '../utils/securityGuards';
import { useAuthOptional } from '../hooks/useAuthOptional';
import { useDashboardPermissions } from '../hooks/useDashboardPermissions';
import { filterNavigationConfig } from '../utils/navigationFilter';
import { nodeAllowed } from './permissions';
import { useI18n } from '@/lib/i18n';
import { useAlertStats, useAlertsByDomain } from '../hooks/useAlerts';
import { SidebarHeader, SidebarItem } from '@/components/navigation';
import { useNavigationRecent } from '@/hooks/navigation/useNavigationRecent';
import { useSidebarKeyboardNav } from '@/hooks/navigation/useSidebarKeyboardNav';
import { useDashboardFavorites } from '../hooks/useDashboardFavorites';

interface DashboardSidebarProps {
  collapsed?: boolean;
  stats?: {
    pilotage?: number;
    chantiers?: number;
    finance?: number;
    clients?: number;
    rh?: number;
    systeme?: number;
  };
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
}

export const DashboardSidebar = React.memo(function DashboardSidebar({
  collapsed = false,
  stats = {},
  onToggleCollapse,
  onOpenCommandPalette,
}: DashboardSidebarProps) {
  const log = useLogger('DashboardSidebar');

  const authContext = useAuthOptional();
  const user = authContext?.user || null;

  const main = useDashboardCommandCenterStore((state) => state.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((state) => state.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((state) => state.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);

  const { addRecent, recentItems } = useNavigationRecent({ maxItems: 10 });
  const { favorites, toggleFavorite, isFavorite } = useDashboardFavorites();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { onKeyDown: onSidebarKeyDown } = useSidebarKeyboardNav({
    containerRef: scrollContainerRef,
    enabled: !collapsed,
  });

  const checkRouteAccess = useCallback((mainId: string, subId?: string | null, leafId?: string | null): boolean => {
    const nav: NavKey = {
      main: mainId as NavKey['main'],
      sub: subId || null,
      leaf: leafId || null,
    };
    const key = navToKey(nav);
    const entry = dashboardRegistry[key];
    return hasViewAccess(entry, user);
  }, [user]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initial = new Set<string>([main || 'pilotage']);
    Object.keys(dashboardNavigationConfig).forEach((id) => initial.add(id));
    return initial;
  });

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const { permissions: userPerms, isLoading: permissionsLoading } = useDashboardPermissions();
  const { t } = useI18n();

  const filteredNavConfig = useMemo(
    () => filterNavigationConfig(
      dashboardNavigationConfig,
      userPerms.permissions,
      userPerms.roles,
      userPerms.featureFlags
    ),
    [userPerms.permissions, userPerms.roles, userPerms.featureFlags]
  );

  const lastMainRef = useRef<string | null>(main || null);

  useEffect(() => {
    const currentMain = main || 'pilotage';
    if (lastMainRef.current === currentMain) return;
    lastMainRef.current = currentMain;
    setExpandedNodes((prev) => {
      if (prev.has(currentMain)) return prev;
      const next = new Set(prev);
      next.add(currentMain);
      return next;
    });
  }, [main]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target as HTMLElement).isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }
      if (e.key === '/' && !inInput) {
        e.preventDefault();
        onOpenCommandPalette?.();
        return;
      }
      if (e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        if (e.key === '1') {
          e.preventDefault();
          navigate('pilotage', 'dashboard', 'default');
          return;
        }
        if (e.key === '2') {
          e.preventDefault();
          navigate('pilotage', 'analytics', 'default');
          return;
        }
        if (e.key === '3') {
          e.preventDefault();
          navigate('finance', 'validation-paiements', 'default');
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette, navigate]);

  // Phase 5: enregistrer la route actuelle dans "récemment visités"
  useEffect(() => {
    const key = navToKey({
      main: main ?? 'pilotage',
      sub: sub ?? null,
      leaf: leaf ?? null,
    });
    addRecent(key);
  }, [main, sub, leaf, addRecent]);

  const { data: alertStatsData } = useAlertStats();
  const alertStats = alertStatsData?.stats;

  const { data: alertsAchats } = useAlertsByDomain('achats');
  const { data: alertsStocks } = useAlertsByDomain('stocks');
  const { data: alertsMateriel } = useAlertsByDomain('materiel');
  const { data: alertsCompliance } = useAlertsByDomain('compliance');
  const { data: alertsReporting } = useAlertsByDomain('reporting');

  const domainAlertsMap = useMemo(() => {
    const map: Record<string, number> = {};
    const add = (events: { severity?: string }[] | undefined, id: string) => {
      if (!events?.length) return;
      const count = events.filter((e) => e.severity === 'critical' || e.severity === 'warning').length;
      if (count > 0) map[id] = count;
    };
    add(alertsAchats?.events, 'achats');
    add(alertsStocks?.events, 'stocks');
    add(alertsMateriel?.events, 'materiel');
    add(alertsCompliance?.events, 'compliance');
    add(alertsReporting?.events, 'reporting');
    return map;
  }, [alertsAchats, alertsStocks, alertsMateriel, alertsCompliance, alertsReporting]);

  const getBadgeForNode = useCallback((node: NavNode, level?: number): number | undefined => {
    const statKey = node.id as keyof typeof stats;
    const propBadge = stats[statKey];
    if (propBadge !== undefined && typeof propBadge === 'number') return propBadge;
    if (level === 1 && (node.id === 'alerts' || node.id === 'alertes') && alertStats) {
      return alertStats.critical_open ?? alertStats.open_count ?? 0;
    }
    if (level === 1 && domainAlertsMap[node.id]) return domainAlertsMap[node.id];
    if (alertStats && level !== undefined) {
      const routeKeyMap: Record<string, string> = {
        'performance::reporting::dashboard': 'reporting',
        'performance::achats::dashboard': 'achats',
        'performance::stocks::dashboard': 'stocks',
        'performance::materiel::dashboard': 'materiel',
        'performance::conformite::dashboard': 'conformite',
      };
      const routeKey = routeKeyMap[node.id];
      if (routeKey && domainAlertsMap[routeKey]) return domainAlertsMap[routeKey];
    }
    return typeof node.badge === 'number' ? node.badge : undefined;
  }, [stats, alertStats, domainAlertsMap]);

  const isNodeActive = useCallback((node: NavNode, level: number, parentMain?: string, parentSub?: string): boolean => {
    if (level === 0) return main === node.id;
    if (level === 1) return main === parentMain && sub === node.id;
    if (level === 2) return main === parentMain && sub === parentSub && leaf === node.id;
    return false;
  }, [main, sub, leaf]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleNavigation = useCallback((mainId: string, subId?: string | null, leafId?: string | null) => {
    try {
      if (!isValidRoute(mainId, subId ?? null, leafId ?? null)) {
        const normalized = normalizeRoute(mainId, subId, leafId);
        mainId = normalized.main;
        subId = normalized.sub;
        leafId = normalized.leaf;
      }
      log.navigation(
        `${main}/${sub ?? ''}/${leaf ?? ''}`,
        `${mainId}/${subId ?? ''}/${leafId ?? ''}`,
        { main: mainId, sub: subId, leaf: leafId }
      );
      navigate(mainId as Parameters<typeof navigate>[0], subId ?? null, leafId ?? null);
    } catch (error) {
      log.error('Erreur lors de la navigation', error instanceof Error ? error : new Error(String(error)), {
        main: mainId,
        sub: subId,
        leaf: leafId,
      });
    }
  }, [main, sub, leaf, navigate, log]);

  const userContext = useMemo(
    () => ({
      perms: userPerms.permissions,
      flags: userPerms.featureFlags,
      roles: userPerms.roles,
    }),
    [userPerms.permissions, userPerms.featureFlags, userPerms.roles]
  );

  const navigateToFirstChild = useCallback(
    (node: NavNode, firstChild: NavNode, level: number, currentMain: string, currentSub: string | undefined) => {
      if (level === 0) {
        let firstLeaf: string | null = null;
        try {
          firstLeaf = getDefaultLeafForSub(node.id, firstChild.id);
        } catch {
          // ignore
        }
        if (!firstLeaf && firstChild.children?.length) firstLeaf = firstChild.children[0].id;
        handleNavigation(node.id, firstChild.id, firstLeaf ?? null);
      } else if (level === 1) {
        const mainId = currentMain || main || 'pilotage';
        let firstLeaf: string | null = null;
        try {
          firstLeaf = getDefaultLeafForSub(mainId, node.id);
        } catch {
          // ignore
        }
        if (!firstLeaf && firstChild.children?.length) firstLeaf = firstChild.children[0].id;
        handleNavigation(main || 'pilotage', node.id, firstLeaf ?? null);
      }
    },
    [main, handleNavigation]
  );

  const getAccessibleChildren = useCallback(
    (node: NavNode, level: number, parentMain?: string): NavNode[] => {
      if (!node.children?.length) return [];
      return node.children.filter((child) => {
        if (!nodeAllowed(userContext, child.requires)) return false;
        if (level === 0) return checkRouteAccess(node.id, child.id, null);
        if (level === 1) return checkRouteAccess(parentMain ?? main ?? 'pilotage', node.id, child.id);
        return true;
      });
    },
    [userContext, checkRouteAccess, main]
  );

  const renderNavNode = useCallback(
    (node: NavNode, level: number, parentMain?: string, parentSub?: string): React.ReactNode => {
      const hasExternalHref = Boolean(node.externalHref);
      const hasChildren = !hasExternalHref && Boolean(node.children?.length);
      // PILOTAGE : un seul niveau dans la sidebar, la sous-navigation (Dashboard, Gouvernance, …) est dans la barre d’onglets
      const isPilotageSingleLevel = level === 0 && node.id === 'pilotage';
      const showChildren = hasChildren && !isPilotageSingleLevel;
      const isExpanded = expandedNodes.has(node.id);
      const isActive = !hasExternalHref && isNodeActive(node, level, parentMain, parentSub);
      const badge = getBadgeForNode(node, level);
      const currentMain = level === 0 ? node.id : parentMain;
      const currentSub = level === 1 ? node.id : parentSub;
      const accessibleChildren = showChildren ? getAccessibleChildren(node, level, parentMain) : [];

      if (level === 0 && accessibleChildren.length === 0 && !isPilotageSingleLevel) return null;
      if (level > 0 && hasChildren && accessibleChildren.length === 0) return null;

      const label = t(node.i18nKey ?? node.label ?? node.id);
      const externalHref = node.externalHref;

      // Pour PILOTAGE en mode "un seul niveau", cible = première sous-vue autorisée (ex. Dashboard)
      const pilotageFirstChild = isPilotageSingleLevel
        ? getAccessibleChildren(node, level, parentMain)[0]
        : null;

      const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasExternalHref && externalHref) return; // lien géré par href

        if (isPilotageSingleLevel && pilotageFirstChild) {
          const defLeaf = getDefaultLeafForSub(node.id, pilotageFirstChild.id);
          handleNavigation(node.id, pilotageFirstChild.id, defLeaf ?? null);
          return;
        }

        if (showChildren) {
          if (accessibleChildren.length > 0) {
            const firstChild = accessibleChildren[0];
            if (!isExpanded) toggleNode(node.id);
            navigateToFirstChild(node, firstChild, level, currentMain ?? '', currentSub);
          } else {
            toggleNode(node.id);
          }
        } else {
          if (level === 0) handleNavigation(node.id, null, null);
          else if (level === 1) {
            const mainId = parentMain ?? main ?? 'pilotage';
            const defLeaf = getDefaultLeafForSub(mainId, node.id);
            handleNavigation(mainId, node.id, defLeaf ?? null);
          } else if (level === 2) handleNavigation(parentMain ?? main ?? 'pilotage', parentSub ?? sub ?? null, node.id);
        }
      };

      const badgeVariant =
        typeof node.badgeType === 'string' && ['default', 'warning', 'critical', 'success'].includes(node.badgeType)
          ? (node.badgeType as 'default' | 'warning' | 'critical' | 'success')
          : undefined;

      return (
        <SidebarItem
          key={node.id}
          id={node.id}
          label={label}
          icon={node.icon}
          badge={badge}
          badgeVariant={badgeVariant}
          hasChildren={showChildren}
          isExpanded={isExpanded}
          isActive={isActive}
          href={externalHref}
          onClick={handleClick}
          ariaLabel={badge ? `${label}, ${badge} éléments` : label}
          tooltipLabel={label}
        >
          {showChildren && isExpanded &&
            accessibleChildren.map((child) =>
              renderNavNode(child, level + 1, currentMain, currentSub)
            )}
        </SidebarItem>
      );
    },
    [
      expandedNodes,
      getAccessibleChildren,
      isNodeActive,
      getBadgeForNode,
      toggleNode,
      handleNavigation,
      navigateToFirstChild,
      main,
      sub,
      t,
    ]
  );

  if (collapsed) {
    return (
      <aside className="w-16 bg-slate-950/80 backdrop-blur border-r border-slate-800/70 flex flex-col items-center py-3 sm:py-4 min-w-0 overflow-hidden">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleCollapse}
                className="mb-3 sm:mb-4 flex-shrink-0 rounded-lg hover:bg-slate-800/50"
                aria-label={t('dashboard.sidebar.openMenu')}
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t('dashboard.sidebar.openMenu')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </aside>
    );
  }

  const currentKey = navToKey({
    main: main ?? 'pilotage',
    sub: sub ?? null,
    leaf: leaf ?? null,
  });
  const recentToShow = useMemo(
    () =>
      recentItems
        .filter((k) => k !== currentKey)
        .slice(0, 5)
        .map((key) => {
          const { main: m, sub: s, leaf: l } = keyToNav(key);
          const { mainLabel, subLabel, leafLabel } = getBreadcrumbLabels(m, s, l);
          const label = [t(mainLabel), subLabel ? t(subLabel) : null, leafLabel ? t(leafLabel) : null]
            .filter(Boolean)
            .join(' › ');
          return { key, label, main: m, sub: s, leaf: l };
        }),
    [recentItems, currentKey, t]
  );

  const favoriteToShow = useMemo(
    () =>
      favorites
        .filter((k) => k !== currentKey)
        .slice(0, 5)
        .map((key) => {
          const { main: m, sub: s, leaf: l } = keyToNav(key);
          const { mainLabel, subLabel, leafLabel } = getBreadcrumbLabels(m, s, l);
          const label = [t(mainLabel), subLabel ? t(subLabel) : null, leafLabel ? t(leafLabel) : null]
            .filter(Boolean)
            .join(' › ');
          return { key, label, main: m, sub: s, leaf: l };
        }),
    [favorites, currentKey, t]
  );

  const isCurrentFavorite = isFavorite(currentKey);

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur border-r border-slate-800/70 flex flex-col h-full min-w-0 overflow-hidden">
      <SidebarHeader title="Navigation" onToggleCollapse={onToggleCollapse} />
      <div
        ref={scrollContainerRef}
        role="navigation"
        aria-label={t('dashboard.sidebar.navLabel')}
        onKeyDown={onSidebarKeyDown}
        className="flex-1 overflow-x-hidden overflow-y-auto p-1.5 sm:p-2 space-y-0.5 sm:space-y-1 min-w-0 scrollbar-dashboard"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {permissionsLoading ? (
          <div className="space-y-1.5 p-1" aria-busy="true" aria-label={t('dashboard.sidebar.loading')}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-11 rounded-xl bg-slate-800/40 animate-pulse"
                style={{ width: i === 1 ? '100%' : i === 2 ? '92%' : i === 3 ? '84%' : i === 4 ? '76%' : '68%' }}
              />
            ))}
          </div>
        ) : (
          Object.values(filteredNavConfig).map((node) => renderNavNode(node, 0, undefined, undefined))
        )}
      </div>
      {hasMounted && (favoriteToShow.length > 0 || isCurrentFavorite) && (
        <div className="flex-shrink-0 p-2 border-t border-slate-800/70">
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <p id="sidebar-favorites-label" className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              {t('dashboard.sidebar.favorites')}
            </p>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(currentKey)}
                    className={cn(
                      'p-1 rounded-md transition-colors',
                      isCurrentFavorite
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-400 hover:text-slate-300'
                    )}
                    aria-label={isCurrentFavorite ? t('dashboard.sidebar.removeFavorite') : t('dashboard.sidebar.addFavorite')}
                    aria-describedby="sidebar-favorites-label"
                  >
                    <Star
                      className="h-3.5 w-3.5"
                      fill={isCurrentFavorite ? 'currentColor' : 'none'}
                      aria-hidden
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isCurrentFavorite ? t('dashboard.sidebar.removeFavorite') : t('dashboard.sidebar.addFavorite')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {favoriteToShow.length > 0 && (
            <ul className="space-y-0.5 mt-1" role="list" aria-labelledby="sidebar-favorites-label">
              {favoriteToShow.map(({ key, label, main: m, sub: s, leaf: l }) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => navigate(m as Parameters<typeof navigate>[0], s, l)}
                    className="w-full text-left px-3 py-2 min-h-[44px] rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 truncate transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
                    aria-label={label}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {hasMounted && recentToShow.length > 0 && (
        <div className="flex-shrink-0 p-2 border-t border-slate-800/70" role="region" aria-labelledby="sidebar-recent-label">
          <p id="sidebar-recent-label" className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            {t('dashboard.sidebar.recentlyVisited')}
          </p>
          <ul className="space-y-0.5 mt-1" role="list" aria-labelledby="sidebar-recent-label">
            {recentToShow.map(({ key, label, main: m, sub: s, leaf: l }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => navigate(m as Parameters<typeof navigate>[0], s, l)}
                  className="w-full text-left px-3 py-2 min-h-[44px] rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 truncate transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
                  aria-label={label}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
});
