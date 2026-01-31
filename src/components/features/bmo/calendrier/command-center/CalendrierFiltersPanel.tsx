/**
 * Panneau de filtres contextuels pour Calendrier
 * Filtres : chantier, équipe, type d'événement
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Building2, Users, Tag } from 'lucide-react';

export interface CalendrierFilters {
  chantierId?: string | null;
  teamId?: string | null;
  eventType?: string | null;
}

interface CalendrierFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CalendrierFilters;
  onFiltersChange: (filters: CalendrierFilters) => void;
  // Options disponibles (mock pour l'instant, à remplacer par données réelles)
  chantiers?: Array<{ id: string; label: string }>;
  teams?: Array<{ id: string; label: string }>;
  eventTypes?: Array<{ id: string; label: string }>;
}

export function CalendrierFiltersPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  chantiers = [],
  teams = [],
  eventTypes = [],
}: CalendrierFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<CalendrierFilters>(filters);

  if (!isOpen) return null;

  const handleFilterChange = (key: keyof CalendrierFilters, value: string | null) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: CalendrierFilters = {
      chantierId: null,
      teamId: null,
      eventType: null,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
    onClose();
  };

  const hasActiveFilters = localFilters.chantierId || localFilters.teamId || localFilters.eventType;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800/50 z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-200">Filtres</h3>
              {hasActiveFilters && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {[localFilters.chantierId, localFilters.teamId, localFilters.eventType].filter(Boolean).length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
              aria-label="Fermer les filtres"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Chantier */}
          <div>
            <label className="text-xs font-medium mb-2 block flex items-center gap-1.5 text-slate-300">
              <Building2 className="w-3.5 h-3.5" />
              Chantier
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => handleFilterChange('chantierId', null)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded text-sm transition-all',
                  !localFilters.chantierId
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                )}
              >
                Tous les chantiers
              </button>
              {chantiers.length > 0 ? (
                chantiers.map((chantier) => (
                  <button
                    key={chantier.id}
                    onClick={() => handleFilterChange('chantierId', chantier.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-sm transition-all',
                      localFilters.chantierId === chantier.id
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                    )}
                  >
                    {chantier.label}
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 px-3 py-2">Aucun chantier disponible</p>
              )}
            </div>
          </div>

          {/* Équipe */}
          <div>
            <label className="text-xs font-medium mb-2 block flex items-center gap-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5" />
              Équipe
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => handleFilterChange('teamId', null)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded text-sm transition-all',
                  !localFilters.teamId
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                )}
              >
                Toutes les équipes
              </button>
              {teams.length > 0 ? (
                teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleFilterChange('teamId', team.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-sm transition-all',
                      localFilters.teamId === team.id
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                    )}
                  >
                    {team.label}
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 px-3 py-2">Aucune équipe disponible</p>
              )}
            </div>
          </div>

          {/* Type d'événement */}
          <div>
            <label className="text-xs font-medium mb-2 block flex items-center gap-1.5 text-slate-300">
              <Tag className="w-3.5 h-3.5" />
              Type d'événement
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => handleFilterChange('eventType', null)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded text-sm transition-all',
                  !localFilters.eventType
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                )}
              >
                Tous les types
              </button>
              {eventTypes.length > 0 ? (
                eventTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleFilterChange('eventType', type.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded text-sm transition-all',
                      localFilters.eventType === type.id
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                    )}
                  >
                    {type.label}
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 px-3 py-2">Aucun type disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1 text-xs"
          >
            Réinitialiser
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1 text-xs bg-blue-500 hover:bg-blue-600"
          >
            Appliquer
          </Button>
        </div>
      </div>
    </>
  );
}

