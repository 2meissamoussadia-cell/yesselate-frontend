'use client';

import { useState, useEffect } from 'react';
import { useLitigesWorkspaceStore } from '@/lib/stores/litigesWorkspaceStore';
import { litigesApiService, type Litige } from '@/lib/services/litigesApiService';
import { Search, ChevronRight, Scale, AlertTriangle, CheckCircle, MessageSquare, Gavel, Building2, Calendar, User, DollarSign, Eye, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props { tabId: string; data: Record<string, unknown>; }

const STATUS_STYLES = {
  active: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  closed: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  negotiation: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  judgment: { border: 'border-l-purple-500', badge: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
};

const STATUS_ICONS = { active: Scale, closed: CheckCircle, negotiation: MessageSquare, judgment: Gavel };

export function LitigesInboxView({ tabId, data }: Props) {
  const { openTab, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useLitigesWorkspaceStore();
  const [litiges, setLitiges] = useState<Litige[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = data.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue && queue !== 'all' && queue !== 'high-risk') filter.status = queue as Litige['status'];
        if (searchQuery) filter.search = searchQuery;
        const result = await litigesApiService.getAll(filter, 'exposure', 1, 50);
        let filtered = result.data;
        if (queue === 'high-risk') filtered = filtered.filter(l => l.risque === 'high');
        setLitiges(filtered);
      } catch (error) { logger.error('Litiges inbox load failed', error as Error, { context: 'LitigesInboxView' }); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (litige: Litige) => {
    openTab({ type: 'litige', id: `litige:${litige.id}`, title: litige.id, icon: '⚖️', data: { litigeId: litige.id } });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, litigeId: string) => {
    e.stopPropagation();
    watchlist.includes(litigeId) ? removeFromWatchlist(litigeId) : addToWatchlist(litigeId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'active' ? 'Litiges actifs' : queue === 'closed' ? 'Litiges clos' : queue === 'negotiation' ? 'En négociation' : queue === 'judgment' ? 'Jugements rendus' : queue === 'high-risk' ? 'Risque élevé' : 'Tous les litiges'}
          </h2>
          <p className="text-sm text-slate-400">{litiges.length} litige(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : litiges.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><Scale className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucun litige trouvé</p></div>
      ) : (
        <div className="space-y-2">
          {litiges.map(litige => {
            const style = STATUS_STYLES[litige.status] || STATUS_STYLES.active;
            const StatusIcon = STATUS_ICONS[litige.status] || Scale;
            const isExpanded = expandedId === litige.id;
            const isInWatchlist = watchlist.includes(litige.id);
            const riskColor = litigesApiService.getRiskColor(litige.risque);

            return (
              <div key={litige.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", style.border, litige.risque === 'high' && "shadow-md")} onClick={() => setExpandedId(isExpanded ? null : litige.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{litige.id}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}><StatusIcon className="w-3 h-3 inline mr-1" />{litigesApiService.getStatusLabel(litige.status)}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", riskColor === 'red' ? 'bg-red-500/20 text-red-600' : riskColor === 'amber' ? 'bg-amber-500/20 text-amber-600' : 'bg-emerald-500/20 text-emerald-600')}>{litige.risque === 'high' ? 'Risque élevé' : litige.risque === 'medium' ? 'Risque moyen' : 'Risque faible'}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{litige.objet}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{litige.adversaire}</span>
                        <span className="flex items-center gap-1"><Scale className="w-3 h-3" />{litige.juridiction}</span>
                        {litige.prochainRDV && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(litige.prochainRDV).toLocaleDateString('fr-FR')}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-red-600 dark:text-red-400">{litigesApiService.formatMontant(litige.exposure)} FCFA</p>
                      <p className="text-xs text-slate-400 mt-1">Exposition</p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => handleToggleWatchlist(e, litige.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}</button>
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(litige); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div><p className="text-xs text-slate-400 mb-1">Type</p><p className="font-medium text-slate-900 dark:text-slate-100">{litige.type}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Montant réclamé</p><p className="font-medium text-slate-900 dark:text-slate-100">{litigesApiService.formatMontant(litige.montant)} FCFA</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Avocat</p><p className="font-medium text-slate-900 dark:text-slate-100">{litige.avocat}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Prochaine audience</p><p className="font-medium text-slate-900 dark:text-slate-100">{litige.prochainRDV ? new Date(litige.prochainRDV).toLocaleDateString('fr-FR') : 'N/A'}</p></div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(litige)} className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">Voir le détail</button>
                      <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Ajouter une note</button>
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

