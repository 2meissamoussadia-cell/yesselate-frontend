/**
 * Sidebar de navigation pour le Calendrier
 * Architecture identique à Alerts/Analytics/Gouvernance
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CalendarDays,
  CalendarClock,
  CalendarRange,
  AlertTriangle,
  Clock,
  Users,
  Flag,
  Archive,
  Star,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export type CalendarMainCategory =
  | 'overview'
  | 'today'
  | 'week'
  | 'month'
  | 'conflicts'
  | 'deadlines'
  | 'meetings'
  | 'milestones'
  | 'favorites'
  | 'archive';

export interface CalendarCategory {
  id: CalendarMainCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  description?: string;
}

// ================================
// CATÉGORIES
// ================================

export const calendarCategories: CalendarCategory[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: Calendar,
    description: 'Tableau de bord complet du calendrier',
  },
  {
    id: 'today',
    label: 'Aujourd\'hui',
    icon: CalendarDays,
    badge: 0, // Sera calculé dynamiquement
    badgeType: 'default',
    description: 'Événements du jour',
  },
  {
    id: 'week',
    label: 'Cette semaine',
    icon: CalendarRange,
    badge: 0,
    badgeType: 'default',
    description: 'Événements de la semaine en cours',
  },
  {
    id: 'month',
    label: 'Ce mois',
    icon: CalendarClock,
    badge: 0,
    badgeType: 'default',
    description: 'Vue mensuelle',
  },
  {
    id: 'conflicts',
    label: 'Conflits',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    description: 'Événements en conflit de planning',
  },
  {
    id: 'deadlines',
    label: 'Échéances',
    icon: Clock,
    badge: 0,
    badgeType: 'warning',
    description: 'Deadlines et échéances importantes',
  },
  {
    id: 'meetings',
    label: 'Réunions',
    icon: Users,
    badge: 0,
    badgeType: 'default',
    description: 'Réunions et conférences',
  },
  {
    id: 'milestones',
    label: 'Jalons',
    icon: Flag,
    badge: 0,
    badgeType: 'success',
    description: 'Jalons projet et étapes clés',
  },
  {
    id: 'favorites',
    label: 'Favoris',
    icon: Star,
    badge: 0,
    badgeType: 'default',
    description: 'Événements favoris',
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    description: 'Événements passés',
  },
];

// ================================
// PROPS
// ================================

interface CalendarCommandSidebarProps {
  activeCategory: CalendarMainCategory;
  onCategoryChange: (categoryId: CalendarMainCategory) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  stats?: {
    today: number;
    week: number;
    month: number;
    conflicts: number;
    deadlines: number;
    meetings: number;
    milestones: number;
    favorites: number;
  };
}

// ================================
// COMPONENT
// ================================

export function CalendarCommandSidebar({
  activeCategory,
  onCategoryChange,
  collapsed = false,
  onToggleCollapse,
  stats,
}: CalendarCommandSidebarProps) {
  // Calculer les badges dynamiques
  const categoriesWithStats = useMemo(() => {
    return calendarCategories.map((cat) => {
      let badge = cat.badge;
      
      if (stats) {
        switch (cat.id) {
          case 'today':
            badge = stats.today;
            break;
          case 'week':
            badge = stats.week;
            break;
          case 'month':
            badge = stats.month;
            break;
          case 'conflicts':
            badge = stats.conflicts;
            break;
          case 'deadlines':
            badge = stats.deadlines;
            break;
          case 'meetings':
            badge = stats.meetings;
            break;
          case 'milestones':
            badge = stats.milestones;
            break;
          case 'favorites':
            badge = stats.favorites;
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
              <Calendar className="h-5 w-5 text-blue-400" />
              <h2 className="text-sm font-semibold text-slate-200">Calendrier</h2>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Calendar className="h-5 w-5 text-blue-400" />
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

        {/* Search bar (si non collapsed) */}
        {!collapsed && (
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher... ⌘K"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              readOnly
              onClick={() => {
                // Ouvrir la command palette
                window.dispatchEvent(new CustomEvent('calendar:open-command-palette'));
              }}
            />
          </div>
        )}
      </div>

      {/* Navigation Categories */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <div className="space-y-1">
          {categoriesWithStats.map((category) => {
            const isActive = activeCategory === category.id;
            const hasBadge = category.badge !== undefined && category.badge !== null;
            const Icon = category.icon;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? category.label : category.description}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-400'
                  )}
                />

                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{category.label}</span>

                    {hasBadge && category.badge !== 0 && (
                      <Badge
                        variant="gray"
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

                {/* Indicateur actif pour mode collapsed */}
                {collapsed && isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-blue-400 rounded-r" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer info (si non collapsed) */}
      {!collapsed && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-800/50">
          <div className="text-xs text-slate-400">
            <div className="flex items-center justify-between mb-1">
              <span>Total événements</span>
              <span className="font-medium text-slate-400">
                {stats?.month || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>À venir</span>
              <span className="font-medium text-slate-400">
                {(stats?.week || 0) + (stats?.deadlines || 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

