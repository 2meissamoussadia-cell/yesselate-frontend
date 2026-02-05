/**
 * Sidebar de navigation pour Missions Terrain
 * Architecture Command Center
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Compass,
  LayoutDashboard,
  MapPin,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Archive,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export type MissionsMainCategory =
  | 'overview'
  | 'planned'
  | 'in-progress'
  | 'on-site'
  | 'delayed'
  | 'completed'
  | 'canceled'
  | 'by-region'
  | 'analytics'
  | 'archive';

export interface MissionsCategory {
  id: MissionsMainCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  description?: string;
}

// ================================
// CATÉGORIES
// ================================

export const missionsCategories: MissionsCategory[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    description: 'Tableau de bord missions',
  },
  {
    id: 'planned',
    label: 'Planifiées',
    icon: Clock,
    badge: 0,
    badgeType: 'default',
    description: 'Missions à venir',
  },
  {
    id: 'in-progress',
    label: 'En cours',
    icon: PlayCircle,
    badge: 0,
    badgeType: 'success',
    description: 'Missions actives',
  },
  {
    id: 'on-site',
    label: 'Sur site',
    icon: MapPin,
    badge: 0,
    badgeType: 'success',
    description: 'Équipes sur le terrain',
  },
  {
    id: 'delayed',
    label: 'En retard',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    description: 'Missions retardées',
  },
  {
    id: 'completed',
    label: 'Terminées',
    icon: CheckCircle2,
    badge: 0,
    badgeType: 'success',
    description: 'Missions complétées',
  },
  {
    id: 'canceled',
    label: 'Annulées',
    icon: XCircle,
    badge: 0,
    badgeType: 'default',
    description: 'Missions annulées',
  },
  {
    id: 'by-region',
    label: 'Par région',
    icon: MapPin,
    badge: 0,
    badgeType: 'default',
    description: 'Vue géographique',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Statistiques missions',
  },
  {
    id: 'archive',
    label: 'Archives',
    icon: Archive,
    description: 'Historique missions',
  },
];

// ================================
// PROPS
// ================================

interface MissionsCommandSidebarProps {
  activeCategory: MissionsMainCategory;
  onCategoryChange: (categoryId: MissionsMainCategory) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenCommandPalette?: () => void;
  stats?: {
    planned: number;
    inProgress: number;
    onSite: number;
    delayed: number;
    completed: number;
    canceled: number;
    byRegion: number;
  };
}

// ================================
// COMPONENT
// ================================

export function MissionsCommandSidebar({
  activeCategory,
  onCategoryChange,
  collapsed = false,
  onToggleCollapse,
  onOpenCommandPalette,
  stats,
}: MissionsCommandSidebarProps) {
  const categoriesWithStats = useMemo(() => {
    return missionsCategories.map((cat) => {
      let badge = cat.badge;
      
      if (stats) {
        switch (cat.id) {
          case 'planned':
            badge = stats.planned;
            break;
          case 'in-progress':
            badge = stats.inProgress;
            break;
          case 'on-site':
            badge = stats.onSite;
            break;
          case 'delayed':
            badge = stats.delayed;
            break;
          case 'completed':
            badge = stats.completed;
            break;
          case 'canceled':
            badge = stats.canceled;
            break;
          case 'by-region':
            badge = stats.byRegion;
            break;
        }
      }
      
      return { ...cat, badge };
    });
  }, [stats]);

  return (
    <div
      className={cn(
        'h-full bg-slate-900 border-r border-slate-700/50 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-200">Missions</h2>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Compass className="h-5 w-5 text-indigo-400" />
            </div>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn(
                'h-6 w-6 p-0 hover:bg-slate-800',
                collapsed && 'hidden'
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          )}
        </div>

        {!collapsed && (
          <div className="mt-3">
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
          <div className="mt-3 px-2">
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
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <div className="space-y-1">
          {categoriesWithStats.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            const hasBadge = category.badge !== undefined && category.badge !== null;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? category.label : category.description}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-400'
                  )}
                />

                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{category.label}</span>

                    {hasBadge && category.badge !== 0 && (
                      <Badge
                        variant="default"
                        className={cn(
                          'h-5 min-w-5 px-1.5 text-xs font-medium',
                          category.badgeType === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : category.badgeType === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : category.badgeType === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-600/40 text-slate-400 border-slate-600/50'
                        )}
                      >
                        {category.badge}
                      </Badge>
                    )}
                  </>
                )}

                {collapsed && isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-indigo-400 rounded-r" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && stats && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-800/50">
          <div className="text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span>Sur site</span>
              <span className="font-medium text-emerald-400">
                {stats.onSite || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>En retard</span>
              <span className="font-medium text-rose-400">
                {stats.delayed || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

