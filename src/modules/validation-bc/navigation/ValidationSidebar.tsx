/**
 * Sidebar de navigation pour le module Validation-BC
 * Navigation hiérarchique avec icônes Lucide
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { validationNavigation, findNavNodeById, type ValidationNavItem } from './validationNavigationConfig';
import { useValidationStats } from '../hooks/useValidationStats';

interface ValidationSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function ValidationSidebar({
  collapsed = false,
  onToggleCollapse,
  activeCategory,
  onCategoryChange,
}: ValidationSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: stats } = useValidationStats();
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview']));

  // Calculer les badges dynamiques basés sur les stats
  const getBadgeForNode = useCallback((node: ValidationNavItem): number | string | undefined => {
    if (!stats) return node.badge;
    
    // Mapping des IDs vers les stats
    const badgeMap: Record<string, number> = {
      'en-attente': stats.enAttente || 0,
      'valides': stats.valides || 0,
      'rejetes': stats.rejetes || 0,
      'urgents': stats.urgents || 0,
      'bc': stats.parType?.BC || 0,
      'factures': stats.parType?.FACTURE || 0,
      'avenants': stats.parType?.AVENANT || 0,
    };
    
    return badgeMap[node.id] || node.badge;
  }, [stats]);

  const getBadgeTypeForNode = useCallback((node: ValidationNavItem): 'default' | 'warning' | 'critical' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'urgents' || node.id.includes('urgent')) return 'critical';
      if (node.id === 'en-attente' || node.id === 'bc' || node.id === 'factures') return 'warning';
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

  // Vérifier si un nœud est actif
  const isNodeActive = useCallback((node: ValidationNavItem): boolean => {
    if (!pathname) return false;
    return pathname === node.route || pathname.startsWith(node.route + '/');
  }, [pathname]);

  // Auto-expand les nœuds parents des nœuds actifs
  useEffect(() => {
    if (!pathname) return;
    
    const nodesToExpand = new Set<string>();
    
    const checkAndExpand = (nodes: ValidationNavItem[], parentId?: string) => {
      nodes.forEach((node) => {
        if (isNodeActive(node)) {
          if (parentId) nodesToExpand.add(parentId);
        }
        if (node.children) {
          checkAndExpand(node.children, node.id);
        }
      });
    };
    
    checkAndExpand(validationNavigation);
    
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      nodesToExpand.forEach((id) => next.add(id));
      return next;
    });
  }, [pathname, isNodeActive]);

  // Composant pour un nœud de navigation
  const NavNode = React.memo(function NavNode({
    node,
    level,
  }: {
    node: ValidationNavItem;
    level: number;
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
      }
      if (node.route) {
        router.push(node.route);
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
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
              : 'hover:bg-slate-700/40 border border-transparent text-slate-300',
            level > 0 && 'text-sm'
          )}
        >
          {/* Indicator */}
          {isActive && level === 0 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-amber-400" />
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
                isActive ? 'text-amber-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
              )}
            />
          )}

          {/* Label */}
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{node.label}</span>
              {badge !== undefined && badge !== null && (
                <Badge
                  variant={badgeType === 'critical' ? 'destructive' : 'default'}
                  className="text-xs"
                >
                  {badge}
                </Badge>
              )}
            </>
          )}
        </button>

        {/* Children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-0.5">
            {node.children!.map((child) => (
              <NavNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  });

  // Render
  return (
    <div
      className={cn(
        'flex flex-col h-full bg-slate-900/50 border-r border-slate-700/50 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200">Validation-BC</h2>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {validationNavigation.map((node) => (
          <NavNode key={node.id} node={node} level={0} />
        ))}
      </nav>

      {/* Toggle Button */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-start text-slate-400 hover:text-slate-200"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}

