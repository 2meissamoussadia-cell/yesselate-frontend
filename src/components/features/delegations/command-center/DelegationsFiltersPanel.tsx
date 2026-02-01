/**
 * Panneau de filtres avancés pour Délégations
 * Panneau latéral pour configurer les filtres
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
  Building2,
  Tag,
  Clock,
  Save,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { useDelegationsCommandCenterStore } from '@/lib/stores/delegationsCommandCenterStore';

const BUREAUX = ['BAGD', 'BAVM', 'BDI', 'BFEP', 'BRH', 'BSG', 'DBMO', 'Direction'];
const TYPES = ['temporary', 'permanent'];
const STATUSES = ['active', 'expired', 'revoked', 'suspended'];
const PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;

export function DelegationsFiltersPanel() {
  const { filters, savedFilters, setFilter, resetFilters, saveFilter, loadFilter, deleteFilter, closeModal } = useDelegationsCommandCenterStore();
  const [localFilters, setLocalFilters] = useState(filters);
  const [filterName, setFilterName] = useState('');

  const handleApply = () => {
    // Appliquer les filtres - mettre à jour le store directement
    // On utilise setFilter pour chaque clé individuellement
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key === 'dateRange') {
        setFilter('dateRange', value);
      } else if (key === 'bureaux') {
        setFilter('bureaux', value);
      } else if (key === 'types') {
        setFilter('types', value);
      } else if (key === 'statuses') {
        setFilter('statuses', value);
      } else if (key === 'priorities') {
        setFilter('priorities', value);
      } else if (key === 'tags') {
        setFilter('tags', value);
      } else if (key === 'customFilters') {
        setFilter('customFilters', value);
      }
    });
    closeModal();
  };

  const handleReset = () => {
    resetFilters();
    setLocalFilters({
      dateRange: { start: null, end: null },
      bureaux: [],
      types: [],
      statuses: [],
      priorities: [],
      tags: [],
      customFilters: {},
    });
  };

  const handleSave = () => {
    if (!filterName.trim()) return;
    saveFilter(filterName);
    setFilterName('');
  };

  const toggleArrayFilter = (key: 'bureaux' | 'types' | 'statuses' | 'priorities' | 'tags', value: string) => {
    setLocalFilters(prev => {
      const arr = prev[key] as readonly string[];
      const includes = arr.includes(value);
      return {
        ...prev,
        [key]: includes
          ? arr.filter(v => v !== value)
          : [...arr, value],
      } as typeof prev;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick={closeModal}>
      <div
        className="h-full w-full max-w-md bg-slate-900 border-l border-slate-700/50 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-slate-200">Filtres avancés</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={closeModal} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Date Range */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Période
            </label>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">De</label>
                <input
                  type="date"
                  value={localFilters.dateRange.start ? new Date(localFilters.dateRange.start).toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value ? new Date(e.target.value) : null },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">À</label>
                <input
                  type="date"
                  value={localFilters.dateRange.end ? new Date(localFilters.dateRange.end).toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setLocalFilters(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value ? new Date(e.target.value) : null },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Bureaux */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Bureaux
            </label>
            <div className="flex flex-wrap gap-2">
              {BUREAUX.map(bureau => (
                <Badge
                  key={bureau}
                  variant={localFilters.bureaux.includes(bureau) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    localFilters.bureaux.includes(bureau)
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                  )}
                  onClick={() => toggleArrayFilter('bureaux', bureau)}
                >
                  {bureau}
                </Badge>
              ))}
            </div>
          </div>

          {/* Types */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Types
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map(type => (
                <Badge
                  key={type}
                  variant={localFilters.types.includes(type) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors capitalize',
                    localFilters.types.includes(type)
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                  )}
                  onClick={() => toggleArrayFilter('types', type)}
                >
                  {type === 'temporary' ? 'Temporaire' : 'Permanent'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Statuts */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Statuts
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(status => (
                <Badge
                  key={status}
                  variant={localFilters.statuses.includes(status) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors capitalize',
                    localFilters.statuses.includes(status)
                      ? status === 'active'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : status === 'revoked'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : status === 'suspended'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                      : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                  )}
                  onClick={() => toggleArrayFilter('statuses', status)}
                >
                  {status === 'active' ? 'Actif' : status === 'expired' ? 'Expiré' : status === 'revoked' ? 'Révoqué' : 'Suspendu'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Filtres sauvegardés</label>
              <div className="space-y-2">
                {savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <button
                      onClick={() => loadFilter(filter.id)}
                      className="flex-1 text-left text-sm text-slate-300 hover:text-slate-200"
                    >
                      {filter.name}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteFilter(filter.id)}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Filter */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder ce filtre
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom du filtre"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!filterName.trim()}
                className="px-3"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <Trash2 className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={closeModal}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleApply} className="bg-purple-500 hover:bg-purple-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

