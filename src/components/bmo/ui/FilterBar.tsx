'use client';

/**
 * FilterBar — Barre de filtres type Outlook (onglets, recherche, filtres rapides, tri).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Page gère : état des vues/filtres/tri, application des filtres sur les données.
 */

import React, { useState } from 'react';
import {
  Mail,
  Flag,
  AtSign,
  Paperclip,
  ArrowUpDown,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ViewTab {
  id: string;
  label: string;
  count?: number;
  color?: 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray';
}

export interface QuickFilterConfig {
  id: string;
  icon: keyof typeof Icons;
  label: string;
}

export interface SortOption {
  id: string;
  label: string;
  icon?: keyof typeof Icons;
}

export interface FilterBarProps {
  /** Onglets de vue (ex. Prioritaire, Autres) */
  viewTabs?: ViewTab[];
  activeView?: string;
  onViewChange?: (viewId: string) => void;
  /** Filtres rapides (icônes toggle) — legacy: string[] */
  activeFilters?: string[] | Record<string, boolean>;
  onFilterToggle?: (filterId: string) => void;
  /** Tri simple (ex. "Par Date") */
  sortLabel?: string;
  onSortClick?: () => void;
  /** Sort avancé (dropdown) */
  sortOptions?: SortOption[];
  currentSort?: { field: string; order: 'asc' | 'desc' };
  onSortChange?: (sort: { field: string; order: 'asc' | 'desc' }) => void;
  /** Recherche */
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  /** Filtres rapides config (icon keys) */
  quickFilters?: QuickFilterConfig[];
  /** Filtres avancés (entonnoir) */
  onAdvancedFilterClick?: () => void;
  className?: string;
}

const defaultViewTabs: ViewTab[] = [
  { id: 'prioritaire', label: 'Prioritaire' },
  { id: 'autres', label: 'Autres' },
];

const colorClasses: Record<string, string> = {
  red: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  blue: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  green: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  gray: 'bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

const defaultQuickFilters: QuickFilterConfig[] = [
  { id: 'unread', icon: 'Mail', label: 'Non lus' },
  { id: 'flagged', icon: 'Flag', label: 'Avec indicateur' },
  { id: 'mentions', icon: 'AtSign', label: 'Mentions' },
  { id: 'attachments', icon: 'Paperclip', label: 'Avec pièces jointes' },
];

function isActiveFilter(activeFilters: string[] | Record<string, boolean> | undefined, id: string): boolean {
  if (!activeFilters) return false;
  if (Array.isArray(activeFilters)) return activeFilters.includes(id);
  return !!activeFilters[id];
}

export function FilterBar({
  viewTabs = defaultViewTabs,
  activeView = 'prioritaire',
  onViewChange,
  activeFilters = [],
  onFilterToggle,
  sortLabel = 'Par Date',
  onSortClick,
  sortOptions = [],
  currentSort,
  onSortChange,
  searchPlaceholder = 'Rechercher...',
  onSearch,
  quickFilters = defaultQuickFilters,
  onAdvancedFilterClick,
  className,
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentSort?.order ?? 'desc');

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    onSearch?.(q);
  };

  const toggleQuickFilter = (id: string) => {
    onFilterToggle?.(id);
  };

  const handleSortChange = (field: string) => {
    const newOrder = currentSort?.field === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    onSortChange?.({ field, order: newOrder });
  };

  const activeFilterCount = Array.isArray(activeFilters)
    ? activeFilters.length
    : Object.values(activeFilters).filter(Boolean).length;

  const effectiveQuickFilters = quickFilters.length > 0 ? quickFilters : defaultQuickFilters;

  return (
    <div className={cn('bg-white dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800', className)}>
      {viewTabs.length > 0 && (
        <div className="flex items-center gap-2 px-4 pt-3 overflow-x-auto">
          {viewTabs.map((tab) => {
            const isActive = activeView === tab.id;
            const colorClass = tab.color && colorClasses[tab.color];
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onViewChange?.(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap border border-transparent',
                  isActive
                    ? colorClass ?? 'bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                )}
                aria-pressed={isActive}
                aria-label={tab.label}
              >
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {tab.count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        {onSearch != null && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {effectiveQuickFilters.length > 0 && (
          <div className="flex items-center gap-2">
            {effectiveQuickFilters.map((f) => {
              const Icon = (Icons[f.icon] as LucideIcon) ?? Search;
              const isActive = isActiveFilter(activeFilters, f.id);
              return (
                <Button
                  key={f.id}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleQuickFilter(f.id)}
                  className={cn(!isActive && 'text-slate-600 dark:text-slate-400')}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {f.label}
                </Button>
              );
            })}
          </div>
        )}

        {onAdvancedFilterClick && (
          <Button variant="outline" size="sm" onClick={onAdvancedFilterClick}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filtres
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}

        {sortOptions.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Trier
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Trier par</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((opt) => {
                const Icon = opt.icon ? (Icons[opt.icon] as LucideIcon) : null;
                const isActive = currentSort?.field === opt.id;
                return (
                  <DropdownMenuItem
                    key={opt.id}
                    onClick={() => handleSortChange(opt.id)}
                    className={cn(isActive && 'bg-sky-50 dark:bg-sky-900/20')}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {Icon && <Icon className="w-4 h-4" />}
                      <span className="flex-1">{opt.label}</span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          {sortOrder === 'desc' ? '↓' : '↑'}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            type="button"
            onClick={onSortClick}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
            aria-label={`Tri : ${sortLabel}`}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>{sortLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
