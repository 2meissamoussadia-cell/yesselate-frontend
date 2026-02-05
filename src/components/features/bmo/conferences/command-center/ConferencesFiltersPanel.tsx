/**
 * ConferencesFiltersPanel
 * Panneau de filtres avancés pour Conférences
 * Pattern overlay comme Analytics
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Filter,
  Calendar,
  Users,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Video,
} from 'lucide-react';
import { useConferencesCommandCenterStore } from '@/lib/stores/conferencesCommandCenterStore';
import { conferencesDecisionnelles } from '@/lib/data';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterSection {
  id: string;
  label: string;
  icon: typeof Filter;
  options: FilterOption[];
}

interface ConferencesFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: {
    statuses: string[];
    types: string[];
    priorities: string[];
    bureaux: string[];
    dateRange: { start: Date | null; end: Date | null };
  }) => void;
}

export function ConferencesFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
}: ConferencesFiltersPanelProps) {
  const { filters, setFilter } = useConferencesCommandCenterStore();

  // État local pour les filtres en cours d'édition
  const [localFilters, setLocalFilters] = useState({
    statuses: filters.statuses || [],
    types: filters.types || [],
    priorities: filters.priorities || [],
    bureaux: filters.bureaux || [],
    dateRange: filters.dateRange || { start: null, end: null },
  });

  // Synchroniser avec le store quand il change
  useEffect(() => {
    setLocalFilters({
      statuses: filters.statuses || [],
      types: filters.types || [],
      priorities: filters.priorities || [],
      bureaux: filters.bureaux || [],
      dateRange: filters.dateRange || { start: null, end: null },
    });
  }, [filters]);

  // Extraire les bureaux uniques des conférences
  const availableBureaux = React.useMemo(() => {
    const bureauxSet = new Set<string>();
    conferencesDecisionnelles.forEach((conf) => {
      conf.participants.forEach((p) => {
        if (p.bureau) bureauxSet.add(p.bureau);
      });
    });
    return Array.from(bureauxSet).sort();
  }, []);

  const filterSections: FilterSection[] = [
    {
      id: 'statuses',
      label: 'Statut',
      icon: CheckCircle2,
      options: [
        { id: 'planifiee', label: 'Planifiée', value: 'planifiee' },
        { id: 'en_cours', label: 'En cours', value: 'en_cours' },
        { id: 'terminee', label: 'Terminée', value: 'terminee' },
        { id: 'annulee', label: 'Annulée', value: 'annulee' },
      ],
    },
    {
      id: 'types',
      label: 'Type',
      icon: Video,
      options: [
        { id: 'crise', label: 'Crise', value: 'crise' },
        { id: 'arbitrage', label: 'Arbitrage', value: 'arbitrage' },
        { id: 'revue_projet', label: 'Revue projet', value: 'revue_projet' },
        { id: 'comite_direction', label: 'Comité direction', value: 'comite_direction' },
        { id: 'resolution_blocage', label: 'Résolution blocage', value: 'resolution_blocage' },
      ],
    },
    {
      id: 'priorities',
      label: 'Priorité',
      icon: AlertTriangle,
      options: [
        { id: 'normale', label: 'Normale', value: 'normale' },
        { id: 'haute', label: 'Haute', value: 'haute' },
        { id: 'urgente', label: 'Urgente', value: 'urgente' },
        { id: 'critique', label: 'Critique', value: 'critique' },
      ],
    },
    {
      id: 'bureaux',
      label: 'Bureau',
      icon: Users,
      options: availableBureaux.map((bureau) => ({
        id: bureau.toLowerCase(),
        label: bureau,
        value: bureau,
      })),
    },
  ];

  const toggleFilter = (sectionId: keyof typeof localFilters, optionValue: string) => {
    if (sectionId === 'dateRange') return;

    setLocalFilters((prev) => {
      const current = (prev[sectionId] as string[]) || [];
      const isSelected = current.includes(optionValue);

      return {
        ...prev,
        [sectionId]: isSelected
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue],
      };
    });
  };

  const clearSection = (sectionId: keyof typeof localFilters) => {
    if (sectionId === 'dateRange') {
      setLocalFilters((prev) => ({ ...prev, dateRange: { start: null, end: null } }));
      return;
    }

    setLocalFilters((prev) => ({
      ...prev,
      [sectionId]: [],
    }));
  };

  const clearAll = () => {
    setLocalFilters({
      statuses: [],
      types: [],
      priorities: [],
      bureaux: [],
      dateRange: { start: null, end: null },
    });
  };

  const handleApply = () => {
    // Appliquer les filtres au store
    setFilter('statuses', localFilters.statuses as any);
    setFilter('types', localFilters.types);
    setFilter('priorities', localFilters.priorities as any);
    setFilter('bureaux', localFilters.bureaux);
    setFilter('dateRange', localFilters.dateRange);

    // Callback optionnel
    if (onApplyFilters) {
      onApplyFilters({
        statuses: localFilters.statuses,
        types: localFilters.types,
        priorities: localFilters.priorities,
        bureaux: localFilters.bureaux,
        dateRange: localFilters.dateRange,
      });
    }

    onClose();
  };

  const activeFilterCount =
    localFilters.statuses.length +
    localFilters.types.length +
    localFilters.priorities.length +
    localFilters.bureaux.length +
    (localFilters.dateRange.start || localFilters.dateRange.end ? 1 : 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-200">Filtres avancés</h3>
            {activeFilterCount > 0 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filterSections.map((section) => {
            const Icon = section.icon;
            const sectionFilters = (localFilters[section.id as keyof typeof localFilters] as string[]) || [];

            return (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <h4 className="text-sm font-medium text-slate-300">{section.label}</h4>
                    {sectionFilters.length > 0 && (
                      <Badge variant="default" className="text-xs">
                        {sectionFilters.length}
                      </Badge>
                    )}
                  </div>
                  {sectionFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSection(section.id as keyof typeof localFilters)}
                      className="h-6 text-xs text-slate-400 hover:text-slate-300"
                    >
                      Effacer
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {section.options.map((option) => {
                    const isSelected = sectionFilters.includes(option.value);

                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleFilter(section.id as keyof typeof localFilters, option.value)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-200',
                          isSelected
                            ? 'bg-purple-500/10 border-purple-500/30 text-slate-200'
                            : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                        )}
                      >
                        <span className="text-sm">{option.label}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Date Range - TODO: Implémenter avec un date picker */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h4 className="text-sm font-medium text-slate-300">Date</h4>
              {(localFilters.dateRange.start || localFilters.dateRange.end) && (
                <Badge variant="default" className="text-xs">
                  1
                </Badge>
              )}
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-2">Plage de dates</p>
              <p className="text-sm text-slate-400 italic">Date picker à implémenter</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={activeFilterCount === 0}
              className="flex-1 border-slate-700 text-slate-400"
            >
              Réinitialiser
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              Appliquer ({activeFilterCount})
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}








