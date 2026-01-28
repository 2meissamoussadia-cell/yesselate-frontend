'use client';
import { useEffect, useState } from 'react';
import { missionsApiService, type MissionsStats } from '@/lib/services/missionsApiService';
import { X, BarChart3, Plane } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MissionsStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<MissionsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      try {
        setLoading(true);
        setStats(await missionsApiService.getStats());
      } catch (e) {
        console.error(e);
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
            <div className="p-2 rounded-xl bg-cyan-500/10"><BarChart3 className="w-5 h-5 text-cyan-400" /></div>
            <h2 className="text-lg font-bold text-slate-200">Statistiques Missions</h2>
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
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <Plane className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-cyan-400">{stats.total}</p>
                  <p className="text-sm text-slate-400 mt-1">Total missions</p>
                </div>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-3xl font-bold text-purple-400">{missionsApiService.formatMontant(stats.budgetTotal)}</p>
                  <p className="text-sm text-slate-400 mt-1">Budget total</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <p className="text-3xl font-bold text-amber-400">{missionsApiService.formatMontant(stats.fraisTotal)}</p>
                  <p className="text-sm text-slate-400 mt-1">Frais déclarés</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/50">
                  <p className="text-sm text-slate-400">En cours</p>
                  <p className="text-xl font-bold text-blue-400">{stats.in_progress}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50">
                  <p className="text-sm text-slate-400">Planifiées</p>
                  <p className="text-xl font-bold text-amber-400">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50">
                  <p className="text-sm text-slate-400">Terminées</p>
                  <p className="text-xl font-bold text-emerald-400">{stats.completed}</p>
                </div>
              </div>

              {stats.byDestination && Object.keys(stats.byDestination).length > 0 && (
                <div className="p-4 rounded-xl bg-slate-800/50">
                  <h4 className="font-semibold text-slate-200 mb-3">Par destination</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(stats.byDestination).map(([dest, count]) => (
                      <div key={dest} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30">
                        <span className="text-sm text-slate-300">{dest}</span>
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

