/**
 * Sidebar de navigation pour Demandes
 * Architecture Command Center
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Inbox,
  LayoutDashboard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  BarChart3,
  Archive,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export interface DemandesCategory {
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

export const demandesCategories: DemandesCategory[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    description: 'Tableau de bord des demandes',
  },
  {
    id: 'inbox',
    label: 'Boîte de réception',
    icon: Inbox,
    badge: 0,
    badgeType: 'default',
    description: 'Nouvelles demandes',
  },
  {
    id: 'pending',
    label: 'En attente',
    icon: Clock,
    badge: 0,
    badgeType: 'warning',
    description: 'Demandes en cours de traitement',
  },
  {
    id: 'urgent',
    label: 'Urgentes',
    icon: AlertCircle,
    badge: 0,
    badgeType: 'critical',
    description: 'Demandes prioritaires',
  },
  {
    id: 'in-progress',
    label: 'En cours',
    icon: TrendingUp,
    badge: 0,
    badgeType: 'default',
    description: 'Demandes en traitement',
  },
  {
    id: 'approved',
    label: 'Approuvées',
    icon: CheckCircle,
    badge: 0,
    badgeType: 'success',
    description: 'Demandes validées',
  },
  {
    id: 'rejected',
    label: 'Rejetées',
    icon: XCircle,
    badge: 0,
    badgeType: 'default',
    description: 'Demandes refusées',
  },
  {
    id: 'assigned',
    label: 'Assignées',
    icon: Users,
    badge: 0,
    badgeType: 'default',
    description: 'Demandes assignées',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Statistiques et analyses',
  },
  {
    id: 'archive',
    label: 'Archives',
    icon: Archive,
    description: 'Demandes archivées',
  },
];

// ================================
// PROPS
// ================================

interface DemandesCommandSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  stats?: {
    inbox: number;
    pending: number;
    urgent: number;
    inProgress: number;
    approved: number;
    rejected: number;
    assigned: number;
  };
}

// ================================
// COMPONENT
// ================================

export function DemandesCommandSidebar({
  activeCategory,
  onCategoryChange,
  collapsed = false,
  onToggleCollapse,
  stats,
}: DemandesCommandSidebarProps) {
  const categoriesWithStats = useMemo(() => {
    return demandesCategories.map((cat) => {
      let badge = cat.badge;
      
      if (stats) {
        switch (cat.id) {
          case 'inbox':
            badge = stats.inbox;
            break;
          case 'pending':
            badge = stats.pending;
            break;
          case 'urgent':
            badge = stats.urgent;
            break;
          case 'in-progress':
            badge = stats.inProgress;
            break;
          case 'approved':
            badge = stats.approved;
            break;
          case 'rejected':
            badge = stats.rejected;
            break;
          case 'assigned':
            badge = stats.assigned;
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
              <Inbox className="h-5 w-5 text-purple-400" />
              <h2 className="text-sm font-semibold text-slate-200">Demandes</h2>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Inbox className="h-5 w-5 text-purple-400" />
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
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              readOnly
              onClick={() => {
                window.dispatchEvent(new CustomEvent('demandes:open-command-palette'));
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
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? category.label : category.description}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-400'
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
                  <div className="absolute left-0 w-1 h-8 bg-purple-400 rounded-r" />
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
              <span>Urgentes</span>
              <span className="font-medium text-rose-400">
                {stats.urgent || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>En attente</span>
              <span className="font-medium text-amber-400">
                {stats.pending || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

