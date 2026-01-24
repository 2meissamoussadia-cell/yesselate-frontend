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
import { ChevronDown, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { dashboardNavigationConfig, type NavNode } from './dashboardNavigationConfig';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';
import { getDefaultLeafForSub, isValidRoute, normalizeRoute } from '../utils/routeValidation';

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
  
  // ✅ Store Command Center = source de vérité
  const main = useDashboardCommandCenterStore((state) => state.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((state) => state.navigation.subCategory);
  const leaf = useDashboardCommandCenterStore((state) => state.navigation.subSubCategory);
  const navigate = useDashboardCommandCenterStore((state) => state.navigate);
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([main || 'overview']));
  const [searchQuery, setSearchQuery] = useState('');
  
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

  const getBadgeForNode = useCallback((node: NavNode): number | undefined => {
    const statKey = node.id as keyof typeof stats;
    return stats[statKey];
  }, [stats]);

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

  // Composant interne pour les nœuds
  const NavNodeComponent = React.memo(function NavNodeComponent({
    node,
    level = 0,
    parentMain,
    parentSub,
  }: {
    node: NavNode;
    level?: number;
    parentMain?: string;
    parentSub?: string;
  }) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isActive = isNodeActive(node, level, parentMain, parentSub);
    const badge = getBadgeForNode(node);
    
    // Déterminer le parent pour les enfants
    const currentMain = level === 0 ? node.id : parentMain;
    const currentSub = level === 1 ? node.id : parentSub;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasChildren) {
        // ✅ TOUJOURS naviguer vers le premier enfant, même si déjà expandé
        if (node.children && node.children.length > 0) {
          const firstChild = node.children[0];
          
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
                  'w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-left min-w-0',
                  'group relative cursor-pointer border',
                  'hover:bg-slate-800/40',
                  isActive
                    ? 'bg-slate-800/55 border-slate-600/50 text-slate-100'
                    : 'border-transparent text-slate-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/40'
                )}
                aria-label={`${node.label}${badge ? `, ${badge} éléments` : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full animate-fadeIn" />
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
                <span className="flex-1 truncate min-w-0 text-xs sm:text-sm">{node.label}</span>
                {badge !== undefined && badge !== null && badge !== 0 && (
                  <Badge
                    variant="default"
                    className="ml-auto bg-slate-800/50 text-slate-200 border border-slate-700/60"
                  >
                    {badge}
                  </Badge>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{node.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {node.children?.map((child) => (
              <NavNodeComponent 
                key={child.id} 
                node={child} 
                level={level + 1}
                parentMain={currentMain}
                parentSub={currentSub}
              />
            ))}
          </div>
        )}
      </div>
    );
  });

  // ✅ Filtrer les nœuds selon la recherche avec debounce
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // Debounce de 300ms
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredNodes = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return dashboardNavigationConfig;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    const filtered: Record<string, NavNode> = {};
    
    // ✅ Recherche récursive dans les nœuds
    const searchInNode = (node: NavNode): boolean => {
      const matchesLabel = node.label.toLowerCase().includes(query);
      
      if (node.children) {
        const matchingChildren = node.children.filter(child => searchInNode(child));
        if (matchingChildren.length > 0 || matchesLabel) {
          return true;
        }
      }
      
      return matchesLabel;
    };
    
    Object.entries(dashboardNavigationConfig).forEach(([key, node]) => {
      if (searchInNode(node)) {
        filtered[key as keyof typeof dashboardNavigationConfig] = node;
      }
    });
    
    return filtered;
  }, [debouncedSearchQuery]);

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
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full min-w-0 overflow-hidden">
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
        <div className="relative min-w-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-0"
          />
        </div>
      </div>
      
      <div 
        className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-0.5 sm:space-y-1 min-w-0"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {Object.values(filteredNodes).map((node) => (
          <NavNodeComponent key={node.id} node={node} level={0} parentMain={undefined} parentSub={undefined} />
        ))}
      </div>
    </aside>
  );
});
