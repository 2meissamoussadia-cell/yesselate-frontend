/**
 * Sidebar de navigation principale du Dashboard Command Center
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Search,
  TrendingUp,
  Zap,
  AlertTriangle,
  Scale,
  Activity,
} from 'lucide-react';
import { useDashboardCommandCenterStore, type DashboardMainCategory } from '@/lib/stores/dashboardCommandCenterStore';

interface NavItem {
  id: DashboardMainCategory;
  icon: React.ElementType;
  label: string;
  badge?: number;
  badgeVariant?: 'default' | 'warning' | 'critical' | 'success';
  color: string;
}

const mainCategories: NavItem[] = [
  {
    id: 'overview',
    icon: LayoutDashboard,
    label: 'Vue d\'ensemble',
    color: 'text-blue-400',
  },
  {
    id: 'performance',
    icon: TrendingUp,
    label: 'Performance',
    color: 'text-emerald-400',
  },
  {
    id: 'actions',
    icon: Zap,
    label: 'Actions',
    badge: 8,
    badgeVariant: 'warning',
    color: 'text-orange-400',
  },
  {
    id: 'risks',
    icon: AlertTriangle,
    label: 'Risques',
    badge: 3,
    badgeVariant: 'critical',
    color: 'text-rose-400',
  },
  {
    id: 'decisions',
    icon: Scale,
    label: 'Décisions',
    badge: 5,
    badgeVariant: 'default',
    color: 'text-purple-400',
  },
  {
    id: 'realtime',
    icon: Activity,
    label: 'Temps réel',
    color: 'text-cyan-400',
  },
];

export function DashboardSidebar() {
  const {
    navigation,
    sidebarCollapsed,
    navigate,
    toggleSidebar,
    toggleCommandPalette,
  } = useDashboardCommandCenterStore();

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">Dashboard</span>
          </div>
        )}
        {sidebarCollapsed && (
          <LayoutDashboard className="h-5 w-5 text-blue-400 mx-auto" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Trigger */}
      {!sidebarCollapsed && (
        <div className="p-3">
          <button
            onClick={toggleCommandPalette}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Rechercher...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {mainCategories.map((category) => {
            const isActive = navigation.mainCategory === category.id;
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                onClick={() => navigate(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  isActive
                    ? 'bg-slate-800/80 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? category.color : 'text-slate-500'
                  )}
                />
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm flex-1 text-left">{category.label}</span>
                    {category.badge !== undefined && (
                      <Badge
                        variant={
                          category.badgeVariant === 'critical'
                            ? 'destructive'
                            : category.badgeVariant === 'warning'
                            ? 'warning'
                            : category.badgeVariant === 'success'
                            ? 'success'
                            : 'default'
                        }
                        className="text-xs"
                      >
                        {category.badge}
                      </Badge>
                    )}
                  </>
                )}
                {sidebarCollapsed && category.badge !== undefined && (
                  <span
                    className={cn(
                      'absolute top-0.5 right-0.5 w-2 h-2 rounded-full',
                      category.badgeVariant === 'critical'
                        ? 'bg-rose-500'
                        : category.badgeVariant === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-3">
        {!sidebarCollapsed && (
          <div className="text-xs text-slate-500 text-center">
            Dashboard BMO v3.0
          </div>
        )}
      </div>
    </aside>
  );
}

