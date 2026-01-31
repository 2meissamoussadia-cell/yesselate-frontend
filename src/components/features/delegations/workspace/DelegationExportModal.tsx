/**
 * Modal d'export pour les délégations
 * Formats: CSV, JSON, PDF
 */

'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  FileSpreadsheet,
  FileJson,
  FileType,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportOption {
  id: ExportFormat;
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onExport?: (format: ExportFormat) => Promise<void>;
}

export function DelegationExportModal({ open, onClose, onExport }: Props) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formats: ExportOption[] = [
    {
      id: 'csv',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      label: 'CSV',
      description: 'Compatible Excel, Google Sheets',
    },
    {
      id: 'json',
      icon: <FileJson className="w-5 h-5" />,
      label: 'JSON',
      description: 'Format API, intégrations',
    },
    {
      id: 'pdf',
      icon: <FileType className="w-5 h-5" />,
      label: 'PDF',
      description: 'Document imprimable',
    },
  ];

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(false);

    try {
      if (onExport) {
        await onExport(selectedFormat);
      } else {
        // Simuler l'export
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const filename = `delegations-${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
        console.log(`Exporting to ${filename}`);
      }

      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Erreur lors de l\'export');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <FluentModal
      open={open}
      title="Exporter les délégations"
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Format selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Format d'export
          </label>
          <div className="grid grid-cols-1 gap-3">
            {formats.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => setSelectedFormat(format.id)}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                  selectedFormat === format.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg',
                    selectedFormat === format.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}
                >
                  {format.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {format.label}
                  </div>
                  <div className="text-sm text-slate-400 dark:text-slate-400">
                    {format.description}
                  </div>
                </div>
                {selectedFormat === format.id && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Success message */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <div className="text-sm text-emerald-700 dark:text-emerald-300">
              Export réussi ! Téléchargement en cours...
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <div className="text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <FluentButton
            variant="ghost"
            onClick={onClose}
            disabled={exporting}
          >
            Annuler
          </FluentButton>
          <FluentButton
            onClick={handleExport}
            loading={exporting}
            disabled={success}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

