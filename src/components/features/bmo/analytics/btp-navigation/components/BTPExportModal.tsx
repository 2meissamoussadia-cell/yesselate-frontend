/**
 * Modale d'Export pour Analytics BTP
 * Permet d'exporter les données dans différents formats (PDF, Excel, CSV, JSON)
 */

'use client';

import React, { useState } from 'react';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { Download, FileText, FileSpreadsheet, FileJson, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { exportToCSV, exportToJSON, exportToExcel } from '@/application/utils/exportUtils';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface ExportOption {
  id: string;
  label: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface BTPExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  filename?: string;
  title?: string;
}

export function BTPExportModal({
  isOpen,
  onClose,
  data,
  filename = 'analytics-export',
  title = 'Exporter les données',
}: BTPExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('excel');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeData, setIncludeData] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions: ExportOption[] = [
    {
      id: 'excel',
      label: 'Excel (.xlsx)',
      format: 'excel',
      icon: FileSpreadsheet,
      description: 'Format Excel avec graphiques et données',
    },
    {
      id: 'pdf',
      label: 'PDF',
      format: 'pdf',
      icon: FileText,
      description: 'Document PDF avec mise en page professionnelle',
    },
    {
      id: 'csv',
      label: 'CSV',
      format: 'csv',
      icon: File,
      description: 'Fichier CSV pour analyse dans Excel',
    },
    {
      id: 'json',
      label: 'JSON',
      format: 'json',
      icon: FileJson,
      description: 'Format JSON pour traitement programmatique',
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        data: includeData ? data : undefined,
        charts: includeCharts ? undefined : undefined, // À implémenter
        metadata: {
          exportedAt: new Date().toISOString(),
          format: selectedFormat,
        },
      };

      // Pour PDF et Excel avec graphiques, utiliser l'API backend
      if ((selectedFormat === 'pdf' || selectedFormat === 'excel') && includeCharts) {
        const response = await fetch('/api/analytics/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            format: selectedFormat,
            type: 'detailed',
            data: exportData.data,
            includeCharts: includeCharts,
            filename: filename,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Si l'export est asynchrone, afficher un message
          if (result.export?.status === 'processing') {
            alert(`Export en cours. Vous recevrez une notification quand il sera prêt.`);
          } else if (result.export?.downloadUrl) {
            window.open(result.export.downloadUrl, '_blank');
          }
        } else {
          throw new Error('Erreur lors de l\'export');
        }
      } else {
        // Pour CSV, JSON, et Excel sans graphiques, exporter directement
        switch (selectedFormat) {
          case 'csv':
            if (Array.isArray(data)) {
              exportToCSV(data, filename);
            } else {
              exportToCSV([data], filename);
            }
            break;
          case 'json':
            exportToJSON(exportData, filename);
            break;
          case 'excel':
            if (Array.isArray(data)) {
              await exportToExcel(data, `${filename}.xlsx`);
            } else {
              await exportToExcel([data], `${filename}.xlsx`);
            }
            break;
          case 'pdf':
            // Pour PDF sans graphiques, utiliser l'API
            const response = await fetch('/api/analytics/export', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                format: 'pdf',
                type: 'detailed',
                data: exportData.data,
                includeCharts: false,
                filename: filename,
              }),
            });
            if (response.ok) {
              const result = await response.json();
              if (result.export?.downloadUrl) {
                window.open(result.export.downloadUrl, '_blank');
              }
            }
            break;
        }
      }

      onClose();
    } catch (error) {
      logger.error('Export error', error instanceof Error ? error : undefined, { component: 'BTPExportModal' });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedOption = exportOptions.find((opt) => opt.id === selectedFormat);

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Choisissez le format et les options d'export"
      size="md"
      actions={[
        {
          label: 'Exporter',
          onClick: handleExport,
          icon: Download,
          variant: 'primary',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Format */}
        <div>
          <Label className="text-sm font-semibold text-slate-300 mb-3 block">
            Format d'export
          </Label>
          <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
            <div className="space-y-3">
              {exportOptions.map((option) => {
                const OptionIcon = option.icon;
                return (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                      selectedFormat === option.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    )}
                    onClick={() => setSelectedFormat(option.id)}
                  >
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <OptionIcon className="h-4 w-4 text-slate-400" />
                        <Label
                          htmlFor={option.id}
                          className="text-sm font-medium text-slate-300 cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                      <p className="text-xs text-slate-400">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Options */}
        <div>
          <Label className="text-sm font-semibold text-slate-300 mb-3 block">
            Options
          </Label>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-data"
                checked={includeData}
                onCheckedChange={(checked) => setIncludeData(checked === true)}
              />
              <Label htmlFor="include-data" className="text-sm text-slate-300 cursor-pointer">
                Inclure les données
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(checked === true)}
              />
              <Label htmlFor="include-charts" className="text-sm text-slate-300 cursor-pointer">
                Inclure les graphiques
              </Label>
            </div>
          </div>
        </div>

        {/* Aperçu */}
        {selectedOption && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Format sélectionné</p>
            <div className="flex items-center gap-2">
              <selectedOption.icon className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-300">{selectedOption.label}</span>
            </div>
          </div>
        )}
      </div>
    </BTPIntelligentModal>
  );
}

