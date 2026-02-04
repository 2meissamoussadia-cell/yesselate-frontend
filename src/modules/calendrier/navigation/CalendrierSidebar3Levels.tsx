/**
 * Sidebar de navigation à 3 niveaux pour le module Calendrier
 * Navigation à 3 niveaux - Niveau 1
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ChevronLeft, Search, CalendarDays } from 'lucide-react';
import {
  calendrierNavigationConfig3Levels,
  type NavNode,
} from './calendrierNavigationConfig3Levels';
import type { CalendrierMainCategory } from '../types/calendrierNavigationTypes';

interface CalendrierSidebar3LevelsProps {
  activeCategory: CalendrierMainCategory;
  activeSubCategory?: string;
  collapsed?: boolean;
  stats?: Record<string, number>;
  onCategoryChange: (category: CalendrierMainCategory, subCategory?: string) => void;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
}

export function CalendrierSidebar3Levels({
  activeCategory,
  activeSubCategory,
  collapsed = false,
  stats = {},
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: CalendrierSidebar3LevelsProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview']));

  const getBadgeForNode = useCallback(
    (node: NavNode): number | string | undefined => {
      // Protection contre stats null ou undefined
      if (!stats || typeof stats !== 'object') {
        return node.badge;
      }
      return stats[node.id] || node.badge;
    },
    [stats]
  );

  const getBadgeTypeForNode = useCallback(
    (node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
      const badge = getBadgeForNode(node);
      if (badge && typeof badge === 'number' && badge > 0) {
        if (node.id === 'retards' || node.id.includes('retard')) return 'critical';
        if (node.id === 'sla-risque' || node.id.includes('risque')) return 'warning';
      }
      return node.badgeType || 'default';
    },
    [getBadgeForNode]
  );

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const handleNodeClick = useCallback(
    (category: CalendrierMainCategory, subCategory?: string) => {
      onCategoryChange(category, subCategory);
    },
    [onCategoryChange]
  );

  return (
    <aside
      className={cn(
        'flex flex-col border-r backdrop-blur-xl transition-all duration-300',
        'border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-900/80',
        'fixed sm:relative z-40 h-full',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-200 text-sm">Calendrier</span>
          </div>
        )}
        {collapsed && <CalendarDays className="h-5 w-5 text-blue-400 mx-auto" />}
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

      {/* Search (si besoin) */}
      {!collapsed && onOpenCommandPalette && (
        <div className="px-3 py-2 border-b border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCommandPalette}
            className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Search className="h-4 w-4 mr-2" />
            Rechercher...
            <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {Object.entries(calendrierNavigationConfig3Levels).map(([key, node]) => {
            const isActive = activeCategory === key;
            const isExpanded = expandedNodes.has(key);
            const hasChildren = node.children && node.children.length > 0;
            const badge = getBadgeForNode(node);
            const badgeType = getBadgeTypeForNode(node);
            const Icon = node.icon;

            return (
              <div key={key}>
                <button
                  onClick={() => {
                    if (hasChildren) toggleNode(key);
                    handleNodeClick(key as CalendrierMainCategory);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-slate-800 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{node.label}</span>
                      {badge !== undefined && (
                        <Badge
                          variant={badgeType}
                          className={cn(
                            'text-[10px] px-1.5 py-0',
                            badgeType === 'critical' &&
                              'bg-red-500/20 text-red-400 border-red-500/30',
                            badgeType === 'warning' &&
                              'bg-amber-500/20 text-amber-400 border-amber-500/30',
                            badgeType === 'success' &&
                              'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                            badgeType === 'default' && 'bg-slate-700 text-slate-300 border-slate-600'
                          )}
                        >
                          {badge}
                        </Badge>
                      )}
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform',
                            isExpanded ? 'rotate-180' : ''
                          )}
                        />
                      )}
                    </>
                  )}
                </button>
                {!collapsed && hasChildren && isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {node.children?.map((subNode) => {
                      const isSubActive = activeSubCategory === subNode.id;
                      return (
                        <button
                          key={subNode.id}
                          onClick={() => handleNodeClick(key as CalendrierMainCategory, subNode.id)}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors',
                            isSubActive
                              ? 'bg-slate-800/80 text-slate-100'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                          )}
                        >
                          <span className="flex-1 text-left">{subNode.label}</span>
                          {subNode.badge !== undefined && (
                            <Badge
                              variant={subNode.badgeType || 'default'}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {subNode.badge}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-slate-700/50 p-3">
          <div className="text-xs text-slate-400 text-center">Calendrier v3.0</div>
        </div>
      )}
    </aside>
  );
}

