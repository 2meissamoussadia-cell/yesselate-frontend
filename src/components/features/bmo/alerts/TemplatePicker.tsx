/**
 * Composant de sélection de template pour les résolutions
 * Permet de choisir un template et de remplir les variables
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Search,
  Star,
  Clock,
  Check,
  X,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  ResolutionTemplate,
  getAllTemplates,
  searchTemplates,
  getMostUsedTemplates,
  getSuggestedTemplates,
  applyTemplate,
  validateTemplateValues,
} from '@/lib/data/resolutionTemplates';

interface TemplatePickerProps {
  alert?: {
    type: string;
    severity: string;
    title: string;
    description?: string;
  };
  onSelect: (template: ResolutionTemplate, values: Record<string, string>) => void;
  onCancel?: () => void;
}

export function TemplatePicker({ alert, onSelect, onCancel }: TemplatePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ResolutionTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'suggested' | 'popular' | 'all'>('suggested');

  // Templates suggérés basés sur l'alerte
  const suggestedTemplates = useMemo(() => {
    return alert ? getSuggestedTemplates(alert) : [];
  }, [alert]);

  // Templates les plus utilisés
  const popularTemplates = useMemo(() => {
    return getMostUsedTemplates(10);
  }, []);

  // Tous les templates filtrés par recherche
  const filteredTemplates = useMemo(() => {
    if (!searchQuery) return getAllTemplates();
    return searchTemplates(searchQuery);
  }, [searchQuery]);

  // Templates à afficher selon l'onglet actif
  const displayedTemplates = useMemo(() => {
    switch (activeTab) {
      case 'suggested':
        return suggestedTemplates;
      case 'popular':
        return popularTemplates;
      case 'all':
        return filteredTemplates;
      default:
        return [];
    }
  }, [activeTab, suggestedTemplates, popularTemplates, filteredTemplates]);

  // Prévisualisation du template avec les valeurs
  const preview = useMemo(() => {
    if (!selectedTemplate) return '';
    return applyTemplate(selectedTemplate, variableValues);
  }, [selectedTemplate, variableValues]);

  // Validation
  const validation = useMemo(() => {
    if (!selectedTemplate) return { valid: false, missing: [] };
    return validateTemplateValues(selectedTemplate, variableValues);
  }, [selectedTemplate, variableValues]);

  const handleSelectTemplate = (template: ResolutionTemplate) => {
    setSelectedTemplate(template);
    // Initialiser les valeurs des variables
    const initialValues: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialValues[v] = '';
    });
    setVariableValues(initialValues);
  };

  const handleSubmit = () => {
    if (!selectedTemplate || !validation.valid) return;
    onSelect(selectedTemplate, variableValues);
  };

  if (selectedTemplate) {
    // Vue de remplissage des variables
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-200">
              {selectedTemplate.title}
            </h3>
            <p className="text-sm text-slate-400">
              Remplissez les champs ci-dessous
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTemplate(null)}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Formulaire de variables */}
        <div className="space-y-3">
          {selectedTemplate.variables.map((variable) => (
            <div key={variable}>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {variable}
                {validation.missing.includes(variable) && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
              <input
                type="text"
                value={variableValues[variable] || ''}
                onChange={(e) =>
                  setVariableValues((prev) => ({
                    ...prev,
                    [variable]: e.target.value,
                  }))
                }
                className={cn(
                  'w-full px-3 py-2 rounded-lg border bg-slate-900/50 text-slate-200',
                  'focus:outline-none focus:ring-2',
                  validation.missing.includes(variable)
                    ? 'border-red-500/30 focus:ring-red-500/30'
                    : 'border-slate-700/50 focus:ring-blue-500/30'
                )}
                placeholder={`Entrez ${variable}`}
              />
            </div>
          ))}
        </div>

        {/* Prévisualisation */}
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-900/30">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
            Prévisualisation
          </p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{preview}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-200"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!validation.valid}
            className={cn(
              'bg-emerald-500 hover:bg-emerald-600',
              !validation.valid && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Check className="h-4 w-4 mr-2" />
            Utiliser ce template
          </Button>
        </div>

        {/* Avertissement si incomplet */}
        {!validation.valid && validation.missing.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-400">
              ⚠️ Champs manquants : {validation.missing.join(', ')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Vue de sélection de template
  return (
    <div className="space-y-4">
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un template..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700/50 bg-slate-900/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {/* Onglets */}
      <div className="flex items-center gap-2 border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab('suggested')}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'suggested'
              ? 'border-blue-400 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <Sparkles className="h-4 w-4 inline mr-1" />
          Suggérés ({suggestedTemplates.length})
        </button>
        <button
          onClick={() => setActiveTab('popular')}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'popular'
              ? 'border-blue-400 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <TrendingUp className="h-4 w-4 inline mr-1" />
          Populaires ({popularTemplates.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'all'
              ? 'border-blue-400 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <FileText className="h-4 w-4 inline mr-1" />
          Tous ({filteredTemplates.length})
        </button>
      </div>

      {/* Liste des templates */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedTemplates.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucun template trouvé</p>
          </div>
        ) : (
          displayedTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="w-full text-left p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">
                      {template.title}
                    </h4>
                    <Badge
                      variant="default"
                      className="text-xs bg-slate-500/10 text-slate-400 border-slate-500/20"
                    >
                      {template.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {template.template}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {template.usageCount} utilisations
                    </span>
                    {template.estimatedTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ~{template.estimatedTimeMinutes} min
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-700/50">
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-slate-200">
          Annuler
        </Button>
      </div>
    </div>
  );
}

