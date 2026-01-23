/**
 * Export Modal - Export avancé des données clients
 * Multiple formats, filters, and custom fields
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  CheckCircle2,
  Filter,
  Columns,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport?: (config: ExportConfig) => void;
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields: string[];
  filters: {
    type?: string[];
    status?: string[];
    dateRange?: { start: string; end: string };
  };
  includeContacts: boolean;
  includeInteractions: boolean;
  includeContracts: boolean;
}

const formats = [
  { id: 'csv', label: 'CSV', icon: FileText, description: 'Fichier texte séparé par virgules' },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet, description: 'Classeur Excel (.xlsx)' },
  { id: 'pdf', label: 'PDF', icon: File, description: 'Document PDF formaté' },
  { id: 'json', label: 'JSON', icon: FileText, description: 'Format JSON pour API' },
];

const availableFields = [
  { id: 'name', label: 'Nom', group: 'basic' },
  { id: 'type', label: 'Type', group: 'basic' },
  { id: 'status', label: 'Statut', group: 'basic' },
  { id: 'sector', label: 'Secteur', group: 'basic' },
  { id: 'city', label: 'Ville', group: 'basic' },
  { id: 'region', label: 'Région', group: 'basic' },
  { id: 'ca', label: 'CA Annuel', group: 'financial' },
  { id: 'satisfaction', label: 'Satisfaction', group: 'metrics' },
  { id: 'since', label: 'Client depuis', group: 'dates' },
  { id: 'lastInteraction', label: 'Dernière interaction', group: 'dates' },
  { id: 'manager', label: 'Manager', group: 'basic' },
  { id: 'contacts', label: 'Nb. contacts', group: 'metrics' },
  { id: 'projects', label: 'Nb. projets', group: 'metrics' },
  { id: 'contracts', label: 'Nb. contrats', group: 'metrics' },
  { id: 'website', label: 'Site web', group: 'contact' },
  { id: 'address', label: 'Adresse', group: 'contact' },
  { id: 'postalCode', label: 'Code postal', group: 'contact' },
  { id: 'tags', label: 'Tags', group: 'basic' },
];

export function ExportModal({ open, onClose, onExport }: ExportModalProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    fields: ['name', 'type', 'status', 'sector', 'ca', 'satisfaction'],
    filters: {},
    includeContacts: false,
    includeInteractions: false,
    includeContracts: false,
  });

  const [step, setStep] = useState<'format' | 'fields' | 'filters' | 'options'>('format');

  if (!open) return null;

  const selectedFormat = formats.find(f => f.id === config.format);
  const FormatIcon = selectedFormat?.icon || FileText;

  const toggleField = (fieldId: string) => {
    setConfig({
      ...config,
      fields: config.fields.includes(fieldId)
        ? config.fields.filter(f => f !== fieldId)
        : [...config.fields, fieldId],
    });
  };

  const selectAllFields = () => {
    setConfig({ ...config, fields: availableFields.map(f => f.id) });
  };

  const deselectAllFields = () => {
    setConfig({ ...config, fields: [] });
  };

  const handleExport = () => {
    onExport?.(config);
    onClose();
  };

  const fieldsByGroup = availableFields.reduce((acc, field) => {
    if (!acc[field.group]) acc[field.group] = [];
    acc[field.group].push(field);
    return acc;
  }, {} as Record<string, typeof availableFields>);

  const groupLabels: Record<string, string> = {
    basic: 'Informations de base',
    financial: 'Financier',
    metrics: 'Métriques',
    dates: 'Dates',
    contact: 'Contact',
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Download className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Exporter les données</h2>
              <p className="text-sm text-slate-400">Configuration de l'export</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-800/50 overflow-x-auto">
          {[
            { id: 'format', label: '1. Format', icon: FileText },
            { id: 'fields', label: '2. Colonnes', icon: Columns },
            { id: 'filters', label: '3. Filtres', icon: Filter },
            { id: 'options', label: '4. Options', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = 
              (s.id === 'format' && step !== 'format') ||
              (s.id === 'fields' && ['filters', 'options'].includes(step)) ||
              (s.id === 'filters' && step === 'options');

            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id as any)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800/30 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                )}
              >
                <Icon className="w-4 h-4" />
                {s.label}
                {isCompleted && <CheckCircle2 className="w-3 h-3" />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Format */}
          {step === 'format' && (
            <div className="space-y-4">
              <div className="text-sm text-slate-400 mb-4">
                Choisissez le format d'export souhaité
              </div>
              <div className="grid grid-cols-2 gap-4">
                {formats.map((format) => {
                  const Icon = format.icon;
                  const isSelected = config.format === format.id;

                  return (
                    <button
                      key={format.id}
                      onClick={() => setConfig({ ...config, format: format.id as any })}
                      className={cn(
                        'flex items-start gap-3 p-4 rounded-xl border transition-all text-left',
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/50'
                          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                      )}
                    >
                      <Icon className={cn(
                        'w-6 h-6 flex-shrink-0',
                        isSelected ? 'text-cyan-400' : 'text-slate-400'
                      )} />
                      <div>
                        <div className={cn(
                          'font-medium mb-1',
                          isSelected ? 'text-cyan-400' : 'text-slate-200'
                        )}>
                          {format.label}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format.description}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-cyan-400 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Fields */}
          {step === 'fields' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-slate-400">
                  Sélectionnez les colonnes à exporter ({config.fields.length} sélectionnées)
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectAllFields}
                  >
                    Tout sélectionner
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deselectAllFields}
                  >
                    Tout désélectionner
                  </Button>
                </div>
              </div>

              {Object.entries(fieldsByGroup).map(([group, fields]) => (
                <div key={group} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    {groupLabels[group]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map((field) => {
                      const isSelected = config.fields.includes(field.id);

                      return (
                        <button
                          key={field.id}
                          onClick={() => toggleField(field.id)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all',
                            isSelected
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-slate-900/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                          )}
                        >
                          <div className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center',
                            isSelected ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                          )}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          {field.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Filters */}
          {step === 'filters' && (
            <div className="space-y-4">
              <div className="text-sm text-slate-400 mb-4">
                Filtrez les données à exporter (optionnel)
              </div>

              {/* Type Filter */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Type de client
                </label>
                <div className="flex flex-wrap gap-2">
                  {['premium', 'standard', 'prospect'].map((type) => {
                    const isSelected = config.filters.type?.includes(type);

                    return (
                      <button
                        key={type}
                        onClick={() => {
                          const currentTypes = config.filters.type || [];
                          setConfig({
                            ...config,
                            filters: {
                              ...config.filters,
                              type: isSelected
                                ? currentTypes.filter(t => t !== type)
                                : [...currentTypes, type],
                            },
                          });
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-slate-600'
                        )}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Statut
                </label>
                <div className="flex flex-wrap gap-2">
                  {['active', 'pending', 'at_risk', 'inactive'].map((status) => {
                    const isSelected = config.filters.status?.includes(status);

                    return (
                      <button
                        key={status}
                        onClick={() => {
                          const currentStatuses = config.filters.status || [];
                          setConfig({
                            ...config,
                            filters: {
                              ...config.filters,
                              status: isSelected
                                ? currentStatuses.filter(s => s !== status)
                                : [...currentStatuses, status],
                            },
                          });
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-slate-600'
                        )}
                      >
                        {status === 'active' ? 'Actif' :
                         status === 'pending' ? 'En attente' :
                         status === 'at_risk' ? 'À risque' :
                         'Inactif'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Période (client depuis)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Du</label>
                    <input
                      type="date"
                      value={config.filters.dateRange?.start || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        filters: {
                          ...config.filters,
                          dateRange: {
                            ...config.filters.dateRange,
                            start: e.target.value,
                          } as any,
                        },
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Au</label>
                    <input
                      type="date"
                      value={config.filters.dateRange?.end || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        filters: {
                          ...config.filters,
                          dateRange: {
                            ...config.filters.dateRange,
                            end: e.target.value,
                          } as any,
                        },
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Options */}
          {step === 'options' && (
            <div className="space-y-4">
              <div className="text-sm text-slate-400 mb-4">
                Options supplémentaires
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setConfig({ ...config, includeContacts: !config.includeContacts })}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl border transition-all',
                    config.includeContacts
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center',
                      config.includeContacts ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                    )}>
                      {config.includeContacts && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="text-left">
                      <div className={cn(
                        'font-medium',
                        config.includeContacts ? 'text-cyan-400' : 'text-slate-200'
                      )}>
                        Inclure les contacts
                      </div>
                      <div className="text-xs text-slate-500">
                        Exporter une feuille séparée avec tous les contacts
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setConfig({ ...config, includeInteractions: !config.includeInteractions })}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl border transition-all',
                    config.includeInteractions
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center',
                      config.includeInteractions ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                    )}>
                      {config.includeInteractions && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="text-left">
                      <div className={cn(
                        'font-medium',
                        config.includeInteractions ? 'text-cyan-400' : 'text-slate-200'
                      )}>
                        Inclure les interactions
                      </div>
                      <div className="text-xs text-slate-500">
                        Historique complet des interactions avec chaque client
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setConfig({ ...config, includeContracts: !config.includeContracts })}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl border transition-all',
                    config.includeContracts
                      ? 'bg-cyan-500/20 border-cyan-500/50'
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center',
                      config.includeContracts ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600'
                    )}>
                      {config.includeContracts && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div className="text-left">
                      <div className={cn(
                        'font-medium',
                        config.includeContracts ? 'text-cyan-400' : 'text-slate-200'
                      )}>
                        Inclure les contrats
                      </div>
                      <div className="text-xs text-slate-500">
                        Détails de tous les contrats en cours et expirés
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Résumé de l'export</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Format:</span>
                    <span className="font-medium">{selectedFormat?.label}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Colonnes:</span>
                    <span className="font-medium">{config.fields.length}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Feuilles supplémentaires:</span>
                    <span className="font-medium">
                      {[config.includeContacts, config.includeInteractions, config.includeContracts].filter(Boolean).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/60">
          <div>
            {step !== 'format' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const steps: ('format' | 'fields' | 'filters' | 'options')[] = ['format', 'fields', 'filters', 'options'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) setStep(steps[currentIndex - 1]);
                }}
              >
                Précédent
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            {step !== 'options' ? (
              <Button
                onClick={() => {
                  const steps: ('format' | 'fields' | 'filters' | 'options')[] = ['format', 'fields', 'filters', 'options'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex < steps.length - 1) setStep(steps[currentIndex + 1]);
                }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handleExport}
                disabled={config.fields.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

