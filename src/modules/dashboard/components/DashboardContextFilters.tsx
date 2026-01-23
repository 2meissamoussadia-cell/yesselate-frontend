/**
 * Composant de filtres contextuels pour le Dashboard
 * Permet de filtrer par bureau, projet, période, etc.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Filter,
  X,
  Building2,
  Calendar,
  FolderKanban,
  ChevronDown,
} from 'lucide-react';
import { useDashboardNavigationStore } from '@/lib/stores/dashboardNavigationStore';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

export interface ContextFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: FilterOption[];
  multiple?: boolean;
}

interface DashboardContextFiltersProps {
  filters?: ContextFilter[];
  onFilterChange?: (filterId: string, values: string[]) => void;
  className?: string;
}

const defaultFilters: ContextFilter[] = [
  {
    id: 'bureau',
    label: 'Bureau',
    icon: Building2,
    options: [
      { id: 'all', label: 'Tous', value: 'all' },
      { id: 'bmo', label: 'BMO', value: 'bmo' },
      { id: 'bf', label: 'BF', value: 'bf' },
      { id: 'bj', label: 'BJ', value: 'bj' },
      { id: 'bct', label: 'BCT', value: 'bct' },
      { id: 'bop', label: 'BOP', value: 'bop' },
      { id: 'bcg', label: 'BCG', value: 'bcg' },
      { id: 'bja', label: 'BJA', value: 'bja' },
      { id: 'brc', label: 'BRC', value: 'brc' },
      { id: 'bpl', label: 'BPL', value: 'bpl' },
      { id: 'bex', label: 'BEX', value: 'bex' },
    ],
  },
  {
    id: 'periode',
    label: 'Période',
    icon: Calendar,
    options: [
      { id: 'today', label: "Aujourd'hui", value: 'today' },
      { id: 'week', label: 'Cette semaine', value: 'week' },
      { id: 'month', label: 'Ce mois', value: 'month' },
      { id: 'quarter', label: 'Ce trimestre', value: 'quarter' },
      { id: 'year', label: 'Cette année', value: 'year' },
      { id: 'custom', label: 'Personnalisée', value: 'custom' },
    ],
  },
  {
    id: 'projet',
    label: 'Projet',
    icon: FolderKanban,
    multiple: true,
    options: [
      { id: 'all', label: 'Tous les projets', value: 'all' },
      // Les projets seront chargés dynamiquement
    ],
  },
];

export function DashboardContextFilters({
  filters = defaultFilters,
  onFilterChange,
  className,
}: DashboardContextFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const toggleDropdown = (filterId: string) => {
    setOpenDropdowns((prev) => {
      const next = new Set(prev);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  };

  const handleFilterSelect = (filterId: string, value: string) => {
    setActiveFilters((prev) => {
      const filter = filters.find((f) => f.id === filterId);
      const isMultiple = filter?.multiple ?? false;
      const currentValues = prev[filterId] || [];

      let newValues: string[];
      if (isMultiple) {
        if (currentValues.includes(value)) {
          newValues = currentValues.filter((v) => v !== value);
        } else {
          newValues = [...currentValues, value];
        }
      } else {
        newValues = [value];
        setOpenDropdowns((prev) => {
          const next = new Set(prev);
          next.delete(filterId);
          return next;
        });
      }

      const updated = { ...prev, [filterId]: newValues };
      onFilterChange?.(filterId, newValues);
      return updated;
    });
  };

  const clearFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const updated = { ...prev };
      delete updated[filterId];
      onFilterChange?.(filterId, []);
      return updated;
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setOpenDropdowns(new Set());
    filters.forEach((filter) => {
      onFilterChange?.(filter.id, []);
    });
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Filter className="h-3.5 w-3.5" />
        <span>Filtres:</span>
      </div>

      {filters.map((filter) => {
        const Icon = filter.icon;
        const selectedValues = activeFilters[filter.id] || [];
        const isOpen = openDropdowns.has(filter.id);
        const hasSelection = selectedValues.length > 0;

        return (
          <div key={filter.id} className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown(filter.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors',
                'border',
                hasSelection
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800/70',
                isOpen && 'bg-slate-800/70 border-slate-600/50'
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{filter.label}</span>
              {hasSelection && (
                <span className="px-1 py-0.5 rounded bg-blue-500/20 text-[10px] font-medium">
                  {selectedValues.length}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'h-3 w-3 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => toggleDropdown(filter.id)}
                />
                <div className="absolute top-full left-0 mt-1 z-20 min-w-[200px] bg-slate-900 border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                    {filter.options.map((option) => {
                      const isSelected = selectedValues.includes(option.value);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleFilterSelect(filter.id, option.value)}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left',
                            isSelected
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'text-slate-300 hover:bg-slate-800/50'
                          )}
                        >
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-slate-500 text-[10px]">
                              {option.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {hasSelection && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilter(filter.id);
                }}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 flex items-center justify-center transition-colors"
                aria-label={`Effacer le filtre ${filter.label}`}
              >
                <X className="h-2.5 w-2.5 text-red-400" />
              </button>
            )}
          </div>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-300 transition-colors"
        >
          <X className="h-3 w-3" />
          <span>Effacer tout</span>
        </button>
      )}
    </div>
  );
}

