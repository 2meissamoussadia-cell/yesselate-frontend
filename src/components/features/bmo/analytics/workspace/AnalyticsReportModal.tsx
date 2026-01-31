/**
 * AnalyticsReportModal.tsx
 * =========================
 * 
 * Modal de génération de rapports personnalisés Analytics
 * Permet de créer des rapports détaillés avec sections configurables
 */

'use client';

import { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Calendar, Users, DollarSign, TrendingUp,
  BarChart3, PieChart, Activity, AlertTriangle, Target,
  CheckCircle2, Loader2, Download, Eye, Clock, Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsReportModalProps {
  open: boolean;
  onClose: () => void;
}

type ReportType = 'executive' | 'operational' | 'financial' | 'performance' | 'custom';
type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface ReportSection {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  included: boolean;
}

interface ReportConfig {
  type: ReportType;
  period: ReportPeriod;
  title: string;
  sections: ReportSection[];
  includeExecutiveSummary: boolean;
  includeRecommendations: boolean;
  includeCharts: boolean;
  compareWithPrevious: boolean;
  bureauFilter: string[];
}

const REPORT_TYPES: { id: ReportType; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'executive', label: 'Rapport Exécutif', description: 'Vue synthétique pour la direction', icon: <Building2 className="w-5 h-5" /> },
  { id: 'operational', label: 'Rapport Opérationnel', description: 'Détails des processus et flux', icon: <Activity className="w-5 h-5" /> },
  { id: 'financial', label: 'Rapport Financier', description: 'Budgets, dépenses et projections', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'performance', label: 'Rapport Performance', description: 'KPIs et métriques détaillés', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'custom', label: 'Rapport Personnalisé', description: 'Configuration libre', icon: <FileText className="w-5 h-5" /> },
];

const PERIOD_OPTIONS: { id: ReportPeriod; label: string }[] = [
  { id: 'week', label: 'Hebdomadaire' },
  { id: 'month', label: 'Mensuel' },
  { id: 'quarter', label: 'Trimestriel' },
  { id: 'year', label: 'Annuel' },
  { id: 'custom', label: 'Personnalisé' },
];

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: 'overview', name: 'Vue d\'ensemble', description: 'Résumé des indicateurs clés', icon: <BarChart3 className="w-4 h-4" />, included: true },
  { id: 'kpis', name: 'KPIs détaillés', description: 'Analyse de tous les indicateurs', icon: <Target className="w-4 h-4" />, included: true },
  { id: 'trends', name: 'Tendances', description: 'Évolutions et projections', icon: <TrendingUp className="w-4 h-4" />, included: true },
  { id: 'bureaux', name: 'Performance Bureaux', description: 'Classement et comparaison', icon: <Users className="w-4 h-4" />, included: true },
  { id: 'financial', name: 'Analyse Financière', description: 'Budgets et consommation', icon: <DollarSign className="w-4 h-4" />, included: false },
  { id: 'alerts', name: 'Alertes et Risques', description: 'Points d\'attention', icon: <AlertTriangle className="w-4 h-4" />, included: true },
  { id: 'distribution', name: 'Répartition', description: 'Graphiques de distribution', icon: <PieChart className="w-4 h-4" />, included: false },
  { id: 'sla', name: 'Conformité SLA', description: 'Respect des délais', icon: <Clock className="w-4 h-4" />, included: false },
];

const MOCK_BUREAUX = [
  { code: 'BTP', name: 'Bureau des Travaux Publics' },
  { code: 'DG', name: 'Direction Générale' },
  { code: 'DAF', name: 'Direction Administrative et Financière' },
  { code: 'BJ', name: 'Bureau Juridique' },
  { code: 'DSI', name: 'Direction des Systèmes d\'Information' },
];

export function AnalyticsReportModal({ open, onClose }: AnalyticsReportModalProps) {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'executive',
    period: 'month',
    title: 'Rapport Analytics',
    sections: DEFAULT_SECTIONS,
    includeExecutiveSummary: true,
    includeRecommendations: true,
    includeCharts: true,
    compareWithPrevious: true,
    bureauFilter: [],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; downloadUrl?: string } | null>(null);

  const toggleSection = (sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, included: !s.included } : s
      ),
    }));
  };

  const toggleBureau = (bureauCode: string) => {
    setConfig(prev => ({
      ...prev,
      bureauFilter: prev.bureauFilter.includes(bureauCode)
        ? prev.bureauFilter.filter(b => b !== bureauCode)
        : [...prev.bureauFilter, bureauCode],
    }));
  };

  const applyReportTypePreset = (type: ReportType) => {
    let preset: Partial<ReportConfig> = { type };
    
    switch (type) {
      case 'executive':
        preset = {
          ...preset,
          title: 'Rapport Exécutif Analytics',
          includeExecutiveSummary: true,
          includeRecommendations: true,
          sections: config.sections.map(s => ({
            ...s,
            included: ['overview', 'kpis', 'alerts'].includes(s.id),
          })),
        };
        break;
      case 'operational':
        preset = {
          ...preset,
          title: 'Rapport Opérationnel Analytics',
          sections: config.sections.map(s => ({
            ...s,
            included: ['overview', 'kpis', 'trends', 'bureaux', 'sla'].includes(s.id),
          })),
        };
        break;
      case 'financial':
        preset = {
          ...preset,
          title: 'Rapport Financier Analytics',
          sections: config.sections.map(s => ({
            ...s,
            included: ['overview', 'financial', 'distribution'].includes(s.id),
          })),
        };
        break;
      case 'performance':
        preset = {
          ...preset,
          title: 'Rapport de Performance Analytics',
          sections: config.sections.map(s => ({
            ...s,
            included: ['kpis', 'trends', 'bureaux', 'sla'].includes(s.id),
          })),
        };
        break;
      case 'custom':
        preset = { ...preset, title: 'Rapport Personnalisé' };
        break;
    }

    setConfig(prev => ({ ...prev, ...preset }));
  };

  const estimatedPages = useMemo(() => {
    const activeSections = config.sections.filter(s => s.included).length;
    const basePages = 2; // Couverture + sommaire
    const sectionPages = activeSections * 2;
    const extras = (config.includeExecutiveSummary ? 1 : 0) + (config.includeRecommendations ? 1 : 0);
    return basePages + sectionPages + extras;
  }, [config]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          period: config.period,
          title: config.title,
          sections: config.sections.filter(s => s.included).map(s => s.id),
          options: {
            includeExecutiveSummary: config.includeExecutiveSummary,
            includeRecommendations: config.includeRecommendations,
            includeCharts: config.includeCharts,
            compareWithPrevious: config.compareWithPrevious,
          },
          bureauFilter: config.bureauFilter,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          success: true,
          message: 'Rapport généré avec succès!',
          downloadUrl: data.downloadUrl || '/api/analytics/reports/download?id=' + data.reportId,
        });
      } else {
        throw new Error('Erreur lors de la génération');
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Erreur lors de la génération du rapport. Veuillez réessayer.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="📊 Génération de rapport"
      maxWidth="5xl"
      dark
    >
      <div className="space-y-6">
        {/* Type de rapport */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Type de rapport
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {REPORT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => applyReportTypePreset(type.id)}
                className={cn(
                  'p-3 rounded-xl border-2 transition-all text-left bg-slate-900/50 border-slate-700',
                  config.type === type.id
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'hover:border-slate-600 hover:bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-2 mb-1 text-orange-500">
                  {type.icon}
                </div>
                <p className="font-medium text-xs text-slate-200">{type.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Titre et période */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-200 mb-2 block">
              Titre du rapport
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 placeholder:text-slate-400"
              placeholder="Titre du rapport..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-200 mb-2 block">
              Période
            </label>
            <div className="flex flex-wrap gap-2">
              {PERIOD_OPTIONS.map((period) => (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, period: period.id }))}
                  className={cn(
                    'px-3 py-2 rounded-lg border text-sm transition-colors bg-slate-900/50 border-slate-700',
                    config.period === period.id
                      ? 'border-orange-500/50 bg-orange-500/10 text-orange-300'
                      : 'hover:bg-slate-800/50 text-slate-400'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sections à inclure */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Sections à inclure
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {config.sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => toggleSection(section.id)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border text-left transition-colors bg-slate-900/50 border-slate-700',
                  section.included
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'hover:bg-slate-800/50 text-slate-400'
                )}
              >
                <div className={cn(
                  'flex-shrink-0',
                  section.included ? 'text-emerald-500' : 'text-slate-400'
                )}>
                  {section.icon}
                </div>
                <div className="min-w-0">
                  <p className={cn(
                    'text-xs font-medium truncate',
                    section.included ? 'text-emerald-300' : 'text-slate-400'
                  )}>{section.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options avancées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
            <h4 className="text-sm font-medium mb-3 text-slate-200">Options de contenu</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeExecutiveSummary}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeExecutiveSummary: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-300">Résumé exécutif</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeRecommendations}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-300">Recommandations</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-300">Inclure graphiques</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.compareWithPrevious}
                  onChange={(e) => setConfig(prev => ({ ...prev, compareWithPrevious: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-300">Comparer période précédente</span>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/50">
            <h4 className="text-sm font-medium mb-3 text-slate-200">Filtrer par bureau</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {MOCK_BUREAUX.map((bureau) => (
                <label key={bureau.code} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.bureauFilter.includes(bureau.code)}
                    onChange={() => toggleBureau(bureau.code)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-300">{bureau.code} - {bureau.name}</span>
                </label>
              ))}
            </div>
            {config.bureauFilter.length === 0 && (
              <p className="text-xs text-slate-400 mt-2">Tous les bureaux inclus</p>
            )}
          </div>
        </div>

        {/* Estimation */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Estimation du rapport
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {config.sections.filter(s => s.included).length} sections • 
                {config.includeCharts ? ' avec graphiques' : ' sans graphiques'} • 
                {PERIOD_OPTIONS.find(p => p.id === config.period)?.label}
              </p>
            </div>
            <Badge variant="default" className="text-xs">
              ~{estimatedPages} pages
            </Badge>
          </div>
        </div>

        {/* Résultat */}
        {result && (
          <div className={cn(
            'p-4 rounded-xl border flex items-start gap-3',
            result.success
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          )}>
            <CheckCircle2 className={cn(
              'w-5 h-5 flex-shrink-0',
              result.success ? 'text-emerald-500' : 'text-red-500'
            )} />
            <div className="flex-1">
              <p className={cn(
                'text-sm',
                result.success ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
              )}>
                {result.message}
              </p>
              {result.success && result.downloadUrl && (
                <a
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  <Download className="w-4 h-4" />
                  Télécharger le rapport
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <FluentButton variant="secondary" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4" />
            {previewMode ? 'Masquer aperçu' : 'Aperçu'}
          </FluentButton>

          <div className="flex items-center gap-3">
            <FluentButton variant="secondary" onClick={onClose}>
              Annuler
            </FluentButton>
            <FluentButton
              variant="primary"
              onClick={handleGenerate}
              disabled={isGenerating || config.sections.filter(s => s.included).length === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Générer le rapport
                </>
              )}
            </FluentButton>
          </div>
        </div>
      </div>
    </FluentModal>
  );
}

