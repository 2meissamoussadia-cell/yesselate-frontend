/**
 * Sidebar de navigation pour le module Demandes
 * Navigation hiérarchique avec icônes Lucide
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ChevronLeft, Search, FileCheck } from 'lucide-react';
import { demandesNavigationConfig, findNavNodeById, type NavNode } from './demandesNavigationConfig';

interface DemandesSidebarProps {
  activeCategory: string;
  activeSubCategory?: string;
  activeSubSubCategory?: string;
  collapsed?: boolean;
  stats?: {
    pending?: number;
    urgent?: number;
    overdue?: number;
  };
  onCategoryChange: (category: string, subCategory?: string, subSubCategory?: string) => void;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
}

export function DemandesSidebar({
  activeCategory,
  activeSubCategory,
  activeSubSubCategory,
  collapsed = false,
  stats = {},
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: DemandesSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview']));

  // Calculer les badges dynamiques
  const getBadgeForNode = useCallback((node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;

    // Mapping des IDs vers les stats
    const badgeMap: Record<string, number> = {
      'en-attente': stats.pending || 0,
      'urgentes': stats.urgent || 0,
      'en-retard': stats.overdue || 0,
    };

    return badgeMap[node.id] || node.badge;
  }, [stats]);

  const getBadgeTypeForNode = useCallback((node: NavNode): 'default' | 'warning' | 'critical' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'urgentes') return 'critical';
      if (node.id === 'en-attente' || node.id === 'en-retard') return 'warning';
    }
    return node.badgeType || 'default';
  }, [getBadgeForNode]);

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

  const isNodeActive = useCallback((node: NavNode): boolean => {
    // Pour les nœuds de niveau 0 (catégories principales)
    if (node.id === activeCategory) {
      // Si le nœud a des enfants, il est actif si un de ses enfants est sélectionné
      if (node.children && node.children.length > 0) {
        return !activeSubCategory || node.children.some((child) => child.id === activeSubCategory);
      }
      return true;
    }
    // Pour les nœuds de niveau 1 (sub-categories)
    return activeSubCategory === node.id;
  }, [activeCategory, activeSubCategory]);

  // Composant pour un nœud de navigation
  const NavNode = React.memo(function NavNode({
    node,
    level = 0,
  }: {
    node: NavNode;
    level?: number;
  }) {
    const isActive = isNodeActive(node);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const badge = getBadgeForNode(node);
    const badgeType = getBadgeTypeForNode(node);
    const Icon = node.icon;

    const handleClick = () => {
      if (hasChildren) {
        toggleNode(node.id);
        // Si c'est le premier niveau avec enfants, naviguer vers le premier enfant
        if (level === 0 && node.children && node.children.length > 0) {
          const firstChild = node.children[0];
          onCategoryChange(node.id, firstChild.id);
        }
      } else {
        // Si on clique sur un enfant de niveau 1, on garde la catégorie parent
        if (level === 1) {
          onCategoryChange(activeCategory, node.id);
        } else if (level === 0) {
          // Niveau 0 sans enfants
          onCategoryChange(node.id);
        }
      }
    };

    return (
      <div className={cn('w-full', level > 0 && 'ml-4')}>
        <button
          onClick={handleClick}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left',
            'group relative',
            level === 0 && 'font-medium',
            isActive
              ? 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
              : 'hover:bg-slate-700/40 border border-transparent text-slate-300',
            level > 0 && 'text-sm'
          )}
        >
          {/* Indicator */}
          {isActive && level === 0 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-orange-400" />
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

          {/* Icon */}
          {Icon && (
            <Icon
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-all duration-200',
                isActive ? 'text-orange-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
              )}
            />
          )}

          {/* Label */}
          {!collapsed && (
            <>
              <span className="flex-1">{node.label}</span>
              {badge !== undefined && (
                <Badge
                  variant={badgeType === 'critical' ? 'destructive' : badgeType === 'warning' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    badgeType === 'critical' && 'bg-red-500/20 text-red-400 border-red-500/30',
                    badgeType === 'warning' && 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  )}
                >
                  {badge}
                </Badge>
              )}
            </>
          )}
        </button>

        {/* Children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {node.children!.map((child) => (
              <NavNode
                key={child.id}
                node={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-orange-400" />
            <span className="font-semibold text-slate-200 text-sm">Demandes</span>
          </div>
        )}
        {collapsed && <FileCheck className="h-5 w-5 text-orange-400 mx-auto" />}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Search Trigger */}
      {!collapsed && onOpenCommandPalette && (
        <div className="p-3 border-b border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCommandPalette}
            className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="text-xs">Rechercher...</span>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.values(demandesNavigationConfig).map((node) => (
          <NavNode key={node.id} node={node} />
        ))}
      </nav>
    </aside>
  );
}

