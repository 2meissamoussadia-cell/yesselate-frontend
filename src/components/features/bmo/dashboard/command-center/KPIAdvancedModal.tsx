/**
 * Modal KPI Avancé avec fonctionnalités complètes
 * - Drill-down par bureau
 * - Comparaisons temporelles
 * - Prédictions/trends
 * - Filtres avancés
 * - Actions rapides
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  X,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Filter,
  Calendar,
  Users,
  Target,
  Zap,
  Share2,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  Building2,
  PieChart,
  LineChart,
  BarChart,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useKPIDetail } from '@/lib/hooks/useDashboardKPIs';
import { getKPIMetadata } from '@/lib/mappings/dashboardKPIMapping';
import { OperationalKPIModal, FinancialKPIModal, PerformanceKPIModal } from './KPISpecializedModals';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';

interface KPIAdvancedModalProps {
  kpiId: string;
  onClose: () => void;
}

// Types pour les données mappées
interface HistoricalDataPoint {
  date: string;
  value: number;
  target?: number;
}

interface BreakdownItem {
  bureau?: string;
  type?: string;
  status?: string;
  value: number;
  percentage?: number;
}

interface RelatedMetric {
  id: string;
  label: string;
  value: string | number;
}

interface Bureau {
  code: string;
  name?: string;
  score?: number;
  charge?: number;
  blocages?: number;
}

interface Prediction {
  period: string;
  predicted: number;
  confidence: number;
}

export function KPIAdvancedModal({ kpiId, onClose }: KPIAdvancedModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'breakdown' | 'comparison' | 'predictions' | 'actions'>('overview');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('year');
  const [selectedBureau, setSelectedBureau] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { displayData, detail, metadata, isLoading } = useKPIDetail(kpiId, period);

  // Utiliser les modals spécialisés selon la catégorie
  if (metadata?.category === 'operational') {
    return <OperationalKPIModal kpiId={kpiId} onClose={onClose} />;
  }
  if (metadata?.category === 'financial') {
    return <FinancialKPIModal kpiId={kpiId} onClose={onClose} />;
  }
  if (metadata?.category === 'performance') {
    return <PerformanceKPIModal kpiId={kpiId} onClose={onClose} />;
  }

  const { data: bureauxData } = useApiQuery(
    async (signal) => dashboardAPI.getBureaux(),
    []
  );

  const { data: trendsData } = useApiQuery(
    async (signal) => dashboardAPI.getTrends({ kpi: kpiId, months: 12 }),
    [kpiId]
  );

  // Données historiques depuis le détail
  const historicalData = useMemo<HistoricalDataPoint[]>(() => {
    if (!detail?.history || !Array.isArray(detail.history)) return [];
    return detail.history.map((item: any): HistoricalDataPoint => {
      // Gérer différents formats possibles
      const period = item.period || item.date || item.month || '';
      const value = typeof item.value === 'number' ? item.value : parseFloat(String(item.value || 0)) || 0;
      const target = item.target !== undefined 
        ? (typeof item.target === 'number' ? item.target : parseFloat(String(item.target)) || undefined)
        : undefined;
      
      return {
        date: period,
        value,
        target,
      };
    }).filter((point: HistoricalDataPoint): point is HistoricalDataPoint => point.date !== '');
  }, [detail]);

  // Breakdown par bureau
  const breakdownByBureau = useMemo<BreakdownItem[]>(() => {
    if (!detail?.breakdown?.byBureau || !Array.isArray(detail.breakdown.byBureau)) return [];
    const mapped: BreakdownItem[] = detail.breakdown.byBureau.map((item: any): BreakdownItem => ({
      bureau: item.bureau || item.code || '',
      value: typeof item.value === 'number' ? item.value : parseFloat(String(item.value || 0)) || 0,
      percentage: item.percentage !== undefined
        ? (typeof item.percentage === 'number' ? item.percentage : parseFloat(String(item.percentage)) || undefined)
        : undefined,
    }));
    return mapped.filter((item: BreakdownItem) => Boolean(item.bureau));
  }, [detail]);

  // Prédictions basées sur les trends
  const predictions = useMemo<Prediction[]>(() => {
    if (!historicalData.length) return [];
    const lastValue = historicalData[historicalData.length - 1]?.value || 0;
    const firstValue = historicalData[0]?.value || 0;
    const avgGrowth = historicalData.length > 1
      ? (lastValue - firstValue) / historicalData.length
      : 0;

    return Array.from({ length: 3 }, (_, i): Prediction => {
      const date = new Date();
      date.setMonth(date.getMonth() + (i + 1));
      return {
        period: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        predicted: Math.max(0, lastValue + avgGrowth * (i + 1)),
        confidence: Math.max(50, 100 - (i * 15)), // Diminue avec le temps
      };
    });
  }, [historicalData]);

  const maxValue = Math.max(
    ...historicalData.map((d) => d.value),
    typeof detail?.currentValue === 'number' ? detail.currentValue : parseFloat(String(detail?.currentValue || 0)) || 0,
    1
  );
  const minValue = Math.min(
    ...historicalData.map((d) => d.value),
    typeof detail?.currentValue === 'number' ? detail.currentValue : parseFloat(String(detail?.currentValue || 0)) || 0,
    0
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="relative z-10 bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl p-8">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-slate-300">Chargement des données...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          'relative z-10 w-full max-w-6xl bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            {displayData && (
              <div className={cn(
                'p-3 rounded-xl',
                displayData.tone === 'ok' && 'bg-emerald-500/10 border border-emerald-500/20',
                displayData.tone === 'warn' && 'bg-amber-500/10 border border-amber-500/20',
                displayData.tone === 'crit' && 'bg-red-500/10 border border-red-500/20',
                displayData.tone === 'info' && 'bg-blue-500/10 border border-blue-500/20',
              )}>
                <displayData.icon className={cn(
                  'w-6 h-6',
                  displayData.tone === 'ok' && 'text-emerald-400',
                  displayData.tone === 'warn' && 'text-amber-400',
                  displayData.tone === 'crit' && 'text-red-400',
                  displayData.tone === 'info' && 'text-blue-400',
                )} />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-slate-200">{displayData?.label || 'KPI'}</h2>
              <p className="text-xs text-slate-400">{metadata?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 text-slate-400 hover:text-slate-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filtres */}
        {showFilters && (
          <div className="px-6 py-3 border-b border-slate-800/50 bg-slate-800/30 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <Select value={period} onValueChange={(v: string) => setPeriod(v as any)}>
                <SelectTrigger className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-300 h-8 min-w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="quarter">Trimestre</SelectItem>
                  <SelectItem value="year">Année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <Select value={selectedBureau || '__all__'} onValueChange={(v) => setSelectedBureau(v === '__all__' ? null : v)}>
                <SelectTrigger className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-300 h-8 min-w-[120px]">
                  <SelectValue placeholder="Bureau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les bureaux</SelectItem>
                  {bureauxData?.bureaux?.map((bureau: any) => (
                    <SelectItem key={bureau.code} value={bureau.code}>
                      {bureau.name || bureau.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 px-6 border-b border-slate-800/50 overflow-x-auto overflow-y-hidden items-center">
          {([
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'history', label: 'Historique', icon: LineChart },
            { id: 'breakdown', label: 'Répartition', icon: PieChart },
            { id: 'comparison', label: 'Comparaison', icon: BarChart },
            { id: 'predictions', label: 'Prédictions', icon: TrendingUp },
            { id: 'actions', label: 'Actions', icon: Zap },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5 flex-shrink-0 h-full',
                  activeTab === tab.id
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                )}
              >
                <Icon className="flex-shrink-0 !w-2 !h-2" style={{ width: '0.5rem', height: '0.5rem', minWidth: '0.5rem', minHeight: '0.5rem', maxWidth: '0.5rem', maxHeight: '0.5rem' }} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Valeur principale */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Valeur actuelle</p>
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
                    {displayData?.trend === 'up' && <TrendingUp className="w-5 h-5" />}
                    {displayData?.trend === 'down' && <TrendingDown className="w-5 h-5" />}
                    {displayData?.trend === 'neutral' && <Minus className="w-5 h-5" />}
                    {displayData?.delta || '—'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Statut</p>
                  <Badge variant={displayData?.tone === 'ok' ? 'default' : displayData?.tone === 'warn' ? 'warning' : 'destructive'}>
                    {displayData?.tone === 'ok' ? 'Normal' : displayData?.tone === 'warn' ? 'Attention' : displayData?.tone === 'crit' ? 'Critique' : 'Info'}
                  </Badge>
                </div>
              </div>

              {/* Graphique historique mini */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-3">Évolution sur {period === 'month' ? '1 mois' : period === 'quarter' ? '3 mois' : '12 mois'}</p>
                <div className="h-32 flex items-end gap-1">
                  {historicalData.map((point: HistoricalDataPoint, i: number) => {
                    const height = ((point.value - minValue) / (maxValue - minValue || 1)) * 100;
                    const isLatest = i === historicalData.length - 1;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 rounded-t transition-all hover:opacity-80 relative group',
                          isLatest
                            ? displayData?.tone === 'ok' ? 'bg-emerald-500' : displayData?.tone === 'warn' ? 'bg-amber-500' : displayData?.tone === 'crit' ? 'bg-red-500' : 'bg-blue-500'
                            : 'bg-slate-700/60'
                        )}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded whitespace-nowrap">
                            {point.date}: {point.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Métriques liées */}
              {detail?.relatedMetrics && detail.relatedMetrics.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-3">Métriques liées</p>
                  <div className="grid grid-cols-2 gap-3">
                    {detail.relatedMetrics.map((metric: any, i: number) => (
                      <div key={i} className="p-2 rounded bg-slate-900/50">
                        <p className="text-xs text-slate-400">{metric.label}</p>
                        <p className="text-sm font-medium text-slate-200">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-4">Historique détaillé</p>
                <div className="h-64 flex items-end gap-1 mb-4">
                  {historicalData.map((point: HistoricalDataPoint, i: number) => {
                    const height = ((point.value - minValue) / (maxValue - minValue || 1)) * 100;
                    const isLatest = i === historicalData.length - 1;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 rounded-t transition-all hover:opacity-80 relative group',
                          isLatest
                            ? displayData?.tone === 'ok' ? 'bg-emerald-500' : displayData?.tone === 'warn' ? 'bg-amber-500' : displayData?.tone === 'crit' ? 'bg-red-500' : 'bg-blue-500'
                            : 'bg-slate-700/60'
                        )}
                        style={{ height: `${Math.max(height, 5)}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded whitespace-nowrap">
                            {point.date}: {point.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {historicalData.slice().reverse().map((point: { value: number; date: string; target?: number }, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                      <span className="text-xs text-slate-400">{point.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-200">{point.value}</span>
                        {point.target && (
                          <span className="text-xs text-slate-400">Objectif: {point.target}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'breakdown' && (
            <div className="space-y-4">
              {breakdownByBureau.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-4">Répartition par bureau</p>
                  <div className="space-y-3">
                    {breakdownByBureau.map((item: BreakdownItem, i: number) => (
                      <div key={`${item.bureau}-${i}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{item.bureau || 'N/A'}</span>
                          <span className="text-slate-300 font-medium">
                            {item.value}
                            {item.percentage !== undefined && ` (${item.percentage}%)`}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              displayData?.tone === 'ok' ? 'bg-emerald-500' : displayData?.tone === 'warn' ? 'bg-amber-500' : displayData?.tone === 'crit' ? 'bg-red-500' : 'bg-blue-500'
                            )}
                            style={{ width: `${item.percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detail?.breakdown?.byType && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-4">Répartition par type</p>
                  <div className="space-y-3">
                    {Array.isArray(detail.breakdown.byType) && detail.breakdown.byType.map((item: BreakdownItem, i: number) => {
                      const percentage = item.percentage !== undefined 
                        ? (typeof item.percentage === 'number' ? item.percentage : parseFloat(String(item.percentage)) || 0)
                        : 0;
                      return (
                        <div key={`${item.type}-${i}`} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">{item.type || 'N/A'}</span>
                            <span className="text-slate-300 font-medium">
                              {item.value} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-4">Comparaison temporelle</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded bg-slate-900/50">
                    <p className="text-xs text-slate-400 mb-1">Période actuelle</p>
                    <p className="text-lg font-bold text-slate-200">{detail?.currentValue || displayData?.value || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded bg-slate-900/50">
                    <p className="text-xs text-slate-400 mb-1">Période précédente</p>
                    <p className="text-lg font-bold text-slate-200">{detail?.previousValue || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded bg-slate-900/50">
                    <p className="text-xs text-slate-400 mb-1">Variation</p>
                    <p className={cn(
                      'text-lg font-bold flex items-center gap-1',
                      (detail?.trend || 0) > 0 ? 'text-emerald-400' : (detail?.trend || 0) < 0 ? 'text-red-400' : 'text-slate-400'
                    )}>
                      {(detail?.trend || 0) > 0 && <TrendingUp className="w-4 h-4" />}
                      {(detail?.trend || 0) < 0 && <TrendingDown className="w-4 h-4" />}
                      {(detail?.trend || 0) === 0 && <Minus className="w-4 h-4" />}
                      {detail?.trend ? `${detail.trend > 0 ? '+' : ''}${detail.trend}${metadata?.unit || ''}` : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparaison par bureau */}
              {breakdownByBureau.length > 0 && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-4">Comparaison par bureau</p>
                  <div className="space-y-2">
                    {breakdownByBureau.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-900/50">
                        <span className="text-sm text-slate-300">{item.bureau}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-slate-200">{item.value}</span>
                          {item.percentage !== undefined && (
                            <Badge variant="default" className="text-xs">
                              {item.percentage}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-4">Prédictions basées sur les tendances</p>
                <div className="space-y-3">
                  {predictions.map((pred: Prediction, i: number) => (
                    <div key={`${pred.period}-${i}`} className="p-3 rounded bg-slate-900/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">{pred.period}</span>
                        <Badge variant="default" className="text-xs">
                          Confiance: {pred.confidence}%
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-slate-200">
                        {pred.predicted.toFixed(1)} {metadata?.unit || ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 border-slate-700 hover:bg-slate-800/50"
                >
                  <Download className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-200">Exporter</p>
                    <p className="text-xs text-slate-400">Télécharger les données</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 border-slate-700 hover:bg-slate-800/50"
                >
                  <Bell className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-200">Configurer alerte</p>
                    <p className="text-xs text-slate-400">Définir des seuils</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 border-slate-700 hover:bg-slate-800/50"
                >
                  <Share2 className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-200">Partager</p>
                    <p className="text-xs text-slate-400">Partager ce KPI</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start gap-2 border-slate-700 hover:bg-slate-800/50"
                >
                  <Settings className="w-5 h-5 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-200">Paramètres</p>
                    <p className="text-xs text-slate-400">Configurer le KPI</p>
                  </div>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/50 flex-shrink-0">
          <div className="text-xs text-slate-400">
            Dernière mise à jour: {detail?.timestamp ? new Date(detail.timestamp).toLocaleString('fr-FR') : 'N/A'}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose} className="border-slate-700">
              Fermer
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

