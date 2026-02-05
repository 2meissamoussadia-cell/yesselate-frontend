/**
 * Sidebar de navigation pour le module Messages Externes
 * Navigation à 3 niveaux - Niveau 1
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, ChevronLeft, Search, Mail } from 'lucide-react';
import { messagesExternesNavigationConfig, type NavNode } from './messagesExternesNavigationConfig';
import type { MessagesExternesMainCategory } from '../types/messagesExternesNavigationTypes';

interface MessagesExternesSidebarProps {
  activeCategory: MessagesExternesMainCategory;
  activeSubCategory?: string;
  collapsed?: boolean;
  stats?: Record<string, number>;
  onCategoryChange: (category: string, subCategory?: string) => void;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
}

export function MessagesExternesSidebar({
  activeCategory,
  activeSubCategory,
  collapsed = false,
  stats = {},
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: MessagesExternesSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['overview']));

  const getBadgeForNode = useCallback((node: NavNode): number | string | undefined => {
    return stats[node.id] || node.badge;
  }, [stats]);

  const getBadgeTypeForNode = useCallback((node: NavNode): 'default' | 'warning' | 'critical' | 'success' => {
    const badge = getBadgeForNode(node);
    if (badge && typeof badge === 'number' && badge > 0) {
      if (node.id === 'requires_response' || node.id === 'unread') return 'critical';
      if (node.id === 'unread' || node.id === 'by_priority') return 'warning';
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

  const NavNodeComponent = React.memo(function NavNodeComponent({ node, level = 0 }: { node: NavNode; level?: number }) {
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
          onCategoryChange(node.id as MessagesExternesMainCategory, node.children[0].id);
        }
      } else {
        if (level === 1) onCategoryChange(activeCategory, node.id);
        else onCategoryChange(node.id as MessagesExternesMainCategory);
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
              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
              : 'hover:bg-slate-700/40 border border-transparent text-slate-300'
          )}
        >
          {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-blue-400" />}
          {Icon && <Icon className={cn('h-4 w-4 flex-shrink-0 transition-all duration-200', isActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-slate-200')} />}
          {!collapsed && (
            <>
              <span className={cn('flex-1 transition-colors duration-200 text-sm', isActive ? 'text-blue-400' : 'text-slate-300')}>{node.label}</span>
              {badge !== undefined && badge !== null && badge !== 0 && (
                <Badge variant={badgeType === 'critical' ? 'urgent' : badgeType === 'warning' ? 'warning' : 'default'} className="h-5 min-w-5 px-1.5 text-xs font-medium">{badge}</Badge>
              )}
              {hasChildren && <span className="text-slate-400">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>}
            </>
          )}
        </button>
        {!collapsed && hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 pl-6">
            {node.children?.map((child) => <NavNodeComponent key={child.id} node={child} level={level + 1} />)}
          </div>
        )}
      </div>
    );
  });

  return (
    <aside className={cn('flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300', 'fixed sm:relative z-40 h-full', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!collapsed && <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-400" /><span className="font-semibold text-slate-200 text-sm">Messages</span></div>}
        {collapsed && <Mail className="h-5 w-5 text-blue-400 mx-auto" />}
        {onToggleCollapse && <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50">{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</Button>}
      </div>
      {!collapsed && (
        <div className="px-3 pb-3 border-b border-slate-700/50">
          <button onClick={onOpenCommandPalette} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors">
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Rechercher...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-mono text-slate-400">⌘K</kbd>
          </button>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {Object.values(messagesExternesNavigationConfig).map((node) => <NavNodeComponent key={node.id} node={node} level={0} />)}
        </div>
      </nav>
      {!collapsed && <div className="border-t border-slate-700/50 p-3"><div className="text-xs text-slate-400 text-center">Messages v2.0</div></div>}
    </aside>
  );
}

