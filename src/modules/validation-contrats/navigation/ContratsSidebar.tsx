/**
 * Sidebar de navigation pour le module Validation-Contrats
 * Navigation hiérarchique avec icônes Lucide
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ChevronLeft, Search, FileCheck } from 'lucide-react';
import { contratsNavigationConfig, findNavNodeById, type NavNode } from './contratsNavigationConfig';

interface ContratsSidebarProps {
  activeCategory: string;
  activeSubCategory?: string;
  collapsed?: boolean;
  stats?: {
    enAttente?: number;
    urgents?: number;
    valides?: number;
    rejetes?: number;
    negociation?: number;
  };
  onCategoryChange: (category: string, subCategory?: string) => void;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
}

export function ContratsSidebar({
  activeCategory,
  activeSubCategory,
  collapsed = false,
  stats = {},
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: ContratsSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview']));

  // Calculer les badges dynamiques
  const getBadgeForNode = useCallback((node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;

    // Mapping des IDs vers les stats
    const badgeMap: Record<string, number> = {
      'en-attente': stats.enAttente || 0,
      'urgents': stats.urgents || 0,
      'valides': stats.valides || 0,
      'rejetes': stats.rejetes || 0,
      'negociation': stats.negociation || 0,
    };

    return badgeMap[node.id] || node.badge;
  }, [stats]);

  const getBadgeTypeForNode = useCallback((node: NavNode): 'default' | 'warning' | 'critical' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'urgents' || node.id === 'critiques') return 'critical';
      if (node.id === 'en-attente' || node.id === 'moyens') return 'warning';
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
    if (node.id === activeCategory) {
      if (node.children && node.children.length > 0) {
        return !activeSubCategory || node.children.some((child) => child.id === activeSubCategory);
      }
      return true;
    }
    return activeSubCategory === node.id;
  }, [activeCategory, activeSubCategory]);

  // Composant pour un nœud de navigation
  const NavNodeComponent = React.memo(function NavNodeComponent({
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
        if (level === 0 && node.children && node.children.length > 0) {
          const firstChild = node.children[0];
          onCategoryChange(node.id, firstChild.id);
        }
      } else {
        if (level === 1) {
          onCategoryChange(activeCategory, node.id);
        } else if (level === 0) {
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
              ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300'
              : 'hover:bg-slate-700/40 border border-transparent text-slate-300',
            level > 0 && 'text-sm'
          )}
        >
          {/* Indicator */}
          {isActive && level === 0 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-purple-400" />
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
            <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-purple-400' : 'text-slate-400')} />
          )}

          {/* Label */}
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{node.label}</span>
              {badge !== undefined && badge !== null && (
                <Badge
                  variant={badgeType === 'critical' ? 'destructive' : badgeType === 'warning' ? 'default' : 'secondary'}
                  className={cn(
                    'text-xs',
                    badgeType === 'critical' && 'bg-red-500/20 text-red-400 border-red-500/30',
                    badgeType === 'warning' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                    badgeType === 'default' && 'bg-slate-700/50 text-slate-300 border-slate-600/50'
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
            {(node.children ?? []).map((child) => (
              <NavNodeComponent key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  });

  if (collapsed) {
    return (
      <div className="w-16 h-full bg-slate-900/80 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full h-8 p-0 text-slate-400 hover:text-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {Object.values(contratsNavigationConfig).map((node) => {
            const Icon = node.icon;
            const isActive = node.id === activeCategory;
            return (
              <button
                key={node.id}
                onClick={() => onCategoryChange(node.id)}
                className={cn(
                  'w-full h-10 flex items-center justify-center rounded-lg transition-colors',
                  isActive
                    ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300'
                    : 'hover:bg-slate-700/40 text-slate-400'
                )}
                title={node.label}
              >
                {Icon && <Icon className="h-5 w-5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-slate-900/80 border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">Validation Contrats</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="w-full justify-start text-slate-400 border-slate-700 hover:bg-slate-800"
        >
          <Search className="h-4 w-4 mr-2" />
          Rechercher...
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {Object.values(contratsNavigationConfig).map((node) => (
          <NavNodeComponent key={node.id} node={node} level={0} />
        ))}
      </div>

      {/* Footer - Taux de validation */}
      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-400 mb-2">Taux validation</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '87%' }} />
          </div>
          <span className="text-xs font-medium text-slate-300">87%</span>
        </div>
      </div>
    </div>
  );
}

