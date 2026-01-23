/**
 * EvaluationsFiltersPanel
 * Panneau de filtres avancés pour les évaluations
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, Calendar, Users, Target, CheckCircle2, AlertTriangle, Clock, Search } from 'lucide-react';
import type { EvaluationsFilters } from '@/lib/services/evaluationsApiService';

export interface EvaluationsActiveFilters {
  status?: string[];
  bureaux?: string[];
  periods?: string[];
  evaluators?: string[];
  scoreMin?: number;
  scoreMax?: number;
  pendingRecsOnly?: boolean;
  dueSoonOnly?: boolean;
  overdueOnly?: boolean;
  dateRange?: {
    start?: string;
    end?: string;
  };
  search?: string;
}

const defaultFilters: EvaluationsActiveFilters = {
  status: [],
  bureaux: [],
  periods: [],
  evaluators: [],
  scoreMin: undefined,
  scoreMax: undefined,
  pendingRecsOnly: false,
  dueSoonOnly: false,
  overdueOnly: false,
  dateRange: {},
  search: '',
};

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FilterSection({ title, icon, children }: FilterSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
        {icon}
        <span>{title}</span>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

interface EvaluationsFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: EvaluationsActiveFilters) => void;
  currentFilters?: EvaluationsActiveFilters;
}

export function countActiveEvaluationsFilters(filters: EvaluationsActiveFilters): number {
  let count = 0;
  count += filters.status?.length || 0;
  count += filters.bureaux?.length || 0;
  count += filters.periods?.length || 0;
  count += filters.evaluators?.length || 0;
  if (filters.scoreMin !== undefined) count++;
  if (filters.scoreMax !== undefined) count++;
  if (filters.pendingRecsOnly) count++;
  if (filters.dueSoonOnly) count++;
  if (filters.overdueOnly) count++;
  if (filters.dateRange?.start) count++;
  if (filters.dateRange?.end) count++;
  if (filters.search) count++;
  return count;
}

export function EvaluationsFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: EvaluationsFiltersPanelProps) {
  const [filters, setFilters] = useState<EvaluationsActiveFilters>(
    currentFilters || defaultFilters
  );

  // Sync avec currentFilters quand ils changent
  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters]);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const activeCount = countActiveEvaluationsFilters(filters);

  if (!isOpen) return null;

  const bureaux = ['BF', 'BCG', 'BJA', 'BOP', 'BRH', 'BTP', 'BJ', 'BS'];
  const periods = ['2025-S1', '2025-S2', '2025-Annuel', '2024-Annuel', '2024-S2'];
  const evaluators = ['Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Bernard'];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 flex flex-col animate-slideInRight"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Filtres Avancés</h3>
            {activeCount > 0 && (
              <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                {activeCount}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Statut */}
          <FilterSection title="Statut" icon={<CheckCircle2 className="w-4 h-4 text-blue-400" />}>
            <div className="space-y-2">
              {[
                { value: 'scheduled', label: 'Planifiée', color: 'text-amber-400' },
                { value: 'in_progress', label: 'En cours', color: 'text-blue-400' },
                { value: 'completed', label: 'Complétée', color: 'text-emerald-400' },
                { value: 'cancelled', label: 'Annulée', color: 'text-red-400' },
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(value) || false}
                    onChange={(e) => {
                      const current = filters.status || [];
                      if (e.target.checked) {
                        setFilters({ ...filters, status: [...current, value] });
                      } else {
                        setFilters({ ...filters, status: current.filter(s => s !== value) });
                      }
                    }}
                    className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className={cn('text-sm', color, 'group-hover:text-slate-200 transition-colors')}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Bureaux */}
          <FilterSection title="Bureaux" icon={<Users className="w-4 h-4 text-purple-400" />}>
            <div className="space-y-2">
              {bureaux.map((bureau) => (
                <label key={bureau} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.bureaux?.includes(bureau) || false}
                    onChange={(e) => {
                      const current = filters.bureaux || [];
                      if (e.target.checked) {
                        setFilters({ ...filters, bureaux: [...current, bureau] });
                      } else {
                        setFilters({ ...filters, bureaux: current.filter(b => b !== bureau) });
                      }
                    }}
                    className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {bureau}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Périodes */}
          <FilterSection title="Période" icon={<Calendar className="w-4 h-4 text-green-400" />}>
            <div className="space-y-2">
              {periods.map((period) => (
                <label key={period} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.periods?.includes(period) || false}
                    onChange={(e) => {
                      const current = filters.periods || [];
                      if (e.target.checked) {
                        setFilters({ ...filters, periods: [...current, period] });
                      } else {
                        setFilters({ ...filters, periods: current.filter(p => p !== period) });
                      }
                    }}
                    className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {period}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Évaluateurs */}
          <FilterSection title="Évaluateur" icon={<Users className="w-4 h-4 text-indigo-400" />}>
            <div className="space-y-2">
              {evaluators.map((evaluator) => (
                <label key={evaluator} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.evaluators?.includes(evaluator) || false}
                    onChange={(e) => {
                      const current = filters.evaluators || [];
                      if (e.target.checked) {
                        setFilters({ ...filters, evaluators: [...current, evaluator] });
                      } else {
                        setFilters({ ...filters, evaluators: current.filter(e => e !== evaluator) });
                      }
                    }}
                    className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {evaluator}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Score */}
          <FilterSection title="Score Global" icon={<Target className="w-4 h-4 text-amber-400" />}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Score minimum</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreMin || ''}
                  onChange={(e) => setFilters({ ...filters, scoreMin: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Score maximum</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.scoreMax || ''}
                  onChange={(e) => setFilters({ ...filters, scoreMax: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>
            </div>
          </FilterSection>

          {/* Période de création */}
          <FilterSection title="Période de création" icon={<Calendar className="w-4 h-4 text-blue-400" />}>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Du</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value || undefined } })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Au</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value || undefined } })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </FilterSection>

          {/* Filtres spéciaux */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Filtres spéciaux</span>
            </div>
            <div className="pl-6 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.pendingRecsOnly || false}
                  onChange={(e) => setFilters({ ...filters, pendingRecsOnly: e.target.checked || undefined })}
                  className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400">Recommandations en attente uniquement</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.dueSoonOnly || false}
                  onChange={(e) => setFilters({ ...filters, dueSoonOnly: e.target.checked || undefined })}
                  className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400">Échéances proches (≤14j)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.overdueOnly || false}
                  onChange={(e) => setFilters({ ...filters, overdueOnly: e.target.checked || undefined })}
                  className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400">Échéances en retard</span>
              </label>
            </div>
          </div>

          {/* Recherche textuelle */}
          <FilterSection title="Recherche" icon={<Search className="w-4 h-4 text-blue-400" />}>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              placeholder="Nom, rôle, ID..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800/50 bg-slate-900/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Réinitialiser
          </Button>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Appliquer ({activeCount})
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

