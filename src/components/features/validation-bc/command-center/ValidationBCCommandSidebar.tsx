/**
 * Sidebar de navigation principale pour Validation-BC
 * Architecture identique à Analytics - Centre de Commandement
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
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  FileEdit,
  History,
  AlertTriangle,
  TrendingUp,
  Shield,
  Users,
  Building2,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

export const validationBCCategories: SidebarCategory[] = [
  { id: 'overview', label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: 'bc', label: 'Bons de Commande', icon: ShoppingCart, badge: 23, badgeType: 'warning' },
  { id: 'factures', label: 'Factures', icon: Receipt, badge: 15, badgeType: 'warning' },
  { id: 'avenants', label: 'Avenants', icon: FileEdit, badge: 8 },
  { id: 'urgents', label: 'Urgents', icon: AlertTriangle, badge: 12, badgeType: 'critical' },
  { id: 'historique', label: 'Historique', icon: History },
  { id: 'tendances', label: 'Tendances', icon: TrendingUp },
  { id: 'validateurs', label: 'Validateurs', icon: Users },
  { id: 'services', label: 'Services', icon: Building2 },
  { id: 'regles', label: 'Règles Métier', icon: Shield },
];

interface ValidationBCCommandSidebarProps {
  activeCategory: string;
  collapsed: boolean;
  onCategoryChange: (category: string) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  categories?: SidebarCategory[]; // ← Optionnel, utilise validationBCCategories par défaut
}

export function ValidationBCCommandSidebar({
  activeCategory,
  collapsed,
  onCategoryChange,
  onToggleCollapse,
  onOpenCommandPalette,
  categories = validationBCCategories, // ← Valeur par défaut
}: ValidationBCCommandSidebarProps) {
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
            <FileCheck className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">Validation-BC</span>
          </div>
        )}
        {collapsed && (
          <FileCheck className="h-5 w-5 text-blue-400 mx-auto" />
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
          {categories.map((category) => {
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
                        'flex-1 text-sm font-medium transition-colors truncate',
                        isActive ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-100'
                      )}
                    >
                      {category.label}
                    </span>
                    {category.badge !== undefined && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'h-5 min-w-5 px-1.5 text-xs transition-all duration-200',
                          category.badgeType === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                            : category.badgeType === 'warning'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-600/40 text-slate-400 border-slate-600/50',
                          isActive && 'scale-110'
                        )}
                      >
                        {category.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Badge for collapsed mode */}
                {collapsed && category.badge !== undefined && (
                  <div
                    className={cn(
                      'absolute -right-1 -top-1 h-4 min-w-4 px-1 flex items-center justify-center rounded-full text-[10px] font-bold',
                      category.badgeType === 'critical'
                        ? 'bg-red-500 text-white animate-pulse'
                        : category.badgeType === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-600 text-slate-200'
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
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Connecté • Temps réel</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}

