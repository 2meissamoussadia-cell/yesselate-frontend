/**
 * DemandesRHFiltersPanel
 * Panneau de filtres avancés pour Demandes RH
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
  User,
  Building2,
} from 'lucide-react';
import { useDemandesRHCommandCenterStore, type DemandesRHActiveFilters } from '@/lib/stores/demandesRHCommandCenterStore';

interface DemandesRHFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemandesRHFiltersPanel({
  isOpen,
  onClose,
}: DemandesRHFiltersPanelProps) {
  const { filters, setFilter, resetFilters } = useDemandesRHCommandCenterStore();
  const [selectedFilters, setSelectedFilters] = useState<DemandesRHActiveFilters>(filters);

  // Synchroniser avec le store quand il change
  useEffect(() => {
    setSelectedFilters(filters);
  }, [filters]);

  const toggleArrayFilter = (key: keyof DemandesRHActiveFilters, value: string) => {
    setSelectedFilters((prev) => {
      const current = (prev[key] as string[]) || [];
      const isSelected = current.includes(value);
      const newValue = isSelected
        ? current.filter((v) => v !== value)
        : [...current, value];

      return {
        ...prev,
        [key]: newValue,
      };
    });
  };

  const clearSection = (key: keyof DemandesRHActiveFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [] : null,
    }));
  };

  const clearAll = () => {
    setSelectedFilters({
      types: [],
      statuses: [],
      priorities: [],
      bureaux: [],
      agents: [],
      dateRange: { start: null, end: null },
      customFilters: {},
    });
  };

  const handleApply = () => {
    // Appliquer les filtres au store
    Object.keys(selectedFilters).forEach((key) => {
      setFilter(key as keyof DemandesRHActiveFilters, selectedFilters[key as keyof DemandesRHActiveFilters]);
    });
    onClose();
  };

  const activeFilterCount =
    selectedFilters.types.length +
    selectedFilters.statuses.length +
    selectedFilters.priorities.length +
    selectedFilters.bureaux.length +
    selectedFilters.agents.length +
    (selectedFilters.dateRange.start ? 1 : 0) +
    (selectedFilters.dateRange.end ? 1 : 0);

  if (!isOpen) return null;

  const typeOptions = [
    { id: 'conges', label: 'Congés', value: 'conges' },
    { id: 'depenses', label: 'Dépenses', value: 'depenses' },
    { id: 'deplacements', label: 'Déplacements', value: 'deplacements' },
    { id: 'avances', label: 'Avances', value: 'avances' },
  ];

  const statusOptions = [
    { id: 'en_attente', label: 'En attente', value: 'en_attente' },
    { id: 'validee', label: 'Validée', value: 'validee' },
    { id: 'rejetee', label: 'Rejetée', value: 'rejetee' },
    { id: 'annulee', label: 'Annulée', value: 'annulee' },
  ];

  const priorityOptions = [
    { id: 'normale', label: 'Normale', value: 'normale' },
    { id: 'urgente', label: 'Urgente', value: 'urgente' },
    { id: 'critique', label: 'Critique', value: 'critique' },
  ];

  const bureauOptions = [
    { id: 'btp', label: 'BTP', value: 'btp' },
    { id: 'bj', label: 'BJ', value: 'bj' },
    { id: 'bs', label: 'BS', value: 'bs' },
    { id: 'bme', label: 'BME', value: 'bme' },
    { id: 'technique', label: 'Bureau Technique', value: 'technique' },
    { id: 'administratif', label: 'Bureau Administratif', value: 'administratif' },
  ];

  const renderFilterSection = (
    id: keyof DemandesRHActiveFilters,
    label: string,
    icon: React.ElementType,
    options: { id: string; label: string; value: string }[]
  ) => {
    const Icon = icon;
    const sectionFilters = (selectedFilters[id] as string[]) || [];

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <h4 className="text-sm font-medium text-slate-300">{label}</h4>
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
              onClick={() => clearSection(id)}
              className="h-6 text-xs text-slate-400 hover:text-slate-300"
            >
              Effacer
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = sectionFilters.includes(option.value);

            return (
              <button
                key={option.id}
                onClick={() => toggleArrayFilter(id, option.value)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all duration-200',
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500/30 text-slate-200'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                )}
              >
                <span className="text-sm">{option.label}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

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
            <Filter className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-200">Filtres avancés</h3>
            {activeFilterCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
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
          {renderFilterSection('types', 'Type de demande', Tag, typeOptions)}
          {renderFilterSection('statuses', 'Statut', CheckCircle2, statusOptions)}
          {renderFilterSection('priorities', 'Priorité', AlertTriangle, priorityOptions)}
          {renderFilterSection('bureaux', 'Bureau', Building2, bureauOptions)}

          {/* Date Range (simplifié pour l'instant) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <h4 className="text-sm font-medium text-slate-300">Période</h4>
            </div>
            <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <p className="text-xs text-slate-400 mb-2">Filtre de date (à implémenter)</p>
              <p className="text-sm text-slate-400">
                {selectedFilters.dateRange.start || selectedFilters.dateRange.end
                  ? 'Dates sélectionnées'
                  : 'Aucune date sélectionnée'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                clearAll();
                resetFilters();
              }}
              disabled={activeFilterCount === 0}
              className="flex-1 border-slate-700 text-slate-400"
            >
              Réinitialiser
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Appliquer ({activeFilterCount})
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

