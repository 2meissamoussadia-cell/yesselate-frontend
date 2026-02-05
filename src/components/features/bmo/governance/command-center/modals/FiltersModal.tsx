/**
 * Modal de filtres avancés
 * Configuration des filtres multi-critères
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Filter,
  X,
  Calendar,
  User,
  FolderKanban,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { Checkbox } from '@/components/ui/checkbox';

export function FiltersModal() {
  const { modal, closeModal, filters, setFilter, resetFilters, saveCurrentFilters, savedFilters, loadSavedFilters } = useGovernanceCommandCenterStore();
  const [filterName, setFilterName] = useState('');

  if (!modal.isOpen || modal.type !== 'filters-advanced') return null;

  const priorityOptions = [
    { id: 'critical', label: 'Critique', color: 'bg-red-500' },
    { id: 'high', label: 'Haute', color: 'bg-orange-500' },
    { id: 'medium', label: 'Moyenne', color: 'bg-amber-500' },
    { id: 'low', label: 'Basse', color: 'bg-slate-500' },
  ];

  const statusOptions = [
    { id: 'on-track', label: 'En bonne voie', icon: CheckCircle2 },
    { id: 'at-risk', label: 'À risque', icon: AlertTriangle },
    { id: 'late', label: 'En retard', icon: Clock },
    { id: 'blocked', label: 'Bloqué', icon: X },
  ];

  const projectOptions = [
    { id: 'proj-1', label: 'Tours Horizon' },
    { id: 'proj-2', label: 'Centre Commercial' },
    { id: 'proj-3', label: 'Résidence Jardins' },
    { id: 'proj-4', label: 'Gare Est' },
  ];

  const handlePriorityToggle = (priority: string) => {
    const current = filters.priorities as string[];
    if (current.includes(priority)) {
      setFilter('priorities', current.filter(p => p !== priority) as any);
    } else {
      setFilter('priorities', [...current, priority] as any);
    }
  };

  const handleStatusToggle = (status: string) => {
    const current = filters.statuses;
    if (current.includes(status)) {
      setFilter('statuses', current.filter(s => s !== status));
    } else {
      setFilter('statuses', [...current, status]);
    }
  };

  const handleProjectToggle = (projectId: string) => {
    const current = filters.projects;
    if (current.includes(projectId)) {
      setFilter('projects', current.filter(p => p !== projectId));
    } else {
      setFilter('projects', [...current, projectId]);
    }
  };

  const activeFiltersCount = 
    filters.priorities.length + 
    filters.statuses.length + 
    filters.projects.length +
    (filters.dateRange.start ? 1 : 0);

  const handleSaveFilters = () => {
    if (filterName.trim()) {
      saveCurrentFilters(filterName.trim());
      setFilterName('');
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-0 gap-0 max-w-2xl">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-lg font-semibold text-slate-200">
                Filtres avancés
              </DialogTitle>
              {activeFiltersCount > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {activeFiltersCount} actif(s)
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-400"
              onClick={closeModal}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Date Range */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4" />
              Période
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Date début</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Date fin</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Priorité
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => {
                const isSelected = filters.priorities.includes(priority.id as any);
                return (
                  <button
                    key={priority.id}
                    onClick={() => handlePriorityToggle(priority.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors',
                      isSelected
                        ? 'bg-slate-800 border-slate-600 text-slate-200'
                        : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <div className={cn('w-2 h-2 rounded-full', priority.color)} />
                    <span className="text-sm">{priority.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4" />
              Statut
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((status) => {
                const Icon = status.icon;
                const isSelected = filters.statuses.includes(status.id);
                return (
                  <button
                    key={status.id}
                    onClick={() => handleStatusToggle(status.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-left',
                      isSelected
                        ? 'bg-slate-800 border-slate-600 text-slate-200'
                        : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{status.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projects */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
              <FolderKanban className="h-4 w-4" />
              Projets
            </label>
            <div className="space-y-2">
              {projectOptions.map((project) => {
                const isSelected = filters.projects.includes(project.id);
                return (
                  <label
                    key={project.id}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                      isSelected
                        ? 'bg-slate-800 border-slate-600'
                        : 'border-slate-700/50 hover:border-slate-600'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleProjectToggle(project.id)}
                    />
                    <span className={cn('text-sm', isSelected ? 'text-slate-200' : 'text-slate-400')}>
                      {project.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                <Save className="h-4 w-4" />
                Filtres sauvegardés
              </label>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((saved) => (
                  <button
                    key={saved.name}
                    onClick={() => loadSavedFilters(saved.name)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:border-slate-600 transition-colors"
                  >
                    {saved.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Save Current Filters */}
          <div className="pt-4 border-t border-slate-800">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2 block">
              Sauvegarder ces filtres
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nom du filtre..."
                className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!filterName.trim()}
                onClick={handleSaveFilters}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-slate-700/50 bg-slate-900/80">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-300"
            onClick={resetFilters}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-700" onClick={closeModal}>
              Annuler
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={closeModal}>
              Appliquer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

