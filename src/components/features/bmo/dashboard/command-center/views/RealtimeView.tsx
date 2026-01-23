/**
 * Vue Temps Réel du Dashboard
 * Indicateurs live et monitoring
 */

'use client';

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { TrendChart } from '@/components/features/bmo/dashboard/charts';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';

// Données de démo temps réel (fallback si API indisponible)
const fallbackLiveMetrics = [
  { id: 'validations', label: "Validations aujourd'hui", value: 23, unit: '', color: 'emerald' },
  { id: 'tempsReponse', label: 'Temps réponse moyen', value: '2.4', unit: 'h', color: 'blue' },
  { id: 'montant', label: 'Montant traité', value: '847', unit: 'M', color: 'amber' },
  { id: 'tauxValidation', label: 'Taux validation', value: '94', unit: '%', color: 'purple' },
];

const recentActivity = [
  { id: '1', type: 'validation', message: 'BC-2024-0852 validé par M. Koné', time: 'il y a 2 min', status: 'success' },
  { id: '2', type: 'alert', message: 'Nouveau blocage détecté sur BC-2024-0867', time: 'il y a 5 min', status: 'warning' },
  { id: '3', type: 'sync', message: 'Synchronisation terminée avec succès', time: 'il y a 8 min', status: 'info' },
  { id: '4', type: 'validation', message: 'PAY-2024-1245 approuvé', time: 'il y a 12 min', status: 'success' },
  { id: '5', type: 'alert', message: 'Échéance contrat CTR-2024-0589 dans 3 jours', time: 'il y a 15 min', status: 'warning' },
];

export function RealtimeView() {
  const { liveStats, startRefresh, endRefresh } = useDashboardCommandCenterStore();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const liveMetrics = useMemo(() => {
    const stats = liveStats as any;
    const hasLive =
      liveStats &&
      (stats.validationsJour !== undefined ||
        stats.tauxValidation !== undefined ||
        stats.tempsReponse !== undefined ||
        stats.montantTraite !== undefined);
    if (!hasLive) return fallbackLiveMetrics;

    return [
      {
        id: 'validations',
        label: "Validations aujourd'hui",
        value: Number(stats.validationsJour ?? 0),
        unit: '',
        color: 'emerald',
      },
      {
        id: 'tempsReponse',
        label: 'Temps réponse moyen',
        value: String(stats.tempsReponse ?? '—'),
        unit: 'h',
        color: 'blue',
      },
      {
        id: 'montant',
        label: 'Montant traité',
        value: String((liveStats as any).montantTraite ?? '—'),
        unit: '',
        color: 'amber',
      },
      {
        id: 'tauxValidation',
        label: 'Taux validation',
        value: String((liveStats as any).tauxValidation ?? '—'),
        unit: '%',
        color: 'purple',
      },
    ];
  }, [liveStats]);

  const doRefresh = useCallback(async () => {
    startRefresh();
    try {
      const res = await dashboardAPI.refresh('kpis');
      // Note: liveStats est géré par le store, pas besoin de setLiveStats ici
    } catch {
      // fallback silent: keep previous
    } finally {
      endRefresh();
      setLastRefresh(new Date());
    }
  }, []); // Pas de dépendances - utilise setLiveStats avec fonction updater

  // Rafraîchissement auto (API)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      void doRefresh();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, doRefresh]);

  const handleManualRefresh = () => {
    void doRefresh();
  };

  const formatLastRefresh = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    return `il y a ${Math.floor(diff / 60)} min`;
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Temps Réel
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitoring et indicateurs live
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status connexion */}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-800/50 border-slate-700/50'
            )}
          >
            {liveStats.connectionStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : liveStats.connectionStatus === 'syncing' ? (
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                liveStats.connectionStatus === 'connected'
                  ? 'text-emerald-400'
                  : liveStats.connectionStatus === 'syncing'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              )}
            >
              {liveStats.connectionStatus === 'connected'
                ? 'Connecté'
                : liveStats.connectionStatus === 'syncing'
                ? 'Synchronisation...'
                : 'Déconnecté'}
            </span>
          </div>

          {/* Auto-refresh toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'border-slate-700',
              autoRefresh ? 'text-emerald-400' : 'text-slate-400'
            )}
          >
            {autoRefresh ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
            Auto: {autoRefresh ? 'ON' : 'OFF'}
          </Button>

          {/* Intervalle */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-300"
          >
            <option value={10}>10s</option>
            <option value={30}>30s</option>
            <option value={60}>1 min</option>
            <option value={120}>2 min</option>
          </select>

          {/* Refresh manuel */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={liveStats.isRefreshing}
            className="border-slate-700 text-slate-400"
          >
            <RefreshCw
              className={cn('w-4 h-4 mr-2', liveStats.isRefreshing && 'animate-spin')}
            />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Métriques live */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Indicateurs temps réel
          </h2>
          <span className="text-xs text-slate-500">
            Màj: {formatLastRefresh()}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {liveMetrics.map((metric) => {
            const iconColorClasses = {
              emerald: 'text-emerald-400',
              blue: 'text-blue-400',
              amber: 'text-amber-400',
              purple: 'text-purple-400',
            }[metric.color];

            return (
              <div
                key={metric.id}
                className={cn(
                  'p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 transition-all',
                  liveStats.isRefreshing && 'animate-pulse'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{metric.label}</span>
                  <Zap className={cn('w-4 h-4', iconColorClasses)} />
                </div>
                <p className="text-3xl font-bold text-slate-200">
                  {metric.value}
                  <span className="text-lg font-normal text-slate-400 ml-1">{metric.unit}</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activité récente */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Activité récente
          </h2>
          <Badge variant="default">{recentActivity.length} événements</Badge>
        </div>

        <div className="divide-y divide-slate-800/50 max-h-80 overflow-y-auto">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 transition-colors"
            >
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  activity.status === 'success'
                    ? 'bg-emerald-500'
                    : activity.status === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">{activity.message}</p>
              </div>
              <span className="text-xs text-slate-500 flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Graphique temps réel */}
      <section className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Évolution en temps réel</h3>
        </div>
        <TrendChart
          data={[
            { period: '08h', validations: 3, alertes: 1 },
            { period: '10h', validations: 8, alertes: 2 },
            { period: '12h', validations: 14, alertes: 1 },
            { period: '14h', validations: 18, alertes: 0 },
            { period: '16h', validations: 23, alertes: 1 },
          ]}
          dataKeys={[
            { key: 'validations', label: 'Validations', color: '#10b981' },
            { key: 'alertes', label: 'Alertes', color: '#f59e0b' },
          ]}
          height={200}
          showGrid={false}
        />
      </section>
    </div>
  );
}

