'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ticketsApi, type TicketStats, type TicketCategory } from '@/lib/services/ticketsApiService';
import { BarChart3, X, Ticket, Zap, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const getCategoryLabel = (cat: TicketCategory): string =>
  ({ technique: 'Technique', commercial: 'Commercial', facturation: 'Facturation', livraison: 'Livraison', qualite: 'Qualité', autre: 'Autre' })[cat] ?? cat;

interface Props { open: boolean; onClose: () => void; }

export function TicketsStatsModal({ open, onClose }: Props) {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try { const data = await ticketsApi.getStats(); setStats(data); }
      catch (error) { console.error('Failed:', error); }
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
            <div className="p-2 rounded-xl bg-purple-500/10"><BarChart3 className="w-5 h-5 text-purple-500" /></div>
            <div><h2 className="text-lg font-bold">Statistiques Tickets</h2><p className="text-sm text-slate-500">Analyse du support client</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
          {loading || !stats ? (
            <div className="grid grid-cols-4 gap-4 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <Ticket className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                  <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
                  <p className="text-sm text-slate-500">Total</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                  <p className="text-sm text-slate-500">Critiques</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                  <p className="text-3xl font-bold text-blue-600">{stats.open}</p>
                  <p className="text-sm text-slate-500">Ouverts</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  <p className="text-3xl font-bold text-emerald-600">{stats.resolved}</p>
                  <p className="text-sm text-slate-500">Résolus</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold text-amber-600">{stats.avgResolutionTime}h</p>
                  <p className="text-sm text-slate-500">Temps moyen résolution</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                  <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold text-red-600">{stats.slaBreached}</p>
                  <p className="text-sm text-slate-500">SLA dépassés</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <h4 className="font-semibold mb-4">Par catégorie</h4>
                <div className="space-y-3">
                  {stats.byCategory.map(({ category, count }) => (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 w-24">{getCategoryLabel(category)}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }} />
                      </div>
                      <span className="text-sm font-medium w-6 text-right">{count}</span>
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

