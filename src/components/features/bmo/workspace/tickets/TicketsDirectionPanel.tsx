'use client';

import { useState, useEffect } from 'react';
import { ticketsApi, type TicketStats } from '@/lib/services/ticketsApiService';
import { X, Zap, Clock, AlertTriangle, XCircle, ArrowRight, CheckCircle, Ticket } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props { open: boolean; onClose: () => void; }

export function TicketsDirectionPanel({ open, onClose }: Props) {
  const [stats, setStats] = useState<TicketStats | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try { const data = await ticketsApi.getStats(); setStats(data); }
      catch (error) { logger.error('Failed to load stats', error instanceof Error ? error : undefined, { component: 'TicketsDirectionPanel' }); }
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
          <div><h3 className="font-semibold">Centre de Pilotage</h3><p className="text-xs text-slate-400">Tickets en temps réel</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!stats ? (
          <div className="space-y-3 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : (
          <>
            {stats.critical > 0 && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-red-500" /><span className="font-semibold text-red-600">Critiques</span></div>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                <p className="text-xs text-red-500/80">Tickets nécessitant action immédiate</p>
              </div>
            )}

            {stats.slaBreached > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2"><XCircle className="w-4 h-4 text-amber-500" /><span className="font-semibold text-amber-600">SLA dépassés</span></div>
                <p className="text-2xl font-bold text-amber-600">{stats.slaBreached}</p>
                <p className="text-xs text-amber-500/80">Délais de réponse non respectés</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <AlertTriangle className="w-4 h-4 text-blue-500 mb-1" />
                <p className="text-xl font-bold text-blue-600">{stats.open}</p>
                <p className="text-xs text-slate-400">Ouverts</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Clock className="w-4 h-4 text-indigo-500 mb-1" />
                <p className="text-xl font-bold text-indigo-600">{stats.inProgress}</p>
                <p className="text-xs text-slate-400">En cours</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1"><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-sm font-medium">Taux de résolution</span></div>
              <p className="text-2xl font-bold text-emerald-600">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-medium mb-3">Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Temps moyen</span>
                  <span className="font-medium text-purple-600">{stats.avgResolutionTime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">En attente</span>
                  <span className="font-medium text-amber-600">{stats.pending}</span>
                </div>
              </div>
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

