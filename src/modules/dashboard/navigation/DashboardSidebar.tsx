/**
 * Sidebar de navigation pour le module Dashboard
 * VERSION CORRIGÉE - Utilise uniquement useDashboardNavigationStore
 */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronDown, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import { dashboardNavigationConfig, type NavNode } from './dashboardNavigationConfig';
import { useDashboardNavigation } from '../context/DashboardNavigationContext';
import { useLogger } from '@/lib/utils/logger';

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
  
  // ✅ Utiliser uniquement useDashboardNavigationStore
  const { main, sub, leaf, setMain, setSub, setLeaf } = useDashboardNavigation();
  
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

  // ✅ Handler de navigation simplifié
  const handleNavigation = useCallback((mainId: string, subId?: string | null, leafId?: string | null) => {
    log.navigation(
      `${main}/${sub || ''}/${leaf || ''}`,
      `${mainId}/${subId || ''}/${leafId || ''}`,
      { main: mainId, sub: subId, leaf: leafId }
    );
    
    setMain(mainId);
    setSub(subId || null);
    setLeaf(leafId || null);
  }, [main, sub, leaf, setMain, setSub, setLeaf, log]);

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
            // ✅ Utiliser la config JSON pour trouver le premier leaf
            let firstLeaf: string | null = null;
            try {
              const config = require('../navigation/navigation.config.json');
              const configLeafs = config?.[node.id]?.sub?.[firstChild.id]?.leaf;
              
              if (configLeafs && typeof configLeafs === 'object') {
                const leafKeys = Object.keys(configLeafs);
                if (leafKeys.length > 0) {
                  firstLeaf = leafKeys[0];
                  log.debug('Leaf trouvé dans config JSON', {
                    main: node.id,
                    sub: firstChild.id,
                    leaf: firstLeaf,
                  });
                }
              }
            } catch (e) {
              // Fallback: utiliser la structure des enfants depuis dashboardNavigationConfig
              if (firstChild.children && firstChild.children.length > 0) {
                firstLeaf = firstChild.children[0].id;
                log.debug('Leaf trouvé dans dashboardNavigationConfig', {
                  main: node.id,
                  sub: firstChild.id,
                  leaf: firstLeaf,
                });
              }
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
            // ✅ Utiliser la config JSON pour trouver le premier leaf
            let firstLeaf: string | null = null;
            try {
              const config = require('../navigation/navigation.config.json');
              const configLeafs = config?.[parentMain || main || 'overview']?.sub?.[node.id]?.leaf;
              
              if (configLeafs && typeof configLeafs === 'object') {
                const leafKeys = Object.keys(configLeafs);
                if (leafKeys.length > 0) {
                  firstLeaf = leafKeys[0];
                  log.debug('Leaf trouvé dans config JSON', {
                    main: parentMain || main || 'overview',
                    sub: node.id,
                    leaf: firstLeaf,
                  });
                }
              }
            } catch (e) {
              // Fallback: utiliser la structure des enfants depuis dashboardNavigationConfig
              if (firstChild.children && firstChild.children.length > 0) {
                firstLeaf = firstChild.children[0].id;
                log.debug('Leaf trouvé dans dashboardNavigationConfig', {
                  main: parentMain || main || 'overview',
                  sub: node.id,
                  leaf: firstLeaf,
                });
              }
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
        if (level === 0) {
          handleNavigation(node.id, null, null);
        } else if (level === 1) {
          handleNavigation(main || 'overview', node.id, null);
        } else if (level === 2) {
          handleNavigation(main || 'overview', sub || null, node.id);
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
                  'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-left',
                  'group relative cursor-pointer border',
                  'hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10',
                  isActive
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 shadow-md shadow-blue-500/20'
                    : 'hover:bg-slate-700/40 border-transparent text-slate-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50'
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
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                )}
                {node.icon && (
                  <node.icon className={cn(
                    'h-4 w-4 flex-shrink-0',
                    isActive ? 'text-blue-400' : 'text-slate-400'
                  )} />
                )}
                <span className="flex-1 truncate">{node.label}</span>
                {badge !== undefined && badge !== null && badge !== 0 && (
                  <Badge variant="secondary" className="ml-auto">
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

  // Filtrer les nœuds selon la recherche
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) {
      return dashboardNavigationConfig;
    }
    const query = searchQuery.toLowerCase();
    // Logique de filtrage simplifiée
    return dashboardNavigationConfig;
  }, [searchQuery]);

  if (collapsed) {
    return (
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="mb-4"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.values(filteredNodes).map((node) => (
          <NavNodeComponent key={node.id} node={node} level={0} parentMain={undefined} parentSub={undefined} />
        ))}
      </div>
    </aside>
  );
});
