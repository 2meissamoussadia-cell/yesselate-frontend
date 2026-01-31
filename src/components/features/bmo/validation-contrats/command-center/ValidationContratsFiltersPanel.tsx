/**
 * Panel de filtres avancés pour Validation Contrats
 * Inspiré de AnalyticsFiltersPanel - Architecture cohérente
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Filter,
  X,
  Calendar,
  DollarSign,
  Building2,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export interface ValidationContratsFilters {
  status: ('pending' | 'validated' | 'rejected' | 'negotiation' | 'expired' | 'signed')[];
  urgency: ('critical' | 'high' | 'medium' | 'low')[];
  type: ('service' | 'fourniture' | 'travaux' | 'prestation' | 'maintenance' | 'location')[];
  montantRange: {
    min: number;
    max: number;
  };
  dureeRange: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  bureau: string[];
  fournisseur: string;
  validations: {
    juridique?: boolean;
    technique?: boolean;
    financier?: boolean;
    direction?: boolean;
  };
  clausesStatus: ('ok' | 'warning' | 'ko')[];
}

interface ValidationContratsFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ValidationContratsFilters) => void;
  currentFilters?: ValidationContratsFilters;
}

const defaultFilters: ValidationContratsFilters = {
  status: [],
  urgency: [],
  type: [],
  montantRange: { min: 0, max: 0 },
  dureeRange: { min: 0, max: 0 },
  dateRange: { start: '', end: '' },
  bureau: [],
  fournisseur: '',
  validations: {},
  clausesStatus: [],
};

export function ValidationContratsFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: ValidationContratsFiltersPanelProps) {
  const [filters, setFilters] = useState<ValidationContratsFilters>(
    currentFilters || defaultFilters
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    count += filters.status.length;
    count += filters.urgency.length;
    count += filters.type.length;
    count += filters.bureau.length;
    count += filters.clausesStatus.length;
    if (filters.montantRange.min > 0 || filters.montantRange.max > 0) count++;
    if (filters.dureeRange.min > 0 || filters.dureeRange.max > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.fournisseur) count++;
    count += Object.values(filters.validations).filter(Boolean).length;
    return count;
  }, [filters]);

  const toggleArrayFilter = <K extends keyof ValidationContratsFilters>(
    key: K,
    value: string
  ) => {
    const currentArray = filters[key] as string[];
    setFilters({
      ...filters,
      [key]: currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value],
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
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
          {/* Statut */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="h-4 w-4 text-purple-400" />
              Statut
            </Label>
            <div className="space-y-2">
              {[
                { value: 'pending', label: 'En attente', color: 'amber' },
                { value: 'negotiation', label: 'Négociation', color: 'blue' },
                { value: 'validated', label: 'Validé', color: 'emerald' },
                { value: 'rejected', label: 'Rejeté', color: 'red' },
                { value: 'expired', label: 'Expiré', color: 'slate' },
                { value: 'signed', label: 'Signé', color: 'emerald' },
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(value as any)}
                    onChange={() => toggleArrayFilter('status', value)}
                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Urgence */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-300">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              Urgence
            </Label>
            <div className="space-y-2">
              {[
                { value: 'critical', label: 'Critique', color: 'red' },
                { value: 'high', label: 'Haute', color: 'amber' },
                { value: 'medium', label: 'Moyenne', color: 'blue' },
                { value: 'low', label: 'Basse', color: 'slate' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.urgency.includes(value as any)}
                    onChange={() => toggleArrayFilter('urgency', value)}
                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-300">
              <Building2 className="h-4 w-4 text-purple-400" />
              Type de contrat
            </Label>
            <div className="space-y-2">
              {[
                { value: 'service', label: 'Service' },
                { value: 'fourniture', label: 'Fourniture' },
                { value: 'travaux', label: 'Travaux' },
                { value: 'prestation', label: 'Prestation' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'location', label: 'Location' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.type.includes(value as any)}
                    onChange={() => toggleArrayFilter('type', value)}
                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Montant */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-300">
              <DollarSign className="h-4 w-4 text-purple-400" />
              Montant (FCFA)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.montantRange.min || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      montantRange: { ...filters.montantRange, min: Number(e.target.value) },
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.montantRange.max || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      montantRange: { ...filters.montantRange, max: Number(e.target.value) },
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Durée */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-purple-400" />
              Durée (mois)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.dureeRange.min || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dureeRange: { ...filters.dureeRange, min: Number(e.target.value) },
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.dureeRange.max || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dureeRange: { ...filters.dureeRange, max: Number(e.target.value) },
                    })
                  }
                  className="bg-slate-800 border-slate-700 text-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Période */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-300">
              <Calendar className="h-4 w-4 text-purple-400" />
              Période de réception
            </Label>
            <div className="space-y-2">
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, start: e.target.value },
                  })
                }
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: { ...filters.dateRange, end: e.target.value },
                  })
                }
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
          </div>

          {/* Bureau */}
          <div className="space-y-2">
            <Label className="text-slate-300">Bureau</Label>
            <div className="space-y-2">
              {['DT', 'DAF', 'DS', 'DRHT'].map((value) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.bureau.includes(value)}
                    onChange={() => toggleArrayFilter('bureau', value)}
                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {value}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Fournisseur */}
          <div className="space-y-2">
            <Label className="text-slate-300">Fournisseur</Label>
            <Input
              type="text"
              placeholder="Rechercher un fournisseur..."
              value={filters.fournisseur}
              onChange={(e) => setFilters({ ...filters, fournisseur: e.target.value })}
              className="bg-slate-800 border-slate-700 text-slate-200"
            />
          </div>

          {/* Validations */}
          <div className="space-y-2">
            <Label className="text-slate-300">Validations</Label>
            <div className="space-y-2">
              {[
                { key: 'juridique', label: 'Juridique' },
                { key: 'technique', label: 'Technique' },
                { key: 'financier', label: 'Financier' },
                { key: 'direction', label: 'Direction' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.validations[key as keyof typeof filters.validations] || false}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        validations: {
                          ...filters.validations,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-2">
            <Label className="text-slate-300">État des clauses</Label>
            <div className="space-y-2">
              {[
                { value: 'ok', label: 'OK', color: 'emerald' },
                { value: 'warning', label: 'Attention', color: 'amber' },
                { value: 'ko', label: 'KO', color: 'red' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.clausesStatus.includes(value as any)}
                    onChange={() => toggleArrayFilter('clausesStatus', value)}
                    className="rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/50 space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              Réinitialiser
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
            >
              Appliquer
            </Button>
          </div>

          {activeFilterCount > 0 && (
            <p className="text-xs text-center text-slate-400">
              {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif
              {activeFilterCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

