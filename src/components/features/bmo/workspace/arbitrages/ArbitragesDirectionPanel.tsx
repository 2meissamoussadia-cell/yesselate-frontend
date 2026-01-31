'use client';

import { useState, useEffect } from 'react';
import { arbitragesApiService, type ArbitragesStats } from '@/lib/services/arbitragesApiService';
import { X, Zap, Clock, Scale, ArrowUp, GitBranch, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { open: boolean; onClose: () => void; }

export function ArbitragesDirectionPanel({ open, onClose }: Props) {
  const [stats, setStats] = useState<ArbitragesStats | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try { const data = await arbitragesApiService.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#1f1f1f] border-l border-slate-200 dark:border-slate-800 shadow-xl z-40 flex flex-col">
      <div className="flex-none p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Centre de Pilotage</h3>
            <p className="text-xs text-slate-400">Arbitrages en temps réel</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!stats ? (
          <div className="space-y-3 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : (
          <>
            {stats.criticalCount > 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-red-600 dark:text-red-400">Critiques</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.criticalCount}</p>
                <p className="text-xs text-red-500/80">Arbitrages urgents à traiter</p>
              </div>
            )}

            {stats.escalated > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">Escaladés</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.escalated}</p>
                <p className="text-xs text-amber-500/80">En attente de décision DG</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Clock className="w-4 h-4 text-blue-500 mb-1" />
                <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-xs text-slate-400">En cours</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Scale className="w-4 h-4 text-amber-500 mb-1" />
                <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-slate-400">En attente</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Goulots principaux</h4>
              <div className="space-y-2">
                {stats.goulotsPrincipaux.slice(0, 3).map((g) => (
                  <div key={g.bureau} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">{g.bureau}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-purple-600">{g.count}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cn("p-3 rounded-xl border", stats.avgResolutionTime > 7 ? "bg-red-500/10 border-red-500/30" : stats.avgResolutionTime > 3 ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30")}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={cn("w-4 h-4", stats.avgResolutionTime > 7 ? "text-red-500" : stats.avgResolutionTime > 3 ? "text-amber-500" : "text-emerald-500")} />
                <span className="text-sm font-medium">Délai moyen résolution</span>
              </div>
              <p className={cn("text-2xl font-bold", stats.avgResolutionTime > 7 ? "text-red-600" : stats.avgResolutionTime > 3 ? "text-amber-600" : "text-emerald-600")}>{stats.avgResolutionTime} jours</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-none p-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-400 text-center">Mise à jour auto toutes les 30s</p>
      </div>
    </div>
  );
}

