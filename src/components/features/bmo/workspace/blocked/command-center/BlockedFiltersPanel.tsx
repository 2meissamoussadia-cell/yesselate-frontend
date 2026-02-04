/**
 * BlockedFiltersPanel
 * Panneau de filtres avancés pour Dossiers Bloqués
 * Architecture identique à PaiementsFiltersPanel et AnalyticsFiltersPanel
 * Harmonisation complète V2.3
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
  Building2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  RotateCcw,
} from 'lucide-react';

// Type harmonisé avec le store
export interface BlockedActiveFilters {
  impact: ('critical' | 'high' | 'medium' | 'low')[];
  bureaux: string[];
  types: string[];
  status: ('pending' | 'escalated' | 'resolved' | 'substituted')[];
  delayRange: { min?: number; max?: number };
  amountRange: { min?: number; max?: number };
  dateRange?: { start: string; end: string };
  search?: string;
  slaBreached?: boolean;
  assignedTo?: string[];
  tags?: string[];
}

interface BlockedFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: BlockedActiveFilters) => void;
  currentFilters?: BlockedActiveFilters;
}

const defaultFilters: BlockedActiveFilters = {
  impact: [],
  bureaux: [],
  types: [],
  status: [],
  delayRange: {},
  amountRange: {},
};

export function BlockedFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: BlockedFiltersPanelProps) {
  // State local pour les filtres en cours d'édition
  const [filters, setFilters] = useState<BlockedActiveFilters>(
    currentFilters || defaultFilters
  );

  // Sync avec currentFilters quand elles changent
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

  const countActiveFilters = () => {
    let count = 0;
    count += filters.impact?.length || 0;
    count += filters.bureaux?.length || 0;
    count += filters.types?.length || 0;
    count += filters.status?.length || 0;
    if (filters.delayRange?.min) count++;
    if (filters.delayRange?.max) count++;
    if (filters.amountRange?.min) count++;
    if (filters.amountRange?.max) count++;
    if (filters.dateRange?.start) count++;
    if (filters.dateRange?.end) count++;
    if (filters.search) count++;
    if (filters.slaBreached) count++;
    return count;
  };

  if (!isOpen) return null;

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
            <h3 className="text-sm font-semibold text-slate-200">
              Filtres Avancés
            </h3>
            {countActiveFilters() > 0 && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                {countActiveFilters()}
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
          {/* Impact */}
          <FilterSection title="Impact" icon="⚡">
            <div className="space-y-2">
              {[
                { value: 'critical', label: 'Critique', color: 'text-red-400' },
                { value: 'high', label: 'Haute', color: 'text-amber-400' },
                { value: 'medium', label: 'Moyenne', color: 'text-blue-400' },
                { value: 'low', label: 'Basse', color: 'text-slate-400' },
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.impact.includes(value as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({
                          ...f,
                          impact: [...f.impact, value as any]
                        }));
                      } else {
                        setFilters(f => ({
                          ...f,
                          impact: f.impact.filter(i => i !== value)
                        }));
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
          <FilterSection title="Bureaux" icon="🏢">
            <div className="space-y-2">
              {['BF', 'BCG', 'BJA', 'BOP', 'BRH', 'BTP', 'BJ', 'BS'].map((bureau) => (
                <label key={bureau} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.bureaux.includes(bureau)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({ ...f, bureaux: [...f.bureaux, bureau] }));
                      } else {
                        setFilters(f => ({ ...f, bureaux: f.bureaux.filter(b => b !== bureau) }));
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

          {/* Type de blocage */}
          <FilterSection title="Type de blocage" icon="🏷️">
            <div className="space-y-2">
              {[
                'Juridique',
                'Administratif',
                'Technique',
                'Financier',
                'Contractuel',
                'RH',
                'Décision',
                'Validation',
              ].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({ ...f, types: [...f.types, type] }));
                      } else {
                        setFilters(f => ({ ...f, types: f.types.filter(t => t !== type) }));
                      }
                    }}
                    className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Statut */}
          <FilterSection title="Statut" icon="📊">
            <div className="space-y-2">
              {[
                { value: 'pending', label: 'En attente', color: 'text-amber-400' },
                { value: 'escalated', label: 'Escaladé', color: 'text-red-400' },
                { value: 'resolved', label: 'Résolu', color: 'text-emerald-400' },
                { value: 'substituted', label: 'Substitué', color: 'text-blue-400' },
              ].map(({ value, label, color }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(value as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({ ...f, status: [...f.status, value as any] }));
                      } else {
                        setFilters(f => ({ ...f, status: f.status.filter(s => s !== value) }));
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

          {/* Délai (jours) */}
          <FilterSection title="Délai (jours)" icon="⏱️">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Minimum</label>
                <input
                  type="number"
                  min="0"
                  value={filters.delayRange.min || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, delayRange: { ...filters.delayRange, min: e.target.value ? parseInt(e.target.value) : undefined } })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Maximum</label>
                <input
                  type="number"
                  min="0"
                  value={filters.delayRange.max || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, delayRange: { ...filters.delayRange, max: e.target.value ? parseInt(e.target.value) : undefined } })
                  }
                  placeholder="∞"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </FilterSection>

          {/* Montant */}
          <FilterSection title="Montant (FCFA)" icon="💰">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Minimum</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.amountRange?.min || ''}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    amountRange: { ...f.amountRange, min: Number(e.target.value) || undefined }
                  }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Maximum</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.amountRange?.max || ''}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    amountRange: { ...f.amountRange, max: Number(e.target.value) || undefined }
                  }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </FilterSection>

          {/* Période de création */}
          <FilterSection title="Période de création" icon="📅">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Du</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value || undefined } as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Au</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value || undefined } as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </FilterSection>

          {/* SLA Dépassé */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.slaBreached || false}
                onChange={(e) => setFilters({ ...filters, slaBreached: e.target.checked || undefined })}
                className="rounded border-slate-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">SLA dépassé uniquement</span>
            </label>
          </div>

          {/* Recherche textuelle */}
          <FilterSection title="Recherche" icon="🔍">
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
              placeholder="Référence, sujet, description..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </FilterSection>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/50 space-y-3">
          {/* Active Filters Count */}
          {countActiveFilters() > 0 && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Filter className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">
                {countActiveFilters()} filtre{countActiveFilters() > 1 ? 's' : ''} actif{countActiveFilters() > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 gap-2 border-slate-700 hover:bg-slate-800"
              disabled={countActiveFilters() === 0}
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Filter className="h-3 w-3" />
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Component: Filter Section
function FilterSection({ 
  title, 
  icon, 
  children 
}: { 
  title: string; 
  icon: string; 
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h4 className="text-sm font-medium text-slate-300">{title}</h4>
      </div>
      {children}
    </div>
  );
}

// Helper: Count active filters
export function countActiveFiltersUtil(filters: BlockedActiveFilters): number {
  let count = 0;
  count += filters.impact?.length || 0;
  count += filters.bureaux?.length || 0;
  count += filters.types?.length || 0;
  count += filters.status?.length || 0;
  if (filters.delayRange?.min) count++;
  if (filters.delayRange?.max) count++;
  if (filters.amountRange?.min) count++;
  if (filters.amountRange?.max) count++;
  if (filters.dateRange?.start) count++;
  if (filters.dateRange?.end) count++;
  if (filters.search) count++;
  if (filters.slaBreached) count++;
  return count;
}
