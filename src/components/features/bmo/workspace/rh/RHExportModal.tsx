'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { demandesRH } from '@/lib/data/bmo-mock-2';
import type { HRRequest } from '@/lib/types/bmo.types';
import { 
  Download, FileSpreadsheet, FileText, CheckCircle2, 
  Calendar, Filter, FileJson
} from 'lucide-react';

type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';
type ExportScope = 'all' | 'pending' | 'validated' | 'rejected' | 'filtered';
type ExportFields = 'basic' | 'complete' | 'custom';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filteredDemands?: HRRequest[];
};

export function RHExportModal({ open, onOpenChange, filteredDemands }: Props) {
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [scope, setScope] = useState<ExportScope>('all');
  const [fields, setFields] = useState<ExportFields>('complete');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [includeDocuments, setIncludeDocuments] = useState(false);
  const [includeRules, setIncludeRules] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Calcul du nombre de demandes à exporter
  const getDemandsCount = () => {
    switch (scope) {
      case 'pending':
        return demandesRH.filter(d => d.status === 'pending').length;
      case 'validated':
        return demandesRH.filter(d => d.status === 'validated').length;
      case 'rejected':
        return demandesRH.filter(d => d.status === 'rejected').length;
      case 'filtered':
        return filteredDemands?.length || 0;
      default:
        return demandesRH.length;
    }
  };

  // Génération du CSV
  const generateCSV = (demands: HRRequest[]) => {
    const headers = [
      'ID', 'Type', 'Sous-type', 'Agent', 'Bureau', 'Statut', 'Priorité',
      'Date demande', 'Date début', 'Date fin', 'Jours', 'Montant', 'Motif'
    ];
    
    const rows = demands.map(d => [
      d.id,
      d.type,
      d.subtype || '',
      d.agent,
      d.bureau,
      d.status,
      d.priority,
      d.date,
      d.startDate || '',
      d.endDate || '',
      d.days || '',
      d.amount || '',
      d.reason.replace(/,/g, ';') // Escape commas
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csv;
  };

  // Génération du JSON
  const generateJSON = (demands: HRRequest[]) => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      totalDemands: demands.length,
      demands: demands.map(d => ({
        ...d,
        validation: includeRules ? {
          // Ajouter ici les règles de validation si disponibles
        } : undefined,
      }))
    }, null, 2);
  };

  // Génération du PDF (simulation)
  const generatePDF = (demands: HRRequest[]) => {
    // En production, utiliser jsPDF ou similaire
    return `PDF Report - ${demands.length} demandes`;
  };

  // Génération Excel (simulation)
  const generateExcel = (demands: HRRequest[]) => {
    // En production, utiliser xlsx ou similaire
    return `Excel Report - ${demands.length} demandes`;
  };

  // Lancer l'export
  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Sélectionner les demandes selon le scope
      let demandsToExport: HRRequest[] = [];
      
      switch (scope) {
        case 'pending':
          demandsToExport = demandesRH.filter(d => d.status === 'pending');
          break;
        case 'validated':
          demandsToExport = demandesRH.filter(d => d.status === 'validated');
          break;
        case 'rejected':
          demandsToExport = demandesRH.filter(d => d.status === 'rejected');
          break;
        case 'filtered':
          demandsToExport = filteredDemands || [];
          break;
        default:
          demandsToExport = demandesRH;
      }
      
      // Appliquer filtre de dates si défini
      if (dateRange.start && dateRange.end) {
        demandsToExport = demandsToExport.filter(d => {
          const demandDate = d.date;
          return demandDate >= dateRange.start && demandDate <= dateRange.end;
        });
      }
      
      // Générer le contenu selon le format
      let content: string;
      let filename: string;
      let mimeType: string;
      
      switch (format) {
        case 'csv':
          content = generateCSV(demandsToExport);
          filename = `demandes-rh-${Date.now()}.csv`;
          mimeType = 'text/csv';
          break;
        
        case 'json':
          content = generateJSON(demandsToExport);
          filename = `demandes-rh-${Date.now()}.json`;
          mimeType = 'application/json';
          break;
        
        case 'pdf':
          content = generatePDF(demandsToExport);
          filename = `demandes-rh-${Date.now()}.pdf`;
          mimeType = 'application/pdf';
          break;
        
        case 'excel':
        default:
          content = generateExcel(demandsToExport);
          filename = `demandes-rh-${Date.now()}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      
      // Télécharger le fichier
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Fermer le modal
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
      
    } catch (error) {
      console.error('Erreur export:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatConfig = {
    pdf: { icon: FileText, label: 'PDF', color: 'text-red-500', bg: 'bg-red-500/10' },
    excel: { icon: FileSpreadsheet, label: 'Excel', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    csv: { icon: FileSpreadsheet, label: 'CSV', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    json: { icon: FileJson, label: 'JSON', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  };

  return (
    <FluentModal
      open={open}
      title="Exporter les demandes RH"
      onClose={() => onOpenChange(false)}
    >
      <div className="space-y-6">
        {/* Format d'export */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Format d&apos;export
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(formatConfig) as ExportFormat[]).map((f) => {
              const config = formatConfig[f];
              const Icon = config.icon;
              const isSelected = format === f;
              
              return (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    isSelected
                      ? "border-orange-500 bg-orange-500/5"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", config.bg)}>
                      <Icon className={cn("w-5 h-5", config.color)} />
                    </div>
                    <div>
                      <div className="font-semibold">{config.label}</div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Périmètre */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Périmètre
          </h3>
          
          <div className="space-y-2">
            {[
              { id: 'all', label: 'Toutes les demandes', count: demandesRH.length },
              { id: 'pending', label: 'En attente', count: demandesRH.filter(d => d.status === 'pending').length },
              { id: 'validated', label: 'Validées', count: demandesRH.filter(d => d.status === 'validated').length },
              { id: 'rejected', label: 'Rejetées', count: demandesRH.filter(d => d.status === 'rejected').length },
              ...(filteredDemands ? [{ id: 'filtered', label: 'Filtre actuel', count: filteredDemands.length }] : []),
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setScope(id as ExportScope)}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all text-left flex items-center justify-between",
                  scope === id
                    ? "border-orange-500 bg-orange-500/5"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                )}
              >
                <span className="font-medium">{label}</span>
                <Badge variant="default">{count}</Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Plage de dates */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Plage de dates (optionnel)
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1 text-slate-400">Date début</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-slate-400">Date fin</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 
                           bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              />
            </div>
          </div>
        </div>

        {/* Options avancées */}
        <div>
          <h3 className="font-semibold mb-3">Options avancées</h3>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <input
                type="checkbox"
                checked={includeRules}
                onChange={(e) => setIncludeRules(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 accent-orange-500"
              />
              <span className="text-sm">Inclure les règles de validation</span>
            </label>
            
            <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <input
                type="checkbox"
                checked={includeDocuments}
                onChange={(e) => setIncludeDocuments(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 accent-orange-500"
              />
              <span className="text-sm">Inclure les références aux documents</span>
            </label>
          </div>
        </div>

        {/* Résumé */}
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Demandes à exporter:</span>
                <span className="font-bold">{getDemandsCount()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Format:</span>
                <span className="font-semibold">{formatConfig[format].label}</span>
              </div>
              {dateRange.start && dateRange.end && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Période:</span>
                  <span className="font-semibold">{dateRange.start} → {dateRange.end}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          
          <Button
            variant="default"
            onClick={handleExport}
            disabled={exporting || getDemandsCount() === 0}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Export en cours...' : `Exporter (${getDemandsCount()})`}
          </Button>
        </div>
      </div>
    </FluentModal>
  );
}

