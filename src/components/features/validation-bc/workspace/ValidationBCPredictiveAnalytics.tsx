'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  Lightbulb,
  BarChart2,
  Target,
  Zap,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface Prediction {
  documentId?: string;
  probabilityOfBreach: number;
  estimatedBreachTime: string;
}

interface Bottleneck {
  bureau: string;
  reason: string;
  estimatedDelay: number;
  confidence: number;
}

interface Recommendation {
  priority: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  action: string;
}

interface InsightsData {
  kpis: {
    healthScore: number;
    validationRate: number;
    avgProcessingTime: number;
    slaCompliance: number;
    anomalyRate: number;
  };
  predictions: {
    expectedVolumeToday: number;
    expectedVolumeWeek: number;
    predictedBottlenecks: Bottleneck[];
    riskOfSlaBreaches: Prediction[];
  };
  trends: {
    volumeTrend: string;
    volumeChange: number;
    processingTimeTrend: string;
    processingTimeChange: number;
    anomalyTrend: string;
    anomalyChange: number;
  };
  recommendations: Recommendation[];
  bureauPerformance: {
    bureau: string;
    pending: number;
    avgProcessingTime: number;
    slaCompliance: number;
    trend: string;
  }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// ============================================
// Component
// ============================================
export function ValidationBCPredictiveAnalytics({ open, onClose }: Props) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/validation-bc/insights');
      if (!res.ok) throw new Error('Erreur chargement insights');
      
      const data = await res.json();
      setInsights(data.data);
    } catch (e) {
      setError('Impossible de charger les analytics');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadInsights();
    }
  }, [open, loadInsights]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'rose';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-rose-500" />;
      default:
        return <span className="text-slate-400">—</span>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-rose-200/50 bg-rose-50/50 dark:border-rose-800/30 dark:bg-rose-900/20';
      case 'medium':
        return 'border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-900/20';
      default:
        return 'border-slate-200/50 bg-slate-50/50 dark:border-slate-800/30 dark:bg-slate-900/20';
    }
  };

  return (
    <FluentModal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          <span>Analytics Prédictifs</span>
        </div>
      }
      onClose={onClose}
    >
      <div className="space-y-4 max-h-[70vh] overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
            <div>{error}</div>
            <FluentButton size="sm" variant="secondary" onClick={loadInsights} className="mt-4">
              Réessayer
            </FluentButton>
          </div>
        ) : insights ? (
          <>
            {/* Score de santé */}
            <div className={cn(
              "p-4 rounded-xl border flex items-center justify-between",
              getHealthColor(insights.kpis.healthScore) === 'emerald' && "border-emerald-200/50 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/20",
              getHealthColor(insights.kpis.healthScore) === 'amber' && "border-amber-200/50 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/20",
              getHealthColor(insights.kpis.healthScore) === 'rose' && "border-rose-200/50 bg-rose-50/30 dark:border-rose-800/30 dark:bg-rose-950/20"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold",
                  getHealthColor(insights.kpis.healthScore) === 'emerald' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
                  getHealthColor(insights.kpis.healthScore) === 'amber' && "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
                  getHealthColor(insights.kpis.healthScore) === 'rose' && "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                )}>
                  {insights.kpis.healthScore}
                </div>
                <div>
                  <div className="font-semibold">Score de santé global</div>
                  <div className="text-sm text-slate-400">
                    Basé sur les KPIs de validation
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{insights.kpis.validationRate.toFixed(1)}%</div>
                  <div className="text-xs text-slate-400">Taux validation</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{insights.kpis.slaCompliance.toFixed(1)}%</div>
                  <div className="text-xs text-slate-400">Conformité SLA</div>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/60 text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <div className="text-lg font-bold">{insights.kpis.avgProcessingTime.toFixed(1)}h</div>
                <div className="text-xs text-slate-400">Temps moyen</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/60 text-center">
                <BarChart2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                <div className="text-lg font-bold">{insights.predictions.expectedVolumeToday}</div>
                <div className="text-xs text-slate-400">Prévu aujourd'hui</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/60 text-center">
                <Zap className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <div className="text-lg font-bold">{insights.kpis.anomalyRate.toFixed(1)}%</div>
                <div className="text-xs text-slate-400">Taux anomalies</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/60 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <div className="text-lg font-bold">{insights.predictions.expectedVolumeWeek}</div>
                <div className="text-xs text-slate-400">Prévu semaine</div>
              </div>
            </div>

            {/* Prédictions de goulots d'étranglement */}
            {insights.predictions.predictedBottlenecks.length > 0 && (
              <div className="rounded-xl border border-amber-200/50 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/20 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  Goulots d'étranglement prédits
                </h3>
                <div className="space-y-2">
                  {insights.predictions.predictedBottlenecks.map((bottleneck, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-slate-800/30">
                      <div>
                        <div className="font-medium text-sm">{bottleneck.bureau}</div>
                        <div className="text-xs text-slate-400">{bottleneck.reason}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-amber-600">+{bottleneck.estimatedDelay}h</div>
                        <div className="text-xs text-slate-400">Conf. {(bottleneck.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risques de dépassement SLA */}
            {insights.predictions.riskOfSlaBreaches.length > 0 && (
              <div className="rounded-xl border border-rose-200/50 bg-rose-50/30 dark:border-rose-800/30 dark:bg-rose-950/20 p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <Clock className="w-4 h-4" />
                  Risques de dépassement SLA
                </h3>
                <div className="space-y-2">
                  {insights.predictions.riskOfSlaBreaches.map((risk, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-slate-800/30">
                      <div className="font-mono text-sm text-purple-600 dark:text-purple-400">
                        {risk.documentId}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-rose-600">
                          {(risk.probabilityOfBreach * 100).toFixed(0)}% risque
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(risk.estimatedBreachTime).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommandations */}
            <div className="rounded-xl border border-purple-200/50 bg-purple-50/30 dark:border-purple-800/30 dark:bg-purple-950/20 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Lightbulb className="w-4 h-4" />
                Recommandations IA
              </h3>
              <div className="space-y-2">
                {insights.recommendations.map((rec, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-xl border",
                    getPriorityColor(rec.priority)
                  )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-medium uppercase",
                            rec.priority === 'high' && "bg-rose-100 text-rose-700",
                            rec.priority === 'medium' && "bg-amber-100 text-amber-700",
                            rec.priority === 'low' && "bg-slate-100 text-slate-600"
                          )}>
                            {rec.priority}
                          </span>
                          <span className="font-medium text-sm">{rec.title}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{rec.description}</div>
                        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">💡 {rec.impact}</div>
                      </div>
                      <FluentButton size="xs" variant="secondary">
                        {rec.action}
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </FluentButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance par bureau */}
            <div className="rounded-xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/60 p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-500" />
                Performance par bureau
              </h3>
              <div className="space-y-2">
                {insights.bureauPerformance.map((perf) => (
                  <div key={perf.bureau} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-medium w-16">{perf.bureau}</span>
                      <span className="text-sm text-slate-400">{perf.pending} en attente</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{perf.avgProcessingTime.toFixed(1)}h</span>
                      <span className={cn(
                        "font-medium",
                        perf.slaCompliance >= 95 && "text-emerald-600",
                        perf.slaCompliance >= 85 && perf.slaCompliance < 95 && "text-amber-600",
                        perf.slaCompliance < 85 && "text-rose-600"
                      )}>
                        {perf.slaCompliance.toFixed(1)}%
                      </span>
                      {getTrendIcon(perf.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Brain className="w-3.5 h-3.5" />
            Analyses mises à jour en temps réel
          </div>
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

export default ValidationBCPredictiveAnalytics;

