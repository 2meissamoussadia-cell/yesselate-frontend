/**
 * FilterPanel Component
 * Panneau de filtres avancé avec recherche et tags
 */

'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { X, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { FormInput, FormSelect } from '../Form';
import { FadeIn } from '../Animations';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'numberrange';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface FilterValue {
  key: string;
  value: any;
  label?: string;
}

interface FilterPanelProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset?: () => void;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  className,
  collapsible = false,
  defaultCollapsed = false,
}: FilterPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les filtres selon la recherche
  const visibleFilters = useMemo(() => {
    if (!searchQuery.trim()) return filters;
    
    const query = searchQuery.toLowerCase();
    return filters.filter(filter =>
      filter.label.toLowerCase().includes(query) ||
      filter.key.toLowerCase().includes(query)
    );
  }, [filters, searchQuery]);

  // Obtenir les filtres actifs
  const activeFilters = useMemo(() => {
    return Object.entries(values)
      .filter(([_, value]) => {
        if (value == null) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim().length > 0;
        return true;
      })
      .map(([key, value]) => {
        const filter = filters.find(f => f.key === key);
        return {
          key,
          value,
          label: filter?.label || key,
        };
      });
  }, [values, filters]);

  const handleFilterChange = (key: string, value: any) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  const handleRemoveFilter = (key: string) => {
    const newValues = { ...values };
    delete newValues[key];
    onChange(newValues);
  };

  const handleReset = () => {
    onChange({});
    onReset?.();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-200">
            Filtres
            {activeFilters.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </h3>
        </div>
        {collapsible && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Filtres actifs */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(filter => (
            <Badge
              key={filter.key}
              variant="outline"
              className="flex items-center gap-1.5"
            >
              <span className="text-xs">
                {filter.label}: {Array.isArray(filter.value) ? filter.value.join(', ') : String(filter.value)}
              </span>
              <button
                onClick={() => handleRemoveFilter(filter.key)}
                className="hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Panel de filtres */}
      {!isCollapsed && (
        <FadeIn>
          <div className="space-y-4 p-4 rounded-lg border border-slate-700/50 bg-slate-800/50">
            {/* Recherche de filtres */}
            {filters.length > 5 && (
              <FormInput
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Rechercher un filtre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            )}

            {/* Liste des filtres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleFilters.map(filter => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    {filter.label}
                  </label>
                  {filter.type === 'text' && (
                    <FormInput
                      value={values[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder}
                    />
                  )}
                  {filter.type === 'select' && filter.options && (
                    <FormSelect
                      value={values[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      options={filter.options}
                      placeholder={filter.placeholder}
                    />
                  )}
                  {filter.type === 'multiselect' && filter.options && (() => {
                    const selected = Array.isArray(values[filter.key]) ? values[filter.key] : [];
                    const toggle = (value: string) => {
                      const next = selected.includes(value)
                        ? selected.filter(v => v !== value)
                        : [...selected, value];
                      handleFilterChange(filter.key, next);
                    };
                    const label = selected.length === 0
                      ? (filter.placeholder || 'Sélectionner...')
                      : selected.length === 1
                        ? filter.options.find(o => o.value === selected[0])?.label ?? selected[0]
                        : `${selected.length} sélectionnés`;
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              'w-full px-4 py-2 rounded-lg border border-slate-700/50 bg-slate-800 text-slate-200',
                              'text-left text-sm flex items-center justify-between gap-2',
                              'hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50'
                            )}
                          >
                            <span className="truncate">{label}</span>
                            <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 max-h-[280px] overflow-y-auto" align="start">
                          <div className="space-y-1">
                            {filter.options.map(option => (
                              <label
                                key={option.value}
                                className={cn(
                                  'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer',
                                  'hover:bg-slate-800/80 text-sm text-slate-200'
                                )}
                              >
                                <Checkbox
                                  checked={selected.includes(option.value)}
                                  onCheckedChange={() => toggle(option.value)}
                                />
                                <span>{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })()}
                  {filter.type === 'number' && (
                    <FormInput
                      type="number"
                      value={values[filter.key] || ''}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : null)}
                      placeholder={filter.placeholder}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

