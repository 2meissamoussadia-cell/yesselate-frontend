/**
 * AnalyticsExportModal.tsx
 * =========================
 * 
 * Modal d'export avancé pour les données Analytics
 * Supporte multiples formats, sélection de données, planification
 */

'use client';

import { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, FileSpreadsheet, FileText, FileJson, 
  Calendar, Clock, CheckCircle2, AlertCircle,
  Loader2, BarChart3, TrendingUp, DollarSign, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsExportModalProps {
  open: boolean;
  onClose: () => void;
}

type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';
type DataScope = 'all' | 'kpis' | 'bureaux' | 'financial' | 'alerts' | 'trends';
type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface ExportConfig {
  format: ExportFormat;
  scope: DataScope[];
  dateRange: DateRange;
  includeCharts: boolean;
  includeRawData: boolean;
  scheduledExport: boolean;
  scheduleFrequency: 'daily' | 'weekly' | 'monthly' | null;
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'excel', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="w-5 h-5 text-emerald-500" />, description: 'Tableaux avec formules et mise en forme' },
  { id: 'csv', label: 'CSV', icon: <FileText className="w-5 h-5 text-blue-500" />, description: 'Format léger, compatible tous systèmes' },
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5 text-red-500" />, description: 'Rapport formaté avec graphiques' },
  { id: 'json', label: 'JSON', icon: <FileJson className="w-5 h-5 text-amber-500" />, description: 'Données structurées pour API' },
];

const SCOPE_OPTIONS: { id: DataScope; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Toutes les données', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'kpis', label: 'KPIs uniquement', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'bureaux', label: 'Performance bureaux', icon: <Users className="w-4 h-4" /> },
  { id: 'financial', label: 'Données financières', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'alerts', label: 'Alertes', icon: <AlertCircle className="w-4 h-4" /> },
  { id: 'trends', label: 'Tendances', icon: <TrendingUp className="w-4 h-4" /> },
];

const DATE_RANGE_OPTIONS: { id: DateRange; label: string }[] = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'week', label: 'Cette semaine' },
  { id: 'month', label: 'Ce mois' },
  { id: 'quarter', label: 'Ce trimestre' },
  { id: 'year', label: 'Cette année' },
  { id: 'custom', label: 'Personnalisé' },
];

export function AnalyticsExportModal({ open, onClose }: AnalyticsExportModalProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'excel',
    scope: ['all'],
    dateRange: 'month',
    includeCharts: true,
    includeRawData: true,
    scheduledExport: false,
    scheduleFrequency: null,
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
    const baseSize = config.scope.includes('all') ? 500 : config.scope.length * 100;
    const chartMultiplier = config.includeCharts ? 2 : 1;
    const formatMultiplier = config.format === 'pdf' ? 1.5 : config.format === 'excel' ? 1.2 : 1;
    return Math.round(baseSize * chartMultiplier * formatMultiplier);
  }, [config]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      // Appel API pour export
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: config.format,
          scope: config.scope,
          dateRange: config.dateRange,
          includeCharts: config.includeCharts,
          includeRawData: config.includeRawData,
          scheduled: config.scheduledExport,
          frequency: config.scheduleFrequency,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExportResult({ 
          success: true, 
          message: config.scheduledExport 
            ? `Export planifié avec succès (${config.scheduleFrequency})` 
            : `Export généré avec succès! Téléchargement en cours...`
        });

        // Simuler téléchargement si pas planifié
        if (!config.scheduledExport && data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        }
      } else {
        throw new Error('Erreur lors de l\'export');
      }
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
      title="📥 Export des données Analytics"
      maxWidth="4xl"
      dark
    >
      <div className="space-y-6">
        {/* Format de sortie */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Format d'export
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FORMAT_OPTIONS.map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, format: format.id }))}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left bg-slate-900/50 border-slate-700',
                  config.format === format.id
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'hover:border-slate-600 hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {format.icon}
                  <span className="font-medium text-sm">{format.label}</span>
                </div>
                <p className="text-xs text-slate-400">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Périmètre des données */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Données à exporter
          </h3>
          <div className="flex flex-wrap gap-2">
            {SCOPE_OPTIONS.map((scope) => (
              <button
                key={scope.id}
                type="button"
                onClick={() => toggleScope(scope.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors bg-slate-900/50 border-slate-700',
                  config.scope.includes(scope.id)
                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                    : 'hover:bg-slate-800/50 text-slate-400'
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
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Période
          </h3>
          <div className="flex flex-wrap gap-2">
            {DATE_RANGE_OPTIONS.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, dateRange: range.id }))}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-colors text-sm bg-slate-900/50 border-slate-700',
                  config.dateRange === range.id
                    ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                    : 'hover:bg-slate-800/50 text-slate-400'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options avancées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
            <h4 className="text-sm font-medium mb-3 text-slate-200">Options de contenu</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-300">Inclure les graphiques</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeRawData}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeRawData: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-300">Inclure les données brutes</span>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
            <h4 className="text-sm font-medium mb-3 text-slate-200">Export planifié</h4>
            <label className="flex items-center gap-3 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={config.scheduledExport}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  scheduledExport: e.target.checked,
                  scheduleFrequency: e.target.checked ? 'weekly' : null
                }))}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-slate-300">Programmer un export récurrent</span>
            </label>
            {config.scheduledExport && (
              <Select
                value={config.scheduleFrequency || 'weekly'}
                onValueChange={(v: string) => setConfig(prev => ({ 
                  ...prev, 
                  scheduleFrequency: v as 'daily' | 'weekly' | 'monthly'
                }))}
              >
                <SelectTrigger className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Résumé et estimation */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Résumé de l'export
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {FORMAT_OPTIONS.find(f => f.id === config.format)?.label} • 
                {config.scope.includes('all') ? ' Toutes données' : ` ${config.scope.length} catégorie(s)`} • 
                {DATE_RANGE_OPTIONS.find(r => r.id === config.dateRange)?.label}
              </p>
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
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
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
            ) : config.scheduledExport ? (
              <>
                <Clock className="w-4 h-4" />
                Planifier l'export
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

