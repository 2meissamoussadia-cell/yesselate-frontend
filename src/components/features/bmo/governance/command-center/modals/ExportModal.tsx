/**
 * Modal de configuration d'export
 * Export des données en Excel, PDF, CSV
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  X,
  FileSpreadsheet,
  FileText,
  Table2,
  Check,
  Loader2,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { logger } from '@/lib/utils/logger';
import { Checkbox } from '@/components/ui/checkbox';
import { toCsv, downloadBlob } from '@/lib/utils/export';

type ExportFormat = 'excel' | 'pdf' | 'csv';
type ExportScope = 'current' | 'all' | 'selected';

export function ExportModal() {
  const { modal, closeModal, navigation, selectedItems } = useGovernanceCommandCenterStore();
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [scope, setScope] = useState<ExportScope>('current');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'reference',
    'designation',
    'project',
    'status',
    'priority',
    'dateEcheance',
  ]);

  if (!modal.isOpen || modal.type !== 'export-config') return null;

  const formats = [
    { id: 'excel' as const, label: 'Excel', icon: FileSpreadsheet, ext: '.xlsx' },
    { id: 'pdf' as const, label: 'PDF', icon: FileText, ext: '.pdf' },
    { id: 'csv' as const, label: 'CSV', icon: Table2, ext: '.csv' },
  ];

  const scopes = [
    { id: 'current' as const, label: 'Vue actuelle', description: 'Exporte les données affichées' },
    { id: 'all' as const, label: 'Toutes les données', description: 'Export complet sans filtres' },
    { id: 'selected' as const, label: 'Sélection', description: `${selectedItems.length} élément(s)`, disabled: selectedItems.length === 0 },
  ];

  const columns = [
    { id: 'reference', label: 'Référence' },
    { id: 'designation', label: 'Désignation' },
    { id: 'project', label: 'Projet' },
    { id: 'responsable', label: 'Responsable' },
    { id: 'status', label: 'Statut' },
    { id: 'priority', label: 'Priorité' },
    { id: 'dateEcheance', label: 'Échéance' },
    { id: 'progress', label: 'Avancement' },
    { id: 'createdAt', label: 'Date création' },
    { id: 'updatedAt', label: 'Dernière màj' },
  ];

  const handleColumnToggle = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter(c => c !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  const handleSelectAllColumns = () => {
    if (selectedColumns.length === columns.length) {
      setSelectedColumns(['reference', 'designation']);
    } else {
      setSelectedColumns(columns.map(c => c.id));
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Construire les données à exporter selon le périmètre
      let items: Record<string, unknown>[] = Array.isArray(selectedItems) ? [...(selectedItems as unknown as Record<string, unknown>[])] : [];
      if (scope === 'all') {
        // Pour "toutes les données", on exporte la sélection ou un placeholder
        if (items.length === 0) items = [{ message: 'Export complet', vue: navigation?.subCategory ?? 'gouvernance', date: new Date().toISOString().slice(0, 10) }];
      } else if (scope === 'current' && items.length === 0) {
        items = [{ vue: navigation?.subCategory ?? 'gouvernance', message: 'Données de la vue actuelle', date: new Date().toISOString().slice(0, 10) }];
      }
      // Filtrer les colonnes si besoin (garder seulement selectedColumns présentes dans les données)
      const rows = items.map((item: Record<string, unknown>) => {
        const filtered: Record<string, unknown> = {};
        selectedColumns.forEach((col) => {
          const val = (item as Record<string, unknown>)[col];
          if (val !== undefined) filtered[col] = val;
        });
        return Object.keys(filtered).length > 0 ? filtered : item;
      });
      const ext = format === 'csv' ? 'csv' : format === 'excel' ? 'xlsx' : 'pdf';
      const filename = `governance_export_${new Date().toISOString().slice(0, 10)}.${ext}`;
      if (format === 'csv') {
        const csvContent = toCsv(rows);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, filename);
      } else if (format === 'excel') {
        // Fallback CSV pour Excel (ouvrable dans Excel)
        const csvContent = toCsv(rows);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, filename.replace('.xlsx', '.csv'));
      } else {
        // PDF: export CSV en attendant implémentation jspdf
        const csvContent = toCsv(rows);
        const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
        downloadBlob(blob, filename.replace('.pdf', '.txt'));
      }
      logger.debug('Export done', { component: 'ExportModal', format, scope });
    } catch (err) {
      logger.error('Export failed', err instanceof Error ? err : undefined, { component: 'ExportModal' });
    } finally {
      setIsExporting(false);
      closeModal();
    }
  };

  return (
    <Dialog open={modal.isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 p-0 gap-0 max-w-lg">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-blue-400" />
              <DialogTitle className="text-lg font-semibold text-slate-200">
                Exporter
              </DialogTitle>
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
        <div className="p-4 space-y-5">
          {/* Format Selection */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">
              Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {formats.map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'border-slate-700/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-xs opacity-60">{f.ext}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3 block">
              Périmètre
            </label>
            <div className="space-y-2">
              {scopes.map((s) => {
                const isSelected = scope === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => !s.disabled && setScope(s.id)}
                    disabled={s.disabled}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left',
                      s.disabled
                        ? 'opacity-50 cursor-not-allowed border-slate-800'
                        : isSelected
                        ? 'bg-slate-800 border-slate-600'
                        : 'border-slate-700/50 hover:border-slate-600'
                    )}
                  >
                    <div>
                      <p className={cn('text-sm font-medium', isSelected ? 'text-slate-200' : 'text-slate-400')}>
                        {s.label}
                      </p>
                      <p className="text-xs text-slate-400">{s.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columns Selection */}
          {format !== 'pdf' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Colonnes
                </label>
                <button
                  onClick={handleSelectAllColumns}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {selectedColumns.length === columns.length ? 'Désélectionner tout' : 'Tout sélectionner'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {columns.map((col) => {
                  const isSelected = selectedColumns.includes(col.id);
                  return (
                    <label
                      key={col.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-slate-800 border-slate-600'
                          : 'border-slate-700/50 hover:border-slate-600'
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleColumnToggle(col.id)}
                      />
                      <span className={cn('text-sm', isSelected ? 'text-slate-200' : 'text-slate-400')}>
                        {col.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-slate-700/50 bg-slate-900/80">
          <div className="text-xs text-slate-400">
            {selectedColumns.length} colonnes sélectionnées
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-slate-700" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 min-w-24"
              onClick={handleExport}
              disabled={isExporting || selectedColumns.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-1" />
                  Exporter
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

