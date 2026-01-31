/**
 * AnalyticsStatsModal.tsx
 * ========================
 * 
 * Modal statistiques avancées avec KPIs détaillés
 */

'use client';

import { useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, TrendingDown, Target, AlertTriangle, 
  CheckCircle2, Clock, Users, DollarSign, Activity
} from 'lucide-react';
import { calculateKPIs, calculateBureauPerformance, detectAlerts, mockComparisons, mockFinancialData, mockOperationalData } from '@/lib/data/analytics';
import { cn } from '@/lib/utils';

interface AnalyticsStatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function AnalyticsStatsModal({ open, onClose }: AnalyticsStatsModalProps) {
  const kpis = useMemo(() => calculateKPIs(), []);
  const bureauPerf = useMemo(() => calculateBureauPerformance(), []);
  const alerts = useMemo(() => detectAlerts(), []);

  const stats = useMemo(() => {
    const goodKPIs = kpis.filter(k => k.status === 'good').length;
    const warningKPIs = kpis.filter(k => k.status === 'warning').length;
    const criticalKPIs = kpis.filter(k => k.status === 'critical').length;

    const avgScore = bureauPerf.length > 0
      ? Math.round(bureauPerf.reduce((sum, b) => sum + b.score, 0) / bureauPerf.length)
      : 0;

    const topBureau = bureauPerf[0] || null;
    const weakestBureau = bureauPerf.length > 0 ? bureauPerf[bureauPerf.length - 1] : null;

    const totalDemands = bureauPerf.reduce((sum, b) => sum + b.totalDemands, 0);
    const totalValidated = bureauPerf.reduce((sum, b) => sum + b.validated, 0);
    const totalPending = bureauPerf.reduce((sum, b) => sum + b.pending, 0);
    const totalOverdue = bureauPerf.reduce((sum, b) => sum + b.overdue, 0);

    const globalValidationRate = totalDemands > 0
      ? Math.round((totalValidated / totalDemands) * 100)
      : 0;
    const globalSLA = totalDemands > 0
      ? Math.round(((totalDemands - totalOverdue) / totalDemands) * 100)
      : 0;

    return {
      goodKPIs,
      warningKPIs,
      criticalKPIs,
      avgScore,
      topBureau,
      weakestBureau,
      totalDemands,
      totalValidated,
      totalPending,
      totalOverdue,
      globalValidationRate,
      globalSLA,
    };
  }, [kpis, bureauPerf]);

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  const monthEvolution = useMemo(() => {
    const current = mockComparisons.thisMonth;
    const previous = mockComparisons.lastMonth;
    
    const demandsChange = Math.round(((current.total - previous.total) / previous.total) * 100);
    const validationChange = Math.round(((current.validated - previous.validated) / previous.validated) * 100);
    const slaChange = current.slaCompliance - previous.slaCompliance;
    const delayChange = current.avgDelay - previous.avgDelay;

    return {
      demandsChange,
      validationChange,
      slaChange,
      delayChange,
    };
  }, []);

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="📊 Statistiques Complètes"
      maxWidth="4xl"
      dark
    >
      <div className="space-y-6">
        {/* Vue d'ensemble globale */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-700 bg-gradient-to-br from-blue-950/20 to-blue-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-slate-400">Total Demandes</span>
            </div>
            <div className="text-3xl font-bold text-blue-400">{stats.totalDemands}</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {monthEvolution.demandsChange > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600">+{monthEvolution.demandsChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">{monthEvolution.demandsChange}%</span>
                </>
              )}
              <span>vs mois dernier</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-gradient-to-br from-emerald-950/20 to-emerald-900/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-400">Taux Validation</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400">{stats.globalValidationRate}%</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {monthEvolution.validationChange > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600">+{monthEvolution.validationChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">{monthEvolution.validationChange}%</span>
                </>
              )}
              <span>vs mois dernier</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-gradient-to-br from-amber-950/20 to-amber-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-400">En Attente</span>
            </div>
            <div className="text-3xl font-bold text-amber-400">{stats.totalPending}</div>
            <div className="text-xs text-slate-400 mt-1">
              {Math.round((stats.totalPending / stats.totalDemands) * 100)}% du total
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-700 bg-gradient-to-br from-purple-950/20 to-purple-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-slate-400">Conformité SLA</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{stats.globalSLA}%</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              {monthEvolution.slaChange > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600">+{monthEvolution.slaChange}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">{monthEvolution.slaChange}%</span>
                </>
              )}
              <span>vs mois dernier</span>
            </div>
          </div>
        </div>

        {/* Statut KPIs */}
        <div className="rounded-xl border border-slate-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-200">
            <Target className="w-4 h-4 text-orange-400" />
            Statut des KPIs ({kpis.length} au total)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-emerald-950/20 border border-emerald-800">
              <div className="text-3xl font-bold text-emerald-400">{stats.goodKPIs}</div>
              <div className="text-sm text-slate-400 mt-1">🟢 Good</div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round((stats.goodKPIs / kpis.length) * 100)}%
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-950/20 border border-amber-800">
              <div className="text-3xl font-bold text-amber-400">{stats.warningKPIs}</div>
              <div className="text-sm text-slate-400 mt-1">🟡 Warning</div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round((stats.warningKPIs / kpis.length) * 100)}%
              </div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-950/20 border border-red-800">
              <div className="text-3xl font-bold text-red-400">{stats.criticalKPIs}</div>
              <div className="text-sm text-slate-400 mt-1">🔴 Critical</div>
              <div className="text-xs text-slate-400 mt-1">
                {Math.round((stats.criticalKPIs / kpis.length) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Performance Bureaux */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Performance Bureaux
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">🏆 Meilleur Bureau</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{stats.topBureau?.bureauName}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stats.topBureau?.bureauCode}</div>
                </div>
                <Badge variant="success" className="text-lg px-3 py-1">
                  {stats.topBureau?.score}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <div className="text-slate-400">Validation</div>
                  <div className="font-semibold text-emerald-600">{stats.topBureau?.validationRate}%</div>
                </div>
                <div>
                  <div className="text-slate-400">SLA</div>
                  <div className="font-semibold text-emerald-600">{stats.topBureau?.slaCompliance}%</div>
                </div>
                <div>
                  <div className="text-slate-400">Délai</div>
                  <div className="font-semibold text-emerald-600">{stats.topBureau?.avgDelay}j</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">⚠️ À Améliorer</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-lg">{stats.weakestBureau?.bureauName}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stats.weakestBureau?.bureauCode}</div>
                </div>
                <Badge variant={stats.weakestBureau?.score && stats.weakestBureau.score < 60 ? 'urgent' : 'warning'} className="text-lg px-3 py-1">
                  {stats.weakestBureau?.score}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <div className="text-slate-400">Validation</div>
                  <div className="font-semibold">{stats.weakestBureau?.validationRate}%</div>
                </div>
                <div>
                  <div className="text-slate-400">SLA</div>
                  <div className="font-semibold">{stats.weakestBureau?.slaCompliance}%</div>
                </div>
                <div>
                  <div className="text-slate-400">Délai</div>
                  <div className="font-semibold">{stats.weakestBureau?.avgDelay}j</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Score moyen global</span>
              <span className="font-bold text-lg">{stats.avgScore}/100</span>
            </div>
          </div>
        </div>

        {/* Alertes actives */}
        {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Alertes Actives ({alerts.length})
            </h3>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border border-red-700/50 bg-slate-900 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{alert.title}</span>
                      <Badge variant="urgent" className="text-[10px]">Critical</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{alert.description}</p>
                  </div>
                </div>
              ))}
              {warningAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border border-amber-700/50 bg-slate-900 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{alert.title}</span>
                      <Badge variant="warning" className="text-[10px]">Warning</Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{alert.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Données financières et opérationnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Financier */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Financier
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Budget total</span>
                <span className="font-bold">{(mockFinancialData.budgetTotal / 1000000000).toFixed(1)} Mds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Consommé</span>
                <span className="font-bold text-amber-600">{(mockFinancialData.budgetConsumed / 1000000000).toFixed(2)} Mds</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Restant</span>
                <span className="font-bold text-emerald-600">{(mockFinancialData.budgetRemaining / 1000000000).toFixed(2)} Mds</span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Taux consommation</span>
                  <Badge variant={
                    mockFinancialData.budgetConsumed / mockFinancialData.budgetTotal > 0.9 ? 'urgent' :
                    mockFinancialData.budgetConsumed / mockFinancialData.budgetTotal > 0.75 ? 'warning' : 'success'
                  }>
                    {Math.round((mockFinancialData.budgetConsumed / mockFinancialData.budgetTotal) * 100)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Opérationnel */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Opérationnel
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Projets actifs</span>
                <span className="font-bold text-blue-600">{mockOperationalData.activeProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Projets terminés</span>
                <span className="font-bold text-emerald-600">{mockOperationalData.completedProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Projets en retard</span>
                <span className="font-bold text-red-600">{mockOperationalData.delayedProjects}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Utilisation ressources</span>
                  <Badge variant={
                    mockOperationalData.resourceUtilization > 90 ? 'urgent' :
                    mockOperationalData.resourceUtilization > 75 ? 'warning' : 'success'
                  }>
                    {mockOperationalData.resourceUtilization}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec timestamp */}
        <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200 dark:border-slate-700">
          Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
        </div>
      </div>
    </FluentModal>
  );
}


