/**
 * Sidebar de navigation principale pour Evaluations
 * Inspiré de la page Analytics - Centre de Commandement
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Search,
  LayoutDashboard,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building2,
  BarChart3,
  Archive,
  type LucideIcon,
} from 'lucide-react';

interface SidebarCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

const evaluationsCategories: SidebarCategory[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'scheduled', label: 'Planifiées', icon: Clock, badge: 0, badgeType: 'warning' },
  { id: 'in_progress', label: 'En cours', icon: PlayCircle, badge: 0 },
  { id: 'completed', label: 'Complétées', icon: CheckCircle2, badge: 0, badgeType: 'default' },
  { id: 'recommendations', label: 'Recommandations', icon: AlertTriangle, badge: 0, badgeType: 'warning' },
  { id: 'scores', label: 'Scores', icon: TrendingUp },
  { id: 'bureaux', label: 'Par bureau', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'archive', label: 'Archives', icon: Archive },
];

interface EvaluationsCommandSidebarProps {
  activeCategory: string;
  collapsed: boolean;
  onCategoryChange: (category: string) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  stats?: {
    scheduled?: number;
    inProgress?: number;
    completed?: number;
    recommendations?: number;
  };
}

export const EvaluationsCommandSidebar = React.memo(function EvaluationsCommandSidebar({
  activeCategory,
  collapsed,
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
  stats = {},
}: EvaluationsCommandSidebarProps) {
  // Mettre à jour les badges avec les stats
  const categoriesWithStats = evaluationsCategories.map((cat) => {
    if (cat.id === 'scheduled' && stats.scheduled !== undefined) {
      return { ...cat, badge: stats.scheduled };
    }
    if (cat.id === 'in_progress' && stats.inProgress !== undefined) {
      return { ...cat, badge: stats.inProgress };
    }
    if (cat.id === 'completed' && stats.completed !== undefined) {
      return { ...cat, badge: stats.completed };
    }
    if (cat.id === 'recommendations' && stats.recommendations !== undefined) {
      return { ...cat, badge: stats.recommendations };
    }
    return cat;
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
            <ClipboardCheck className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">Évaluations</span>
          </div>
        )}
        {collapsed && (
          <ClipboardCheck className="h-5 w-5 text-blue-400 mx-auto" />
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
            <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">⌘K</kbd>
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
          {categoriesWithStats.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'group relative',
                  isActive
                    ? 'bg-blue-500/10 border border-blue-500/30 scale-[1.02]'
                    : 'hover:bg-slate-700/40 border border-transparent hover:scale-[1.01]'
                )}
                title={collapsed ? category.label : undefined}
              >
                {/* Indicator */}
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all duration-300',
                    isActive ? 'bg-blue-400' : 'bg-transparent'
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center transition-all duration-200',
                    isActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label & Badge */}
                {!collapsed && (
                  <>
                    <span
                      className={cn(
                        'flex-1 text-left text-sm font-medium truncate transition-colors duration-200',
                        isActive ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    >
                      {category.label}
                    </span>

                    {category.badge !== undefined && (
                      <Badge
                        variant="default"
                        className={cn(
                          'h-5 min-w-5 px-1.5 text-xs font-medium transition-all duration-200',
                          category.badgeType === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30 group-hover:bg-red-500/30'
                            : category.badgeType === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 group-hover:bg-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30 group-hover:bg-slate-500/30'
                        )}
                      >
                        {category.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Collapsed Badge */}
                {collapsed && category.badge !== undefined && (
                  <div
                    className={cn(
                      'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-xs flex items-center justify-center font-medium transition-transform duration-200',
                      category.badgeType === 'critical'
                        ? 'bg-red-500 text-white'
                        : category.badgeType === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white',
                      isActive && 'scale-110'
                    )}
                  >
                    {category.badge}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-3">
        {!collapsed && (
          <div className="text-xs text-slate-400 text-center">
            Évaluations v2.0
          </div>
        )}
      </div>
    </aside>
  );
});

export { evaluationsCategories };
export type { SidebarCategory };

