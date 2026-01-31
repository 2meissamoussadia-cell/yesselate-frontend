/**
 * Modals spécialisés pour chaque type de KPI
 * Chaque modal contient des métriques et visualisations spécifiques au type de KPI
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileText,
  PieChart,
  LineChart,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useKPIDetail } from '@/lib/hooks/useDashboardKPIs';
import { getKPIMetadata } from '@/lib/mappings/dashboardKPIMapping';

interface KPISpecializedModalProps {
  kpiId: string;
  onClose: () => void;
}

/**
 * Modal spécialisé pour les KPIs opérationnels (Demandes, Blocages, etc.)
 */
export function OperationalKPIModal({ kpiId, onClose }: KPISpecializedModalProps) {
  const { displayData, detail, metadata } = useKPIDetail(kpiId, 'year');
  const [selectedView, setSelectedView] = useState<'overview' | 'bureaux' | 'timeline'>('overview');

  const breakdownByBureau = detail?.breakdown?.byBureau || [];
  const breakdownByType = detail?.breakdown?.byType || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-5xl bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-xl',
              displayData?.tone === 'ok' && 'bg-emerald-500/10 border border-emerald-500/20',
              displayData?.tone === 'warn' && 'bg-amber-500/10 border border-amber-500/20',
              displayData?.tone === 'crit' && 'bg-red-500/10 border border-red-500/20',
            )}>
              <FileText className={cn(
                'w-6 h-6',
                displayData?.tone === 'ok' && 'text-emerald-400',
                displayData?.tone === 'warn' && 'text-amber-400',
                displayData?.tone === 'crit' && 'text-red-400',
              )} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">{displayData?.label}</h2>
              <p className="text-xs text-slate-400">KPI Opérationnel</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 px-6 border-b border-slate-800/50">
          {(['overview', 'bureaux', 'timeline'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                selectedView === view
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              )}
            >
              {view === 'overview' && 'Vue d\'ensemble'}
              {view === 'bureaux' && 'Par bureau'}
              {view === 'timeline' && 'Chronologie'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-200">{displayData?.value || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Objectif</p>
                  <p className="text-2xl font-bold text-slate-200">{detail?.target || metadata?.target || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Variation</p>
                  <p className={cn(
                    'text-2xl font-bold flex items-center gap-1',
                    displayData?.trend === 'up' && displayData?.tone === 'ok' && 'text-emerald-400',
                    displayData?.trend === 'down' && (displayData?.tone === 'warn' || displayData?.tone === 'crit') && 'text-red-400',
                    'text-slate-400'
                  )}>
                    {displayData?.delta || '—'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Statut</p>
                  <Badge variant={displayData?.tone === 'ok' ? 'default' : displayData?.tone === 'warn' ? 'warning' : 'destructive'}>
                    {displayData?.tone === 'ok' ? 'Normal' : displayData?.tone === 'warn' ? 'Attention' : 'Critique'}
                  </Badge>
                </div>
              </div>

              {breakdownByType.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-4">Répartition par type</p>
                  <div className="space-y-3">
                    {breakdownByType.map((item: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{item.type}</span>
                          <span className="text-slate-300 font-medium">{item.value} ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === 'bureaux' && breakdownByBureau.length > 0 && (
            <div className="space-y-4">
              {breakdownByBureau.map((item: any, i: number) => (
                <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-slate-200">{item.bureau}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-200">{item.value}</p>
                      {item.percentage !== undefined && (
                        <p className="text-xs text-slate-400">{item.percentage}%</p>
                      )}
                    </div>
                  </div>
                  {item.percentage !== undefined && (
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedView === 'timeline' && detail?.history && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-4">Évolution dans le temps</p>
              <div className="space-y-2">
                {detail.history.slice().reverse().map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                    <span className="text-xs text-slate-400">{item.period}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-200">{item.value}</span>
                      {item.target && (
                        <span className="text-xs text-slate-400">Objectif: {item.target}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/50">
          <div className="text-xs text-slate-400">
            Dernière mise à jour: {detail?.timestamp ? new Date(detail.timestamp).toLocaleString('fr-FR') : 'N/A'}
          </div>
          <Button size="sm" variant="outline" onClick={onClose} className="border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal spécialisé pour les KPIs financiers (Budget, etc.)
 */
export function FinancialKPIModal({ kpiId, onClose }: KPISpecializedModalProps) {
  const { displayData, detail, metadata } = useKPIDetail(kpiId, 'year');
  const [selectedView, setSelectedView] = useState<'overview' | 'breakdown' | 'forecast'>('overview');

  const breakdownByBureau = detail?.breakdown?.byBureau || [];
  const breakdownByCategory = detail?.breakdown?.byCategory || [];

  const budgetConsumed = typeof displayData?.value === 'string'
    ? parseFloat(displayData.value.replace('%', ''))
    : (typeof displayData?.value === 'number' ? displayData.value : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-5xl bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">{displayData?.label}</h2>
              <p className="text-xs text-slate-400">KPI Financier</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 px-6 border-b border-slate-800/50">
          {(['overview', 'breakdown', 'forecast'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                selectedView === view
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              )}
            >
              {view === 'overview' && 'Vue d\'ensemble'}
              {view === 'breakdown' && 'Répartition'}
              {view === 'forecast' && 'Prévisions'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Jauge de budget */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-slate-200">Budget consommé</p>
                  <p className="text-2xl font-bold text-slate-200">{displayData?.value || 'N/A'}</p>
                </div>
                <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      budgetConsumed <= 75 ? 'bg-emerald-500' :
                      budgetConsumed <= 90 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(budgetConsumed, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span>0%</span>
                  <span>Objectif: {detail?.target || metadata?.target || 'N/A'}</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Budget total</p>
                  <p className="text-xl font-bold text-slate-200">{detail?.target || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Restant</p>
                  <p className="text-xl font-bold text-slate-200">
                    {typeof detail?.target === 'number' && typeof detail?.currentValue === 'number'
                      ? `${(detail.target - detail.currentValue).toFixed(1)} ${metadata?.unit || ''}`
                      : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Tendance</p>
                  <p className={cn(
                    'text-xl font-bold flex items-center gap-1',
                    displayData?.trend === 'up' && 'text-emerald-400',
                    displayData?.trend === 'down' && 'text-red-400',
                    'text-slate-400'
                  )}>
                    {displayData?.delta || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'breakdown' && (
            <div className="space-y-4">
              {breakdownByCategory.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-4">Répartition par catégorie</p>
                  <div className="space-y-3">
                    {breakdownByCategory.map((item: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{item.category}</span>
                          <span className="text-slate-300 font-medium">{item.value} ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {breakdownByBureau.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-4">Répartition par bureau</p>
                  <div className="space-y-3">
                    {breakdownByBureau.map((item: any, i: number) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{item.bureau}</span>
                          <span className="text-slate-300 font-medium">{item.value} ({item.percentage}%)</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedView === 'forecast' && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-4">Prévisions basées sur les tendances</p>
              <div className="space-y-3">
                {[1, 2, 3].map((month) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() + month);
                  const forecast = budgetConsumed + (month * 2); // Simulation
                  return (
                    <div key={month} className="p-3 rounded bg-slate-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">
                          {date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </span>
                        <Badge variant="default" className="text-xs">
                          Confiance: {Math.max(50, 100 - (month * 15))}%
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-slate-200">{forecast.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/50">
          <div className="text-xs text-slate-400">
            Dernière mise à jour: {detail?.timestamp ? new Date(detail.timestamp).toLocaleString('fr-FR') : 'N/A'}
          </div>
          <Button size="sm" variant="outline" onClick={onClose} className="border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal spécialisé pour les KPIs de performance (Validations, SLA, etc.)
 */
export function PerformanceKPIModal({ kpiId, onClose }: KPISpecializedModalProps) {
  const { displayData, detail, metadata } = useKPIDetail(kpiId, 'year');
  const [selectedView, setSelectedView] = useState<'overview' | 'bureaux' | 'trends'>('overview');

  const breakdownByBureau = detail?.breakdown?.byBureau || [];
  const historicalData = detail?.history || [];

  const performanceScore = typeof displayData?.value === 'string'
    ? parseFloat(displayData.value.replace('%', ''))
    : (typeof displayData?.value === 'number' ? displayData.value : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-5xl bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-3 rounded-xl',
              displayData?.tone === 'ok' && 'bg-emerald-500/10 border border-emerald-500/20',
              displayData?.tone === 'warn' && 'bg-amber-500/10 border border-amber-500/20',
              displayData?.tone === 'crit' && 'bg-red-500/10 border border-red-500/20',
            )}>
              <Activity className={cn(
                'w-6 h-6',
                displayData?.tone === 'ok' && 'text-emerald-400',
                displayData?.tone === 'warn' && 'text-amber-400',
                displayData?.tone === 'crit' && 'text-red-400',
              )} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">{displayData?.label}</h2>
              <p className="text-xs text-slate-400">KPI de Performance</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 px-6 border-b border-slate-800/50">
          {(['overview', 'bureaux', 'trends'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={cn(
                'px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                selectedView === view
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              )}
            >
              {view === 'overview' && 'Vue d\'ensemble'}
              {view === 'bureaux' && 'Par bureau'}
              {view === 'trends' && 'Tendances'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedView === 'overview' && (
            <div className="space-y-6">
              {/* Score de performance circulaire */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="transform -rotate-90 w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${performanceScore} ${100 - performanceScore}`}
                      className={cn(
                        performanceScore >= 90 ? 'text-emerald-400' :
                        performanceScore >= 75 ? 'text-amber-400' : 'text-red-400'
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn(
                      'text-4xl font-bold',
                      performanceScore >= 90 ? 'text-emerald-400' :
                      performanceScore >= 75 ? 'text-amber-400' : 'text-red-400'
                    )}>
                      {performanceScore.toFixed(0)}
                    </span>
                    <span className="text-sm text-slate-400">{metadata?.unit || '%'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Valeur actuelle</p>
                  <p className="text-xl font-bold text-slate-200">{displayData?.value || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Objectif</p>
                  <p className="text-xl font-bold text-slate-200">{detail?.target || metadata?.target || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Écart</p>
                  <p className={cn(
                    'text-xl font-bold',
                    performanceScore >= (detail?.target || 0) ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {typeof detail?.target === 'number'
                      ? `${(performanceScore - detail.target).toFixed(1)}${metadata?.unit || ''}`
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'bureaux' && breakdownByBureau.length > 0 && (
            <div className="space-y-4">
              {breakdownByBureau.map((item: any, i: number) => {
                const bureauScore = item.value || 0;
                return (
                  <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-slate-200">{item.bureau}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-200">{item.value}{metadata?.unit || ''}</p>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          bureauScore >= 90 ? 'bg-emerald-500' :
                          bureauScore >= 75 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${Math.min(bureauScore, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedView === 'trends' && historicalData.length > 0 && (
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-400 mb-4">Évolution de la performance</p>
              <div className="h-64 flex items-end gap-2">
                {historicalData.map((point: any, i: number) => {
                  const value = point.value || 0;
                  const maxValue = Math.max(...historicalData.map((p: any) => p.value || 0), 100);
                  const height = (value / maxValue) * 100;
                  const isLatest = i === historicalData.length - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div
                        className={cn(
                          'w-full rounded-t transition-all hover:opacity-80 relative',
                          isLatest
                            ? performanceScore >= 90 ? 'bg-emerald-500' :
                              performanceScore >= 75 ? 'bg-amber-500' : 'bg-red-500'
                            : 'bg-slate-700/60'
                        )}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded whitespace-nowrap">
                            {point.period}: {value}{metadata?.unit || ''}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 text-center truncate w-full">{point.period}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/50">
          <div className="text-xs text-slate-400">
            Dernière mise à jour: {detail?.timestamp ? new Date(detail.timestamp).toLocaleString('fr-FR') : 'N/A'}
          </div>
          <Button size="sm" variant="outline" onClick={onClose} className="border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}


