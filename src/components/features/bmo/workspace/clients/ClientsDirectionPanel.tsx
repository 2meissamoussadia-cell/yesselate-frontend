'use client';

import { useState, useEffect } from 'react';
import { clientsApiService, type ClientsStats } from '@/lib/services/clientsApiService';
import { X, AlertTriangle, DollarSign, TrendingUp, Users, ArrowRight, Crown, Building2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props { open: boolean; onClose: () => void; }

export function ClientsDirectionPanel({ open, onClose }: Props) {
  const [stats, setStats] = useState<ClientsStats | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try { const data = await clientsApiService.getStats(); setStats(data); }
      catch (error) { logger.error('Clients stats failed', error as Error, { context: 'ClientsDirectionPanel' }); }
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
          <div><h3 className="font-semibold">Centre de Pilotage</h3><p className="text-xs text-slate-400">Clients en temps réel</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!stats ? (
          <div className="space-y-3 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : (
          <>
            {stats.litige > 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="font-semibold text-red-600">Litiges</span></div>
                <p className="text-2xl font-bold text-red-600">{stats.litige}</p>
                <p className="text-xs text-red-500/80">Clients nécessitant attention</p>
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-emerald-500" /><span className="font-semibold text-emerald-600">CA Total</span></div>
              <p className="text-xl font-bold text-emerald-600">{clientsApiService.formatMontant(stats.chiffreAffairesTotal)}</p>
              <p className="text-xs text-emerald-500/80">FCFA cumulés</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <TrendingUp className="w-4 h-4 text-cyan-500 mb-1" />
                <p className="text-xl font-bold text-cyan-600">{stats.active}</p>
                <p className="text-xs text-slate-400">Actifs</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Users className="w-4 h-4 text-blue-500 mb-1" />
                <p className="text-xl font-bold text-blue-600">{stats.prospect}</p>
                <p className="text-xs text-slate-400">Prospects</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-medium mb-3">Top clients</h4>
              <div className="space-y-2">
                {stats.topClients.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                    <div className="flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" /><span className="text-sm truncate max-w-[120px]">{c.name}</span></div>
                    <div className="flex items-center gap-1"><span className="font-medium text-cyan-600 text-xs">{clientsApiService.formatMontant(c.ca)}</span><ArrowRight className="w-3 h-3 text-slate-400" /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
              <div className="flex items-center gap-2 mb-1"><Building2 className="w-4 h-4 text-indigo-500" /><span className="text-sm font-medium">Projets en cours</span></div>
              <p className="text-2xl font-bold text-indigo-600">{stats.projetsEnCours}</p>
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

