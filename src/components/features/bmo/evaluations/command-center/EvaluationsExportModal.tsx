/**
 * EvaluationsExportModal
 * Modal d'export pour les évaluations
 */

'use client';

import { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, FileSpreadsheet, FileText, FileJson, 
  Calendar, Clock, CheckCircle2, AlertCircle,
  Loader2, ClipboardCheck, Users, Target, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvaluationsExportModalProps {
  open: boolean;
  onClose: () => void;
  filteredCount?: number;
  selectedCount?: number;
}

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';
type DataScope = 'all' | 'completed' | 'scheduled' | 'in_progress' | 'recommendations' | 'scores';
type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface ExportConfig {
  format: ExportFormat;
  scope: DataScope[];
  dateRange: DateRange;
  includeRecommendations: boolean;
  includeCriteria: boolean;
  includeDocuments: boolean;
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'excel', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="w-5 h-5 text-emerald-500" />, description: 'Tableaux avec formules et mise en forme' },
  { id: 'csv', label: 'CSV', icon: <FileText className="w-5 h-5 text-blue-500" />, description: 'Format léger, compatible tous systèmes' },
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5 text-red-500" />, description: 'Rapport formaté avec détails' },
  { id: 'json', label: 'JSON', icon: <FileJson className="w-5 h-5 text-amber-500" />, description: 'Données structurées pour API' },
];

const SCOPE_OPTIONS: { id: DataScope; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Toutes les évaluations', icon: <ClipboardCheck className="w-4 h-4" /> },
  { id: 'completed', label: 'Complétées uniquement', icon: <CheckCircle2 className="w-4 h-4" /> },
  { id: 'scheduled', label: 'Planifiées uniquement', icon: <Calendar className="w-4 h-4" /> },
  { id: 'in_progress', label: 'En cours uniquement', icon: <Clock className="w-4 h-4" /> },
  { id: 'recommendations', label: 'Avec recommandations', icon: <Target className="w-4 h-4" /> },
  { id: 'scores', label: 'Scores uniquement', icon: <BarChart3 className="w-4 h-4" /> },
];

const DATE_RANGE_OPTIONS: { id: DateRange; label: string }[] = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'week', label: 'Cette semaine' },
  { id: 'month', label: 'Ce mois' },
  { id: 'quarter', label: 'Ce trimestre' },
  { id: 'year', label: 'Cette année' },
  { id: 'custom', label: 'Personnalisé' },
];

export function EvaluationsExportModal({ open, onClose, filteredCount = 0, selectedCount = 0 }: EvaluationsExportModalProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    scope: ['all'],
    dateRange: 'month',
    includeRecommendations: true,
    includeCriteria: true,
    includeDocuments: false,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string } | null>(null);

  const toggleScope = (scope: DataScope) => {
    if (scope === 'all') {
      setConfig(prev => ({ ...prev, scope: ['all'] }));
    } else {
      setConfig(prev => {
        const newScope = prev.scope.includes(scope)
          ? prev.scope.filter(s => s !== scope)
          : [...prev.scope.filter(s => s !== 'all'), scope];
        return { ...prev, scope: newScope.length === 0 ? ['all'] : newScope };
      });
    }
  };

  const estimatedSize = useMemo(() => {
    const baseSize = config.scope.includes('all') ? 300 : config.scope.length * 50;
    const detailsMultiplier = (config.includeRecommendations ? 1.3 : 1) * (config.includeCriteria ? 1.2 : 1) * (config.includeDocuments ? 1.5 : 1);
    const formatMultiplier = config.format === 'pdf' ? 1.5 : config.format === 'excel' ? 1.2 : 1;
    return Math.round(baseSize * detailsMultiplier * formatMultiplier);
  }, [config]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      // Simuler l'export (à remplacer par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Générer le fichier
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `evaluations-export-${timestamp}.${config.format}`;
      
      // Pour l'instant, simuler un téléchargement
      const content = `Export des évaluations\nFormat: ${config.format}\nScope: ${config.scope.join(', ')}\nDate: ${timestamp}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportResult({ 
        success: true, 
        message: `Export généré avec succès! Fichier: ${filename}`
      });

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setExportResult({ 
        success: false, 
        message: 'Erreur lors de la génération de l\'export. Veuillez réessayer.' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="📥 Export des évaluations"
    >
      <div className="space-y-6">
        {/* Format de sortie */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Format d'export
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, format: format.id }))}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  config.format === format.id
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {format.icon}
                  <span className="font-medium text-sm">{format.label}</span>
                </div>
                <p className="text-xs text-slate-500">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Périmètre des données */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Données à exporter
          </h3>
          <div className="flex flex-wrap gap-2">
            {SCOPE_OPTIONS.map((scope) => (
              <button
                key={scope.id}
                type="button"
                onClick={() => toggleScope(scope.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                  config.scope.includes(scope.id)
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {scope.icon}
                <span className="text-sm">{scope.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Période */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
            Période
          </h3>
          <div className="flex flex-wrap gap-2">
            {DATE_RANGE_OPTIONS.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, dateRange: range.id }))}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-colors text-sm',
                  config.dateRange === range.id
                    ? 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options avancées */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium mb-3">Options de contenu</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeRecommendations}
                onChange={(e) => setConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm">Inclure les recommandations</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeCriteria}
                onChange={(e) => setConfig(prev => ({ ...prev, includeCriteria: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm">Inclure les critères détaillés</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeDocuments}
                onChange={(e) => setConfig(prev => ({ ...prev, includeDocuments: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm">Inclure les documents (liens)</span>
            </label>
          </div>
        </div>

        {/* Résumé et estimation */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Résumé de l'export
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {FORMAT_OPTIONS.find(f => f.id === config.format)?.label} • 
                {config.scope.includes('all') ? ' Toutes évaluations' : ` ${config.scope.length} catégorie(s)`} • 
                {DATE_RANGE_OPTIONS.find(r => r.id === config.dateRange)?.label}
              </p>
              {filteredCount > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  {filteredCount} évaluation(s) filtrée(s){selectedCount > 0 ? ` • ${selectedCount} sélectionnée(s)` : ''}
                </p>
              )}
            </div>
            <Badge variant="default" className="text-xs">
              ~{estimatedSize} Ko
            </Badge>
          </div>
        </div>

        {/* Résultat export */}
        {exportResult && (
          <div className={cn(
            'p-4 rounded-xl border flex items-start gap-3',
            exportResult.success
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          )}>
            {exportResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            )}
            <p className={cn(
              'text-sm',
              exportResult.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
            )}>
              {exportResult.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <FluentButton variant="secondary" onClick={onClose}>
            Annuler
          </FluentButton>
          <FluentButton
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Exporter maintenant
              </>
            )}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

