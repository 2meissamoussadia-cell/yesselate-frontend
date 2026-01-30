/**
 * Navigation secondaire et tertiaire pour le module Dashboard
 * VERSION CORRIGÉE - Navigation unifiée (Command Center store)
 */

'use client';

import React, { useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Sparkles } from 'lucide-react';
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
import type { DashboardMainCategory } from '../types/dashboardNavigationTypes';
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
}

export const DashboardSubNavigation = memo(function DashboardSubNavigation({
  stats = {},
  showBreadcrumbs = false,
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
  const mainConfig = dashboardNavigationConfig[currentMainCategory];
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

  return (
    <div className="bg-slate-950/20 border-b border-slate-800/40 backdrop-blur relative overflow-hidden">
      
      {/* Breadcrumb (optionnel). Par défaut on évite la double breadcrumb. */}
      {showBreadcrumbs ? (
        <div 
          className={cn("px-2 sm:px-4 py-1.5 flex items-center gap-1.5 sm:gap-2 text-xs border-b border-slate-800/50 relative min-w-0 overflow-x-auto", zIndexClass('breadcrumbs'))}
          role="navigation"
          aria-label="Fil d'Ariane"
        >
          <span className="text-slate-400">Dashboard</span>
          <ChevronRight className="h-3 w-3 text-slate-500" />
          <span className="text-slate-200 font-medium">{mainLabel}</span>
          {sub && activeSubLabel && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-500" />
              <span className="text-slate-300">{activeSubLabel}</span>
            </>
          )}
          {leaf && activeSubSubLabel && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-500" />
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {activeSubSubLabel}
              </span>
            </>
          )}
        </div>
      ) : null}

      {/* Level 2 Navigation - Sub Categories (Segmented Tabs) */}
      {subCategories.length > 0 && (
        <div className={cn("px-2 sm:px-4 py-1.5 border-b border-slate-800/50 relative min-w-0", zIndexClass('subNavigation'))}>
          <SegmentedTabs
            items={subCategories.map((subCat) => ({
              id: subCat.id,
              label: subCat.label ?? subCat.id,
              badge: getBadgeForNode(subCat),
            }))}
            value={sub || null}
            onChange={handleSubCategoryClick}
          />
        </div>
      )}

      {/* Level 3 Navigation - Sub Sub Categories (Segmented Tabs) */}
      {subSubCategories.length > 0 && sub && (
        <div className={cn("px-2 sm:px-4 py-1.5 bg-slate-800/20 relative min-w-0", zIndexClass('subNavigation'))}>
          <SegmentedTabs
            items={subSubCategories.map((subSubCat) => ({
              id: subSubCat.id,
              label: subSubCat.label ?? subSubCat.id,
              badge: getBadgeForNode(subSubCat),
            }))}
            value={leaf || null}
            onChange={handleSubSubCategoryClick}
            className="text-xs"
          />
        </div>
      )}
    </div>
  );
});
