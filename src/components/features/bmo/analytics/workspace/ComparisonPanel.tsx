/**
 * ComparisonPanel.tsx
 * ===================
 * 
 * Panel interactif pour comparer bureaux et périodes
 * - Sélection multiple de bureaux
 * - Sélection de périodes multiples
 * - Métriques configurables
 * - Graphiques comparatifs
 * - Tableaux de données
 */

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { FluentButton } from '@/components/ui/fluent-button';
import {
  Users, Calendar, Target, TrendingUp, TrendingDown,
  Check, X, RefreshCw, Download, BarChart3, Filter
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { InteractiveChart, ChartGrid } from '../charts';

interface ComparisonPanelProps {
  type: 'bureaux' | 'periods';
}

const BUREAUX_OPTIONS = [
  { id: 'btp', name: 'Bureau Technique et Pilotage', code: 'BTP' },
  { id: 'bj', name: 'Bureau Juridique', code: 'BJ' },
  { id: 'bs', name: 'Bureau Social', code: 'BS' },
  { id: 'dg', name: 'Direction Générale', code: 'DG' },
  { id: 'daf', name: 'Direction Administrative et Financière', code: 'DAF' },
];

const PERIOD_OPTIONS = [
  { id: 'current-month', label: 'Mois en cours' },
  { id: 'last-month', label: 'Mois dernier' },
  { id: 'current-quarter', label: 'Trimestre en cours' },
  { id: 'last-quarter', label: 'Trimestre dernier' },
  { id: 'current-year', label: 'Année en cours' },
  { id: 'last-year', label: 'Année dernière' },
];

const METRIC_OPTIONS = [
  { id: 'performance', label: 'Performance globale', unit: '/100' },
  { id: 'validation_rate', label: 'Taux de validation', unit: '%' },
  { id: 'sla_compliance', label: 'Conformité SLA', unit: '%' },
  { id: 'avg_delay', label: 'Délai moyen', unit: 'jours' },
  { id: 'productivity', label: 'Productivité', unit: '%' },
  { id: 'quality_score', label: 'Score qualité', unit: '/100' },
  { id: 'budget_usage', label: 'Utilisation budget', unit: '%' },
  { id: 'active_projects', label: 'Projets actifs', unit: '' },
];

export function ComparisonPanel({ type }: ComparisonPanelProps) {
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>(['btp', 'bj']);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['current-month', 'last-month']);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['performance', 'validation_rate', 'sla_compliance']);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = (list: string[], setList: (list: string[]) => void, id: string) => {
    if (list.includes(id)) {
      setList(list.filter(item => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  // Mock data generation
  const comparisonData = useMemo(() => {
    if (type === 'bureaux') {
      return selectedBureaux.map(bureauId => {
        const bureau = BUREAUX_OPTIONS.find(b => b.id === bureauId)!;
        return {
          id: bureauId,
          name: bureau.code,
          fullName: bureau.name,
          metrics: {
            performance: Math.round(70 + Math.random() * 25),
            validation_rate: Math.round(75 + Math.random() * 20),
            sla_compliance: Math.round(80 + Math.random() * 15),
            avg_delay: parseFloat((2 + Math.random() * 3).toFixed(1)),
            productivity: Math.round(65 + Math.random() * 30),
            quality_score: Math.round(70 + Math.random() * 25),
            budget_usage: Math.round(60 + Math.random() * 30),
            active_projects: Math.round(8 + Math.random() * 15),
          },
        };
      });
    } else {
      return selectedPeriods.map(periodId => {
        const period = PERIOD_OPTIONS.find(p => p.id === periodId)!;
        return {
          id: periodId,
          name: period.label,
          metrics: {
            performance: Math.round(70 + Math.random() * 25),
            validation_rate: Math.round(75 + Math.random() * 20),
            sla_compliance: Math.round(80 + Math.random() * 15),
            avg_delay: parseFloat((2 + Math.random() * 3).toFixed(1)),
            productivity: Math.round(65 + Math.random() * 30),
            quality_score: Math.round(70 + Math.random() * 25),
            budget_usage: Math.round(60 + Math.random() * 30),
            active_projects: Math.round(8 + Math.random() * 15),
          },
        };
      });
    }
  }, [type, selectedBureaux, selectedPeriods]);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Nettoyer le timer précédent si présent
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    
    refreshTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      refreshTimerRef.current = null;
    }, 1000);
  };
  
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  const handleExport = () => {
    logger.debug('Exporting comparison data', { component: 'ComparisonPanel' });
  };

  const bestPerformer = useMemo(() => {
    if (comparisonData.length === 0) return null;
    return comparisonData.reduce((best, current) => 
      current.metrics.performance > best.metrics.performance ? current : best
    );
  }, [comparisonData]);

  const worstPerformer = useMemo(() => {
    if (comparisonData.length === 0) return null;
    return comparisonData.reduce((worst, current) => 
      current.metrics.performance < worst.metrics.performance ? current : worst
    );
  }, [comparisonData]);

  const averagePerformance = useMemo(() => {
    if (comparisonData.length === 0) return 0;
    const sum = comparisonData.reduce((acc, item) => acc + item.metrics.performance, 0);
    return Math.round(sum / comparisonData.length);
  }, [comparisonData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            {type === 'bureaux' ? (
              <Users className="w-5 h-5 text-blue-600" />
            ) : (
              <Calendar className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              Comparaison {type === 'bureaux' ? 'par Bureau' : 'par Période'}
            </h2>
            <p className="text-sm text-slate-400">
              {type === 'bureaux' 
                ? `${selectedBureaux.length} bureau(x) • ${selectedMetrics.length} métrique(s)`
                : `${selectedPeriods.length} période(s) • ${selectedMetrics.length} métrique(s)`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FluentButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
          </FluentButton>
          <FluentButton variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </FluentButton>
          <div className="flex items-center gap-1 ml-2 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('chart')}
              className={cn(
                'px-3 py-1.5 rounded text-sm transition-colors',
                viewMode === 'chart'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'px-3 py-1.5 rounded text-sm transition-colors',
                viewMode === 'table'
                  ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selection Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bureaux or Periods Selection */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold mb-3">
            {type === 'bureaux' ? 'Sélectionner les bureaux' : 'Sélectionner les périodes'}
          </h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {type === 'bureaux' ? (
              BUREAUX_OPTIONS.map((bureau) => (
                <label
                  key={bureau.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedBureaux.includes(bureau.id)}
                    onChange={() => toggleSelection(selectedBureaux, setSelectedBureaux, bureau.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{bureau.code}</p>
                    <p className="text-xs text-slate-400">{bureau.name}</p>
                  </div>
                  {selectedBureaux.includes(bureau.id) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </label>
              ))
            ) : (
              PERIOD_OPTIONS.map((period) => (
                <label
                  key={period.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedPeriods.includes(period.id)}
                    onChange={() => toggleSelection(selectedPeriods, setSelectedPeriods, period.id)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{period.label}</p>
                  </div>
                  {selectedPeriods.includes(period.id) && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3">Métriques à comparer</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {METRIC_OPTIONS.map((metric) => (
              <label
                key={metric.id}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors',
                  selectedMetrics.includes(metric.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={() => toggleSelection(selectedMetrics, setSelectedMetrics, metric.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                />
                <div>
                  <p className="text-xs font-medium">{metric.label}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <p className="text-xs text-slate-400 mb-1">🏆 Meilleur</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">
            {bestPerformer?.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {bestPerformer?.metrics.performance}/100
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-400 mb-1">Moyenne</p>
          <p className="text-2xl font-bold">{averagePerformance}/100</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <p className="text-xs text-slate-400 mb-1">⚠️ À améliorer</p>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
            {worstPerformer?.name}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {worstPerformer?.metrics.performance}/100
          </p>
        </div>
      </div>

      {/* Comparison View */}
      {viewMode === 'chart' ? (
        <ChartGrid
          columns={2}
          charts={selectedMetrics.slice(0, 4).map(metricId => {
            const metric = METRIC_OPTIONS.find(m => m.id === metricId)!;
            return {
              id: metricId,
              title: metric.label,
              chartProps: {
                data: comparisonData.map(item => ({
                  name: item.name,
                  value: (item.metrics as any)[metricId],
                })),
                type: 'bar',
                colors: ['#3b82f6'],
                showGrid: true,
                enableExport: true,
              },
            };
          })}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                    {type === 'bureaux' ? 'Bureau' : 'Période'}
                  </th>
                  {selectedMetrics.map(metricId => {
                    const metric = METRIC_OPTIONS.find(m => m.id === metricId)!;
                    return (
                      <th key={metricId} className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">
                        {metric.label}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {comparisonData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{item.name}</p>
                      {type === 'bureaux' && (
                        <p className="text-xs text-slate-400">{(item as any).fullName}</p>
                      )}
                    </td>
                    {selectedMetrics.map(metricId => {
                      const metric = METRIC_OPTIONS.find(m => m.id === metricId)!;
                      const value = (item.metrics as any)[metricId];
                      const isBest = value === Math.max(...comparisonData.map(d => (d.metrics as any)[metricId]));
                      const isWorst = value === Math.min(...comparisonData.map(d => (d.metrics as any)[metricId]));

                      return (
                        <td key={metricId} className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className={cn(
                              'font-semibold',
                              isBest && 'text-green-600',
                              isWorst && 'text-red-600'
                            )}>
                              {value}{metric.unit}
                            </span>
                            {isBest && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {isWorst && <TrendingDown className="w-4 h-4 text-red-600" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

