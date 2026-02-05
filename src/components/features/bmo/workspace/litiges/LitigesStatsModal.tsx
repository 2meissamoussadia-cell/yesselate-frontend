'use client';
import { useEffect, useState } from 'react';
import { litigesApiService, type LitigesStats } from '@/lib/services/litigesApiService';
import { logger } from '@/lib/utils/logger';
import { X, BarChart3, Scale } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function LitigesStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<LitigesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setLoading(true);
        setStats(await litigesApiService.getStats());
      } catch (e) {
        logger.error('Litiges stats load failed', e as Error, { context: 'LitigesStatsModal' });
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
            <div className="p-2 rounded-xl bg-red-500/10"><BarChart3 className="w-5 h-5 text-red-400" /></div>
            <h2 className="text-lg font-bold text-slate-200">Statistiques Litiges</h2>
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
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <Scale className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-red-400">{stats.active}</p>
                  <p className="text-sm text-slate-400 mt-1">Litiges actifs</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-3xl font-bold text-amber-400">{stats.prochesAudiences}</p>
                  <p className="text-sm text-slate-400 mt-1">Audiences prévues</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-3xl font-bold text-emerald-400">{stats.closed}</p>
                  <p className="text-sm text-slate-400 mt-1">Litiges clos</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50">
                <h4 className="font-semibold text-slate-200 mb-2">Exposition totale</h4>
                <p className="text-2xl font-mono font-bold text-red-400">{litigesApiService.formatMontant(stats.totalExposure)} FCFA</p>
              </div>

              {stats.byType && Object.keys(stats.byType).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <h4 className="font-semibold text-slate-200 mb-3">Par type</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30">
                        <span className="text-sm text-slate-300">{type}</span>
                        <span className="font-bold text-slate-200">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-slate-400">Aucune donnée disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}

