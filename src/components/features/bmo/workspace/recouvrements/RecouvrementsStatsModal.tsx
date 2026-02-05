'use client';
import { useEffect, useState } from 'react';
import { recouvrementsApiService, type RecouvrementsStats } from '@/lib/services/recouvrementsApiService';
import { logger } from '@/lib/utils/logger';
import { X, BarChart3, DollarSign, TrendingUp } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RecouvrementsStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<RecouvrementsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setLoading(true);
        setStats(await recouvrementsApiService.getStats());
      } catch (e) {
        logger.error('Recouvrements stats load failed', e as Error, { context: 'RecouvrementsStatsModal' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl mx-4 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10"><BarChart3 className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-lg font-bold text-slate-200">Statistiques Recouvrement</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
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
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <DollarSign className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-400">{recouvrementsApiService.formatMontant(stats.montantTotal)}</p>
                  <p className="text-sm text-slate-400 mt-1">Total créances</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-400">{stats.tauxRecouvrement}%</p>
                  <p className="text-sm text-slate-400 mt-1">Taux recouvrement</p>
                </div>

                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-2xl font-bold text-red-400">{recouvrementsApiService.formatMontant(stats.montantEnRetard)}</p>
                  <p className="text-sm text-slate-400 mt-1">En retard</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Créances recouvrées</p>
                    <p className="text-xl font-bold text-emerald-400">{recouvrementsApiService.formatMontant(stats.montantRecouvre)} FCFA</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">En cours</p>
                    <p className="text-xl font-bold text-blue-400">{recouvrementsApiService.formatMontant(stats.montantEnAttente)} FCFA</p>
                  </div>
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

