'use client';

import { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Building2,
  TrendingUp,
  TrendingDown,
  Zap,
  Loader2
} from 'lucide-react';
import { blockedApi } from '@/lib/services/blockedApiService';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  onOpenQueue: (queue: string) => void;
  compact?: boolean;
};

const IMPACT_WEIGHT: Record<string, number> = { critical: 100, high: 50, medium: 20, low: 5 };

function parseAmountFCFA(amount: unknown): number {
  const s = String(amount ?? '').replace(/[^\d]/g, '');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function computePriority(d: BlockedDossier): number {
  const w = IMPACT_WEIGHT[d.impact] ?? 1;
  const delay = Math.max(0, d.delay ?? 0) + 1;
  const amount = parseAmountFCFA(d.amount);
  const factor = 1 + amount / 1_000_000;
  return Math.round(w * delay * factor);
}

export function BlockedLiveCounters({ onOpenQueue, compact = false }: Props) {
  const [data, setData] = useState<BlockedDossier[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await blockedApi.getAll();
        setData(result.data);
      } catch (error) {
        console.error('Failed to load blocked data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const critical = data.filter(d => d.impact === 'critical');
    const high = data.filter(d => d.impact === 'high');
    const medium = data.filter(d => d.impact === 'medium');
    const low = data.filter(d => d.impact === 'low');
    
    const totalAmount = data.reduce((acc, d) => acc + parseAmountFCFA(d.amount), 0);
    const avgDelay = data.length === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + (d.delay ?? 0), 0) / data.length);
    const avgPriority = data.length === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + computePriority(d), 0) / data.length);
    
    // Bureaux avec le plus de blocages
    const byBureau: Record<string, { count: number; critical: number }> = {};
    data.forEach(d => {
      const bureau = d.bureau || 'Non assigné';
      if (!byBureau[bureau]) byBureau[bureau] = { count: 0, critical: 0 };
      byBureau[bureau].count++;
      if (d.impact === 'critical') byBureau[bureau].critical++;
    });
    
    const topBureaux = Object.entries(byBureau)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([bureau, stats]) => ({ bureau, ...stats }));

    return {
      total: data.length,
      critical: critical.length,
      high: high.length,
      medium: medium.length,
      low: low.length,
      totalAmount,
      avgDelay,
      avgPriority,
      topBureaux,
    };
  }, [data]);

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}G`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return amount.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <button
          onClick={() => onOpenQueue('critical')}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors",
            stats.critical > 0 
              ? "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20" 
              : "text-slate-400"
          )}
        >
          <AlertCircle className="w-4 h-4" />
          <span className="font-semibold">{stats.critical}</span>
        </button>

        <button
          onClick={() => onOpenQueue('high')}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors",
            stats.high > 0 
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20" 
              : "text-slate-400"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">{stats.high}</span>
        </button>

        <button
          onClick={() => onOpenQueue('all')}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <span className="font-semibold">{stats.total}</span>
          <span className="text-xs text-slate-400">total</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* Critiques - Design épuré, texte neutre */}
      <button
        onClick={() => onOpenQueue('critical')}
        className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className={cn(
            "w-5 h-5",
            stats.critical > 0 ? "text-red-500" : "text-slate-400"
          )} />
          <span className="text-xs text-slate-400 font-medium">Critiques</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {stats.critical}
        </p>
        {stats.critical > 0 && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-500" />
            Action immédiate
          </p>
        )}
      </button>

      {/* Élevé */}
      <button
        onClick={() => onOpenQueue('high')}
        className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className={cn(
            "w-5 h-5",
            stats.high > 0 ? "text-amber-500" : "text-slate-400"
          )} />
          <span className="text-xs text-slate-400 font-medium">Élevé</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {stats.high}
        </p>
      </button>

      {/* Moyen */}
      <button
        onClick={() => onOpenQueue('medium')}
        className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left transition-all hover:border-slate-300 dark:hover:border-slate-700"
      >
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="text-xs text-slate-400 font-medium">Moyen</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {stats.medium}
        </p>
      </button>

      {/* Délai moyen */}
      <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <span className="text-xs text-slate-400 font-medium">Délai moy.</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {stats.avgDelay}<span className="text-base font-normal text-slate-400">j</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {stats.avgDelay > 7 ? (
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-amber-500" /> Élevé
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-500" /> Normal
            </span>
          )}
        </p>
      </div>

      {/* Montant total */}
      <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">💰</span>
          <span className="text-xs text-slate-400 font-medium">Montant bloqué</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {formatAmount(stats.totalAmount)}
        </p>
        <p className="text-xs text-slate-400 mt-1">FCFA</p>
      </div>

      {/* Priorité moyenne */}
      <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-left">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <span className="text-xs text-slate-400 font-medium">Score priorité</span>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {stats.avgPriority}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Impact × Délai × Montant
        </p>
      </div>

      {/* Top bureaux */}
      {stats.topBureaux.length > 0 && (
        <div className="col-span-2 md:col-span-4 lg:col-span-6">
          <div className="p-4 rounded-xl border bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Top bureaux impactés
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.topBureaux.map(({ bureau, count, critical }) => (
                <button
                  key={bureau}
                  onClick={() => onOpenQueue('all')}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-300">{bureau}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {count}
                  </span>
                  {critical > 0 && (
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

