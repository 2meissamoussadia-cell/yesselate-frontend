/**
 * Panneau de filtres avancés pour Clients
 * Inspiré de la page Analytics
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Filter,
  Building2,
  Crown,
  AlertTriangle,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Check,
} from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: FilterOption[];
  type: 'checkbox' | 'radio';
}

const filterGroups: FilterGroup[] = [
  {
    id: 'type',
    label: 'Type de client',
    icon: Users,
    type: 'checkbox',
    options: [
      { id: 'premium', label: 'Premium', count: 8 },
      { id: 'standard', label: 'Standard', count: 124 },
      { id: 'prospect', label: 'Prospect', count: 12 },
      { id: 'inactif', label: 'Inactif', count: 12 },
    ],
  },
  {
    id: 'status',
    label: 'Statut',
    icon: AlertTriangle,
    type: 'checkbox',
    options: [
      { id: 'actif', label: 'Actif', count: 140 },
      { id: 'litige', label: 'En litige', count: 3 },
      { id: 'attente', label: 'En attente', count: 13 },
    ],
  },
  {
    id: 'sector',
    label: 'Secteur d\'activité',
    icon: Building2,
    type: 'checkbox',
    options: [
      { id: 'tech', label: 'Technologie', count: 35 },
      { id: 'industrie', label: 'Industrie', count: 42 },
      { id: 'services', label: 'Services', count: 28 },
      { id: 'finance', label: 'Finance', count: 18 },
      { id: 'sante', label: 'Santé', count: 15 },
      { id: 'commerce', label: 'Commerce', count: 18 },
    ],
  },
  {
    id: 'ca',
    label: 'Chiffre d\'affaires',
    icon: DollarSign,
    type: 'radio',
    options: [
      { id: 'all', label: 'Tous' },
      { id: 'small', label: '< 50K€', count: 45 },
      { id: 'medium', label: '50K€ - 200K€', count: 68 },
      { id: 'large', label: '200K€ - 500K€', count: 32 },
      { id: 'enterprise', label: '> 500K€', count: 11 },
    ],
  },
  {
    id: 'region',
    label: 'Région',
    icon: MapPin,
    type: 'checkbox',
    options: [
      { id: 'idf', label: 'Île-de-France', count: 65 },
      { id: 'aura', label: 'Auvergne-Rhône-Alpes', count: 28 },
      { id: 'paca', label: 'PACA', count: 22 },
      { id: 'occitanie', label: 'Occitanie', count: 18 },
      { id: 'bretagne', label: 'Bretagne', count: 12 },
      { id: 'autres', label: 'Autres régions', count: 11 },
    ],
  },
  {
    id: 'date',
    label: 'Date d\'inscription',
    icon: Calendar,
    type: 'radio',
    options: [
      { id: 'all', label: 'Toutes les dates' },
      { id: 'week', label: 'Cette semaine', count: 3 },
      { id: 'month', label: 'Ce mois', count: 12 },
      { id: 'quarter', label: 'Ce trimestre', count: 28 },
      { id: 'year', label: 'Cette année', count: 45 },
    ],
  },
];

interface ClientsFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Record<string, string[]>) => void;
}

export const ClientsFiltersPanel = React.memo(function ClientsFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
}: ClientsFiltersPanelProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  const handleToggleFilter = (groupId: string, optionId: string, type: 'checkbox' | 'radio') => {
    setSelectedFilters((prev) => {
      const current = prev[groupId] || [];
      
      if (type === 'radio') {
        return { ...prev, [groupId]: [optionId] };
      }
      
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const handleClearAll = () => {
    setSelectedFilters({});
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onClose();
  };

  const totalActiveFilters = Object.values(selectedFilters).reduce(
    (acc, arr) => acc + arr.filter(id => id !== 'all').length,
    0
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-200">Filtres avancés</h3>
            {totalActiveFilters > 0 && (
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {totalActiveFilters}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filterGroups.map((group) => {
            const Icon = group.icon;
            const selectedInGroup = selectedFilters[group.id] || [];

            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-medium text-slate-300">{group.label}</h4>
                </div>
                <div className="space-y-1.5">
                  {group.options.map((option) => {
                    const isSelected = selectedInGroup.includes(option.id);

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleToggleFilter(group.id, option.id, group.type)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left',
                          isSelected
                            ? 'bg-cyan-500/15 border border-cyan-500/30'
                            : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-4 h-4 rounded flex items-center justify-center border transition-all',
                              group.type === 'radio' ? 'rounded-full' : 'rounded',
                              isSelected
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'border-slate-600'
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <span
                            className={cn(
                              'text-sm',
                              isSelected ? 'text-slate-200' : 'text-slate-400'
                            )}
                          >
                            {option.label}
                          </span>
                        </div>
                        {option.count !== undefined && (
                          <span className="text-xs text-slate-600">{option.count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4 border-t border-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-slate-400 hover:text-slate-200"
            disabled={totalActiveFilters === 0}
          >
            Réinitialiser
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-slate-700 text-slate-400"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Appliquer
              {totalActiveFilters > 0 && ` (${totalActiveFilters})`}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});

