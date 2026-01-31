'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  Scale,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Zap,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface ArbitrageStats {
  total: number;
  ouverts: number;
  tranches: number;
  critiques: number;
  enRetard: number;
  expositionTotale: number;
  simplesPending: number;
  simplesResolved: number;
  simplesUrgent: number;
  bureauxSurcharge: number;
  totalGoulots: number;
  byBureau: { bureau: string; count: number; critiques: number }[];
  byType: { type: string; count: number }[];
  trends: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  avgResolutionTime: number;
  ts: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// ============================================
// Component
// ============================================
export function ArbitragesStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<ArbitrageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/arbitrages/stats', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadStats();
  }, [open, loadStats]);

  const formatNumber = (n: number) => new Intl.NumberFormat('fr-FR').format(n);
  const formatAmount = (n: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);

  return (
    <FluentModal open={open} title="Statistiques — Arbitrages & Gouvernance" onClose={onClose}>
      <div className="space-y-6">
        {error && !stats && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <FluentButton size="sm" variant="secondary" onClick={loadStats}>
              Réessayer
            </FluentButton>
          </div>
        )}

        {loading && !stats && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {stats && (
          <>
            {/* KPIs principaux */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-200/50 dark:border-red-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-slate-400">Total</span>
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-400">{formatNumber(stats.total)}</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-slate-400">Ouverts</span>
                </div>
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">{formatNumber(stats.ouverts)}</div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-900/20 border border-rose-200/50 dark:border-rose-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  <span className="text-sm text-slate-400">Critiques</span>
                </div>
                <div className="text-3xl font-bold text-rose-700 dark:text-rose-400">{formatNumber(stats.critiques)}</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-400">Tranchés</span>
                </div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{formatNumber(stats.tranches)}</div>
              </div>
            </div>

            {/* Exposition et performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold">Exposition financière</span>
                </div>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                  {formatAmount(stats.expositionTotale)}
                </div>
                <div className="text-sm text-slate-400 mt-1">Montant total en arbitrage</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">Temps de résolution moyen</span>
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {stats.avgResolutionTime} jours
                </div>
                <div className="text-sm text-slate-400 mt-1">Délai moyen de traitement</div>
              </div>
            </div>

            {/* Tendances */}
            <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold">Tendances</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Jour</div>
                  <div className={cn(
                    'text-xl font-bold flex items-center justify-center gap-1',
                    (stats.trends?.daily ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                  )}>
                    {(stats.trends?.daily ?? 0) > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stats.trends?.daily ?? 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Semaine</div>
                  <div className={cn(
                    'text-xl font-bold flex items-center justify-center gap-1',
                    (stats.trends?.weekly ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                  )}>
                    {(stats.trends?.weekly ?? 0) > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stats.trends?.weekly ?? 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Mois</div>
                  <div className={cn(
                    'text-xl font-bold flex items-center justify-center gap-1',
                    (stats.trends?.monthly ?? 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                  )}>
                    {(stats.trends?.monthly ?? 0) > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stats.trends?.monthly ?? 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Par bureau */}
            {stats.byBureau && stats.byBureau.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-teal-500" />
                  <span className="font-semibold">Par bureau</span>
                </div>
                <div className="space-y-2">
                  {stats.byBureau.slice(0, 5).map((b) => (
                    <div key={b.bureau} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="font-medium">{b.bureau}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-600 dark:text-slate-400">{b.count} arbitrages</span>
                        {b.critiques > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                            {b.critiques} critiques
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-400">
                Dernière MAJ: {new Date(stats.ts).toLocaleString('fr-FR')}
              </span>
              <div className="flex gap-2">
                <FluentButton size="sm" variant="secondary" onClick={loadStats} disabled={loading}>
                  <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                  Actualiser
                </FluentButton>
                <FluentButton size="sm" variant="primary" onClick={onClose}>
                  Fermer
                </FluentButton>
              </div>
            </div>
          </>
        )}
      </div>
    </FluentModal>
  );
}

export default ArbitragesStatsModal;

