/**
 * Navigation secondaire et tertiaire pour le module Dashboard
 * VERSION CORRIGÉE - Navigation unifiée (Command Center store)
 */

'use client';

import React, { useCallback, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface DashboardSubNavigationProps {
  stats?: {
    overview?: number;
    performance?: number;
    actions?: number;
    risks?: number;
    decisions?: number;
    realtime?: number;
  };
  /** Par défaut: on évite une 2e breadcrumb (DashboardBreadcrumbs fait déjà le job) */
  showBreadcrumbs?: boolean;
}

export const DashboardSubNavigation = memo(function DashboardSubNavigation({
  stats = {},
  showBreadcrumbs = false,
}: DashboardSubNavigationProps) {
  const log = useLogger('DashboardSubNavigation');
  const router = useRouter();
  const params = useSearchParams();
  
  const main = useDashboardCommandCenterStore((state) => state.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((state) => state.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((state) => state.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);

  const pushRoute = useCallback(
    (next: { main: string; sub: string | null; leaf: string | null }) => {
      const sp = new URLSearchParams(params.toString());
      sp.set('main', next.main);
      if (next.sub) sp.set('sub', next.sub);
      else sp.delete('sub');
      if (next.leaf) sp.set('leaf', next.leaf);
      else sp.delete('leaf');
      router.push(`/maitre-ouvrage/dashboard?${sp.toString()}`);
    },
    [router, params]
  );

  const currentMainCategory = (main || 'overview') as DashboardMainCategory;

  // Récupérer les sous-catégories (niveau 2)
  const subCategories = getSubCategories(currentMainCategory) || [];

  // Récupérer les sous-sous-catégories (niveau 3)
  const subSubCategories = (sub
    ? getSubSubCategories(currentMainCategory, sub)
    : []) || [];

  // Labels pour le breadcrumb
  const mainConfig = dashboardNavigationConfig[main as keyof typeof dashboardNavigationConfig];
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

  // ✅ Handler pour niveau 2 (sub-category) avec validation
  const handleSubCategoryClick = useCallback((subCatId: string) => {
    log.debug('Clic niveau 2', { subCatId, main });
    
    // ✅ Utiliser getDefaultLeafForSub depuis routeValidation (plus optimisé et cache)
    let defaultLeaf: string | null = null;
    const currentMain = main || 'overview';
    
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
    pushRoute({ main: currentMain, sub: subCatId, leaf: defaultLeaf || null });
  }, [main, sub, leaf, navigate, log, pushRoute]);

  // ✅ Handler pour niveau 3 (sub-sub-category / leaf) avec validation
  const handleSubSubCategoryClick = useCallback((leafId: string) => {
    log.debug('Clic niveau 3', { leafId, main, sub });
    
    if (!sub) {
      log.warn('Pas de subCategory pour naviguer vers leaf', { leafId, main });
      return;
    }
    
    const currentMain = main || 'overview';
    
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
    pushRoute({ main: currentMain, sub, leaf: leafId });
  }, [main, sub, leaf, navigate, log, pushRoute]);

  return (
    <div className="bg-slate-950/20 border-b border-slate-800/40 backdrop-blur relative overflow-hidden">
      
      {/* Breadcrumb (optionnel). Par défaut on évite la double breadcrumb. */}
      {showBreadcrumbs ? (
        <div 
          className={cn("px-2 sm:px-4 py-2 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm border-b border-slate-800/50 relative min-w-0 overflow-x-auto", zIndexClass('breadcrumbs'))}
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
        <div className={cn("px-2 sm:px-4 py-2 sm:py-2.5 border-b border-slate-800/50 relative min-w-0", zIndexClass('subNavigation'))}>
          <SegmentedTabs
            items={subCategories.map((subCat) => ({
              id: subCat.id,
              label: subCat.label,
              badge: getBadgeForNode(subCat),
            }))}
            value={sub || null}
            onChange={handleSubCategoryClick}
          />
        </div>
      )}

      {/* Level 3 Navigation - Sub Sub Categories (Segmented Tabs) */}
      {subSubCategories.length > 0 && sub && (
        <div className={cn("px-2 sm:px-4 py-2 sm:py-2.5 bg-slate-800/20 relative min-w-0", zIndexClass('subNavigation'))}>
          <SegmentedTabs
            items={subSubCategories.map((subSubCat) => ({
              id: subSubCat.id,
              label: subSubCat.label,
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
