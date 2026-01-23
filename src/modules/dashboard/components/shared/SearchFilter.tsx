/**
 * Composant de recherche et filtre pour les KPIs
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  resultsCount?: number;
  totalCount?: number;
  onClear?: () => void;
  className?: string;
}

export function SearchFilter({
  placeholder = 'Rechercher...',
  value,
  onChange,
  resultsCount,
  totalCount,
  onClear,
  className,
}: SearchFilterProps) {
  const handleClear = useCallback(() => {
    onChange('');
    onClear?.();
  }, [onChange, onClear]);

  const showResultsCount = resultsCount !== undefined && totalCount !== undefined;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'pl-9 pr-9 bg-slate-800/50 border-slate-700/50 text-slate-300',
            'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
            'placeholder:text-slate-500'
          )}
          aria-label="Rechercher"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {showResultsCount && value && (
        <div className="mt-2 text-xs text-slate-500">
          {resultsCount} résultat{resultsCount > 1 ? 's' : ''} sur {totalCount}
        </div>
      )}
    </div>
  );
}

