/**
 * Panneau de Filtres Avancés pour Validation Paiements
 * Inspiré d'Analytics - Filtres multi-critères
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Filter,
  Trash2,
  Save,
  RotateCcw,
} from 'lucide-react';

export interface PaiementsActiveFilters {
  urgency: ('critical' | 'high' | 'medium' | 'low')[];
  bureaux: string[];
  types: ('facture' | 'acompte' | 'solde' | 'avance' | 'retenue' | 'avoir')[];
  status: ('pending' | 'validated' | 'rejected' | 'scheduled' | 'paid' | 'blocked')[];
  amountRange: { min?: number; max?: number };
  dateRange?: { start: string; end: string };
  fournisseurs?: string[];
  responsables?: string[];
}

interface PaiementsFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: PaiementsActiveFilters) => void;
  currentFilters?: PaiementsActiveFilters;
}

const defaultFilters: PaiementsActiveFilters = {
  urgency: [],
  bureaux: [],
  types: [],
  status: [],
  amountRange: {},
};

export function PaiementsFiltersPanel({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: PaiementsFiltersPanelProps) {
  const [filters, setFilters] = useState<PaiementsActiveFilters>(
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
    count += filters.urgency.length;
    count += filters.bureaux.length;
    count += filters.types.length;
    count += filters.status.length;
    if (filters.amountRange.min) count++;
    if (filters.amountRange.max) count++;
    if (filters.dateRange?.start) count++;
    if (filters.dateRange?.end) count++;
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
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 shadow-2xl z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Filtres Avancés
            </h3>
            {countActiveFilters() > 0 && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Urgence */}
          <FilterSection title="Urgence" icon="⚡">
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
                    checked={filters.urgency.includes(value as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({
                          ...f,
                          urgency: [...f.urgency, value as any]
                        }));
                      } else {
                        setFilters(f => ({
                          ...f,
                          urgency: f.urgency.filter(u => u !== value)
                        }));
                      }
                    }}
                    className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
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
              {['DF', 'DG', 'DAF', 'DS', 'DRHT'].map((bureau) => (
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
                    className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {bureau}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Types de Paiement */}
          <FilterSection title="Types de Paiement" icon="💳">
            <div className="space-y-2">
              {[
                { value: 'facture', label: 'Facture' },
                { value: 'acompte', label: 'Acompte' },
                { value: 'solde', label: 'Solde' },
                { value: 'avance', label: 'Avance' },
                { value: 'retenue', label: 'Retenue' },
                { value: 'avoir', label: 'Avoir' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(value as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilters(f => ({ ...f, types: [...f.types, value as any] }));
                      } else {
                        setFilters(f => ({ ...f, types: f.types.filter(t => t !== value) }));
                      }
                    }}
                    className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                    {label}
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
                { value: 'validated', label: 'Validé', color: 'text-emerald-400' },
                { value: 'rejected', label: 'Rejeté', color: 'text-red-400' },
                { value: 'scheduled', label: 'Planifié', color: 'text-blue-400' },
                { value: 'paid', label: 'Payé', color: 'text-emerald-500' },
                { value: 'blocked', label: 'Bloqué', color: 'text-red-500' },
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
                    className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className={cn('text-sm', color, 'group-hover:text-slate-200 transition-colors')}>
                    {label}
                  </span>
                </label>
              ))}
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
                  value={filters.amountRange.min || ''}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    amountRange: { ...f.amountRange, min: Number(e.target.value) || undefined }
                  }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Maximum</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.amountRange.max || ''}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    amountRange: { ...f.amountRange, max: Number(e.target.value) || undefined }
                  }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </FilterSection>

          {/* Période */}
          <FilterSection title="Période" icon="📅">
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Date de début</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    dateRange: { ...f.dateRange, start: e.target.value } as any
                  }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Date de fin</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    dateRange: { ...f.dateRange, end: e.target.value } as any
                  }))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/50 space-y-3">
          {/* Active Filters Count */}
          {countActiveFilters() > 0 && (
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Filter className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">
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
              className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
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
export function countActiveFiltersUtil(filters: PaiementsActiveFilters): number {
  let count = 0;
  count += filters.urgency?.length || 0;
  count += filters.bureaux?.length || 0;
  count += filters.types?.length || 0;
  count += filters.status?.length || 0;
  if (filters.amountRange?.min) count++;
  if (filters.amountRange?.max) count++;
  if (filters.dateRange?.start) count++;
  if (filters.dateRange?.end) count++;
  return count;
}

