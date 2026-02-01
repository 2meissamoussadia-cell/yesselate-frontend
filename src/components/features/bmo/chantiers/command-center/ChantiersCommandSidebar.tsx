/**
 * Sidebar de navigation pour Chantiers
 * Architecture Command Center
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Construction,
  LayoutDashboard,
  PlayCircle,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Layers,
  MapPin,
  BarChart3,
  Archive,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export interface ChantiersCategory {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  description?: string;
}

// ================================
// CATÉGORIES
// ================================

export const chantiersCategories: ChantiersCategory[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    description: 'Tableau de bord chantiers',
  },
  {
    id: 'active',
    label: 'Actifs',
    icon: PlayCircle,
    badge: 0,
    badgeType: 'success',
    description: 'Chantiers en cours',
  },
  {
    id: 'planning',
    label: 'Planification',
    icon: Clock,
    badge: 0,
    badgeType: 'default',
    description: 'Chantiers à venir',
  },
  {
    id: 'delayed',
    label: 'En retard',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    description: 'Chantiers retardés',
  },
  {
    id: 'completed',
    label: 'Terminés',
    icon: CheckCircle2,
    badge: 0,
    badgeType: 'success',
    description: 'Chantiers complétés',
  },
  {
    id: 'inspection',
    label: 'Inspection',
    icon: ClipboardCheck,
    badge: 0,
    badgeType: 'warning',
    description: 'En inspection',
  },
  {
    id: 'by-phase',
    label: 'Par phase',
    icon: Layers,
    badge: 0,
    badgeType: 'default',
    description: 'Vue par phase travaux',
  },
  {
    id: 'by-location',
    label: 'Par localisation',
    icon: MapPin,
    badge: 0,
    badgeType: 'default',
    description: 'Vue géographique',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Statistiques chantiers',
  },
  {
    id: 'archive',
    label: 'Archives',
    icon: Archive,
    description: 'Historique chantiers',
  },
];

// ================================
// PROPS
// ================================

interface ChantiersCommandSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  stats?: {
    active: number;
    planning: number;
    delayed: number;
    completed: number;
    inspection: number;
    byPhase: number;
    byLocation: number;
  };
}

// ================================
// COMPONENT
// ================================

export function ChantiersCommandSidebar({
  activeCategory,
  onCategoryChange,
  collapsed = false,
  onToggleCollapse,
  stats,
}: ChantiersCommandSidebarProps) {
  const categoriesWithStats = useMemo(() => {
    return chantiersCategories.map((cat) => {
      let badge = cat.badge;
      
      if (stats) {
        switch (cat.id) {
          case 'active':
            badge = stats.active;
            break;
          case 'planning':
            badge = stats.planning;
            break;
          case 'delayed':
            badge = stats.delayed;
            break;
          case 'completed':
            badge = stats.completed;
            break;
          case 'inspection':
            badge = stats.inspection;
            break;
          case 'by-phase':
            badge = stats.byPhase;
            break;
          case 'by-location':
            badge = stats.byLocation;
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
              <Construction className="h-5 w-5 text-teal-400" />
              <h2 className="text-sm font-semibold text-slate-200">Chantiers</h2>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Construction className="h-5 w-5 text-teal-400" />
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
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher... ⌘K"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              readOnly
              onClick={() => {
                window.dispatchEvent(new CustomEvent('chantiers:open-command-palette'));
              }}
            />
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
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? category.label : category.description}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-400'
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

                {collapsed && isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-teal-400 rounded-r" />
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
              <span>Actifs</span>
              <span className="font-medium text-emerald-400">
                {stats.active || 0}
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

