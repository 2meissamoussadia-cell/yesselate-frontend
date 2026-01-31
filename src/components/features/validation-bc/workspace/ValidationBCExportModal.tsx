'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Download } from 'lucide-react';

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ValidationBCExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
}

export function ValidationBCExportModal({ open, onClose, onExport }: ValidationBCExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport(format);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <FluentModal open={open} title="Export des données" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
            Format d'export
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFormat('csv')}
              className={`p-3 rounded-xl border transition-colors ${
                format === 'csv'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="font-semibold text-sm">CSV</div>
              <div className="text-xs text-slate-400">Excel compatible</div>
            </button>

            <button
              onClick={() => setFormat('json')}
              className={`p-3 rounded-xl border transition-colors ${
                format === 'json'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="font-semibold text-sm">JSON</div>
              <div className="text-xs text-slate-400">Format API</div>
            </button>

            <button
              onClick={() => setFormat('pdf')}
              className={`p-3 rounded-xl border transition-colors ${
                format === 'pdf'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="font-semibold text-sm">PDF</div>
              <div className="text-xs text-slate-400">Document</div>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <FluentButton size="sm" variant="secondary" onClick={onClose} disabled={exporting}>
            Annuler
          </FluentButton>
          <FluentButton size="sm" variant="primary" onClick={handleExport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Export en cours...' : 'Exporter'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

