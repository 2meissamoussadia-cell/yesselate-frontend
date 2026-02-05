/**
 * ExportModal
 * Modale avancée pour exporter les données financières
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
}

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  dataType: 'transactions' | 'invoices' | 'budgets' | 'all';
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    bureau?: string[];
    status?: string[];
    type?: string[];
  };
  options: {
    includeDetails: boolean;
    includeAttachments: boolean;
    groupBy?: string;
  };
}

export function ExportModal({ isOpen, onClose, onExport }: ExportModalProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    dataType: 'transactions',
    dateRange: {
      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    filters: {},
    options: {
      includeDetails: true,
      includeAttachments: false,
    },
  });

  const formats = [
    {
      id: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Document imprimable',
      color: 'rose',
    },
    {
      id: 'excel',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Feuille de calcul',
      color: 'emerald',
    },
    {
      id: 'csv',
      label: 'CSV',
      icon: FileText,
      description: 'Valeurs séparées',
      color: 'blue',
    },
    {
      id: 'json',
      label: 'JSON',
      icon: FileJson,
      description: 'Données structurées',
      color: 'amber',
    },
  ];

  const dataTypes = [
    { id: 'transactions', label: 'Transactions', count: 156 },
    { id: 'invoices', label: 'Factures', count: 24 },
    { id: 'budgets', label: 'Budgets', count: 8 },
    { id: 'all', label: 'Tout exporter', count: 188 },
  ];

  const bureaux = ['BTP', 'BJ', 'BS', 'BME', 'Tous'];
  const statuses = ['Terminé', 'En attente', 'Approuvé', 'En retard'];

  const handleExport = () => {
    onExport(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-200">Exporter les données</h2>
                <p className="text-sm text-slate-400">Configurez votre export</p>
              </div>
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Format d'export</h3>
                <div className="grid grid-cols-4 gap-3">
                  {formats.map((format) => {
                    const Icon = format.icon;
                    const isSelected = config.format === format.id;

                    return (
                      <button
                        key={format.id}
                        onClick={() => setConfig({ ...config, format: format.id as any })}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all',
                          isSelected
                            ? 'border-cyan-500/50 bg-cyan-500/10'
                            : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-6 h-6 mx-auto mb-2',
                            isSelected ? 'text-cyan-400' : 'text-slate-400'
                          )}
                        />
                        <p
                          className={cn(
                            'text-sm font-medium text-center',
                            isSelected ? 'text-slate-200' : 'text-slate-400'
                          )}
                        >
                          {format.label}
                        </p>
                        <p className="text-xs text-slate-600 text-center mt-1">
                          {format.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Data Type Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Type de données</h3>
                <div className="grid grid-cols-2 gap-3">
                  {dataTypes.map((type) => {
                    const isSelected = config.dataType === type.id;

                    return (
                      <button
                        key={type.id}
                        onClick={() => setConfig({ ...config, dataType: type.id as any })}
                        className={cn(
                          'p-4 rounded-lg border transition-all text-left',
                          isSelected
                            ? 'border-cyan-500/50 bg-cyan-500/10'
                            : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p
                              className={cn(
                                'text-sm font-medium',
                                isSelected ? 'text-slate-200' : 'text-slate-400'
                              )}
                            >
                              {type.label}
                            </p>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {type.count} élément{type.count > 1 ? 's' : ''}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Période
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Date de début</label>
                    <input
                      type="date"
                      value={config.dateRange.start}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dateRange: { ...config.dateRange, start: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Date de fin</label>
                    <input
                      type="date"
                      value={config.dateRange.end}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          dateRange: { ...config.dateRange, end: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtres (optionnel)
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Bureaux</label>
                    <div className="flex flex-wrap gap-2">
                      {bureaux.map((bureau) => {
                        const isSelected = config.filters.bureau?.includes(bureau);

                        return (
                          <button
                            key={bureau}
                            onClick={() => {
                              const current = config.filters.bureau || [];
                              const newBureaux = isSelected
                                ? current.filter((b) => b !== bureau)
                                : [...current, bureau];
                              setConfig({
                                ...config,
                                filters: { ...config.filters, bureau: newBureaux },
                              });
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                            )}
                          >
                            {bureau}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Statuts</label>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map((status) => {
                        const isSelected = config.filters.status?.includes(status);

                        return (
                          <button
                            key={status}
                            onClick={() => {
                              const current = config.filters.status || [];
                              const newStatuses = isSelected
                                ? current.filter((s) => s !== status)
                                : [...current, status];
                              setConfig({
                                ...config,
                                filters: { ...config.filters, status: newStatuses },
                              });
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                              isSelected
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800'
                            )}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300">Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.options.includeDetails}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          options: { ...config.options, includeDetails: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        Inclure les détails complets
                      </p>
                      <p className="text-xs text-slate-400">
                        Ajouter toutes les informations détaillées
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.options.includeAttachments}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          options: {
                            ...config.options,
                            includeAttachments: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        Inclure les pièces jointes
                      </p>
                      <p className="text-xs text-slate-400">
                        Exporter avec les documents associés (PDF uniquement)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/60">
            <p className="text-xs text-slate-400">
              Export au format {config.format.toUpperCase()} • {config.dataType}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-slate-700 text-slate-400 hover:text-slate-200"
              >
                Annuler
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleExport}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

