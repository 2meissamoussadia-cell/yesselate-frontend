'use client';

import { useEffect, useState, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { getStats } from '@/lib/api/demandesClient';
import { 
  RefreshCw, Inbox, AlertTriangle, Clock, CheckCircle2, 
  XCircle, Timer, Calendar, TrendingUp, TrendingDown
} from 'lucide-react';

type StatsData = {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  urgent: number;
  high: number;
  overdue: number;
  avgDelay: number;
  ts: string;
};

const STAT_CONFIG = [
  { key: 'total', label: 'Total', icon: Inbox, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-300' },
  { key: 'pending', label: 'À traiter', icon: Inbox, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { key: 'urgent', label: 'Urgentes', icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', critical: true },
  { key: 'overdue', label: 'En retard', icon: Clock, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', critical: true },
  { key: 'validated', label: 'Validées', icon: CheckCircle2, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { key: 'rejected', label: 'Rejetées', icon: XCircle, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  { key: 'avgDelay', label: 'Délai moyen', icon: Timer, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', suffix: 'j' },
  { key: 'ts', label: 'Mise à jour', icon: Calendar, color: 'bg-slate-500/10 text-slate-500', isDate: true },
] as const;

export function QuickStatsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      const result = await getStats();
      setData(result);
      setLastRefresh(new Date());
    } catch (e) {
      setErr((e as Error)?.message ?? 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchData();
  }, [open, fetchData]);

  // Auto-refresh toutes les 30 secondes si la modale est ouverte
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [open, fetchData]);

  const getValue = (key: string): string | number => {
    if (!data) return '—';
    const value = data[key as keyof StatsData];
    if (key === 'ts' && value) {
      return new Date(value as string).toLocaleTimeString();
    }
    return value ?? '—';
  };

  // Calcul du taux de traitement
  const processingRate = data && data.total > 0 
    ? Math.round(((data.validated + data.rejected) / data.total) * 100) 
    : 0;

  return (
    <FluentModal open={open} onClose={() => onOpenChange(false)} title="Statistiques en temps réel">
      <div className="space-y-4">
        {/* En-tête avec refresh */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {lastRefresh && (
              <span>Dernière mise à jour : {lastRefresh.toLocaleTimeString()}</span>
            )}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
                       border border-slate-200 hover:bg-slate-50 
                       dark:border-slate-700 dark:hover:bg-slate-800
                       disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Erreur */}
        {err && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm">
            {err}
          </div>
        )}

        {/* Grille de stats */}
        {loading && !data ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STAT_CONFIG.map((stat) => {
                const Icon = stat.icon;
                const value = getValue(stat.key);
                const isCritical = 'critical' in stat && stat.critical && typeof value === 'number' && value > 0;
                
                return (
                  <div
                    key={stat.key}
                    className={`p-4 rounded-xl border transition-all ${stat.color} ${
                      isCritical ? 'ring-2 ring-rose-500/50 animate-pulse' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 opacity-70" />
                      <span className="text-xs opacity-70">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {value}
                      {'suffix' in stat && stat.suffix && <span className="text-sm font-normal ml-0.5">{stat.suffix}</span>}
                    </div>
                    {isCritical && (
                      <div className="text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Action requise
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Indicateur de performance */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Taux de traitement</span>
                <span className="text-lg font-bold flex items-center gap-1">
                  {processingRate}%
                  {processingRate >= 70 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-amber-500" />
                  )}
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    processingRate >= 70 ? 'bg-emerald-500' : processingRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${processingRate}%` }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {data.validated + data.rejected} traitées sur {data.total} demandes
              </div>
            </div>
          </>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-400">
            Rafraîchissement auto toutes les 30s
          </span>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800
                       dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Fermer
          </button>
        </div>
      </div>
    </FluentModal>
  );
}
