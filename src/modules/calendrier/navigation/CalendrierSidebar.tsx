/**
 * Sidebar de navigation pour le module Calendrier & Planification v3.0
 * Lit la configuration de navigation et affiche la structure hiérarchique
 * Affiche les badges via le store Zustand
 */

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import { calendrierNavigation, type CalendrierNavItem } from './calendrierNavigationConfig';
import { useCalendrierFiltersStore } from '../stores/calendrierFiltersStore';

interface CalendrierSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function CalendrierSidebar({
  collapsed = false,
  onToggleCollapse,
}: CalendrierSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { stats } = useCalendrierFiltersStore();
  // Initialiser avec les items de niveau 0 et 1 expandés par défaut
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Expander les items de niveau 0 par défaut
    calendrierNavigation.forEach((item, index) => {
      const rootKey = `root-${index}`;
      initial.add(rootKey);
      // Expander aussi les items de niveau 1 qui ont des enfants
      if (item.children) {
        item.children.forEach((child, childIndex) => {
          if (child.children && child.children.length > 0) {
            initial.add(`${rootKey}-${childIndex}`);
          }
        });
      }
    });
    return initial;
  });

  // Helper pour obtenir l'icône Lucide à partir d'un nom de chaîne
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
  };

  // Helper pour obtenir le badge count
  const getBadgeCount = (badgeKey?: string): number | null => {
    if (!badgeKey || !stats) return null;
    // Les clés sont déjà en snake_case dans la config
    return (stats as any)[badgeKey] || null;
  };

  // Toggle expansion d'un item
  const toggleExpanded = (itemKey: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  // Vérifier si un item est actif
  const isItemActive = useCallback((item: CalendrierNavItem, currentPathname: string): boolean => {
    if (!item.route || !currentPathname) return false;
    return currentPathname === item.route || currentPathname.startsWith(item.route);
  }, []);

  // Auto-expand les items qui ont un enfant actif (à tous les niveaux)
  useEffect(() => {
    if (!pathname) return;

    const itemsToExpand = new Set<string>();
    
    // Fonction récursive pour vérifier si un item a un enfant actif
    const hasActiveChild = (item: CalendrierNavItem): boolean => {
      if (!item.children) return false;
      return item.children.some((child) => isItemActive(child, pathname) || hasActiveChild(child));
    };
    
    // Fonction récursive pour collecter tous les items qui doivent être auto-expandés
    const collectItemsToExpand = (
      items: CalendrierNavItem[],
      parentKey: string = ''
    ): void => {
      items.forEach((item, index) => {
        const itemKey = parentKey ? `${parentKey}-${index}` : `root-${index}`;
        const hasActive = hasActiveChild(item);
        
        // Si l'item a un enfant actif, l'expander
        if (hasActive) {
          itemsToExpand.add(itemKey);
        }
        
        // Récursivement traiter les enfants
        if (item.children) {
          collectItemsToExpand(item.children, itemKey);
        }
      });
    };

    // Commencer avec les items de niveau 0 déjà expandés
    const initialExpanded = new Set<string>();
    calendrierNavigation.forEach((_, index) => {
      initialExpanded.add(`root-${index}`);
    });

    // Collecter tous les items à expander
    collectItemsToExpand(calendrierNavigation);
    
    // Fusionner les items initiaux avec ceux qui ont des enfants actifs
    setExpandedItems((prev) => {
      const next = new Set(initialExpanded);
      itemsToExpand.forEach((key) => next.add(key));
      return next;
    });
  }, [pathname, isItemActive]); // Re-run quand le pathname change

  // Vérifier si un item parent a un enfant actif (pour le rendu)
  // Fonction récursive normale (pas de hook)
  const hasActiveChildForRender = (item: CalendrierNavItem, currentPathname: string): boolean => {
    if (!item.children || !currentPathname) return false;
    return item.children.some((child) => isItemActive(child, currentPathname) || hasActiveChildForRender(child, currentPathname));
  };

  // Rendre un item de navigation
  const renderNavItem = (item: CalendrierNavItem, level: number = 0, key: string = ''): React.ReactNode => {
    const itemKey = key || item.label;
    const currentPathname = pathname || '';
    const isActive = isItemActive(item, currentPathname);
    const hasActive = hasActiveChildForRender(item, currentPathname);
    const isExpanded = expandedItems.has(itemKey);
    const hasChildren = item.children && item.children.length > 0;
    const IconComponent = item.icon ? getIcon(item.icon) : null;
    const badgeCount = getBadgeCount(item.badgeKey);

    return (
      <div key={itemKey} className="space-y-0.5">
        <button
          type="button"
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(itemKey);
            }
            if (item.route) {
              router.push(item.route);
            }
          }}
          aria-label={!hasChildren ? `Aller à ${item.label}` : undefined}
          aria-expanded={hasChildren ? isExpanded : undefined}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg transition-all duration-200 text-left focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
            'group relative',
            level === 0 && 'font-medium',
            isActive || hasActive
              ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
              : 'hover:bg-slate-700/40 border border-transparent text-slate-300',
            level > 0 && 'ml-4 text-sm'
          )}
        >
          {/* Indicator */}
          {(isActive || hasActive) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full bg-blue-400" aria-hidden />
          )}

          {/* Icon */}
          {IconComponent && (
            <IconComponent
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-all duration-200',
                isActive || hasActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
              )}
              aria-hidden
            />
          )}

          {/* Label */}
          {!collapsed && (
            <>
              <span
                className={cn(
                  'flex-1 transition-colors duration-200',
                  isActive || hasActive ? 'text-blue-400' : 'text-slate-300'
                )}
              >
                {item.label}
              </span>

              {/* Badge */}
              {badgeCount !== null && badgeCount > 0 && (
                <Badge
                  variant={badgeCount > 10 ? 'urgent' : 'warning'}
                  className="h-5 min-w-5 px-1.5 text-xs font-medium"
                >
                  {badgeCount}
                </Badge>
              )}

              {/* Chevron */}
              {hasChildren && (
                <LucideIcons.ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    isExpanded ? 'rotate-180' : ''
                  )}
                  aria-hidden
                />
              )}
            </>
          )}
        </button>

        {/* Children */}
        {!collapsed && isExpanded && hasChildren && (
          <div className="ml-4 space-y-0.5">
            {item.children?.map((child, index) =>
              renderNavItem(child, level + 1, `${itemKey}-${index}`)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        'fixed sm:relative z-40 h-full',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <LucideIcons.CalendarDays className="h-5 w-5 text-blue-400" aria-hidden />
            <span className="font-semibold text-slate-200 text-sm">
              Calendrier & Planification v3.0
            </span>
          </div>
        )}
        {collapsed && (
          <LucideIcons.CalendarDays className="h-5 w-5 text-blue-400 mx-auto" aria-hidden />
        )}
        {onToggleCollapse && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
            className="min-h-[44px] min-w-[44px] p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {collapsed ? (
              <LucideIcons.ChevronRight className="h-4 w-4" aria-hidden />
            ) : (
              <LucideIcons.ChevronLeft className="h-4 w-4" aria-hidden />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {calendrierNavigation.map((item, index) =>
            renderNavItem(item, 0, `root-${index}`)
          )}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-slate-700/50 p-3">
          <div className="text-xs text-slate-400 text-center">
            Calendrier v3.0
          </div>
        </div>
      )}
    </aside>
  );
}

