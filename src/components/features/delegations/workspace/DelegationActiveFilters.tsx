/**
 * Filtres actifs visuels pour les délégations
 * Badges amovibles
 */

'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

interface DelegationActiveFiltersProps {
  filters: ActiveFilter[];
  onClearAll?: () => void;
  className?: string;
}

export function DelegationActiveFilters({
  filters,
  onClearAll,
  className,
}: DelegationActiveFiltersProps) {
  if (filters.length === 0) return null;
  
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      <span className="text-xs text-white/60 font-medium">Filtres actifs:</span>
      
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant="outline"
          className="bg-blue-500/20 text-blue-300 border-blue-500/30 pl-2 pr-1 py-1 gap-1"
        >
          <span className="text-xs">
            {filter.label}: <span className="font-semibold">{filter.value}</span>
          </span>
          <button
            onClick={filter.onRemove}
            className="ml-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      {filters.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-white/60 hover:text-white hover:bg-white/10"
        >
          Tout effacer
        </Button>
      )}
    </div>
  );
}

