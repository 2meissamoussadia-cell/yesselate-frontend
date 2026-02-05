/**
 * Modal d'export pour Anomalies & Annotations
 * Formats : CSV, Excel, PDF, JSON
 * Scopes : Tout, Filtré, Sélectionné
 */

'use client';

import { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, FileJson, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => Promise<void>;
  filteredCount?: number;
  selectedAnomalyCount?: number;
  selectedAnnotationCount?: number;
  hasFilters?: boolean;
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  scope: 'all' | 'filtered' | 'selected';
  options: {
    includeDetails: boolean;
    includeAnnotations: boolean;
    includeResolved: boolean;
  };
}

const EXPORT_FORMATS = [
  { 
    value: 'excel' as const, 
    label: 'Excel (XLSX)', 
    icon: FileSpreadsheet, 
    description: 'Feuille de calcul complète', 
    color: 'text-emerald-400' 
  },
  { 
    value: 'csv' as const, 
    label: 'CSV', 
    icon: FileText, 
    description: 'Données tabulaires simples', 
    color: 'text-blue-400' 
  },
  { 
    value: 'pdf' as const, 
    label: 'PDF', 
    icon: FileText, 
    description: 'Rapport formaté pour impression', 
    color: 'text-red-400' 
  },
  { 
    value: 'json' as const, 
    label: 'JSON', 
    icon: FileJson, 
    description: 'Format technique pour API', 
    color: 'text-amber-400' 
  },
];

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  filteredCount = 0,
  selectedAnomalyCount = 0,
  selectedAnnotationCount = 0,
  hasFilters = false,
}: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('excel');
  const [scope, setScope] = useState<'all' | 'filtered' | 'selected'>('filtered');
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [includeResolved, setIncludeResolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedCount = selectedAnomalyCount + selectedAnnotationCount;
  const canSelectFiltered = hasFilters && filteredCount > 0;
  const canSelectSelected = selectedCount > 0;

  const handleExport = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const config: ExportConfig = {
        format,
        scope,
        options: {
          includeDetails,
          includeAnnotations,
          includeResolved,
        },
      };

      await onExport(config);
      
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-400" />
                Exporter les données
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Choisissez le format et les options d'export
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-emerald-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Export réussi !</h3>
              <p className="text-slate-400 text-center">
                Votre fichier a été généré et téléchargé avec succès.
              </p>
            </div>
          ) : (
            <>
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Format d'export
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {EXPORT_FORMATS.map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.value}
                        onClick={() => setFormat(fmt.value)}
                        disabled={loading}
                        className={cn(
                          'p-4 rounded-lg border text-left transition-all',
                          format === fmt.value
                            ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
                            : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50',
                          loading && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', fmt.color)} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-200">{fmt.label}</div>
                            <div className="text-xs text-slate-400 mt-1">{fmt.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scope Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Portée de l'export
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setScope('all')}
                    disabled={loading}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-all',
                      scope === 'all'
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="font-medium text-slate-200">Toutes les données</div>
                    <div className="text-xs text-slate-400 mt-1">Export complet sans filtres</div>
                  </button>
                  
                  {canSelectFiltered && (
                    <button
                      onClick={() => setScope('filtered')}
                      disabled={loading}
                      className={cn(
                        'w-full p-3 rounded-lg border text-left transition-all',
                        scope === 'filtered'
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="font-medium text-slate-200">Résultats filtrés</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {filteredCount} élément{filteredCount > 1 ? 's' : ''} correspondant aux filtres
                      </div>
                    </button>
                  )}
                  
                  {canSelectSelected && (
                    <button
                      onClick={() => setScope('selected')}
                      disabled={loading}
                      className={cn(
                        'w-full p-3 rounded-lg border text-left transition-all',
                        scope === 'selected'
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50',
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="font-medium text-slate-200">Sélection</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Options d'inclusion
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <Checkbox
                      checked={includeDetails}
                      onCheckedChange={setIncludeDetails}
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">Détails complets</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Inclure toutes les informations détaillées
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <Checkbox
                      checked={includeAnnotations}
                      onCheckedChange={setIncludeAnnotations}
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">Annotations</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Inclure les annotations associées
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors">
                    <Checkbox
                      checked={includeResolved}
                      onCheckedChange={setIncludeResolved}
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">Anomalies résolues</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Inclure les anomalies déjà résolues
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700/50">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={loading}
              className="border-slate-700 text-slate-400"
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
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
        )}
      </div>
    </div>
  );
}

