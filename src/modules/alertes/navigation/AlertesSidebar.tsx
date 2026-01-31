/**
 * Sidebar de navigation principale pour Alertes & Risques
 * Inspiré de AnalyticsCommandSidebar avec navigation hiérarchique à 3 niveaux
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { alertesNavigationConfig, type AlerteNavItem } from './alertesNavigationConfig';
import { useAlertesCommandCenterStore } from '@/lib/stores/alertesCommandCenterStore';

interface AlertesSidebarProps {
  activeCategory: string;
  collapsed: boolean;
  onCategoryChange: (category: string) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  stats?: {
    critical?: number;
    warning?: number;
    sla?: number;
    blocked?: number;
    acknowledged?: number;
    resolved?: number;
  };
}

export const AlertesSidebar = React.memo(function AlertesSidebar({
  activeCategory,
  collapsed,
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
  stats = {},
}: AlertesSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview']));

  // Calculer les badges dynamiques
  const getBadgeForNode = (node: AlerteNavItem): number | string | undefined => {
    if (node.id === 'en-cours') {
      const total = (stats.critical || 0) + (stats.warning || 0) + (stats.sla || 0) + (stats.blocked || 0);
      return total > 0 ? total : undefined;
    }
    if (node.id === 'critiques') return stats.critical;
    if (node.id === 'avertissements') return stats.warning;
    if (node.id === 'sla-depasses') return stats.sla;
    if (node.id === 'blocages') return stats.blocked;
    if (node.id === 'acquittees') return stats.acknowledged;
    if (node.id === 'resolues') return stats.resolved;
    return node.badge;
  };

  const getBadgeTypeForNode = (node: AlerteNavItem): 'default' | 'warning' | 'critical' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'critiques' || node.id.includes('critique')) return 'critical';
      if (node.id === 'avertissements' || node.id === 'sla-depasses' || node.id === 'blocages') return 'warning';
    }
    return node.badgeType || 'default';
  };

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

  const isNodeActive = (node: AlerteNavItem): boolean => {
    if (node.id === activeCategory) return true;
    if (node.children) {
      return node.children.some((child) => isNodeActive(child));
    }
    return false;
  };

  // Composant séparé pour chaque nœud de navigation
  // Permet d'utiliser des hooks (useEffect) correctement
  const NavNode = React.memo(function NavNode({
    node,
    level,
    isActive,
    isExpanded,
    hasChildren,
    badge,
    badgeType,
    collapsed,
    onToggle,
    onCategoryChange,
    activeCategory,
    expandedNodes,
    getBadgeForNode,
    getBadgeTypeForNode,
    isNodeActive,
  }: {
    node: AlerteNavItem;
    level: number;
    isActive: boolean;
    isExpanded: boolean;
    hasChildren: boolean;
    badge: number | string | undefined;
    badgeType: 'default' | 'warning' | 'critical';
    collapsed: boolean;
    onToggle: () => void;
    onCategoryChange: (id: string) => void;
    activeCategory: string;
    expandedNodes: Set<string>;
    getBadgeForNode: (node: AlerteNavItem) => number | string | undefined;
    getBadgeTypeForNode: (node: AlerteNavItem) => 'default' | 'warning' | 'critical';
    isNodeActive: (node: AlerteNavItem) => boolean;
  }) {
    const Icon = node.icon;

    // Auto-expand si actif - utiliser useRef pour éviter les boucles infinies
    const prevIsActiveRef = React.useRef(isActive);
    
    React.useEffect(() => {
      // Ne faire l'auto-expand que quand le nœud devient actif (transition inactive -> active)
      const becameActive = isActive && !prevIsActiveRef.current;
      
      // Auto-expand seulement si :
      // 1. Le nœud vient de devenir actif
      // 2. Il a des enfants
      // 3. Il n'est pas déjà expandé (vérifié via isExpanded prop)
      if (becameActive && hasChildren && !isExpanded) {
        onToggle();
      }
      
      prevIsActiveRef.current = isActive;
      // Ne pas inclure isExpanded dans les dépendances pour éviter la boucle infinie
      // On vérifie seulement la transition inactive -> active
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, hasChildren]);

    const handleClick = () => {
      if (hasChildren) {
        onToggle();
      }
      if (node.route) {
        onCategoryChange(node.id);
      }
    };

    const indentClass = level === 0 ? '' : level === 1 ? 'ml-4' : 'ml-8';

    return (
      <div className={cn('w-full', indentClass)}>
        <button
          onClick={handleClick}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
            'group relative',
            isActive
              ? 'bg-amber-500/10 border border-amber-500/30 scale-[1.02]'
              : 'hover:bg-slate-700/40 border border-transparent hover:scale-[1.01]',
            level > 0 && 'text-sm'
          )}
          title={collapsed ? node.label : undefined}
        >
          {/* Indicator */}
          {level === 0 && (
            <div
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all duration-300',
                isActive ? 'bg-amber-400' : 'bg-transparent'
              )}
            />
          )}

          {/* Icon */}
          {!collapsed && (
            <div
              className={cn(
                'flex-shrink-0 flex items-center justify-center transition-all duration-200',
                isActive
                  ? 'text-amber-400 scale-110'
                  : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}

          {/* Label & Badge */}
          {!collapsed && (
            <>
              <span
                className={cn(
                  'flex-1 text-left text-sm font-medium truncate transition-colors duration-200',
                  isActive ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200',
                  level > 0 && 'font-normal'
                )}
              >
                {node.label}
              </span>

              {badge !== undefined && badge !== null && (
                <Badge
                  variant="outline"
                  className={cn(
                    'h-5 min-w-5 px-1.5 text-xs font-medium transition-all duration-200',
                    badgeType === 'critical'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30 group-hover:bg-red-500/30'
                      : badgeType === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 group-hover:bg-amber-500/30'
                      : 'bg-slate-500/20 text-slate-400 border-slate-500/30 group-hover:bg-slate-500/30'
                  )}
                >
                  {badge}
                </Badge>
              )}

              {/* Expand/Collapse Icon */}
              {hasChildren && (
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              )}
            </>
          )}

          {/* Collapsed Badge */}
          {collapsed && badge !== undefined && badge !== null && (
            <div
              className={cn(
                'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-xs flex items-center justify-center font-medium transition-transform duration-200',
                badgeType === 'critical'
                  ? 'bg-red-500 text-white'
                  : badgeType === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-500 text-white',
                isActive && 'scale-110'
              )}
            >
              {badge}
            </div>
          )}
        </button>

        {/* Children */}
        {!collapsed && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children?.map((child) => {
              const childIsActive = isNodeActive(child);
              const childIsExpanded = expandedNodes.has(child.id);
              const childHasChildren = !!(child.children && child.children.length > 0);
              
              return (
                <NavNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  isActive={childIsActive}
                  isExpanded={childIsExpanded}
                  hasChildren={childHasChildren}
                  badge={getBadgeForNode(child)}
                  badgeType={getBadgeTypeForNode(child)}
                  collapsed={collapsed}
                  onToggle={() => toggleNode(child.id)}
                  onCategoryChange={onCategoryChange}
                  activeCategory={activeCategory}
                  expandedNodes={expandedNodes}
                  getBadgeForNode={getBadgeForNode}
                  getBadgeTypeForNode={getBadgeTypeForNode}
                  isNodeActive={isNodeActive}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  });

  // Mémoriser les callbacks pour éviter les re-renders
  const createToggleHandler = useCallback((nodeId: string) => () => toggleNode(nodeId), [toggleNode]);
  const createCategoryChangeHandler = useCallback((nodeId: string) => () => onCategoryChange(nodeId), [onCategoryChange]);

  const renderNavNode = (node: AlerteNavItem, level: number = 0): React.ReactNode => {
    const isActive = isNodeActive(node);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const badge = getBadgeForNode(node);
    const badgeType = getBadgeTypeForNode(node);

    return (
      <NavNode
        key={node.id}
        node={node}
        level={level}
        isActive={isActive}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        badge={badge}
        badgeType={badgeType}
        collapsed={collapsed}
        onToggle={createToggleHandler(node.id)}
        onCategoryChange={createCategoryChangeHandler(node.id)}
        activeCategory={activeCategory}
        expandedNodes={expandedNodes}
        getBadgeForNode={getBadgeForNode}
        getBadgeTypeForNode={getBadgeTypeForNode}
        isNodeActive={isNodeActive}
      />
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        'fixed sm:relative z-40 h-full',
        'transform transition-transform',
        collapsed
          ? 'w-16 -translate-x-full sm:translate-x-0'
          : 'w-64 translate-x-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-slate-200 text-sm">Alertes & Risques</span>
          </div>
        )}
        {collapsed && (
          <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Trigger */}
      {!collapsed && (
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={onOpenCommandPalette}
            className="w-full justify-start gap-2 h-9 px-3 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Rechercher...</span>
            <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">
              <KeyboardShortcut shortcut="⌘K" />
            </kbd>
          </Button>
        </div>
      )}
      {collapsed && (
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCommandPalette}
            className="w-full h-9 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {alertesNavigationConfig.map((node) => renderNavNode(node, 0))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-3">
        {!collapsed && (
          <div className="text-xs text-slate-400 text-center">
            Alertes v1.0
          </div>
        )}
      </div>
    </aside>
  );
});

