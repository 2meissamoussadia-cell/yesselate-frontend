'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, FileJson, X } from 'lucide-react';

interface AdvancedExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    period: string;
    totals: any;
    rates: any;
    risks: number;
    decisions: number;
    timestamp: string;
  };
}

export function AdvancedExportModal({ isOpen, onClose, data }: AdvancedExportModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [exporting, setExporting] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportToPDF = async () => {
    setExporting('pdf');
    addToast('Génération du PDF en cours...', 'info');

    // Simulation de génération PDF
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // En production, utiliser une librairie comme jsPDF ou react-pdf
    const content = `
      RAPPORT DASHBOARD MAÎTRE D'OUVRAGE
      Période: ${data.period}
      Date: ${new Date(data.timestamp).toLocaleDateString('fr-FR')}
      
      KPIs:
      - Demandes: ${data.totals.demandes}
      - Validations: ${data.totals.validations}
      - Rejets: ${data.totals.rejets}
      - Budget: ${data.totals.budget}Mds FCFA
      
      Taux:
      - Validation: ${data.rates.validation}%
      - Rejet: ${data.rates.reject}%
      
      Alertes:
      - Risques: ${data.risks}
      - Décisions: ${data.decisions}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(null);
    addToast('PDF exporté avec succès !', 'success');
  };

  const exportToExcel = async () => {
    setExporting('excel');
    addToast('Génération du fichier Excel en cours...', 'info');

    // Convertir les données en CSV (format Excel-compatible)
    const csvContent = [
      ['Métrique', 'Valeur'],
      ['Période', data.period],
      ['Demandes', data.totals.demandes],
      ['Validations', data.totals.validations],
      ['Rejets', data.totals.rejets],
      ['Budget (Mds FCFA)', data.totals.budget],
      ['Taux Validation (%)', data.rates.validation],
      ['Taux Rejet (%)', data.rates.reject],
      ['Nombre de Risques', data.risks],
      ['Nombre de Décisions', data.decisions],
      ['Date Export', new Date(data.timestamp).toLocaleString('fr-FR')],
    ]
      .map((row) => row.map((field) => `"${String(field)}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(null);
    addToast('Fichier Excel exporté avec succès !', 'success');
  };

  const exportToJSON = async () => {
    setExporting('json');
    addToast('Génération du JSON en cours...', 'info');

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExporting(null);
    addToast('JSON exporté avec succès !', 'success');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          'pointer-events-none'
        )}
      >
        <Card
          className={cn(
            'w-full max-w-md pointer-events-auto',
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="border-b border-slate-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Avancé
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 p-0"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-slate-400 mb-4">
              Choisissez le format d'export pour vos données du dashboard
            </p>

            <div className="space-y-2">
              <Button
                onClick={exportToPDF}
                disabled={exporting !== null}
                className="w-full justify-start"
                variant="secondary"
              >
                <FileText className="w-4 h-4 mr-2" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">PDF</div>
                  <div className="text-xs text-slate-400">Rapport formaté</div>
                </div>
                {exporting === 'pdf' && <Badge variant="info" className="text-[9px]">Génération...</Badge>}
              </Button>

              <Button
                onClick={exportToExcel}
                disabled={exporting !== null}
                className="w-full justify-start"
                variant="secondary"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Excel / CSV</div>
                  <div className="text-xs text-slate-400">Tableur compatible</div>
                </div>
                {exporting === 'excel' && <Badge variant="info" className="text-[9px]">Génération...</Badge>}
              </Button>

              <Button
                onClick={exportToJSON}
                disabled={exporting !== null}
                className="w-full justify-start"
                variant="secondary"
              >
                <FileJson className="w-4 h-4 mr-2" />
                <div className="flex-1 text-left">
                  <div className="font-semibold">JSON</div>
                  <div className="text-xs text-slate-400">Données structurées</div>
                </div>
                {exporting === 'json' && <Badge variant="info" className="text-[9px]">Génération...</Badge>}
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-700">
              <p className="text-[10px] text-slate-400">
                Les fichiers seront téléchargés automatiquement une fois générés.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

