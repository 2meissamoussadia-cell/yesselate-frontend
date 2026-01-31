/**
 * EmployesFiltersPanel
 * Panneau de filtres avancés pour Employés
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Filter,
  Calendar,
  Users,
  Briefcase,
  Building2,
  Target,
  Shield,
  Search,
  TrendingUp,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { useEmployesCommandCenterStore } from '@/lib/stores/employesCommandCenterStore';

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

interface EmployesFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: Record<string, string[]>) => void;
}

export function EmployesFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
}: EmployesFiltersPanelProps) {
  const { filters, setFilter, resetFilters } = useEmployesCommandCenterStore();
  const [localFilters, setLocalFilters] = useState<Record<string, string[]>>({
    status: filters.status || [],
    departments: filters.departments || [],
    contractTypes: filters.contractTypes || [],
    bureaux: filters.bureaux || [],
    performance: filters.performance || [],
  });

  const filterSections: FilterSection[] = [
    {
      id: 'status',
      label: 'Statut',
      icon: Users,
      options: [
        { id: 'actif', label: 'Actif', value: 'actif' },
        { id: 'conges', label: 'En congés', value: 'conges' },
        { id: 'mission', label: 'En mission', value: 'mission' },
        { id: 'absent', label: 'Absent', value: 'absent' },
        { id: 'inactif', label: 'Inactif', value: 'inactif' },
      ],
    },
    {
      id: 'departments',
      label: 'Départements',
      icon: Building2,
      options: [
        { id: 'btp', label: 'BTP', value: 'BTP' },
        { id: 'finance', label: 'Finance', value: 'Finance' },
        { id: 'rh', label: 'RH', value: 'RH' },
        { id: 'it', label: 'IT', value: 'IT' },
        { id: 'commercial', label: 'Commercial', value: 'Commercial' },
        { id: 'logistique', label: 'Logistique', value: 'Logistique' },
        { id: 'juridique', label: 'Juridique', value: 'Juridique' },
        { id: 'direction', label: 'Direction', value: 'Direction' },
      ],
    },
    {
      id: 'contractTypes',
      label: 'Types de contrat',
      icon: Briefcase,
      options: [
        { id: 'cdi', label: 'CDI', value: 'CDI' },
        { id: 'cdd', label: 'CDD', value: 'CDD' },
        { id: 'stage', label: 'Stage', value: 'Stage' },
        { id: 'interim', label: 'Intérim', value: 'Intérim' },
      ],
    },
    {
      id: 'bureaux',
      label: 'Bureaux',
      icon: MapPin,
      options: [
        { id: 'btp', label: 'BTP', value: 'BTP' },
        { id: 'bj', label: 'BJ', value: 'BJ' },
        { id: 'bs', label: 'BS', value: 'BS' },
        { id: 'bme', label: 'BME', value: 'BME' },
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: Target,
      options: [
        { id: 'excellent', label: 'Excellent', value: 'excellent' },
        { id: 'good', label: 'Bon', value: 'good' },
        { id: 'needs-improvement', label: 'À améliorer', value: 'needs-improvement' },
      ],
    },
  ];

  const toggleFilter = (sectionId: string, optionValue: string) => {
    setLocalFilters((prev) => {
      const current = prev[sectionId] || [];
      const newFilters = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      return { ...prev, [sectionId]: newFilters };
    });
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(localFilters).reduce((sum, arr) => sum + arr.length, 0);
  }, [localFilters]);

  const handleApply = () => {
    // Apply filters to store
    Object.entries(localFilters).forEach(([key, value]) => {
      setFilter(key as keyof typeof filters, value as any);
    });

    // Call callback if provided
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }

    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      status: [],
      departments: [],
      contractTypes: [],
      bureaux: [],
      performance: [],
    });
    resetFilters();
  };

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
          {filterSections.map((section) => {
            const Icon = section.icon;
            const selected = localFilters[section.id] || [];

            return (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-medium text-slate-300">{section.label}</h4>
                  {selected.length > 0 && (
                    <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      {selected.length}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleFilter(section.id, option.value)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                          isSelected
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                        )}
                      >
                        {isSelected && <CheckCircle2 className="h-3 w-3" />}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleApply}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Appliquer les filtres
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full border-slate-700 text-slate-400 hover:text-slate-200"
            size="sm"
          >
            Réinitialiser
          </Button>
        </div>
      </div>
    </>
  );
}

