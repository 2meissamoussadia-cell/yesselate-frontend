/**
 * Composant FilterBar pour les filtres de contrats
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { useContratsFilters } from '../hooks/useContratsFilters';
import type { StatutContrat, TypeContrat, PrioriteContrat } from '../types/contratsTypes';

interface FilterBarProps {
  onFiltersChange?: () => void;
}

export function FilterBar({ onFiltersChange }: FilterBarProps) {
  const filters = useContratsFilters();
  const activeFilters = filters.getFilters();

  const hasActiveFilters =
    (activeFilters.statuts?.length ?? 0) > 0 ||
    (activeFilters.types?.length ?? 0) > 0 ||
    (activeFilters.priorites?.length ?? 0) > 0 ||
    (activeFilters.recherche?.length ?? 0) > 0;

  const handleRemoveStatut = (statut: StatutContrat) => {
    filters.setStatuts(activeFilters.statuts.filter((s) => s !== statut));
    onFiltersChange?.();
  };

  const handleRemoveType = (type: TypeContrat) => {
    filters.setTypes((activeFilters.types ?? []).filter((t) => t !== type));
    onFiltersChange?.();
  };

  const handleRemovePriorite = (priorite: PrioriteContrat) => {
    filters.setPriorites((activeFilters.priorites ?? []).filter((p) => p !== priorite));
    onFiltersChange?.();
  };

  const handleClearSearch = () => {
    filters.setRecherche('');
    onFiltersChange?.();
  };

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg flex-wrap">
      <Filter className="h-4 w-4 text-slate-400" />
      <span className="text-sm text-slate-400">Filtres actifs:</span>

      {(activeFilters.statuts ?? []).map((statut) => (
        <Badge
          key={statut}
          variant="secondary"
          className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        >
          {statut.replace('_', ' ')}
          <button
            onClick={() => handleRemoveStatut(statut)}
            className="ml-1 hover:text-yellow-300"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {activeFilters.types.map((type) => (
        <Badge
          key={type}
          variant="secondary"
          className="bg-blue-500/20 text-blue-400 border-blue-500/30"
        >
          {type}
          <button onClick={() => handleRemoveType(type)} className="ml-1 hover:text-blue-300">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {(activeFilters.priorites ?? []).map((priorite) => (
        <Badge
          key={priorite}
          variant="secondary"
          className="bg-red-500/20 text-red-400 border-red-500/30"
        >
          {priorite}
          <button
            onClick={() => handleRemovePriorite(priorite)}
            className="ml-1 hover:text-red-300"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {activeFilters.recherche && (
        <Badge variant="gray" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          Recherche: {activeFilters.recherche}
          <button onClick={handleClearSearch} className="ml-1 hover:text-purple-300">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          filters.resetFilters();
          onFiltersChange?.();
        }}
        className="ml-auto text-xs text-slate-400 hover:text-slate-200"
      >
        Tout effacer
      </Button>
    </div>
  );
}

