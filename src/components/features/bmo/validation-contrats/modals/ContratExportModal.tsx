/**
 * Modal d'export de contrats
 * Permet de choisir le format, périmètre et options d'export
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText, Code, Loader2 } from 'lucide-react';
import { useContratToast } from '@/hooks/useContratToast';

interface ContratExportModalProps {
  open: boolean;
  onClose: () => void;
  filteredCount?: number;
  selectedCount?: number;
}

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';
type ExportScope = 'all' | 'filtered' | 'selected';

export function ContratExportModal({
  open,
  onClose,
  filteredCount = 0,
  selectedCount = 0,
}: ContratExportModalProps) {
  const toast = useContratToast();
  const [format, setFormat] = useState<ExportFormat>('excel');
  const [scope, setScope] = useState<ExportScope>('all');
  const [loading, setLoading] = useState(false);

  const [includeGeneral, setIncludeGeneral] = useState(true);
  const [includeFournisseurs, setIncludeFournisseurs] = useState(true);
  const [includeClauses, setIncludeClauses] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(false);
  const [includeHistorique, setIncludeHistorique] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(false);
  const [anonymize, setAnonymize] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    
    // Simuler export
    await new Promise(r => setTimeout(r, 2000));
    
    toast.exportSuccess(format.toUpperCase());
    setLoading(false);
    onClose();
  };

  const formatIcons = {
    excel: FileSpreadsheet,
    csv: FileText,
    pdf: FileText,
    json: Code,
  };

  const FormatIcon = formatIcons[format];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-200">Exporter les contrats</DialogTitle>
          <DialogDescription className="text-slate-400">
            Choisissez le format et les options d'export
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Format */}
          <div className="space-y-3">
            <Label className="text-slate-300">Format d'export</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
                { value: 'csv', label: 'CSV (.csv)', icon: FileText },
                { value: 'pdf', label: 'PDF (rapport)', icon: FileText },
                { value: 'json', label: 'JSON (données)', icon: Code },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setFormat(value as ExportFormat)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    format === value
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Périmètre */}
          <div className="space-y-3">
            <Label className="text-slate-300">Périmètre</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={(e) => setScope(e.target.value as ExportScope)}
                  className="text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200">Tous les contrats</p>
                  <p className="text-xs text-slate-400">73 contrats au total</p>
                </div>
              </label>

              {filteredCount > 0 && (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="filtered"
                    checked={scope === 'filtered'}
                    onChange={(e) => setScope(e.target.value as ExportScope)}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Contrats filtrés</p>
                    <p className="text-xs text-slate-400">{filteredCount} contrats avec filtres actifs</p>
                  </div>
                </label>
              )}

              {selectedCount > 0 && (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 cursor-pointer hover:border-slate-600 transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="selected"
                    checked={scope === 'selected'}
                    onChange={(e) => setScope(e.target.value as ExportScope)}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-200">Sélection manuelle</p>
                    <p className="text-xs text-slate-400">{selectedCount} contrats sélectionnés</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Données à inclure */}
          <div className="space-y-3">
            <Label className="text-slate-300">Données à inclure</Label>
            <div className="grid grid-cols-2 gap-2">
              <Checkbox label="Informations générales" checked={includeGeneral} onChange={setIncludeGeneral} />
              <Checkbox label="Fournisseurs" checked={includeFournisseurs} onChange={setIncludeFournisseurs} />
              <Checkbox label="Clauses" checked={includeClauses} onChange={setIncludeClauses} />
              <Checkbox label="Documents" checked={includeDocuments} onChange={setIncludeDocuments} />
              <Checkbox label="Historique" checked={includeHistorique} onChange={setIncludeHistorique} />
            </div>
          </div>

          {/* Options avancées */}
          <div className="space-y-3">
            <Label className="text-slate-300">Options avancées</Label>
            <div className="space-y-2">
              <Checkbox 
                label="Inclure audit trail (hash SHA-256)" 
                checked={includeAudit} 
                onChange={setIncludeAudit}
                description="Ajoute un manifest d'audit avec hash cryptographique"
              />
              <Checkbox 
                label="Anonymiser données sensibles" 
                checked={anonymize} 
                onChange={setAnonymize}
                description="Masque les informations personnelles et confidentielles"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-700/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="border-slate-700 text-slate-400"
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            {loading ? (
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
      </DialogContent>
    </Dialog>
  );
}

function Checkbox({ 
  label, 
  checked, 
  onChange, 
  description 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
      />
      <div>
        <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-xs text-slate-600 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

