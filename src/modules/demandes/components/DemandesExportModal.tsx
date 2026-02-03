/**
 * Modal d'export pour Demandes
 */

'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, FileText, FileJson } from 'lucide-react';
import type { Demande } from '../types/demandesTypes';

interface DemandesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Demande[];
}

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';

export function DemandesExportModal({ isOpen, onClose, data }: DemandesExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      let blob: Blob;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          filename = `demandes-${timestamp}.json`;
          mimeType = 'application/json';
          break;

        case 'csv':
          // Convertir en CSV
          const headers = ['Référence', 'Titre', 'Statut', 'Priorité', 'Service', 'Montant', 'Date de création', 'Créé par'];
          const rows = data.map((d) => [
            d.reference,
            d.title,
            d.status,
            d.priority,
            d.service,
            d.montant?.toString() || '',
            d.createdAt.toISOString().split('T')[0],
            d.createdBy,
          ]);
          const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
          ].join('\n');
          blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel
          filename = `demandes-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;

        case 'excel':
          // Pour Excel, on utilise CSV avec l'extension .xlsx (ou on peut utiliser une bibliothèque xlsx plus tard)
          // Pour l'instant, on génère un CSV qui s'ouvre bien dans Excel
          const excelHeaders = ['Référence', 'Titre', 'Statut', 'Priorité', 'Service', 'Montant', 'Date de création', 'Créé par'];
          const excelRows = data.map((d) => [
            d.reference,
            d.title,
            d.status,
            d.priority,
            d.service,
            d.montant?.toString() || '',
            d.createdAt.toISOString().split('T')[0],
            d.createdBy,
          ]);
          const excelContent = [
            excelHeaders.join(','),
            ...excelRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
          ].join('\n');
          blob = new Blob(['\ufeff' + excelContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          filename = `demandes-${timestamp}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;

        case 'pdf':
          // Pour PDF, on génère un texte simple pour l'instant
          // TODO: Utiliser jsPDF ou une autre bibliothèque pour générer un vrai PDF
          const pdfContent = `DEMANDES - EXPORT ${timestamp}\n\n` +
            data.map((d, i) => 
              `${i + 1}. ${d.reference} - ${d.title}\n` +
              `   Statut: ${d.status} | Priorité: ${d.priority} | Service: ${d.service}\n` +
              `   Montant: ${d.montant ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(d.montant) : 'N/A'}\n` +
              `   Date: ${d.createdAt.toISOString().split('T')[0]} | Par: ${d.createdBy}\n`
            ).join('\n');
          blob = new Blob([pdfContent], { type: 'application/pdf' });
          filename = `demandes-${timestamp}.pdf`;
          mimeType = 'application/pdf';
          break;

        default:
          throw new Error(`Format d'export non supporté: ${format}`);
      }

      // Télécharger le fichier
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      // L'erreur sera gérée par le composant parent si nécessaire
      // Ne pas logger en production
      if (process.env.NODE_ENV === 'development' && error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error('Export error:', error.message);
      }
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-200">Exporter les demandes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-300 mb-3 block">Format</Label>
            <div className="space-y-2">
              {[
                { id: 'excel' as ExportFormat, label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { id: 'csv' as ExportFormat, label: 'CSV (.csv)', icon: FileSpreadsheet },
                { id: 'pdf' as ExportFormat, label: 'PDF (.pdf)', icon: FileText },
                { id: 'json' as ExportFormat, label: 'JSON (.json)', icon: FileJson },
              ].map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <div
                    key={fmt.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                      ${format === fmt.id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50'
                      }
                    `}
                    onClick={() => setFormat(fmt.id)}
                  >
                    <Icon className="h-5 w-5 text-slate-400" />
                    <Label className="flex-1 text-sm text-slate-300 cursor-pointer">{fmt.label}</Label>
                    <Checkbox checked={format === fmt.id} onCheckedChange={() => setFormat(fmt.id)} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400">
              {data.length} demande{data.length > 1 ? 's' : ''} sera{data.length > 1 ? 'ont' : ''} exportée{data.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
            Annuler
          </Button>
          <Button size="sm" onClick={handleExport} disabled={isExporting} className="gap-2">
            <Download className="h-4 w-4" />
            {isExporting ? 'Export...' : 'Exporter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

