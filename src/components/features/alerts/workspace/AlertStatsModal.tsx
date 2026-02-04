'use client';

import { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle,
  Building2,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { calculateAlertStats, filterAlertsByQueue } from '@/lib/data/alerts';

interface AlertStatsModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * AlertStatsModal
 * ===============
 * 
 * Modal affichant des statistiques détaillées sur les alertes.
 */
export function AlertStatsModal({ open, onClose }: AlertStatsModalProps) {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const stats = useMemo(() => calculateAlertStats(), []);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLastUpdate(new Date());
    setLoading(false);
  };

  // Calculs additionnels
  const criticalRate = stats.total > 0 ? Math.round((stats.critical / stats.total) * 100) : 0;
  const resolvedRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const acknowledgedRate = stats.total > 0 ? Math.round((stats.acknowledged / stats.total) * 100) : 0;
  const escalationRate = stats.total > 0 ? Math.round((stats.escalated / stats.total) * 100) : 0;

  // Performance scores
  const performanceScore = Math.round((resolvedRate + (100 - criticalRate) + (100 - escalationRate)) / 3);
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Statistiques détaillées"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header avec refresh */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <FluentButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Rafraîchir
          </FluentButton>
        </div>

        {/* Score de performance global */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                Score de Performance Global
              </h3>
              <p className="text-sm text-slate-400">
                Basé sur le taux de résolution, critiques et escalades
              </p>
            </div>
            <div className="text-right">
              <div className={cn('text-4xl font-bold', getPerformanceColor(performanceScore))}>
                {performanceScore}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {performanceScore >= 80 ? '✅ Excellent' : performanceScore >= 60 ? '⚠️ Correct' : '🔴 À améliorer'}
              </p>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-1000 rounded-full',
                performanceScore >= 80 && 'bg-gradient-to-r from-emerald-500 to-green-500',
                performanceScore >= 60 && performanceScore < 80 && 'bg-gradient-to-r from-amber-500 to-yellow-500',
                performanceScore < 60 && 'bg-gradient-to-r from-rose-500 to-red-500'
              )}
              style={{ width: `${performanceScore}%` }}
            />
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Critiques</p>
            </div>
            <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">{stats.critical}</p>
            <p className="text-xs text-rose-500 mt-1">{criticalRate}% du total</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Avertissements</p>
            </div>
            <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">{stats.warning}</p>
            <p className="text-xs text-slate-400 mt-1">{Math.round((stats.warning / stats.total) * 100)}% du total</p>
          </div>

          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Acquittées</p>
            </div>
            <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">{stats.acknowledged}</p>
            <p className="text-xs text-purple-500 mt-1">{acknowledgedRate}% du total</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Résolues</p>
            </div>
            <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">{stats.resolved}</p>
            <p className="text-xs text-emerald-500 mt-1">{resolvedRate}% du total</p>
          </div>
        </div>

        {/* Performance temps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-200">Temps de réponse</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">
                {stats.avgResponseTime}
              </p>
              <p className="text-sm text-slate-400">minutes</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              {stats.avgResponseTime < 60 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">Excellent</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-500">À améliorer</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-slate-700 dark:text-slate-200">Temps de résolution</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">
                {stats.avgResolutionTime}
              </p>
              <p className="text-sm text-slate-400">minutes</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              {stats.avgResolutionTime < 120 ? (
                <>
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-500">Rapide</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-500">Moyen</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Répartition par bureau */}
        {Object.keys(stats.byBureau).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Répartition par bureau</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(stats.byBureau)
                .sort((a, b) => b[1] - a[1])
                .map(([bureau, count]) => {
                  const percentage = Math.round((count / stats.total) * 100);
                  
                  return (
                    <div key={bureau} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700 dark:text-slate-200">{bureau}</span>
                        <span className="text-slate-400">{count} alertes ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Répartition par type */}
        {Object.keys(stats.byType).length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Répartition par type</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(stats.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const percentage = Math.round((count / stats.total) * 100);
                  
                  return (
                    <div key={type} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize mb-1">
                        {type}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{count}</p>
                        <p className="text-xs text-slate-400">({percentage}%)</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Recommandations */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">📊 Recommandations</h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {criticalRate > 30 && (
              <li className="flex items-start gap-2">
                <span className="text-rose-500">⚠️</span>
                <span>Taux d'alertes critiques élevé ({criticalRate}%). Prioriser leur traitement.</span>
              </li>
            )}
            {escalationRate > 20 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-500">⚠️</span>
                <span>Taux d'escalade élevé ({escalationRate}%). Formation des équipes recommandée.</span>
              </li>
            )}
            {resolvedRate < 50 && (
              <li className="flex items-start gap-2">
                <span className="text-amber-500">⚠️</span>
                <span>Taux de résolution faible ({resolvedRate}%). Vérifier les ressources disponibles.</span>
              </li>
            )}
            {stats.avgResponseTime > 60 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500">💡</span>
                <span>Temps de réponse moyen élevé. Optimiser les processus de traitement.</span>
              </li>
            )}
            {criticalRate <= 20 && resolvedRate >= 70 && escalationRate <= 15 && (
              <li className="flex items-start gap-2">
                <span className="text-emerald-500">✅</span>
                <span>Performance excellente ! Maintenir ce niveau de qualité.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </FluentModal>
  );
}

