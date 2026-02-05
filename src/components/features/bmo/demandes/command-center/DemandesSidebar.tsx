/**
 * Demandes Command Center - Sidebar
 * Navigation principale identique au pattern Governance
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useDemandesCommandCenterStore,
  type DemandesMainCategory,
} from '@/lib/stores/demandesCommandCenterStore';
import {
  LayoutDashboard,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TimerOff,
  ChevronLeft,
  ChevronRight,
  Search,
  FileCheck,
} from 'lucide-react';

interface CategoryItem {
  id: DemandesMainCategory;
  label: string;
  icon: typeof LayoutDashboard;
  color: string;
  badge?: number;
  badgeVariant?: 'default' | 'critical' | 'warning' | 'success';
}

const mainCategories: CategoryItem[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, color: 'text-blue-400' },
  { id: 'pending', label: 'En attente', icon: Clock, color: 'text-amber-400', badge: 45, badgeVariant: 'warning' },
  { id: 'urgent', label: 'Urgentes', icon: AlertCircle, color: 'text-rose-400', badge: 12, badgeVariant: 'critical' },
  { id: 'validated', label: 'Validées', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'rejected', label: 'Rejetées', icon: XCircle, color: 'text-slate-400' },
  { id: 'overdue', label: 'En retard', icon: TimerOff, color: 'text-orange-400', badge: 8, badgeVariant: 'warning' },
];

export function DemandesSidebar() {
  const {
    navigation,
    sidebarCollapsed,
    liveStats,
    navigate,
    toggleSidebar,
    toggleCommandPalette,
  } = useDemandesCommandCenterStore();

  // Update badges with live stats
  const getCategoryBadge = (id: DemandesMainCategory): number | undefined => {
    switch (id) {
      case 'pending': return liveStats.pending || undefined;
      case 'urgent': return liveStats.urgent || undefined;
      case 'overdue': return liveStats.overdue || undefined;
      default: return undefined;
    }
  };

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
            <FileCheck className="h-5 w-5 text-orange-400" />
            <span className="font-semibold text-slate-200 text-sm">Demandes</span>
          </div>
        )}
        {sidebarCollapsed && (
          <FileCheck className="h-5 w-5 text-orange-400 mx-auto" />
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
            const badge = getCategoryBadge(category.id);

            return (
              <button
                key={category.id}
                onClick={() => navigate(category.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative',
                  isActive
                    ? 'bg-slate-800/80 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors flex-shrink-0',
                    isActive ? category.color : 'text-slate-400'
                  )}
                />
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm flex-1 text-left">{category.label}</span>
                    {badge !== undefined && badge > 0 && (
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
                        {badge}
                      </Badge>
                    )}
                  </>
                )}
                {sidebarCollapsed && badge !== undefined && badge > 0 && (
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
          <div className="text-xs text-slate-400 text-center">
            Demandes BMO v3.0
          </div>
        )}
      </div>
    </aside>
  );
}


