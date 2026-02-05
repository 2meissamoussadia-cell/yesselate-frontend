/**
 * Sidebar de navigation pour Ressources (RH)
 * Architecture Command Center
 */

'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  LayoutDashboard,
  UserCheck,
  UserPlus,
  Calendar,
  GraduationCap,
  FileCheck,
  Shield,
  BarChart3,
  Archive,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export type RessourcesMainCategory =
  | 'overview'
  | 'employees'
  | 'recruitment'
  | 'leave'
  | 'training'
  | 'evaluations'
  | 'contracts'
  | 'teams'
  | 'analytics'
  | 'archive';

export interface RessourcesCategory {
  id: RessourcesMainCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical' | 'success';
  description?: string;
}

// ================================
// CATÉGORIES
// ================================

export const ressourcesCategories: RessourcesCategory[] = [
  {
    id: 'overview',
    label: 'Vue d\'ensemble',
    icon: LayoutDashboard,
    description: 'Tableau de bord RH',
  },
  {
    id: 'employees',
    label: 'Employés',
    icon: UserCheck,
    badge: 0,
    badgeType: 'success',
    description: 'Gestion employés',
  },
  {
    id: 'recruitment',
    label: 'Recrutement',
    icon: UserPlus,
    badge: 0,
    badgeType: 'default',
    description: 'Postes et candidats',
  },
  {
    id: 'leave',
    label: 'Congés & Absences',
    icon: Calendar,
    badge: 0,
    badgeType: 'warning',
    description: 'Gestion absences',
  },
  {
    id: 'training',
    label: 'Formations',
    icon: GraduationCap,
    badge: 0,
    badgeType: 'default',
    description: 'Plans de formation',
  },
  {
    id: 'evaluations',
    label: 'Évaluations',
    icon: FileCheck,
    badge: 0,
    badgeType: 'default',
    description: 'Performance employés',
  },
  {
    id: 'contracts',
    label: 'Contrats',
    icon: FileCheck,
    badge: 0,
    badgeType: 'default',
    description: 'Contrats de travail',
  },
  {
    id: 'teams',
    label: 'Équipes',
    icon: Users,
    badge: 0,
    badgeType: 'default',
    description: 'Organisation équipes',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    description: 'Statistiques RH',
  },
  {
    id: 'archive',
    label: 'Archives',
    icon: Archive,
    description: 'Historique RH',
  },
];

// ================================
// PROPS
// ================================

interface RessourcesCommandSidebarProps {
  activeCategory: RessourcesMainCategory;
  onCategoryChange: (categoryId: RessourcesMainCategory) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  stats?: {
    employees: number;
    recruitment: number;
    leave: number;
    training: number;
    evaluations: number;
    contracts: number;
    teams: number;
  };
}

// ================================
// COMPONENT
// ================================

export function RessourcesCommandSidebar({
  activeCategory,
  onCategoryChange,
  collapsed = false,
  onToggleCollapse,
  stats,
}: RessourcesCommandSidebarProps) {
  const categoriesWithStats = useMemo(() => {
    return ressourcesCategories.map((cat) => {
      let badge = cat.badge;
      
      if (stats) {
        switch (cat.id) {
          case 'employees':
            badge = stats.employees;
            break;
          case 'recruitment':
            badge = stats.recruitment;
            break;
          case 'leave':
            badge = stats.leave;
            break;
          case 'training':
            badge = stats.training;
            break;
          case 'evaluations':
            badge = stats.evaluations;
            break;
          case 'contracts':
            badge = stats.contracts;
            break;
          case 'teams':
            badge = stats.teams;
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
              <Users className="h-5 w-5 text-violet-400" />
              <h2 className="text-sm font-semibold text-slate-200">Ressources</h2>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Users className="h-5 w-5 text-violet-400" />
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
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              readOnly
              onClick={() => {
                window.dispatchEvent(new CustomEvent('ressources:open-command-palette'));
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
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? category.label : category.description}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-400'
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
                  <div className="absolute left-0 w-1 h-8 bg-violet-400 rounded-r" />
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
              <span>Employés actifs</span>
              <span className="font-medium text-emerald-400">
                {stats.employees || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>En congé</span>
              <span className="font-medium text-amber-400">
                {stats.leave || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

