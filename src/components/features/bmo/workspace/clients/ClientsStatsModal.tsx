'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clientsApiService, type ClientsStats } from '@/lib/services/clientsApiService';
import { BarChart3, X, Users, CheckCircle, AlertTriangle, UserPlus, DollarSign, Building2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props { open: boolean; onClose: () => void; }

export function ClientsStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<ClientsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try { const data = await clientsApiService.getStats(); setStats(data); }
      catch (error) { logger.error('Clients stats load failed', error as Error, { context: 'ClientsStatsModal' }); }
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
            <div className="p-2 rounded-xl bg-cyan-500/10"><BarChart3 className="w-5 h-5 text-cyan-500" /></div>
            <div><h2 className="text-lg font-bold">Statistiques Clients</h2><p className="text-sm text-slate-400">Vue d'ensemble du portefeuille clients</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {loading || !stats ? (
            <div className="grid grid-cols-4 gap-4 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
                  <p className="text-3xl font-bold text-cyan-600">{stats.total}</p>
                  <p className="text-sm text-slate-400">Total</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                  <p className="text-sm text-slate-400">Actifs</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="text-3xl font-bold text-red-600">{stats.litige}</p>
                  <p className="text-sm text-slate-400">En litige</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <UserPlus className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-3xl font-bold text-blue-600">{stats.prospect}</p>
                  <p className="text-sm text-slate-400">Prospects</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-2xl font-bold text-emerald-600">{clientsApiService.formatMontant(stats.chiffreAffairesTotal)} FCFA</p>
                  <p className="text-sm text-slate-400">Chiffre d'affaires total</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                  <Building2 className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                  <p className="text-2xl font-bold text-indigo-600">{stats.projetsEnCours} / {stats.projetsTotal}</p>
                  <p className="text-sm text-slate-400">Projets en cours / Total</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold mb-4">Top 5 Clients (CA)</h4>
                <div className="space-y-3">
                  {stats.topClients.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="flex-1 text-sm font-medium">{c.name}</span>
                      <span className="font-mono text-sm text-cyan-600">{clientsApiService.formatMontant(c.ca)} FCFA</span>
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

