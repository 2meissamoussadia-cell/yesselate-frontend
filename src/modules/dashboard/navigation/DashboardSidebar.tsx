/**
 * Sidebar de navigation pour le module Dashboard
 * VERSION CORRIGÉE - Navigation unifiée (Command Center store)
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { dashboardNavigationConfig, type NavNode } from './dashboardNavigationConfig';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';
import { getDefaultLeafForSub, isValidRoute, normalizeRoute } from '../utils/routeValidation';
import { dashboardRegistry } from '../registry';
import { navToKey, type NavKey } from '../types/dashboard';
import { hasViewAccess } from '../utils/securityGuards';
import { useAuthOptional } from '../hooks/useAuthOptional';
import { useDashboardPermissions } from '../hooks/useDashboardPermissions';
import { filterNavigationConfig } from '../utils/navigationFilter';
import { nodeAllowed } from './permissions';
import { useDashboardPermissionsStore } from '@/lib/stores/dashboardPermissionsStore';
import { useI18n } from '@/src/lib/i18n';
import { useAlertStats } from '../hooks/useAlerts';

interface DashboardSidebarProps {
  collapsed?: boolean;
  stats?: {
    overview?: number;
    performance?: number;
    actions?: number;
    risks?: number;
    decisions?: number;
    realtime?: number;
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
  const router = useRouter();
  const params = useSearchParams();
  
  // ✅ Auth pour les guards de sécurité (optionnel)
  const authContext = useAuthOptional();
  const user = authContext?.user || null;
  
  // ✅ Store Command Center = source de vérité
  const main = useDashboardCommandCenterStore((state) => state.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((state) => state.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((state) => state.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);
  
  // ✅ Helper pour vérifier l'accès à une route
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
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([main || 'overview']));
  
  // Phase P10: Charger les permissions pour filtrer la navigation
  const { permissions: userPerms } = useDashboardPermissions();
  
  // Phase P12: i18n pour les labels de navigation
  const { t } = useI18n();
  
  // Phase P10: Filtrer la navigation selon permissions et feature flags
  const filteredNavConfig = useMemo(
    () => filterNavigationConfig(
      dashboardNavigationConfig,
      userPerms.permissions,
      userPerms.roles,
      userPerms.featureFlags
    ),
    [userPerms.permissions, userPerms.roles, userPerms.featureFlags]
  );
  
  // Ref pour suivre la dernière valeur de main et éviter les mises à jour inutiles
  const lastMainRef = useRef<string | null>(main || null);

  // ✅ S'assurer que le nœud actif est toujours expandé
  // PATCH: Comparaison de valeur plutôt que de référence pour éviter les boucles infinies
  useEffect(() => {
    const currentMain = main || 'overview';
    
    // Ne mettre à jour que si la valeur de main a vraiment changé
    if (lastMainRef.current === currentMain) {
      return; // Même valeur, pas besoin de mettre à jour
    }
    
    lastMainRef.current = currentMain;
    
    setExpandedNodes((prev) => {
      // Si le nœud est déjà dans le Set, ne pas créer un nouveau Set
      if (prev.has(currentMain)) {
        return prev;
      }
      // Créer un nouveau Set seulement si nécessaire
      const next = new Set(prev);
      next.add(currentMain);
      return next;
    });
  }, [main]);

  // ✅ Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  // Phase P15: Récupérer les stats d'alertes pour les badges
  const { data: alertStatsData } = useAlertStats();
  const alertStats = alertStatsData?.stats;

  const getBadgeForNode = useCallback((node: NavNode, level?: number): number | undefined => {
    // Badge depuis props stats (compatibilité)
    const statKey = node.id as keyof typeof stats;
    const propBadge = stats[statKey];
    if (propBadge !== undefined) return propBadge;

    // Phase P15: Badge depuis alertes par routeKey
    if (alertStats && level !== undefined) {
      // Mapping routeKey -> node.id pour les sections performance
      const routeKeyMap: Record<string, string> = {
        'performance::reporting::dashboard': 'reporting',
        'performance::achats::dashboard': 'achats',
        'performance::stocks::dashboard': 'stocks',
        'performance::materiel::dashboard': 'materiel',
        'performance::conformite::dashboard': 'conformite',
      };

      const routeKey = routeKeyMap[node.id];
      if (routeKey) {
        // Récupérer les alertes pour ce routeKey et compter les critiques/warnings
        // Pour l'instant, on retourne le total d'alertes ouvertes
        // TODO: Filtrer par routeKey dans useAlertStats si nécessaire
        return alertStats.critical_open + alertStats.warning_open;
      }
    }

    return node.badge;
  }, [stats, alertStats]);

  const isNodeActive = useCallback((node: NavNode, level: number, parentMain?: string, parentSub?: string): boolean => {
    if (level === 0) {
      return main === node.id;
    }
    if (level === 1) {
      return main === parentMain && sub === node.id;
    }
    if (level === 2) {
      return main === parentMain && sub === parentSub && leaf === node.id;
    }
    return false;
  }, [main, sub, leaf]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // ✅ Handler de navigation simplifié avec validation
  const handleNavigation = useCallback((mainId: string, subId?: string | null, leafId?: string | null) => {
    try {
      // ✅ Valider la route avant de naviguer
      if (!isValidRoute(mainId, subId || null, leafId || null)) {
        // Utiliser debug au lieu de warn pour réduire le bruit dans la console
        log.debug('Route invalide détectée, normalisation', {
          main: mainId,
          sub: subId,
          leaf: leafId,
        });
        
        // Normaliser la route
        const normalized = normalizeRoute(mainId, subId, leafId);
        mainId = normalized.main;
        subId = normalized.sub;
        leafId = normalized.leaf;
      }
      
      log.navigation(
        `${main}/${sub || ''}/${leaf || ''}`,
        `${mainId}/${subId || ''}/${leafId || ''}`,
        { main: mainId, sub: subId, leaf: leafId }
      );
      
      navigate(mainId as any, subId || null, leafId || null);

      // ✅ URL = source de vérité → pousser la route immédiatement
      const sp = new URLSearchParams(params.toString());
      sp.set('main', mainId);
      if (subId) sp.set('sub', subId);
      else sp.delete('sub');
      if (leafId) sp.set('leaf', leafId);
      else sp.delete('leaf');
      router.push(`/maitre-ouvrage/dashboard?${sp.toString()}`);
    } catch (error) {
      log.error('Erreur lors de la navigation', error instanceof Error ? error : new Error(String(error)), {
        main: mainId,
        sub: subId,
        leaf: leafId,
      });
    }
  }, [main, sub, leaf, navigate, log, router, params]);

  // Phase P10: Contexte utilisateur pour nodeAllowed (au niveau parent)
  const userContext = useMemo(
    () => ({
      perms: userPerms.permissions,
      flags: userPerms.featureFlags,
      roles: userPerms.roles,
    }),
    [userPerms.permissions, userPerms.featureFlags, userPerms.roles]
  );

  // Composant interne pour les nœuds
  const NavNodeComponent = React.memo(function NavNodeComponent({
    node,
    level = 0,
    parentMain,
    parentSub,
    userContext: ctx,
  }: {
    node: NavNode;
    level?: number;
    parentMain?: string;
    parentSub?: string;
    userContext: { perms: string[]; flags: Record<string, boolean>; roles: string[] };
  }) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isActive = isNodeActive(node, level, parentMain, parentSub);
    const badge = getBadgeForNode(node, level);
    
    // Déterminer le parent pour les enfants
    const currentMain = level === 0 ? node.id : parentMain;
    const currentSub = level === 1 ? node.id : parentSub;
    
    // ✅ Filtrer les enfants selon les permissions (utilise nodeAllowed)
    const accessibleChildren = useMemo(() => {
      if (!hasChildren || !node.children) return [];
      
      return node.children.filter((child) => {
        // Phase P10: Utiliser nodeAllowed pour vérifier l'accès selon requires
        if (!nodeAllowed(ctx, child.requires)) {
          return false;
        }
        
        // Vérification supplémentaire via checkRouteAccess pour compatibilité
        if (level === 0) {
          // Niveau 1 (sub) : vérifier l'accès avec main + sub
          return checkRouteAccess(node.id, child.id, null);
        } else if (level === 1) {
          // Niveau 2 (leaf) : vérifier l'accès avec main + sub + leaf
          const mainId = parentMain || main || 'overview';
          return checkRouteAccess(mainId, node.id, child.id);
        }
        return true; // Niveau 0, toujours accessible
      });
    }, [node.children, level, node.id, parentMain, main, checkRouteAccess, ctx]);
    
    // ✅ Masquer le nœud si aucun enfant accessible (pour les niveaux 1 et 2)
    if (level > 0 && hasChildren && accessibleChildren.length === 0) {
      return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasChildren) {
        // ✅ TOUJOURS naviguer vers le premier enfant accessible, même si déjà expandé
        if (accessibleChildren.length > 0) {
          const firstChild = accessibleChildren[0];
          
          // Expand le nœud s'il n'est pas déjà expandé
          if (!isExpanded) {
            toggleNode(node.id);
          }
          
          if (level === 0) {
            // Niveau 0 (main) → niveau 1 (sub) → niveau 2 (leaf)
            // ✅ Utiliser getDefaultLeafForSub depuis routeValidation (plus optimisé et cache)
            let firstLeaf: string | null = null;
            try {
              firstLeaf = getDefaultLeafForSub(node.id, firstChild.id);
              
              if (firstLeaf) {
                log.debug('Leaf trouvé via routeValidation', {
                  main: node.id,
                  sub: firstChild.id,
                  leaf: firstLeaf,
                });
              }
            } catch (e) {
              log.warn('Erreur lors de la résolution du leaf', { error: e, main: node.id, sub: firstChild.id });
            }
            
            // Fallback: utiliser la structure des enfants depuis dashboardNavigationConfig
            if (!firstLeaf && firstChild.children && firstChild.children.length > 0) {
              firstLeaf = firstChild.children[0].id;
              log.debug('Leaf trouvé dans dashboardNavigationConfig (fallback)', {
                main: node.id,
                sub: firstChild.id,
                leaf: firstLeaf,
              });
            }
            
            // Naviguer vers le premier enfant avec son premier leaf
            log.debug('Navigation depuis sidebar niveau 0', {
              from: `${main}/${sub || ''}/${leaf || ''}`,
              to: `${node.id}/${firstChild.id}/${firstLeaf || ''}`,
            });
            
            if (firstLeaf) {
              handleNavigation(node.id, firstChild.id, firstLeaf);
            } else {
              handleNavigation(node.id, firstChild.id, null);
            }
          } else if (level === 1) {
            // Niveau 1 (sub) → niveau 2 (leaf)
            // ✅ Utiliser getDefaultLeafForSub depuis routeValidation (plus optimisé et cache)
            let firstLeaf: string | null = null;
            const currentMain = parentMain || main || 'overview';
            
            try {
              firstLeaf = getDefaultLeafForSub(currentMain, node.id);
              
              if (firstLeaf) {
                log.debug('Leaf trouvé via routeValidation', {
                  main: currentMain,
                  sub: node.id,
                  leaf: firstLeaf,
                });
              }
            } catch (e) {
              log.warn('Erreur lors de la résolution du leaf', { error: e, main: currentMain, sub: node.id });
            }
            
            // Fallback: utiliser la structure des enfants depuis dashboardNavigationConfig
            if (!firstLeaf && firstChild.children && firstChild.children.length > 0) {
              firstLeaf = firstChild.children[0].id;
              log.debug('Leaf trouvé dans dashboardNavigationConfig (fallback)', {
                main: currentMain,
                sub: node.id,
                leaf: firstLeaf,
              });
            }
            
            // Naviguer vers le premier leaf
            log.debug('Navigation depuis sidebar niveau 1', {
              from: `${main}/${sub || ''}/${leaf || ''}`,
              to: `${main || 'overview'}/${node.id}/${firstLeaf || ''}`,
            });
            
            if (firstLeaf) {
              handleNavigation(main || 'overview', node.id, firstLeaf);
            } else {
              handleNavigation(main || 'overview', node.id, null);
            }
          }
        } else {
          // Pas d'enfants, juste toggle
          toggleNode(node.id);
        }
      } else {
        // Navigation directe (pas d'enfants)
        // ✅ Utiliser les valeurs parentes correctes pour éviter les routes incorrectes
        if (level === 0) {
          handleNavigation(node.id, null, null);
        } else if (level === 1) {
          // Niveau 1 : utiliser parentMain (ou main si pas de parent)
          const targetMain = parentMain || main || 'overview';
          handleNavigation(targetMain, node.id, null);
        } else if (level === 2) {
          // Niveau 2 : utiliser parentMain et parentSub (ou main/sub si pas de parents)
          const targetMain = parentMain || main || 'overview';
          const targetSub = parentSub || sub || null;
          handleNavigation(targetMain, targetSub, node.id);
        }
      }
    };

    return (
      <div key={node.id} className="relative">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleClick}
                className={cn(
                  'relative w-full min-h-[44px] px-3 py-2 rounded-xl text-left transition-colors',
                  'flex items-center gap-3',
                  isActive
                    ? 'bg-slate-900/55 text-slate-50 border border-slate-700/60'
                    : 'text-slate-300 hover:text-slate-50 hover:bg-slate-900/30',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60'
                )}
                aria-label={`${t(node.i18nKey ?? node.label ?? node.id)}${badge ? `, ${badge} éléments` : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span className="absolute left-1 top-2 bottom-2 w-[3px] rounded-full bg-blue-500/90" />
                )}
                {hasChildren && (
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                    )}
                  </div>
                )}
                {node.icon && (
                  <node.icon className={cn(
                    'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0',
                    isActive ? 'text-slate-200' : 'text-slate-400'
                  )} />
                )}
                <span className="flex-1 truncate min-w-0 text-xs sm:text-sm">
                  {t(node.i18nKey ?? node.label ?? node.id)}
                </span>
                {badge !== undefined && badge !== null && badge !== 0 && (
                  <Badge
                    variant={
                      badge > 10 ? 'destructive' : 
                      badge > 5 ? 'warning' : 
                      'default'
                    }
                    className={cn(
                      "ml-auto border",
                      badge > 10 
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/50"
                        : badge > 5
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                          : "bg-slate-800/50 text-slate-200 border-slate-700/60"
                    )}
                  >
                    {badge}
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t(node.i18nKey ?? node.label ?? node.id)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {accessibleChildren.map((child) => (
              <NavNodeComponent
                key={child.id}
                node={child}
                level={level + 1}
                parentMain={currentMain}
                parentSub={currentSub}
                userContext={ctx}
              />
            ))}
          </div>
        )}
      </div>
    );
  });


  if (collapsed) {
    return (
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-3 sm:py-4 min-w-0 overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-3 sm:mb-4 flex-shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-slate-950/50 backdrop-blur border-r border-slate-800/70 flex flex-col h-full min-w-0 overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-slate-800 min-w-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-white break-words min-w-0">Navigation</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-0.5 sm:space-y-1 min-w-0"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {Object.values(filteredNavConfig).map((node) => (
          <NavNodeComponent key={node.id} node={node} level={0} parentMain={undefined} parentSub={undefined} userContext={userContext} />
        ))}
      </div>
    </aside>
  );
});
