/**
 * Panneau de filtres avancés pour Logs
 * Pattern: Comme AnalyticsFiltersPanel
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
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Server,
  Globe,
  Shield,
  Terminal,
  Search,
  Trash2,
} from 'lucide-react';
import { useLogsCommandCenterStore } from '@/lib/stores/logsCommandCenterStore';
import { logsApiService } from '@/lib/services/logsApiService';

interface LogsFiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters?: (filters: any) => void;
}

export function LogsFiltersPanel({ isOpen, onClose, onApplyFilters }: LogsFiltersPanelProps) {
  const { filters, setFilter, resetFilters } = useLogsCommandCenterStore();
  const [localFilters, setLocalFilters] = useState({
    levels: filters.levels || [],
    sources: filters.sources || [],
    modules: filters.modules || [],
    search: filters.search || '',
    dateFrom: filters.dateRange?.start || null,
    dateTo: filters.dateRange?.end || null,
  });

  const levels = [
    { id: 'error', label: 'Erreur', icon: AlertCircle, color: 'red' },
    { id: 'warning', label: 'Warning', icon: AlertTriangle, color: 'amber' },
    { id: 'info', label: 'Info', icon: Info, color: 'blue' },
    { id: 'debug', label: 'Debug', icon: Bug, color: 'slate' },
  ];

  const sources = [
    { id: 'system', label: 'Système', icon: Server },
    { id: 'api', label: 'API', icon: Globe },
    { id: 'database', label: 'BDD', icon: Terminal },
    { id: 'auth', label: 'Auth', icon: Shield },
    { id: 'business', label: 'Métier', icon: Terminal },
  ];

  const modules = ['payments', 'documents', 'postgres', 'login', 'cron', 'contracts', 'memory'];

  const toggleLevel = (level: string) => {
    setLocalFilters(prev => ({
      ...prev,
      levels: prev.levels.includes(level as any)
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level as any],
    }));
  };

  const toggleSource = (source: string) => {
    setLocalFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source as any)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source as any],
    }));
  };

  const toggleModule = (module: string) => {
    setLocalFilters(prev => ({
      ...prev,
      modules: prev.modules.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...prev.modules, module],
    }));
  };

  const handleApply = () => {
    setFilter('levels', localFilters.levels);
    setFilter('sources', localFilters.sources);
    setFilter('modules', localFilters.modules);
    setFilter('search', localFilters.search);
    setFilter('dateRange', {
      start: localFilters.dateFrom,
      end: localFilters.dateTo,
    });
    onApplyFilters?.(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      levels: [],
      sources: [],
      modules: [],
      search: '',
      dateFrom: null,
      dateTo: null,
    });
    resetFilters();
  };

  const activeFiltersCount = localFilters.levels.length + localFilters.sources.length + localFilters.modules.length + (localFilters.search ? 1 : 0) + (localFilters.dateFrom || localFilters.dateTo ? 1 : 0);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-100">Filtres avancés</h2>
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Search className="h-4 w-4 inline mr-2" />
              Recherche
            </label>
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Rechercher dans les messages, modules..."
              className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Niveaux */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Niveaux</label>
            <div className="grid grid-cols-2 gap-2">
              {levels.map((level) => {
                const isSelected = localFilters.levels.includes(level.id as any);
                const Icon = level.icon;
                return (
                  <button
                    key={level.id}
                    onClick={() => toggleLevel(level.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                      isSelected
                        ? `bg-${level.color}-500/20 border-${level.color}-500/50 text-${level.color}-400`
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{level.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Sources</label>
            <div className="grid grid-cols-2 gap-2">
              {sources.map((source) => {
                const isSelected = localFilters.sources.includes(source.id as any);
                const Icon = source.icon;
                return (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{source.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modules */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Modules</label>
            <div className="flex flex-wrap gap-2">
              {modules.map((module) => {
                const isSelected = localFilters.modules.includes(module);
                return (
                  <button
                    key={module}
                    onClick={() => toggleModule(module)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border text-sm transition-all',
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {module}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              <Calendar className="h-4 w-4 inline mr-2" />
              Période
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Du</label>
                <input
                  type="date"
                  value={localFilters.dateFrom ? new Date(localFilters.dateFrom).toISOString().split('T')[0] : ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, dateFrom: e.target.value ? new Date(e.target.value) : null }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Au</label>
                <input
                  type="date"
                  value={localFilters.dateTo ? new Date(localFilters.dateTo).toISOString().split('T')[0] : ''}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, dateTo: e.target.value ? new Date(e.target.value) : null }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-none px-6 py-4 border-t border-slate-800/50 bg-slate-900/80 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-700 text-slate-400 hover:text-slate-200"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-400 hover:text-slate-200"
            >
              Annuler
            </Button>
            <Button
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Appliquer ({activeFiltersCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

