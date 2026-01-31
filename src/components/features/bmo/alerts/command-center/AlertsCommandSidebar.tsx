/**
 * Sidebar de navigation principale pour Alertes
 * Navigation latérale collapsible - inspiré de Gouvernance/Analytics
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Search,
  LayoutDashboard,
  AlertCircle,
  Clock,
  Shield,
  CheckCircle,
  Bell,
  Settings,
  History,
  Star,
  type LucideIcon,
} from 'lucide-react';

export interface AlertsSidebarCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

export const alertsCategories: AlertsSidebarCategory[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'critical', label: 'Critiques', icon: AlertCircle, badge: 3, badgeType: 'critical' },
  { id: 'warning', label: 'Avertissements', icon: AlertTriangle, badge: 8, badgeType: 'warning' },
  { id: 'sla', label: 'SLA dépassés', icon: Clock, badge: 5, badgeType: 'warning' },
  { id: 'blocked', label: 'Bloqués', icon: Shield, badge: 2 },
  { id: 'acknowledged', label: 'Acquittées', icon: Bell, badge: 12 },
  { id: 'resolved', label: 'Résolues', icon: CheckCircle, badge: 45 },
  { id: 'rules', label: 'Règles', icon: Settings },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'favorites', label: 'Suivis', icon: Star },
];

interface AlertsCommandSidebarProps {
  activeCategory: string;
  collapsed: boolean;
  stats?: {
    critical?: number;
    warning?: number;
    sla?: number;
    blocked?: number;
    acknowledged?: number;
    resolved?: number;
  };
  onCategoryChange: (category: string) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
}

export function AlertsCommandSidebar({
  activeCategory,
  collapsed,
  stats,
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: AlertsCommandSidebarProps) {
  // Mise à jour dynamique des badges avec les stats
  const getCategoryBadge = (categoryId: string): number | string | undefined => {
    if (!stats) return alertsCategories.find(c => c.id === categoryId)?.badge;
    
    switch (categoryId) {
      case 'critical': return stats.critical ?? 0;
      case 'warning': return stats.warning ?? 0;
      case 'sla': return stats.sla ?? 0;
      case 'blocked': return stats.blocked ?? 0;
      case 'acknowledged': return stats.acknowledged ?? 0;
      case 'resolved': return stats.resolved ?? 0;
      default: return alertsCategories.find(c => c.id === categoryId)?.badge;
    }
  };

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
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-slate-200 text-sm">Alertes</span>
          </div>
        )}
        {collapsed && (
          <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />
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
          {alertsCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            const badge = getCategoryBadge(category.id);
            const showBadge = badge !== undefined && badge !== 0;

            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                  'group relative',
                  isActive
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'hover:bg-slate-700/40 border border-transparent'
                )}
                title={collapsed ? category.label : undefined}
              >
                {/* Indicator */}
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all',
                    isActive ? 'bg-amber-400' : 'bg-transparent'
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center',
                    isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Label & Badge */}
                {!collapsed && (
                  <>
                    <span
                      className={cn(
                        'flex-1 text-left text-sm font-medium truncate',
                        isActive ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    >
                      {category.label}
                    </span>

                    {showBadge && (
                      <Badge
                        variant="default"
                        className={cn(
                          'h-5 min-w-5 px-1.5 text-xs font-medium',
                          category.badgeType === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : category.badgeType === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        )}
                      >
                        {badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Collapsed Badge */}
                {collapsed && showBadge && (
                  <div
                    className={cn(
                      'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-xs flex items-center justify-center font-medium',
                      category.badgeType === 'critical'
                        ? 'bg-red-500 text-white'
                        : category.badgeType === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white'
                    )}
                  >
                    {badge}
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
            Alertes & Risques v2.0
          </div>
        )}
      </div>
    </aside>
  );
}

