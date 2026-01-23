/**
 * Panel de Filtres Avancés pour Analytics BTP
 * Permet de filtrer les données selon plusieurs critères avec mise à jour dynamique
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Filter, Calendar as CalendarIcon, MapPin, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { DisplayLogic } from '@/lib/config/analyticsDisplayLogic';

interface FilterValue {
  id: string;
  type: 'temporal' | 'geographical' | 'hierarchical' | 'status' | 'custom';
  value: any;
  label?: string;
}

interface BTPFilterPanelProps {
  filters: DisplayLogic['filters'];
  onFiltersChange: (filters: FilterValue[]) => void;
  activeFilters?: FilterValue[];
  className?: string;
}

export function BTPFilterPanel({
  filters,
  onFiltersChange,
  activeFilters = [],
  className,
}: BTPFilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterValue[]>(activeFilters);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [activeFilters]);

  const handleFilterChange = (filterId: string, value: any) => {
    const updated = localFilters.filter((f) => f.id !== filterId);
    if (value !== undefined && value !== null && value !== '') {
      const filter = filters.find((f) => f.id === filterId);
      updated.push({
        id: filterId,
        type: filter?.type || 'custom',
        value,
        label: filter?.options?.[value] || value,
      });
    }
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const removeFilter = (filterId: string) => {
    const updated = localFilters.filter((f) => f.id !== filterId);
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const clearAllFilters = () => {
    setLocalFilters([]);
    onFiltersChange([]);
    setDateRange({});
  };

  const renderFilterInput = (filter: DisplayLogic['filters'][0]) => {
    const currentValue = localFilters.find((f) => f.id === filter.id)?.value;

    switch (filter.type) {
      case 'temporal':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Période</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className={cn(
                    'w-full justify-start text-left font-normal text-xs',
                    !dateRange.from && 'text-slate-500'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString()
                    )
                  ) : (
                    'Sélectionner une période'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    if (range?.from && range?.to) {
                      handleFilterChange(filter.id, {
                        from: range.from.toISOString(),
                        to: range.to.toISOString(),
                      });
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'status':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Statut</Label>
            <Select
              value={currentValue || ''}
              onValueChange={(value) => handleFilterChange(filter.id, value)}
            >
              <SelectTrigger className="w-full text-xs h-8">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'geographical':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Localisation</Label>
            <Input
              placeholder="Rechercher une localisation..."
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="text-xs h-8"
            />
          </div>
        );

      case 'hierarchical':
        return (
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Hiérarchie</Label>
            <Select
              value={currentValue || ''}
              onValueChange={(value) => handleFilterChange(filter.id, value)}
            >
              <SelectTrigger className="w-full text-xs h-8">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {/* Options à charger dynamiquement */}
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">{filter.id}</Label>
            <Input
              placeholder={`Filtrer par ${filter.id}...`}
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="text-xs h-8"
            />
          </div>
        );
    }
  };

  return (
    <div className={cn('bg-slate-800/50 rounded-lg border border-slate-700 p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-300">Filtres</h3>
          {localFilters.length > 0 && (
            <Badge variant="default" className="text-xs">
              {localFilters.length} actif{localFilters.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {localFilters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-7">
            <X className="h-3 w-3 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Filtres actifs */}
      {localFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {localFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="default"
              className="text-xs flex items-center gap-1"
            >
              {filter.label || filter.id}: {String(filter.value).substring(0, 20)}
              <button
                onClick={() => removeFilter(filter.id)}
                className="ml-1 hover:bg-slate-700 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Inputs de filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filters.map((filter) => (
          <div key={filter.id}>{renderFilterInput(filter)}</div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700">
        <Button variant="default" size="sm" className="text-xs">
          Sauvegarder la sélection
        </Button>
        <Button variant="default" size="sm" className="text-xs">
          Charger une sélection
        </Button>
      </div>
    </div>
  );
}

