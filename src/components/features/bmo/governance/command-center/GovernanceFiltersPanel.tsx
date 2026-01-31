/**
 * GovernanceFiltersPanel
 * Panneau de filtres avancés pour Gouvernance
 * Aligné avec AnalyticsFiltersPanel et CalendrierFiltersPanel
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  X,
  Filter,
  Calendar,
  Users,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FolderKanban,
  DollarSign,
  RotateCcw,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: FilterOption[];
}

interface GovernanceFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: Record<string, string[]>) => void;
}

export function GovernanceFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
}: GovernanceFiltersPanelProps) {
  const { filters, setFilter, resetFilters } = useGovernanceCommandCenterStore();
  
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    period: [],
    projects: [],
    priorities: [],
    statuses: [],
    teams: [],
    categories: [],
  });

  // Initialiser depuis le store
  useEffect(() => {
    if (isOpen) {
      setSelectedFilters({
        period: filters.dateRange.start || filters.dateRange.end ? ['custom'] : [],
        projects: filters.projects || [],
        priorities: filters.priorities || [],
        statuses: filters.statuses || [],
        teams: filters.teams || [],
        categories: filters.categories || [],
      });
    }
  }, [isOpen, filters]);

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
      id: 'projects',
      label: 'Projets',
      icon: FolderKanban,
      options: [
        { id: 'proj-1', label: 'Projet Alpha', value: 'proj-1' },
        { id: 'proj-2', label: 'Projet Beta', value: 'proj-2' },
        { id: 'proj-3', label: 'Projet Gamma', value: 'proj-3' },
        { id: 'proj-4', label: 'Projet Delta', value: 'proj-4' },
      ],
    },
    {
      id: 'priorities',
      label: 'Priorités',
      icon: AlertTriangle,
      options: [
        { id: 'critical', label: 'Critique', value: 'critical' },
        { id: 'high', label: 'Élevée', value: 'high' },
        { id: 'medium', label: 'Moyenne', value: 'medium' },
        { id: 'low', label: 'Basse', value: 'low' },
      ],
    },
    {
      id: 'statuses',
      label: 'Statuts',
      icon: CheckCircle2,
      options: [
        { id: 'on-track', label: 'En bonne voie', value: 'on-track' },
        { id: 'at-risk', label: 'À risque', value: 'at-risk' },
        { id: 'late', label: 'En retard', value: 'late' },
        { id: 'blocked', label: 'Bloqué', value: 'blocked' },
        { id: 'completed', label: 'Terminé', value: 'completed' },
      ],
    },
    {
      id: 'teams',
      label: 'Équipes',
      icon: Users,
      options: [
        { id: 'team-1', label: 'Équipe Chantier Alpha', value: 'team-1' },
        { id: 'team-2', label: 'Équipe Chantier Beta', value: 'team-2' },
        { id: 'team-3', label: 'Équipe Support', value: 'team-3' },
        { id: 'team-4', label: 'Direction', value: 'team-4' },
      ],
    },
    {
      id: 'categories',
      label: 'Catégories',
      icon: Tag,
      options: [
        { id: 'budget', label: 'Budget', value: 'budget' },
        { id: 'planning', label: 'Planning', value: 'planning' },
        { id: 'contract', label: 'Contrat', value: 'contract' },
        { id: 'scope', label: 'Périmètre', value: 'scope' },
        { id: 'hr', label: 'RH', value: 'hr' },
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

  const handleApply = () => {
    // Appliquer les filtres au store
    setFilter('projects', selectedFilters.projects);
    setFilter('priorities', selectedFilters.priorities as any);
    setFilter('statuses', selectedFilters.statuses);
    setFilter('teams', selectedFilters.teams);
    setFilter('categories', selectedFilters.categories);

    // Gérer la période
    if (selectedFilters.period.includes('custom')) {
      // TODO: Ouvrir date picker pour période personnalisée
    } else if (selectedFilters.period.length > 0) {
      const period = selectedFilters.period[0];
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = now;

      switch (period) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          start = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          start = new Date(now.setMonth(now.getMonth() - 3));
          break;
        case 'year':
          start = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      setFilter('dateRange', { start, end });
    } else {
      setFilter('dateRange', { start: null, end: null });
    }

    // Callback optionnel
    if (onApplyFilters) {
      onApplyFilters(selectedFilters);
    }

    onClose();
  };

  const handleReset = () => {
    resetFilters();
    setSelectedFilters({
      period: [],
      projects: [],
      priorities: [],
      statuses: [],
      teams: [],
      categories: [],
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).flat().length;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-200">Filtres avancés</h3>
            {getActiveFiltersCount() > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                {getActiveFiltersCount()}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filterSections.map((section) => {
            const Icon = section.icon;
            const selected = selectedFilters[section.id] || [];
            const hasSelection = selected.length > 0;

            return (
              <div key={section.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-medium text-slate-300">{section.label}</h4>
                  {hasSelection && (
                    <Badge variant="default" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                      {selected.length}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {section.options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return (
                      <label
                        key={option.id}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors',
                          isSelected
                            ? 'bg-blue-500/10 border border-blue-500/30'
                            : 'bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800/70'
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleFilter(section.id, option.value)}
                        />
                        <span className={cn(
                          'text-sm flex-1',
                          isSelected ? 'text-slate-200' : 'text-slate-400'
                        )}>
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleReset}
              className="flex-1 border-slate-700 text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              Réinitialiser
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Appliquer
            </Button>
          </div>
          {getActiveFiltersCount() > 0 && (
            <p className="text-xs text-slate-400 text-center">
              {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''} actif{getActiveFiltersCount() > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

