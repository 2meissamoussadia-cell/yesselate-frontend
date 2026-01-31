'use client';

import { useState, useEffect } from 'react';
import { useRecouvrementsWorkspaceStore } from '@/lib/stores/recouvrementsWorkspaceStore';
import { recouvrementsApiService, type Creance } from '@/lib/services/recouvrementsApiService';
import { Search, ChevronRight, DollarSign, Clock, CheckCircle, AlertTriangle, XCircle, Building2, Calendar, Eye, Star, StarOff, Bell, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { tabId: string; data: Record<string, unknown>; }

const STATUS_STYLES = {
  pending: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  in_progress: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  paid: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  litige: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  irrecoverable: { border: 'border-l-slate-500', badge: 'bg-slate-500/20 text-slate-600 dark:text-slate-400' },
};

const STATUS_ICONS = { pending: Clock, in_progress: TrendingUp, paid: CheckCircle, litige: AlertTriangle, irrecoverable: XCircle };

export function RecouvrementsInboxView({ tabId, data }: Props) {
  const { openTab, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useRecouvrementsWorkspaceStore();
  const [creances, setCreances] = useState<Creance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = data.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue && queue !== 'all' && queue !== 'overdue') filter.status = queue as Creance['status'];
        if (queue === 'overdue') filter.overdueOnly = true;
        if (searchQuery) filter.search = searchQuery;
        const result = await recouvrementsApiService.getAll(filter, 'amount', 1, 50);
        setCreances(result.data);
      } catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (creance: Creance) => {
    openTab({ type: 'creance', id: `creance:${creance.id}`, title: creance.id, icon: '💰', data: { creanceId: creance.id } });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, creanceId: string) => {
    e.stopPropagation();
    watchlist.includes(creanceId) ? removeFromWatchlist(creanceId) : addToWatchlist(creanceId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'pending' ? 'En attente' : queue === 'in_progress' ? 'En cours' : queue === 'paid' ? 'Payées' : queue === 'litige' ? 'En litige' : queue === 'overdue' ? 'En retard' : queue === 'irrecoverable' ? 'Irrécouvrables' : 'Toutes les créances'}
          </h2>
          <p className="text-sm text-slate-400">{creances.length} créance(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : creances.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucune créance trouvée</p></div>
      ) : (
        <div className="space-y-2">
          {creances.map(creance => {
            const style = STATUS_STYLES[creance.status] || STATUS_STYLES.pending;
            const StatusIcon = STATUS_ICONS[creance.status] || Clock;
            const isExpanded = expandedId === creance.id;
            const isInWatchlist = watchlist.includes(creance.id);
            const progress = creance.montant > 0 ? Math.round((creance.montantRecouvre / creance.montant) * 100) : 0;

            return (
              <div key={creance.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", style.border, creance.joursRetard > 30 && "shadow-md")} onClick={() => setExpandedId(isExpanded ? null : creance.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{creance.id}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}><StatusIcon className="w-3 h-3 inline mr-1" />{recouvrementsApiService.getStatusLabel(creance.status)}</span>
                        {creance.joursRetard > 0 && <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/20 text-red-600">{creance.joursRetard}j retard</span>}
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{creance.client}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{creance.projetName || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Échéance: {new Date(creance.dateEcheance).toLocaleDateString('fr-FR')}</span>
                        <span className="flex items-center gap-1"><Bell className="w-3 h-3" />{creance.nbRelances} relance(s)</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-amber-600 dark:text-amber-400">{recouvrementsApiService.formatMontant(creance.montant)} FCFA</p>
                      <p className="text-xs text-slate-400 mt-1">Recouvré: {progress}%</p>
                      <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} /></div>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => handleToggleWatchlist(e, creance.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}</button>
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(creance); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div><p className="text-xs text-slate-400 mb-1">Montant recouvré</p><p className="font-medium text-emerald-600">{recouvrementsApiService.formatMontant(creance.montantRecouvre)} FCFA</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Restant dû</p><p className="font-medium text-red-600">{recouvrementsApiService.formatMontant(creance.montant - creance.montantRecouvre)} FCFA</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Date facture</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(creance.dateFacture).toLocaleDateString('fr-FR')}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Dernière relance</p><p className="font-medium text-slate-900 dark:text-slate-100">{creance.derniereRelance ? new Date(creance.derniereRelance).toLocaleDateString('fr-FR') : 'Aucune'}</p></div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(creance)} className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600">Voir le détail</button>
                      <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Bell className="w-4 h-4 inline mr-1" />Relancer</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

