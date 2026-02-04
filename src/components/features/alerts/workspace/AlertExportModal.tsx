'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Code,
  Printer,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { filterAlertsByQueue, calculateAlertStats, type Alert } from '@/lib/data/alerts';

interface AlertExportModalProps {
  open: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

/**
 * AlertExportModal
 * ================
 * 
 * Modal pour exporter les alertes dans différents formats.
 */
export function AlertExportModal({ open, onClose }: AlertExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [includeResolved, setIncludeResolved] = useState(false);
  const [includeTimeline, setIncludeTimeline] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const formats: Array<{
    id: ExportFormat;
    label: string;
    icon: typeof FileText;
    description: string;
    recommended?: boolean;
  }> = [
    {
      id: 'csv',
      label: 'CSV',
      icon: FileSpreadsheet,
      description: 'Format tableur (Excel, Google Sheets)',
      recommended: true,
    },
    {
      id: 'excel',
      label: 'Excel',
      icon: FileSpreadsheet,
      description: 'Fichier Excel avec formatage',
    },
    {
      id: 'json',
      label: 'JSON',
      icon: Code,
      description: 'Format développeur (API, scripts)',
    },
    {
      id: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Document imprimable',
    },
  ];

  const handleExport = async () => {
    setExporting(true);
    setExportSuccess(false);

    try {
      // Récupérer toutes les alertes ou seulement les actives
      const alerts = includeResolved 
        ? filterAlertsByQueue('all')
        : filterAlertsByQueue('all').filter(a => a.status !== 'resolved');

      // Simuler l'export (en production, appeler l'API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Générer le fichier selon le format
      if (selectedFormat === 'csv') {
        exportToCSV(alerts);
      } else if (selectedFormat === 'json') {
        exportToJSON(alerts);
      } else if (selectedFormat === 'excel') {
        // En production: appeler API pour générer Excel
        console.log('Export Excel:', alerts);
      } else if (selectedFormat === 'pdf') {
        // En production: appeler API pour générer PDF
        console.log('Export PDF:', alerts);
      }

      setExportSuccess(true);
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Erreur export:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = (alerts: Alert[]) => {
    const headers = [
      'ID',
      'Titre',
      'Description',
      'Sévérité',
      'Type',
      'Statut',
      'Impact',
      'Bureau',
      'Responsable',
      'Créé le',
      'Résolu le',
      'Montant',
      'Jours bloqués',
    ];

    const rows = alerts.map(alert => [
      alert.id,
      alert.title,
      alert.description,
      alert.severity,
      alert.type,
      alert.status,
      alert.impact,
      alert.bureau || '',
      alert.responsible || '',
      alert.createdAt,
      alert.resolvedAt || '',
      alert.amount || '',
      alert.daysBlocked || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alertes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = (alerts: Alert[]) => {
    const data = includeTimeline 
      ? alerts 
      : alerts.map(({ timeline, ...rest }) => rest);

    const json = JSON.stringify({
      exportedAt: new Date().toISOString(),
      total: alerts.length,
      stats: calculateAlertStats(),
      alerts: data,
    }, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alertes_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Exporter les alertes"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Format selection */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Format d'export
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {formats.map((format) => {
              const Icon = format.icon;
              const isSelected = selectedFormat === format.id;
              
              return (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all text-left",
                    isSelected
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-purple-500/20" : "bg-slate-100 dark:bg-slate-800"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5",
                        isSelected ? "text-purple-500" : "text-slate-400"
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {format.label}
                        </span>
                        {format.recommended && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded">
                            Recommandé
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-400">
                        {format.description}
                      </p>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Options */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Options d'export
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
              <input
                type="checkbox"
                checked={includeResolved}
                onChange={(e) => setIncludeResolved(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Inclure les alertes résolues
                </p>
                <p className="text-xs text-slate-400">
                  Exporter également les alertes qui ont été résolues
                </p>
              </div>
            </label>

            {selectedFormat === 'json' && (
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                <input
                  type="checkbox"
                  checked={includeTimeline}
                  onChange={(e) => setIncludeTimeline(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Inclure la timeline
                  </p>
                  <p className="text-xs text-slate-400">
                    Exporter l'historique complet des événements
                  </p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Stats preview */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Aperçu de l'export
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Alertes</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                {includeResolved 
                  ? filterAlertsByQueue('all').length 
                  : filterAlertsByQueue('all').filter(a => a.status !== 'resolved').length}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Format</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200 uppercase">
                {selectedFormat}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Taille estimée</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                ~{Math.round(filterAlertsByQueue('all').length * 0.5)}KB
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <FluentButton
            variant="secondary"
            onClick={onClose}
            disabled={exporting}
          >
            Annuler
          </FluentButton>
          
          <FluentButton
            variant="primary"
            onClick={handleExport}
            disabled={exporting || exportSuccess}
          >
            {exporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Export en cours...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Export réussi !
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exporter
              </>
            )}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

