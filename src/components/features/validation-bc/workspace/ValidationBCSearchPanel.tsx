'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';

interface ValidationBCSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  query: string;
  bureau?: string;
  type?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function ValidationBCSearchPanel({ isOpen, onClose, onSearch }: ValidationBCSearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
  });

  const handleReset = () => {
    setFilters({ query: '' });
  };

  const handleApply = () => {
    onSearch(filters);
    onClose();
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.bureau) count++;
    if (filters.type) count++;
    if (filters.status) count++;
    if (filters.minAmount) count++;
    if (filters.maxAmount) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl mt-20 mb-20">
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#1f1f1f]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold">Recherche avancée</h3>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500 text-white">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Recherche textuelle */}
            <div>
              <label className="block text-sm font-medium mb-2">Recherche globale</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="ID, fournisseur, objet..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90 outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>
            </div>

            {/* Filtres en grille */}
            <div className="grid grid-cols-2 gap-4">
              {/* Bureau */}
              <div>
                <label className="block text-sm font-medium mb-2">Bureau</label>
                <Select
                  value={filters.bureau ?? '__all__'}
                  onValueChange={(v) => setFilters({ ...filters, bureau: v === '__all__' ? undefined : v })}
                >
                  <SelectTrigger className="w-full h-10 rounded-lg border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#141414]/70 text-sm focus:ring-2 focus:ring-purple-400/30">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f1f]">
                    <SelectItem value="__all__">Tous</SelectItem>
                    <SelectItem value="DRE">DRE</SelectItem>
                    <SelectItem value="DAAF">DAAF</SelectItem>
                    <SelectItem value="DSI">DSI</SelectItem>
                    <SelectItem value="DG">DG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <Select
                  value={filters.type ?? '__all__'}
                  onValueChange={(v) => setFilters({ ...filters, type: v === '__all__' ? undefined : v })}
                >
                  <SelectTrigger className="w-full h-10 rounded-lg border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#141414]/70 text-sm focus:ring-2 focus:ring-purple-400/30">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f1f]">
                    <SelectItem value="__all__">Tous</SelectItem>
                    <SelectItem value="bc">Bon de commande</SelectItem>
                    <SelectItem value="facture">Facture</SelectItem>
                    <SelectItem value="avenant">Avenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium mb-2">Statut</label>
                <Select
                  value={filters.status ?? '__all__'}
                  onValueChange={(v) => setFilters({ ...filters, status: v === '__all__' ? undefined : v })}
                >
                  <SelectTrigger className="w-full h-10 rounded-lg border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#141414]/70 text-sm focus:ring-2 focus:ring-purple-400/30">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f1f]">
                    <SelectItem value="__all__">Tous</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="validated">Validé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                    <SelectItem value="anomaly">Anomalie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Montant min */}
              <div>
                <label className="block text-sm font-medium mb-2">Montant min (FCFA)</label>
                <input
                  type="number"
                  value={filters.minAmount || ''}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>

              {/* Montant max */}
              <div>
                <label className="block text-sm font-medium mb-2">Montant max (FCFA)</label>
                <input
                  type="number"
                  value={filters.maxAmount || ''}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="∞"
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>

              {/* Date from */}
              <div>
                <label className="block text-sm font-medium mb-2">Date de début</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>

              {/* Date to */}
              <div>
                <label className="block text-sm font-medium mb-2">Date de fin</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                  className="w-full rounded-lg border border-slate-200/70 bg-white/90 p-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
            <FluentButton size="sm" variant="secondary" onClick={handleReset}>
              Réinitialiser
            </FluentButton>
            <div className="flex gap-2">
              <FluentButton size="sm" variant="secondary" onClick={onClose}>
                Annuler
              </FluentButton>
              <FluentButton size="sm" variant="primary" onClick={handleApply}>
                <Filter className="w-4 h-4 mr-2" />
                Appliquer
              </FluentButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

