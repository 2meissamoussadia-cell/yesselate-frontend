/**
 * Saved Filters Manager
 * Système de sauvegarde et gestion de filtres favoris
 * Compatible avec tous les modules (Paiements, Blocked, Analytics)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Star,
  Trash2,
  Check,
  X,
  Edit2,
  Share2,
  Download,
  Upload,
} from 'lucide-react';
import { logger } from '@/lib/utils/logger';

export interface SavedFilter<T = any> {
  id: string;
  name: string;
  description?: string;
  filters: T;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  module: 'paiements' | 'blocked' | 'analytics';
  createdBy?: string;
  sharedWith?: string[];
  isPublic?: boolean;
}

interface SavedFiltersManagerProps<T = any> {
  module: 'paiements' | 'blocked' | 'analytics';
  currentFilters: T;
  onApplyFilter: (filters: T) => void;
  countActiveFilters: (filters: T) => number;
}

const STORAGE_KEY_PREFIX = 'yesselate_saved_filters_';

export function SavedFiltersManager<T = any>({
  module,
  currentFilters,
  onApplyFilter,
  countActiveFilters,
}: SavedFiltersManagerProps<T>) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter<T>[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingName, setSavingName] = useState('');
  const [savingDescription, setSavingDescription] = useState('');

  // Load saved filters from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${module}`);
    if (stored) {
      try {
        setSavedFilters(JSON.parse(stored));
      } catch (e) {
        logger.error('Failed to load saved filters', e instanceof Error ? e : undefined, { component: 'SavedFiltersManager' });
      }
    }
  }, [module]);

  // Save filters to localStorage
  const persistFilters = (filters: SavedFilter<T>[]) => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${module}`, JSON.stringify(filters));
    setSavedFilters(filters);
  };

  // Save current filters
  const handleSave = () => {
    if (!savingName.trim()) return;

    const newFilter: SavedFilter<T> = {
      id: `filter_${Date.now()}`,
      name: savingName.trim(),
      description: savingDescription.trim() || undefined,
      filters: currentFilters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      module,
    };

    persistFilters([...savedFilters, newFilter]);
    setSavingName('');
    setSavingDescription('');
  };

  // Delete filter
  const handleDelete = (id: string) => {
    persistFilters(savedFilters.filter(f => f.id !== id));
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    persistFilters(
      savedFilters.map(f =>
        f.id === id ? { ...f, isFavorite: !f.isFavorite } : f
      )
    );
  };

  // Apply saved filter
  const handleApply = (filter: SavedFilter<T>) => {
    onApplyFilter(filter.filters);
  };

  // Update filter
  const handleUpdate = (id: string) => {
    persistFilters(
      savedFilters.map(f =>
        f.id === id
          ? {
              ...f,
              name: savingName.trim() || f.name,
              description: savingDescription.trim() || f.description,
              updatedAt: new Date().toISOString(),
            }
          : f
      )
    );
    setEditingId(null);
    setSavingName('');
    setSavingDescription('');
  };

  // Start editing
  const startEditing = (filter: SavedFilter<T>) => {
    setEditingId(filter.id);
    setSavingName(filter.name);
    setSavingDescription(filter.description || '');
  };

  // Export filters
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(savedFilters, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${module}_filters_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import filters
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          persistFilters([...savedFilters, ...imported]);
        }
      } catch (err) {
        logger.error('Failed to import filters', err instanceof Error ? err : undefined, { component: 'SavedFiltersManager' });
      }
    };
    reader.readAsText(file);
  };

  const activeCount = countActiveFilters(currentFilters);
  const favorites = savedFilters.filter(f => f.isFavorite);
  const recent = savedFilters.slice(-5).reverse();

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 text-slate-400 hover:text-slate-200"
        title="Filtres sauvegardés"
      >
        <Star className="h-4 w-4" />
        <span className="hidden sm:inline">Filtres sauvegardés</span>
        {savedFilters.length > 0 && (
          <Badge variant="outline" className="bg-slate-800 text-slate-300">
            {savedFilters.length}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-200">
                Filtres Sauvegardés
              </h2>
              <p className="text-xs text-slate-400">
                {savedFilters.length} filtre{savedFilters.length > 1 ? 's' : ''} • Module: {module}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Export/Import */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0"
              title="Exporter"
              disabled={savedFilters.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Importer"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                </span>
              </Button>
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Save Current */}
          {activeCount > 0 && (
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Save className="h-4 w-4" />
                Sauvegarder les filtres actuels ({activeCount} actif{activeCount > 1 ? 's' : ''})
              </div>
              <input
                type="text"
                placeholder="Nom du filtre..."
                value={savingName}
                onChange={(e) => setSavingName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description (optionnel)..."
                value={savingDescription}
                onChange={(e) => setSavingDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Button
                onClick={handleSave}
                disabled={!savingName.trim()}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          )}

          {/* Favorites */}
          {favorites.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                Favoris ({favorites.length})
              </h3>
              <div className="space-y-2">
                {favorites.map((filter) => (
                  <FilterItem
                    key={filter.id}
                    filter={filter}
                    isEditing={editingId === filter.id}
                    editName={savingName}
                    editDescription={savingDescription}
                    onEditNameChange={setSavingName}
                    onEditDescriptionChange={setSavingDescription}
                    onApply={() => handleApply(filter)}
                    onToggleFavorite={() => handleToggleFavorite(filter.id)}
                    onDelete={() => handleDelete(filter.id)}
                    onStartEdit={() => startEditing(filter)}
                    onSaveEdit={() => handleUpdate(filter.id)}
                    onCancelEdit={() => {
                      setEditingId(null);
                      setSavingName('');
                      setSavingDescription('');
                    }}
                    countActiveFilters={countActiveFilters}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Filters */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">
              Tous les filtres ({savedFilters.length})
            </h3>
            {savedFilters.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun filtre sauvegardé</p>
                <p className="text-xs mt-1">Configurez des filtres et sauvegardez-les pour un accès rapide</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedFilters.map((filter) => (
                  <FilterItem
                    key={filter.id}
                    filter={filter}
                    isEditing={editingId === filter.id}
                    editName={savingName}
                    editDescription={savingDescription}
                    onEditNameChange={setSavingName}
                    onEditDescriptionChange={setSavingDescription}
                    onApply={() => handleApply(filter)}
                    onToggleFavorite={() => handleToggleFavorite(filter.id)}
                    onDelete={() => handleDelete(filter.id)}
                    onStartEdit={() => startEditing(filter)}
                    onSaveEdit={() => handleUpdate(filter.id)}
                    onCancelEdit={() => {
                      setEditingId(null);
                      setSavingName('');
                      setSavingDescription('');
                    }}
                    countActiveFilters={countActiveFilters}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Filter Item Component
function FilterItem<T = any>({
  filter,
  isEditing,
  editName,
  editDescription,
  onEditNameChange,
  onEditDescriptionChange,
  onApply,
  onToggleFavorite,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  countActiveFilters,
}: {
  filter: SavedFilter<T>;
  isEditing: boolean;
  editName: string;
  editDescription: string;
  onEditNameChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onApply: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  countActiveFilters: (filters: T) => number;
}) {
  const activeCount = countActiveFilters(filter.filters);

  if (isEditing) {
    return (
      <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg space-y-2">
        <input
          type="text"
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-200"
        />
        <input
          type="text"
          value={editDescription}
          onChange={(e) => onEditDescriptionChange(e.target.value)}
          placeholder="Description..."
          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-400"
        />
        <div className="flex gap-2">
          <Button onClick={onSaveEdit} size="sm" className="flex-1">
            <Check className="h-3 w-3 mr-1" />
            Sauvegarder
          </Button>
          <Button onClick={onCancelEdit} variant="outline" size="sm" className="flex-1">
            <X className="h-3 w-3 mr-1" />
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 rounded-lg transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className="flex-shrink-0"
              title={filter.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  filter.isFavorite
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-400 hover:text-amber-400'
                )}
              />
            </button>
            <h4 className="text-sm font-medium text-slate-200 truncate">
              {filter.name}
            </h4>
            <Badge variant="outline" className="text-xs bg-slate-700/50">
              {activeCount}
            </Badge>
          </div>
          {filter.description && (
            <p className="text-xs text-slate-400 mt-1 truncate">
              {filter.description}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {new Date(filter.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onApply}
            className="h-7 w-7 p-0"
            title="Appliquer"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartEdit}
            className="h-7 w-7 p-0"
            title="Modifier"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

