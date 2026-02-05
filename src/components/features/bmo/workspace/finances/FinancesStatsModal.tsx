'use client';
import { useEffect, useState } from 'react';
import { financesApiService, type FinancesStats } from '@/lib/services/financesApiService';
import { X, BarChart3, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function FinancesStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<FinancesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setLoading(true);
        setStats(await financesApiService.getStats());
      } catch (e) {
        logger.error('Finances stats load failed', e as Error, { context: 'FinancesStatsModal' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl mx-4 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Statistiques Financières</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-slate-800" />
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <Wallet className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-400">
                    {financesApiService.formatMontant(stats.tresorerieGlobale)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Trésorerie</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-400">
                    {financesApiService.formatMontant(stats.budgetTotal)}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">Budget Total</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <TrendingDown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-400">{stats.budgetTotal > 0 ? Math.round((stats.budgetConsomme / stats.budgetTotal) * 100) : 0}%</p>
                  <p className="text-sm text-slate-400 mt-1">Taux Consommation</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <h3 className="font-semibold text-slate-200 mb-3">Flux de trésorerie</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Flux entrants</p>
                    <p className="text-xl font-bold text-emerald-400">
                      +{financesApiService.formatMontant(stats.fluxEntrants)} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Flux sortants</p>
                    <p className="text-xl font-bold text-red-400">
                      -{financesApiService.formatMontant(stats.fluxSortants)} FCFA
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400">Solde net</p>
                  <p className={cn("text-2xl font-bold", (stats.fluxEntrants - stats.fluxSortants) >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {(stats.fluxEntrants - stats.fluxSortants) >= 0 ? '+' : ''}{financesApiService.formatMontant(stats.fluxEntrants - stats.fluxSortants)} FCFA
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400">Aucune donnée disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}

