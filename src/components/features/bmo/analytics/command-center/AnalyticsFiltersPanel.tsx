/**
 * AnalyticsFiltersPanel
 * Panneau de filtres avancés pour Analytics
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Filter,
  Calendar,
  Users,
  Tag,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

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

interface AnalyticsFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Record<string, string[]>) => void;
}

export function AnalyticsFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
}: AnalyticsFiltersPanelProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    period: [],
    bureau: [],
    category: [],
    status: [],
  });

  const filterSections: FilterSection[] = [
    {
      id: 'period',
      label: 'Période',
      icon: Calendar,
      options: [
        { id: 'today', label: "Aujourd'hui", value: 'today' },
        { id: 'week', label: 'Cette semaine', value: 'week' },
        { id: 'month', label: 'Ce mois', value: 'month' },
        { id: 'quarter', label: 'Ce trimestre', value: 'quarter' },
        { id: 'year', label: 'Cette année', value: 'year' },
        { id: 'custom', label: 'Personnalisé', value: 'custom' },
      ],
    },
    {
      id: 'bureau',
      label: 'Bureau',
      icon: Users,
      options: [
        { id: 'btp', label: 'BTP', value: 'btp' },
        { id: 'bj', label: 'BJ', value: 'bj' },
        { id: 'bs', label: 'BS', value: 'bs' },
        { id: 'bme', label: 'BME', value: 'bme' },
        { id: 'all', label: 'Tous', value: 'all' },
      ],
    },
    {
      id: 'category',
      label: 'Catégorie',
      icon: Tag,
      options: [
        { id: 'performance', label: 'Performance', value: 'performance' },
        { id: 'financial', label: 'Financier', value: 'financial' },
        { id: 'operational', label: 'Opérationnel', value: 'operational' },
        { id: 'strategic', label: 'Stratégique', value: 'strategic' },
      ],
    },
    {
      id: 'status',
      label: 'Statut',
      icon: TrendingUp,
      options: [
        { id: 'success', label: 'OK', value: 'success' },
        { id: 'warning', label: 'Attention', value: 'warning' },
        { id: 'critical', label: 'Critique', value: 'critical' },
        { id: 'neutral', label: 'Neutre', value: 'neutral' },
      ],
    },
  ];

  const toggleFilter = (sectionId: string, optionValue: string) => {
    setSelectedFilters((prev) => {
      const current = prev[sectionId] || [];
      const isSelected = current.includes(optionValue);

      return {
        ...prev,
        [sectionId]: isSelected
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue],
      };
    });
  };

  const clearSection = (sectionId: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [sectionId]: [],
    }));
  };

  const clearAll = () => {
    setSelectedFilters({
      period: [],
      bureau: [],
      category: [],
      status: [],
    });
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onClose();
  };

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (acc, filters) => acc + filters.length,
    0
  );

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
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filterSections.map((section) => {
            const Icon = section.icon;
            const sectionFilters = selectedFilters[section.id] || [];

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
                      onClick={() => clearSection(section.id)}
                      className="h-6 text-xs text-slate-500 hover:text-slate-300"
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
                        onClick={() => toggleFilter(section.id, option.value)}
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
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
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

