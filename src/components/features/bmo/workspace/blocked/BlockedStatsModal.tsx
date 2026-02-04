'use client';

import { useMemo, useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Building2, Clock, Wallet, BarChart3, Target, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { blockedApi } from '@/lib/services/blockedApiService';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  open: boolean;
  onClose: () => void;
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

export function BlockedStatsModal({ open, onClose }: Props) {
  const [data, setData] = useState<BlockedDossier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await blockedApi.getAll(undefined, undefined, 1, 500);
        if (!cancelled) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    return () => { cancelled = true; };
  }, [open]);

  const stats = useMemo(() => {
    const total = data.length;
    const critical = data.filter(d => d.impact === 'critical').length;
    const high = data.filter(d => d.impact === 'high').length;
    const medium = data.filter(d => d.impact === 'medium').length;
    const low = data.filter(d => d.impact === 'low').length;

    const totalAmount = data.reduce((acc, d) => acc + parseAmountFCFA(d.amount), 0);
    const avgDelay = total === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + (d.delay ?? 0), 0) / total);
    const maxDelay = Math.max(...data.map(d => d.delay ?? 0));
    const avgPriority = total === 0 ? 0 : Math.round(data.reduce((acc, d) => acc + computePriority(d), 0) / total);

    // Par type
    const byType: Record<string, { count: number; amount: number }> = {};
    data.forEach(d => {
      const type = d.type || 'Autre';
      if (!byType[type]) byType[type] = { count: 0, amount: 0 };
      byType[type].count++;
      byType[type].amount += parseAmountFCFA(d.amount);
    });

    // Par bureau
    const byBureau: Record<string, { count: number; critical: number; amount: number }> = {};
    data.forEach(d => {
      const bureau = d.bureau || 'Non assigné';
      if (!byBureau[bureau]) byBureau[bureau] = { count: 0, critical: 0, amount: 0 };
      byBureau[bureau].count++;
      if (d.impact === 'critical') byBureau[bureau].critical++;
      byBureau[bureau].amount += parseAmountFCFA(d.amount);
    });

    // Distribution par tranche de délai
    const delayDistribution = {
      '0-7j': data.filter(d => (d.delay ?? 0) <= 7).length,
      '8-14j': data.filter(d => (d.delay ?? 0) > 7 && (d.delay ?? 0) <= 14).length,
      '15-30j': data.filter(d => (d.delay ?? 0) > 14 && (d.delay ?? 0) <= 30).length,
      '30j+': data.filter(d => (d.delay ?? 0) > 30).length,
    };

    // Score de risque global
    const riskScore = Math.min(100, Math.round(
      (critical * 25) + (high * 10) + (avgDelay / maxDelay * 30) + (avgPriority / 10000 * 35)
    ));

    return {
      total,
      critical,
      high,
      medium,
      low,
      totalAmount,
      avgDelay,
      maxDelay,
      avgPriority,
      byType: Object.entries(byType).sort((a, b) => b[1].count - a[1].count),
      byBureau: Object.entries(byBureau).sort((a, b) => b[1].count - a[1].count),
      delayDistribution,
      riskScore,
    };
  }, [data]);

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} Md`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)} K`;
    return amount.toLocaleString('fr-FR');
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'Critique';
    if (score >= 40) return 'Modéré';
    return 'Maîtrisé';
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-[#1f1f1f]/95 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-lg font-bold">Statistiques des blocages</h2>
              <p className="text-sm text-slate-400">Tableau de bord en temps réel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              <span className="ml-3 text-slate-400">Chargement des statistiques...</span>
            </div>
          ) : (
          <>
          {/* Score de risque */}
          <div className={cn(
            "p-6 rounded-xl border text-center",
            stats.riskScore >= 70 
              ? "bg-red-500/10 border-red-500/30"
              : stats.riskScore >= 40 
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-emerald-500/10 border-emerald-500/30"
          )}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className={cn("w-5 h-5", getRiskColor(stats.riskScore))} />
              <span className="text-sm font-medium text-slate-400">Score de risque global</span>
            </div>
            <p className={cn("text-5xl font-bold", getRiskColor(stats.riskScore))}>
              {stats.riskScore}
            </p>
            <p className={cn("text-sm font-medium mt-1", getRiskColor(stats.riskScore))}>
              {getRiskLabel(stats.riskScore)}
            </p>
          </div>

          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-slate-400">Critiques</span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.total > 0 ? Math.round(stats.critical / stats.total * 100) : 0}% du total
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-slate-400">Délai moyen</span>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.avgDelay}j</p>
              <p className="text-xs text-slate-400 mt-1">
                Max: {stats.maxDelay}j
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-400">Montant bloqué</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatAmount(stats.totalAmount)}</p>
              <p className="text-xs text-slate-400 mt-1">FCFA</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-slate-400">Priorité moy.</span>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgPriority}</p>
              <p className="text-xs text-slate-400 mt-1">Score composite</p>
            </div>
          </div>

          {/* Distribution par impact */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="font-semibold text-sm mb-4">Distribution par impact</h3>
            <div className="space-y-3">
              {[
                { label: 'Critique', value: stats.critical, color: 'bg-red-500', pct: stats.total > 0 ? stats.critical / stats.total * 100 : 0 },
                { label: 'Élevé', value: stats.high, color: 'bg-amber-500', pct: stats.total > 0 ? stats.high / stats.total * 100 : 0 },
                { label: 'Moyen', value: stats.medium, color: 'bg-blue-500', pct: stats.total > 0 ? stats.medium / stats.total * 100 : 0 },
                { label: 'Faible', value: stats.low, color: 'bg-slate-400', pct: stats.total > 0 ? stats.low / stats.total * 100 : 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs w-16 text-slate-400">{item.label}</span>
                  <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all", item.color)}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-12 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Par type */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
              <h3 className="font-semibold text-sm mb-4">Par type de dossier</h3>
              <div className="space-y-2">
                {stats.byType.slice(0, 5).map(([type, { count, amount }]) => (
                  <div key={type} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <span className="text-sm font-medium">{type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{formatAmount(amount)}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Par bureau */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Par bureau
              </h3>
              <div className="space-y-2">
                {stats.byBureau.slice(0, 5).map(([bureau, { count, critical, amount }]) => (
                  <div key={bureau} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{bureau}</span>
                      {critical > 0 && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{formatAmount(amount)}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-bold",
                        critical > 0 ? "bg-red-500/20 text-red-600" : "bg-slate-200 dark:bg-slate-700"
                      )}>
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribution par délai */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Distribution par ancienneté
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(stats.delayDistribution).map(([range, count]) => (
                <div 
                  key={range} 
                  className={cn(
                    "p-3 rounded-lg text-center border",
                    range === '30j+' && count > 0 
                      ? "bg-red-500/10 border-red-500/30" 
                      : "bg-white dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
                  )}
                >
                  <p className={cn(
                    "text-xl font-bold",
                    range === '30j+' && count > 0 ? "text-red-500" : ""
                  )}>{count}</p>
                  <p className="text-xs text-slate-400">{range}</p>
                </div>
              ))}
            </div>
          </div>
          </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total: {stats.total} dossiers bloqués</span>
            <span>Dernière mise à jour: {new Date().toLocaleString('fr-FR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

