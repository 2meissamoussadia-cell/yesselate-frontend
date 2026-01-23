/**
 * AuditFiltersPanel
 * Panneau de filtres avancés pour Audit
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
  Shield,
  AlertTriangle,
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
  icon: React.ComponentType<{ className?: string }>;
  options: FilterOption[];
}

interface AuditFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: Record<string, string[]>) => void;
}

export function AuditFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
}: AuditFiltersPanelProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    period: [],
    severity: [],
    type: [],
    module: [],
    user: [],
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
      id: 'severity',
      label: 'Sévérité',
      icon: AlertTriangle,
      options: [
        { id: 'critical', label: 'Critique', value: 'critical' },
        { id: 'high', label: 'Élevée', value: 'high' },
        { id: 'medium', label: 'Moyenne', value: 'medium' },
        { id: 'low', label: 'Faible', value: 'low' },
      ],
    },
    {
      id: 'type',
      label: 'Type',
      icon: Shield,
      options: [
        { id: 'security', label: 'Sécurité', value: 'security' },
        { id: 'compliance', label: 'Conformité', value: 'compliance' },
        { id: 'system', label: 'Système', value: 'system' },
        { id: 'user', label: 'Utilisateur', value: 'user' },
        { id: 'data', label: 'Données', value: 'data' },
      ],
    },
    {
      id: 'module',
      label: 'Module',
      icon: Tag,
      options: [
        { id: 'validation-bc', label: 'Validation BC', value: 'validation-bc' },
        { id: 'validation-contrats', label: 'Validation Contrats', value: 'validation-contrats' },
        { id: 'validation-paiements', label: 'Validation Paiements', value: 'validation-paiements' },
        { id: 'finances', label: 'Finances', value: 'finances' },
        { id: 'rh', label: 'RH', value: 'rh' },
        { id: 'system', label: 'Système', value: 'system' },
      ],
    },
    {
      id: 'user',
      label: 'Utilisateur',
      icon: Users,
      options: [
        { id: 'all', label: 'Tous', value: 'all' },
        { id: 'system', label: 'Système', value: 'system' },
        { id: 'admin', label: 'Administrateur', value: 'admin' },
      ],
    },
    {
      id: 'status',
      label: 'Statut',
      icon: CheckCircle2,
      options: [
        { id: 'new', label: 'Nouveau', value: 'new' },
        { id: 'in-progress', label: 'En cours', value: 'in-progress' },
        { id: 'resolved', label: 'Résolu', value: 'resolved' },
        { id: 'archived', label: 'Archivé', value: 'archived' },
      ],
    },
  ];

  const toggleFilter = (sectionId: string, optionId: string) => {
    setSelectedFilters((prev) => {
      const current = prev[sectionId] || [];
      const newFilters = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      return {
        ...prev,
        [sectionId]: newFilters,
      };
    });
  };

  const handleReset = () => {
    setSelectedFilters({
      period: [],
      severity: [],
      type: [],
      module: [],
      user: [],
      status: [],
    });
  };

  const handleApply = () => {
    onApplyFilters(selectedFilters);
    onClose();
  };

  const activeFiltersCount = Object.values(selectedFilters).reduce(
    (sum, filters) => sum + filters.length,
    0
  );

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
            <Filter className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-medium text-slate-200">Filtres avancés</h3>
            {activeFiltersCount > 0 && (
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                {activeFiltersCount}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {filterSections.map((section) => {
            const Icon = section.icon;
            const selected = selectedFilters[section.id] || [];

            return (
              <div key={section.id}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <h4 className="text-sm font-semibold text-slate-300">{section.label}</h4>
                  {selected.length > 0 && (
                    <Badge variant="gray" className="h-4 px-1.5 text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {selected.length}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.options.map((option) => {
                    const isSelected = selected.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleFilter(section.id, option.id)}
                        className={cn(
                          'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-slate-300'
                        )}
                      >
                        {option.label}
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
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
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








