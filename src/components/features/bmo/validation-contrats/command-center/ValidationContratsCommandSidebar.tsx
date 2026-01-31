/**
 * Sidebar de navigation principale pour Validation Contrats
 * Inspiré de AnalyticsCommandSidebar - Architecture moderne et collapsible
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Search,
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';

interface SidebarCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

const validationContratsCategories: SidebarCategory[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: Inbox },
  { id: 'pending', label: 'En attente', icon: Clock, badge: 12, badgeType: 'warning' },
  { id: 'urgent', label: 'Urgents', icon: AlertTriangle, badge: 3, badgeType: 'critical' },
  { id: 'validated', label: 'Validés', icon: CheckCircle, badge: 45 },
  { id: 'rejected', label: 'Rejetés', icon: XCircle, badge: 8 },
  { id: 'negotiation', label: 'Négociation', icon: Users, badge: 5 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'financial', label: 'Financier', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
];

interface ValidationContratsCommandSidebarProps {
  activeCategory: string;
  collapsed: boolean;
  onCategoryChange: (category: string) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
}

export const ValidationContratsCommandSidebar = React.memo(function ValidationContratsCommandSidebar({
  activeCategory,
  collapsed,
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: ValidationContratsCommandSidebarProps) {
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
            <FileCheck className="h-5 w-5 text-purple-400" />
            <span className="font-semibold text-slate-200 text-sm">Validation Contrats</span>
          </div>
        )}
        {collapsed && (
          <FileCheck className="h-5 w-5 text-purple-400 mx-auto" />
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
          {validationContratsCategories.map((category) => {
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
                    ? 'bg-purple-500/10 border border-purple-500/30 scale-[1.02]'
                    : 'hover:bg-slate-700/40 border border-transparent hover:scale-[1.01]'
                )}
                title={collapsed ? category.label : undefined}
              >
                {/* Indicator */}
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all duration-300',
                    isActive ? 'bg-purple-400' : 'bg-transparent'
                  )}
                />

                {/* Icon */}
                <div
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center transition-all duration-200',
                    isActive ? 'text-purple-400 scale-110' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
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

                    {category.badge && (
                      <Badge
                        variant="outline"
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
                {collapsed && category.badge && (
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
      <div className="p-3 border-t border-slate-700/50">
        {!collapsed && (
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Taux validation</span>
              <span className="text-emerald-400 font-medium">87%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87%' }} />
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
});

export { validationContratsCategories };

