/**
 * Modal d'export pour Logs
 * Export des logs dans différents formats
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
  FileJson,
  FileCode,
  File,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useLogsCommandCenterStore } from '@/lib/stores/logsCommandCenterStore';
import { logsApiService } from '@/lib/services/logsApiService';

interface LogsExportModalProps {
  onClose: () => void;
}

export function LogsExportModal({ onClose }: LogsExportModalProps) {
  const { filters } = useLogsCommandCenterStore();
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'txt' | 'pdf'>('csv');
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const formats = [
    { id: 'csv' as const, label: 'CSV', icon: FileText, description: 'Format tableur (Excel, Google Sheets)' },
    { id: 'json' as const, label: 'JSON', icon: FileJson, description: 'Format structuré pour développeurs' },
    { id: 'txt' as const, label: 'TXT', icon: FileCode, description: 'Format texte simple' },
    { id: 'pdf' as const, label: 'PDF', icon: File, description: 'Document PDF formaté' },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      // Convertir les filtres du store au format LogsFilter
      const exportFilters = {
        level: filters.levels.length === 1 ? filters.levels[0] : undefined,
        source: filters.sources.length === 1 ? filters.sources[0] : undefined,
        module: filters.modules.length === 1 ? filters.modules[0] : undefined,
        search: filters.search || undefined,
        dateFrom: filters.dateRange?.start ? filters.dateRange.start.toISOString() : undefined,
        dateTo: filters.dateRange?.end ? filters.dateRange.end.toISOString() : undefined,
      };

      const blob = await logsApiService.exportLogs(exportFilters, selectedFormat);
      
      // Télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-export-${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExported(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const activeFiltersCount = filters.levels.length + filters.sources.length + filters.modules.length + (filters.search ? 1 : 0) + (filters.dateRange?.start || filters.dateRange?.end ? 1 : 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-slate-100">Exporter les logs</h2>
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
          {exported ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-emerald-400 mb-4" />
              <p className="text-slate-200 font-medium mb-2">Export réussi !</p>
              <p className="text-sm text-slate-400">Le fichier a été téléchargé</p>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Format d'export</label>
                <div className="grid grid-cols-2 gap-3">
                  {formats.map((format) => {
                    const Icon = format.icon;
                    const isSelected = selectedFormat === format.id;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded-lg border transition-all text-left',
                          isSelected
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        )}
                      >
                        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium mb-1">{format.label}</div>
                          <div className="text-xs opacity-75">{format.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-sm font-medium text-slate-300 mb-2">Filtres appliqués</p>
                  <div className="flex flex-wrap gap-2">
                    {filters.levels.length > 0 && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        {filters.levels.length} niveau(s)
                      </Badge>
                    )}
                    {filters.sources.length > 0 && (
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {filters.sources.length} source(s)
                      </Badge>
                    )}
                    {filters.modules.length > 0 && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {filters.modules.length} module(s)
                      </Badge>
                    )}
                    {filters.search && (
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        Recherche: {filters.search}
                      </Badge>
                    )}
                    {(filters.dateRange?.start || filters.dateRange?.end) && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        Période définie
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-400">
                  Les logs seront exportés selon les filtres actuellement appliqués. 
                  {activeFiltersCount === 0 && ' Tous les logs seront inclus.'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!exported && (
          <div className="flex-none px-6 py-4 border-t border-slate-800/50 bg-slate-900/80 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-400 hover:text-slate-200"
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Export en cours...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

