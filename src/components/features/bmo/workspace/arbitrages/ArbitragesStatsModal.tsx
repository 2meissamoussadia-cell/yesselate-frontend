'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { logger } from '@/lib/utils/logger';
import { arbitragesApiService, type ArbitragesStats } from '@/lib/services/arbitragesApiService';
import { BarChart3, X, Scale, Zap, Clock, CheckCircle, ArrowUp, GitBranch, Users } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props { open: boolean; onClose: () => void; }

export function ArbitragesStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<ArbitragesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try { const data = await arbitragesApiService.getStats(); setStats(data); }
      catch (error) { logger.error('Arbitrages stats load failed', error as Error, { context: 'ArbitragesStatsModal' }); }
      finally { setLoading(false); }
    };
    load();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800 dark:bg-[#1f1f1f] shadow-2xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10"><BarChart3 className="w-5 h-5 text-orange-500" /></div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Statistiques Arbitrages</h2>
              <p className="text-sm text-slate-400">Analyse des arbitrages et goulots</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {loading || !stats ? (
            <div className="grid grid-cols-4 gap-4 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                  <Scale className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <p className="text-3xl font-bold text-orange-600">{stats.total}</p>
                  <p className="text-sm text-slate-400">Total</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="text-3xl font-bold text-red-600">{stats.criticalCount}</p>
                  <p className="text-sm text-slate-400">Critiques</p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <ArrowUp className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-3xl font-bold text-amber-600">{stats.escalated}</p>
                  <p className="text-sm text-slate-400">Escaladés</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-3xl font-bold text-emerald-600">{stats.resolved}</p>
                  <p className="text-sm text-slate-400">Résolus</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Par type</h4>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400 w-20">{arbitragesApiService.getTypeLabel(type)}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Par priorité</h4>
                  <div className="space-y-3">
                    {Object.entries(stats.byPriority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center gap-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400 w-20 capitalize">{priority}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className={cn("h-full rounded-full", priority === 'critical' ? 'bg-red-500' : priority === 'high' ? 'bg-amber-500' : priority === 'medium' ? 'bg-blue-500' : 'bg-slate-400')} style={{ width: `${(count / stats.total) * 100}%` }} />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Goulots principaux</h4>
                <div className="grid grid-cols-5 gap-3">
                  {stats.goulotsPrincipaux.map((g, i) => (
                    <div key={g.bureau} className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-lg font-bold text-orange-600">{g.count}</p>
                      <p className="text-xs text-slate-400">{g.bureau}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

