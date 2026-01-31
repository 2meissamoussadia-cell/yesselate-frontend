/**
 * Sidebar de navigation pour Finances
 * Architecture Command Center
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Archive,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export interface FinancesCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  description?: string;
}

// ================================
// CATÉGORIES
// ================================

export const financesCategories: FinancesCategory[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    description: 'Tableau de bord financier global',
  },
  {
    id: 'revenue',
    label: 'Revenus',
    icon: TrendingUp,
    badge: 0,
    badgeType: 'success',
    description: 'Suivi des revenus et encaissements',
  },
  {
    id: 'expenses',
    label: 'Dépenses',
    icon: TrendingDown,
    badge: 0,
    badgeType: 'default',
    description: 'Suivi des dépenses et décaissements',
  },
  {
    id: 'budget',
    label: 'Budgets',
    icon: Wallet,
    badge: 0,
    badgeType: 'default',
    description: 'Gestion budgétaire',
  },
  {
    id: 'pending',
    label: 'En attente',
    icon: Clock,
    badge: 0,
    badgeType: 'warning',
    description: 'Transactions en attente validation',
  },
  {
    id: 'overdue',
    label: 'Impayés',
    icon: AlertTriangle,
    badge: 0,
    badgeType: 'critical',
    description: 'Factures et paiements en retard',
  },
  {
    id: 'validated',
    label: 'Validés',
    icon: CheckCircle,
    badge: 0,
    badgeType: 'success',
    description: 'Transactions validées',
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: FileText,
    badge: 0,
    badgeType: 'default',
    description: 'Rapports financiers',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Analyses financières avancées',
  },
  {
    id: 'archive',
    label: 'Archives',
    icon: Archive,
    description: 'Historique financier',
  },
];

// ================================
// PROPS
// ================================

interface FinancesCommandSidebarProps {
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  stats?: {
    revenue: number;
    expenses: number;
    budget: number;
    pending: number;
    overdue: number;
    validated: number;
    reports: number;
  };
}

// ================================
// COMPONENT
// ================================

export function FinancesCommandSidebar({
  activeCategory,
  onCategoryChange,
  collapsed = false,
  onToggleCollapse,
  stats,
}: FinancesCommandSidebarProps) {
  const categoriesWithStats = useMemo(() => {
    return financesCategories.map((cat) => {
      let badge = cat.badge;
      
      if (stats) {
        switch (cat.id) {
          case 'revenue':
            badge = stats.revenue;
            break;
          case 'expenses':
            badge = stats.expenses;
            break;
          case 'budget':
            badge = stats.budget;
            break;
          case 'pending':
            badge = stats.pending;
            break;
          case 'overdue':
            badge = stats.overdue;
            break;
          case 'validated':
            badge = stats.validated;
            break;
          case 'reports':
            badge = stats.reports;
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
              <Wallet className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200">Finances</h2>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Wallet className="h-5 w-5 text-cyan-400" />
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
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              readOnly
              onClick={() => {
                window.dispatchEvent(new CustomEvent('finances:open-command-palette'));
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
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? category.label : category.description}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-400'
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
                  <div className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r" />
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
              <span>En attente</span>
              <span className="font-medium text-amber-400">
                {stats.pending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Impayés</span>
              <span className="font-medium text-rose-400">
                {stats.overdue || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

