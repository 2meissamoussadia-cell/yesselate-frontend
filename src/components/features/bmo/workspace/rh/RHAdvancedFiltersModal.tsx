'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Filter, X, Save, RotateCcw } from 'lucide-react';

export type RHFilters = {
  types: string[];
  statuses: string[];
  priorities: string[];
  bureaux: string[];
  dateRange: { start: string; end: string };
  amountRange: { min: number; max: number };
  daysRange: { min: number; max: number };
  hasDocuments: boolean | null;
  requiresSubstitution: boolean | null;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: RHFilters;
  onApply: (filters: RHFilters) => void;
  onReset: () => void;
};

const DEFAULT_FILTERS: RHFilters = {
  types: [],
  statuses: [],
  priorities: [],
  bureaux: [],
  dateRange: { start: '', end: '' },
  amountRange: { min: 0, max: 10000000 },
  daysRange: { min: 0, max: 365 },
  hasDocuments: null,
  requiresSubstitution: null,
};

export function RHAdvancedFiltersModal({ open, onOpenChange, filters, onApply, onReset }: Props) {
  const [localFilters, setLocalFilters] = useState<RHFilters>(filters);

  const toggleArrayFilter = (key: keyof Pick<RHFilters, 'types' | 'statuses' | 'priorities' | 'bureaux'>, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onOpenChange(false);
  };

  const handleReset = () => {
    setLocalFilters(DEFAULT_FILTERS);
    onReset();
  };

  const activeFiltersCount = [
    localFilters.types.length,
    localFilters.statuses.length,
    localFilters.priorities.length,
    localFilters.bureaux.length,
    localFilters.dateRange.start ? 1 : 0,
    localFilters.amountRange.min > 0 || localFilters.amountRange.max < 10000000 ? 1 : 0,
    localFilters.daysRange.min > 0 || localFilters.daysRange.max < 365 ? 1 : 0,
    localFilters.hasDocuments !== null ? 1 : 0,
    localFilters.requiresSubstitution !== null ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <FluentModal
      open={open}
      title="Filtres avancés"
      onClose={() => onOpenChange(false)}
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Type de demande */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📝 Type de demande
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {['Congé', 'Dépense', 'Maladie', 'Déplacement', 'Paie'].map(type => {
              const isActive = localFilters.types.includes(type);
              const icons: Record<string, string> = {
                Congé: '🏖️',
                Dépense: '💸',
                Maladie: '🏥',
                Déplacement: '✈️',
                Paie: '💰',
              };
              
              return (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter('types', type)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all",
                    isActive
                      ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  {icons[type]} {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Statut */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            🔄 Statut
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'pending', label: '⏳ En attente' },
              { value: 'validated', label: '✅ Validées' },
              { value: 'rejected', label: '❌ Rejetées' },
            ].map(({ value, label }) => {
              const isActive = localFilters.statuses.includes(value);
              
              return (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('statuses', value)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all",
                    isActive
                      ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priorité */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            ⚡ Priorité
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'urgent', label: '🔥 Urgent' },
              { value: 'high', label: '⚠️ Haute' },
              { value: 'normal', label: 'ℹ️ Normale' },
            ].map(({ value, label }) => {
              const isActive = localFilters.priorities.includes(value);
              
              return (
                <button
                  key={value}
                  onClick={() => toggleArrayFilter('priorities', value)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all",
                    isActive
                      ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bureau */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            🏢 Bureau
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {['BA', 'BM', 'BCT', 'BJ', 'BF'].map(bureau => {
              const isActive = localFilters.bureaux.includes(bureau);
              
              return (
                <button
                  key={bureau}
                  onClick={() => toggleArrayFilter('bureaux', bureau)}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 transition-all font-semibold",
                    isActive
                      ? "border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  {bureau}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plage de dates */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            📅 Plage de dates
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Date début</label>
              <input
                type="date"
                value={localFilters.dateRange.start}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Date fin</label>
              <input
                type="date"
                value={localFilters.dateRange.end}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        </div>

        {/* Montant */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            💰 Montant (FCFA)
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Minimum</label>
              <input
                type="number"
                value={localFilters.amountRange.min}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, min: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Maximum</label>
              <input
                type="number"
                value={localFilters.amountRange.max}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  amountRange: { ...prev.amountRange, max: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        </div>

        {/* Durée (jours) */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            ⏱️ Durée (jours)
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Minimum</label>
              <input
                type="number"
                value={localFilters.daysRange.min}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  daysRange: { ...prev.daysRange, min: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Maximum</label>
              <input
                type="number"
                value={localFilters.daysRange.max}
                onChange={(e) => setLocalFilters(prev => ({
                  ...prev,
                  daysRange: { ...prev.daysRange, max: Number(e.target.value) }
                }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        </div>

        {/* Options avancées */}
        <div>
          <h3 className="font-semibold mb-3">Options</h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm">Documents joints:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, hasDocuments: true }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm border transition-all",
                    localFilters.hasDocuments === true
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  Oui
                </button>
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, hasDocuments: false }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm border transition-all",
                    localFilters.hasDocuments === false
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  Non
                </button>
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, hasDocuments: null }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm border transition-all",
                    localFilters.hasDocuments === null
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  Tous
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">Substitution requise:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, requiresSubstitution: true }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm border transition-all",
                    localFilters.requiresSubstitution === true
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  Oui
                </button>
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, requiresSubstitution: false }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm border transition-all",
                    localFilters.requiresSubstitution === false
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  Non
                </button>
                <button
                  onClick={() => setLocalFilters(prev => ({ ...prev, requiresSubstitution: null }))}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm border transition-all",
                    localFilters.requiresSubstitution === null
                      ? "border-orange-500 bg-orange-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  )}
                >
                  Tous
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="bg-orange-500">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Réinitialiser
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            
            <Button
              variant="default"
              onClick={handleApply}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </FluentModal>
  );
}

