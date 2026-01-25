/**
 * Modal de comparaison multi-KPIs
 * Permet de comparer plusieurs KPIs côte à côte avec benchmarking
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
  Minus,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useKPIDetail } from '@/lib/hooks/useDashboardKPIs';
import { getAllKPIMappings, type KPIMapping } from '@/lib/mappings/dashboardKPIMapping';

interface KPIComparisonModalProps {
  kpiIds: string[];
  onClose: () => void;
}

export function KPIComparisonModal({ kpiIds, onClose }: KPIComparisonModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('year');

  const mappings = useMemo(() => {
    return kpiIds.map(id => {
      const allMappings = getAllKPIMappings();
      return allMappings.find(m => m.metadata.id === id);
    }).filter(Boolean) as KPIMapping[];
  }, [kpiIds]);

  // Utiliser les hooks pour chaque KPI (limité à 4 KPIs max pour éviter trop de requêtes)
  const kpi1 = useKPIDetail(kpiIds[0] || '', selectedPeriod);
  const kpi2 = useKPIDetail(kpiIds[1] || '', selectedPeriod);
  const kpi3 = useKPIDetail(kpiIds[2] || '', selectedPeriod);
  const kpi4 = useKPIDetail(kpiIds[3] || '', selectedPeriod);

  const kpiDetails = useMemo(() => {
    const details = [kpi1, kpi2, kpi3, kpi4].slice(0, kpiIds.length);
    return mappings.slice(0, kpiIds.length).map((m, i) => ({
      mapping: m,
      detail: details[i],
    }));
  }, [mappings, kpi1, kpi2, kpi3, kpi4, kpiIds.length]);

  // Calculer les scores relatifs pour le benchmarking
  const benchmarkData = useMemo(() => {
    const values = kpiDetails.map(({ detail }) => {
      const value = typeof detail.displayData?.value === 'number'
        ? detail.displayData.value
        : parseFloat(String(detail.displayData?.value || 0).replace('%', '').replace('j', ''));
      return value;
    });

    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;

    return kpiDetails.map(({ detail }, i) => {
      const value = values[i];
      const score = range > 0 ? ((value - minValue) / range) * 100 : 50;
      return {
        ...detail,
        score,
        rank: values.filter(v => v > value).length + 1,
      };
    });
  }, [kpiDetails]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 z-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          'relative z-10 w-full max-w-7xl bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">Comparaison de KPIs</h2>
            <p className="text-xs text-slate-500">{kpiIds.length} KPIs sélectionnés</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-300"
            >
              <option value="month">Mois</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Année</option>
            </select>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tableau de comparaison */}
          <div className="space-y-4">
            {/* En-têtes */}
            <div className="grid grid-cols-6 gap-4 pb-2 border-b border-slate-800/50">
              <div className="text-xs font-medium text-slate-400">KPI</div>
              <div className="text-xs font-medium text-slate-400 text-center">Valeur</div>
              <div className="text-xs font-medium text-slate-400 text-center">Objectif</div>
              <div className="text-xs font-medium text-slate-400 text-center">Tendance</div>
              <div className="text-xs font-medium text-slate-400 text-center">Score</div>
              <div className="text-xs font-medium text-slate-400 text-center">Rang</div>
            </div>

            {/* Lignes de comparaison */}
            {kpiDetails.map(({ mapping, detail }, index) => {
              const benchmark = benchmarkData[index];
              const displayData = detail.displayData;
              const kpiDetail = detail.detail;

              return (
                <div
                  key={mapping.metadata.id}
                  className={cn(
                    'grid grid-cols-6 gap-4 p-4 rounded-lg border transition-all hover:bg-slate-800/30',
                    benchmark?.rank === 1 && 'border-emerald-500/30 bg-emerald-500/5',
                    'border-slate-700/50'
                  )}
                >
                  {/* KPI Name */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      displayData?.tone === 'ok' && 'bg-emerald-500/10',
                      displayData?.tone === 'warn' && 'bg-amber-500/10',
                      displayData?.tone === 'crit' && 'bg-red-500/10',
                      displayData?.tone === 'info' && 'bg-blue-500/10',
                    )}>
                      <mapping.display.icon className={cn(
                        'w-4 h-4',
                        displayData?.tone === 'ok' && 'text-emerald-400',
                        displayData?.tone === 'warn' && 'text-amber-400',
                        displayData?.tone === 'crit' && 'text-red-400',
                        displayData?.tone === 'info' && 'text-blue-400',
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{displayData?.label}</p>
                      <p className="text-xs text-slate-500">{mapping.metadata.category}</p>
                    </div>
                  </div>

                  {/* Valeur */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-200">{displayData?.value || 'N/A'}</p>
                      <Badge
                        variant={displayData?.tone === 'ok' ? 'default' : displayData?.tone === 'warn' ? 'warning' : 'destructive'}
                        className="text-xs mt-1"
                      >
                        {displayData?.tone === 'ok' ? 'OK' : displayData?.tone === 'warn' ? 'Attention' : 'Critique'}
                      </Badge>
                    </div>
                  </div>

                  {/* Objectif */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-300">{kpiDetail?.target || mapping.metadata.target || 'N/A'}</p>
                      {kpiDetail?.target && displayData?.value && (
                        <p className="text-xs text-slate-500">
                          {typeof displayData.value === 'number' && typeof kpiDetail.target === 'number'
                            ? `${Math.round((displayData.value / kpiDetail.target) * 100)}%`
                            : '—'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tendance */}
                  <div className="flex items-center justify-center">
                    <div className={cn(
                      'flex items-center gap-1 text-sm font-medium',
                      displayData?.trend === 'up' && displayData?.tone === 'ok' && 'text-emerald-400',
                      displayData?.trend === 'down' && (displayData?.tone === 'warn' || displayData?.tone === 'crit') && 'text-red-400',
                      'text-slate-400'
                    )}>
                      {displayData?.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {displayData?.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                      {displayData?.trend === 'neutral' && <Minus className="w-4 h-4" />}
                      {displayData?.delta || '—'}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative w-16 h-16 mx-auto">
                        <svg className="transform -rotate-90 w-16 h-16">
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-slate-700"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="28"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${benchmark?.score || 0} ${100 - (benchmark?.score || 0)}`}
                            className={cn(
                              (benchmark?.score || 0) >= 80 ? 'text-emerald-400' :
                              (benchmark?.score || 0) >= 60 ? 'text-amber-400' : 'text-red-400'
                            )}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={cn(
                            'text-xs font-bold',
                            (benchmark?.score || 0) >= 80 ? 'text-emerald-400' :
                            (benchmark?.score || 0) >= 60 ? 'text-amber-400' : 'text-red-400'
                          )}>
                            {Math.round(benchmark?.score || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rang */}
                  <div className="flex items-center justify-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      benchmark?.rank === 1 && 'bg-emerald-500/20 text-emerald-400',
                      benchmark?.rank === 2 && 'bg-amber-500/20 text-amber-400',
                      benchmark?.rank === 3 && 'bg-blue-500/20 text-blue-400',
                      'bg-slate-800 text-slate-400'
                    )}>
                      {benchmark?.rank || '—'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Graphique comparatif */}
          <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-4">Vue comparative</p>
            <div className="h-48 flex items-end gap-2">
              {kpiDetails.map(({ mapping, detail }, i) => {
                const value = typeof detail.displayData?.value === 'number'
                  ? detail.displayData.value
                  : parseFloat(String(detail.displayData?.value || 0).replace('%', '').replace('j', ''));
                const maxValue = Math.max(...kpiDetails.map(({ detail }) => {
                  const v = typeof detail.displayData?.value === 'number'
                    ? detail.displayData.value
                    : parseFloat(String(detail.displayData?.value || 0).replace('%', '').replace('j', ''));
                  return v;
                }), 1);
                const height = (value / maxValue) * 100;

                return (
                  <div key={mapping.metadata.id} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'w-full rounded-t transition-all hover:opacity-80 relative group',
                        detail.displayData?.tone === 'ok' ? 'bg-emerald-500' :
                        detail.displayData?.tone === 'warn' ? 'bg-amber-500' :
                        detail.displayData?.tone === 'crit' ? 'bg-red-500' : 'bg-blue-500'
                      )}
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded whitespace-nowrap">
                          {detail.displayData?.value}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center truncate w-full">{mapping.display.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800/50 flex-shrink-0">
          <div className="text-xs text-slate-500">
            Comparaison de {kpiIds.length} KPIs
          </div>
          <Button size="sm" variant="outline" onClick={onClose} className="border-slate-700">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

