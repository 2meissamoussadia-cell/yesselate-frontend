/**
 * Navigation secondaire et tertiaire pour le module Dashboard
 * VERSION CORRIGÉE - Navigation unifiée (Command Center store)
 */

'use client';

import React, { useCallback, memo } from 'react';
import { cn } from '@/lib/cn';
import { ChevronRight } from 'lucide-react';
import {
  dashboardNavigationConfig,
  getSubCategories,
  getSubSubCategories,
  type NavNode,
} from './dashboardNavigationConfig';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';
import { getDefaultLeafForSub, isValidRoute } from '../utils/routeValidation';
import { zIndexClass } from '../utils/zIndex';
import type { DashboardMainCategory, DashboardNavMainCategory } from '../types/dashboardNavigationTypes';
import { SegmentedTabs } from '../components/shared/SegmentedTabs';
import { useDashboardPermissions } from '../hooks/useDashboardPermissions';
import { nodeAllowed } from './permissions';
import { useDashboardPermissionsStore } from '@/lib/stores/dashboardPermissionsStore';
import { useMemo } from 'react';

interface DashboardSubNavigationProps {
  stats?: {
    pilotage?: number;
    chantiers?: number;
    finance?: number;
    clients?: number;
    rh?: number;
    systeme?: number;
  };
  /** Par défaut: on évite une 2e breadcrumb (DashboardBreadcrumbs fait déjà le job) */
  showBreadcrumbs?: boolean;
  /** Afficher uniquement les onglets principaux (PILOTAGE, CHANTIERS, etc.) — utilisé quand la sub-nav est en sidebar verticale */
  mainTabsOnly?: boolean;
}

export const DashboardSubNavigation = memo(function DashboardSubNavigation({
  stats = {},
  showBreadcrumbs = false,
  mainTabsOnly = false,
}: DashboardSubNavigationProps) {
  const log = useLogger('DashboardSubNavigation');

  const main = useDashboardCommandCenterStore((state) => state.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((state) => state.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((state) => state.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);

  // Phase P10: Charger les permissions depuis le store Zustand
  useDashboardPermissions(); // Charge les permissions si nécessaire
  const permissions = useDashboardPermissionsStore((state) => state.permissions);

  // Contexte utilisateur pour nodeAllowed (depuis le store)
  const userContext = useMemo(
    () => ({
      perms: permissions.permissions,
      flags: permissions.featureFlags,
      roles: permissions.roles,
    }),
    [permissions.permissions, permissions.featureFlags, permissions.roles]
  );

  // Normaliser la casse (config utilise des clés lowercase: overview, performance, etc.)
  const currentMainCategory = (typeof main === 'string' ? main.toLowerCase() : 'pilotage') as DashboardMainCategory;

  // Récupérer les sous-catégories (niveau 2) et filtrer selon permissions
  const allSubCategories = getSubCategories(currentMainCategory) || [];
  const subCategories = useMemo(
    () => allSubCategories.filter((subCat) => nodeAllowed(userContext, subCat.requires)),
    [allSubCategories, userContext]
  );

  // Récupérer les sous-sous-catégories (niveau 3) et filtrer selon permissions
  const allSubSubCategories = (sub
    ? getSubSubCategories(currentMainCategory, sub)
    : []) || [];
  const subSubCategories = useMemo(
    () => allSubSubCategories.filter((subSubCat) => nodeAllowed(userContext, subSubCat.requires)),
    [allSubSubCategories, userContext]
  );

  // Labels pour le breadcrumb (utiliser la catégorie normalisée pour la config)
  const mainConfig = currentMainCategory in dashboardNavigationConfig
    ? dashboardNavigationConfig[currentMainCategory as DashboardNavMainCategory]
    : undefined;
  const mainLabel = mainConfig?.label || main || 'Dashboard';
  
  const subConfig = mainConfig?.children?.find((c) => c.id === sub);
  const activeSubLabel = subConfig?.label;
  
  const subSubConfig = subConfig?.children?.find((c) => c.id === leaf);
  const activeSubSubLabel = subSubConfig?.label;

  // Helper pour les badges
  const getBadgeForNode = useCallback((node: NavNode): number | undefined => {
    // Logique de badge simplifiée
    return undefined;
  }, []);

  const getBadgeTypeForNode = useCallback((node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    return 'default';
  }, []);

  // ✅ Handler niveau 2 : uniquement navigate() (Store). URL mise à jour par useDashboardCommandCenterUrlSync.
  const handleSubCategoryClick = useCallback((subCatId: string) => {
    log.debug('Clic niveau 2', { subCatId, main });
    
    // ✅ Utiliser getDefaultLeafForSub depuis routeValidation (plus optimisé et cache)
    let defaultLeaf: string | null = null;
    const currentMain = main || 'pilotage';
    
    try {
      defaultLeaf = getDefaultLeafForSub(currentMain, subCatId);
      
      if (defaultLeaf) {
        log.debug('Leaf trouvé via routeValidation', {
          main: currentMain,
          sub: subCatId,
          leaf: defaultLeaf,
        });
      }
      
      // ✅ Valider la route avant de naviguer
      if (!isValidRoute(currentMain, subCatId, defaultLeaf)) {
        log.warn('Route invalide après résolution du leaf', {
          main: currentMain,
          sub: subCatId,
          leaf: defaultLeaf,
        });
        defaultLeaf = null;
      }
    } catch (e) {
      log.warn('Erreur lors de la résolution du leaf', { error: e, main: currentMain, sub: subCatId });
      
      // Fallback: utiliser getSubSubCategories si routeValidation échoue
      const subSubCategoriesForThisSub = getSubSubCategories(currentMainCategory, subCatId);
      defaultLeaf = subSubCategoriesForThisSub && subSubCategoriesForThisSub.length > 0 
        ? subSubCategoriesForThisSub[0].id 
        : null;
    }
    
    log.navigation(
      `${main}/${sub || ''}/${leaf || ''}`,
      `${currentMain}/${subCatId}/${defaultLeaf || ''}`,
      { main: currentMain, sub: subCatId, leaf: defaultLeaf }
    );
    
    navigate(currentMain as any, subCatId, defaultLeaf);
    // URL mise à jour par useDashboardCommandCenterUrlSync (Store -> URL)
  }, [main, sub, leaf, navigate, log]);

  // ✅ Handler niveau 3 (leaf) : uniquement navigate() (Store). URL mise à jour par useDashboardCommandCenterUrlSync.
  const handleSubSubCategoryClick = useCallback((leafId: string) => {
    log.debug('Clic niveau 3', { leafId, main, sub });
    
    if (!sub) {
      log.warn('Pas de subCategory pour naviguer vers leaf', { leafId, main });
      return;
    }
    
    const currentMain = main || 'pilotage';
    
    // ✅ Valider la route avant de naviguer
    try {
      if (!isValidRoute(currentMain, sub, leafId)) {
        log.warn('Route invalide pour leaf', {
          main: currentMain,
          sub,
          leaf: leafId,
        });
        return; // Ne pas naviguer vers une route invalide
      }
    } catch (e) {
      log.warn('Erreur lors de la validation de la route', { error: e, main: currentMain, sub, leaf: leafId });
    }
    
    log.navigation(
      `${currentMain}/${sub}/${leaf || ''}`,
      `${currentMain}/${sub}/${leafId}`,
      { main: currentMain, sub, leaf: leafId }
    );
    
    navigate(currentMain as any, sub, leafId);
    // URL mise à jour par useDashboardCommandCenterUrlSync (Store -> URL)
  }, [main, sub, leaf, navigate, log]);

  const MAIN_DG_CATEGORIES: DashboardMainCategory[] = [
    'pilotage',
    'chantiers',
    'finance',
    'clients',
    'rh',
    'systeme',
  ];

  const mainTabs = MAIN_DG_CATEGORIES
    .map((key) => {
      const node = dashboardNavigationConfig[key as DashboardNavMainCategory];
      if (!node || !nodeAllowed(userContext, node.requires)) return null;
      return {
        id: key,
        label: node.label,
        icon: node.icon,
      };
    })
    .filter(Boolean);

  return (
    <div
      className={cn(
        'min-w-0 border-b border-slate-200 bg-white/95 dark:border-slate-800/80 dark:bg-slate-950/80',
        zIndexClass('subnav')
      )}
    >
      {/* NIVEAU 1 : TABS PRINCIPAUX (6 BLOCS DG) — une ligne, scroll horizontal si besoin */}
      <div className="min-w-0 px-3 pb-2 pt-1">
        <SegmentedTabs
          value={currentMainCategory}
          onChange={(val) => {
            const nextMain = val as DashboardMainCategory;
            const subs = getSubCategories(nextMain);
            const firstSub = subs[0];
            const defaultLeaf =
              firstSub?.id != null
                ? getDefaultLeafForSub(nextMain, firstSub.id)
                : null;

            navigate(nextMain, firstSub?.id ?? null, defaultLeaf);
          }}
          items={mainTabs as any}
          className="h-9 text-[11px]"
          pillClassName="rounded-full border border-slate-300 bg-slate-100 dark:border-slate-800/60 dark:bg-slate-950/30"
          pillItemClassName="rounded-full px-3 py-1.5 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=inactive]:text-slate-600 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-50 dark:data-[state=inactive]:bg-slate-900/40 dark:data-[state=inactive]:text-slate-400"
          underlineClassName="h-[2px] rounded-full bg-sky-500"
        />
      </div>

      {/* NIVEAU 2 : CHIPS HORIZONTAUX (sub) — masqués si mainTabsOnly (sub-nav en sidebar) */}
      {!mainTabsOnly && subCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
          {subCategories.map((subCat) => {
            const active = subCat.id === sub;
            return (
              <button
                key={subCat.id}
                type="button"
                onClick={() => handleSubCategoryClick(subCat.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition-colors',
                  active
                    ? 'border-sky-500/70 bg-sky-500/10 text-sky-100'
                    : 'border-slate-800/60 bg-slate-900/60 text-slate-400 hover:bg-slate-800/80'
                )}
              >
                {subCat.icon && (
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                    <subCat.icon className="h-3 w-3 min-h-0 min-w-0 max-h-full max-w-full" aria-hidden />
                  </span>
                )}
                <span>{subCat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* NIVEAU 3 : FILTRES DISCRETS (leaf) — masqués si mainTabsOnly */}
      {!mainTabsOnly && subSubCategories.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
          {subSubCategories.map((leafNode) => {
            const active = leafNode.id === leaf;
            return (
              <button
                key={leafNode.id}
                type="button"
                onClick={() => handleSubSubCategoryClick(leafNode.id)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] transition-colors',
                  active
                    ? 'bg-slate-800 text-slate-100'
                    : 'bg-transparent text-slate-400 hover:bg-slate-900'
                )}
              >
                {leafNode.label}
              </button>
            );
          })}
        </div>
      )}

      {/* BREADCRUMB OPTIONNEL EN BAS — masqué si mainTabsOnly */}
      {!mainTabsOnly && showBreadcrumbs && (
        <div className="px-4 pb-2 text-[10px] text-slate-400 flex items-center gap-1">
          <span>{mainLabel}</span>
          {activeSubLabel && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <span>{activeSubLabel}</span>
            </>
          )}
          {activeSubSubLabel && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <span>{activeSubSubLabel}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
});
