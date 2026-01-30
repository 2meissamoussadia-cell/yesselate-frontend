/**
 * Sidebar de navigation pour le module Gouvernance
 * Navigation à 3 niveaux - Niveau 1
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ChevronLeft, Search, CalendarClock } from 'lucide-react';
import { governanceNavigationConfig, type NavNode } from './governanceNavigationConfig';
import type { GovernanceMainCategory } from '../types/governanceNavigationTypes';

interface GovernanceSidebarProps {
  activeCategory: GovernanceMainCategory;
  activeSubCategory?: string;
  collapsed?: boolean;
  stats?: {
    strategic?: number;
    attention?: number;
    arbitrages?: number;
    instances?: number;
    compliance?: number;
  };
  onCategoryChange: (category: string, subCategory?: string) => void;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
}

export function GovernanceSidebar({
  activeCategory,
  activeSubCategory,
  collapsed = false,
  stats = {},
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: GovernanceSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['strategic']));

  const getBadgeForNode = useCallback((node: NavNode): number | string | undefined => {
    if (!stats) return node.badge;
    const badgeMap: Record<string, number> = {
      strategic: stats.strategic || 0,
      attention: stats.attention || 0,
      arbitrages: stats.arbitrages || 0,
      instances: stats.instances || 0,
      compliance: stats.compliance || 0,
    };
    return badgeMap[node.id] || node.badge;
  }, [stats]);

  const getBadgeTypeForNode = useCallback((node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'attention' || node.id === 'retards' || node.id === 'critiques') return 'critical';
      if (node.id === 'arbitrages' || node.id === 'en-attente') return 'warning';
    }
    return node.badgeType || 'default';
  }, [getBadgeForNode]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
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
          onCategoryChange(node.id as GovernanceMainCategory, node.children[0].id);
        }
      } else {
        if (level === 1) onCategoryChange(activeCategory, node.id);
        else onCategoryChange(node.id as GovernanceMainCategory);
      }
    };

    return (
      <div key={node.id}>
        <button
          onClick={handleClick}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left',
            'group relative',
            isActive
              ? 'bg-sky-500/15 text-sky-100 border-l-2 border-sky-500'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border-l-2 border-transparent'
          )}
        >
          {/* Icon */}
          {Icon && (
            <Icon
              className={cn(
                'h-3.5 w-3.5 flex-shrink-0 transition-all duration-200',
                isActive ? 'text-sky-100' : 'text-slate-400 group-hover:text-slate-200'
              )}
            />
          )}

          {/* Label */}
          {!collapsed && (
            <>
              <span
                className={cn(
                  'flex-1 transition-colors duration-200 text-sm',
                  isActive ? 'text-sky-100' : 'text-slate-300'
                )}
              >
                {node.label}
              </span>

              {/* Badge */}
              {badge !== undefined && badge !== null && badge !== 0 && (
                <Badge
                  variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'}
                  className="h-5 min-w-5 px-1.5 text-xs font-medium"
                >
                  {badge}
                </Badge>
              )}

              {/* Expand/Collapse icon */}
              {hasChildren && (
                <span className="text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </>
          )}
        </button>

        {/* Children */}
        {!collapsed && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 pl-6">
            {node.children?.map((child) => (
              <NavNodeComponent key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col border-r border-slate-800/70 bg-slate-950/60 overflow-y-auto overflow-x-hidden scrollbar-dashboard transition-[width] duration-200 ease-out',
        'z-40 h-full',
        collapsed ? 'w-14' : 'w-52'
      )}
      aria-label="Navigation Gouvernance"
    >
      {/* Header — aligné dashboard */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800/60">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">
              Centre de Commande
            </span>
          </div>
        )}
        {collapsed && (
          <CalendarClock className="h-5 w-5 text-blue-400 mx-auto" />
        )}
        {onToggleCollapse && (
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
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pb-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher…"
              className="w-full rounded-xl bg-white/5 px-3 py-2 pl-8 text-sm text-slate-200 ring-1 ring-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              onClick={onOpenCommandPalette}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 min-w-0">
        <div className="space-y-0.5 px-2">
          {Object.values(governanceNavigationConfig).map((node) => (
            <NavNodeComponent key={node.id} node={node} level={0} />
          ))}
        </div>
      </nav>

      {/* Footer — aligné dashboard */}
      {!collapsed && (
        <div className="border-t border-slate-800/60 p-3">
          <div className="text-xs text-slate-500 text-center">
            Gouvernance
          </div>
        </div>
      )}
    </aside>
  );
}

