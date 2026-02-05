'use client';

import { useState, useEffect } from 'react';
import { useArbitragesWorkspaceStore } from '@/lib/stores/arbitragesWorkspaceStore';
import { arbitragesApiService, type Arbitrage } from '@/lib/services/arbitragesApiService';
import { FileText, GitBranch, Users, Clock, BarChart3, Search, ChevronRight, Eye, Star, StarOff, Scale, Zap, Building2, User, AlertTriangle, ArrowUp, Gavel, DollarSign } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

const STATUS_STYLES = {
  pending: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600' },
  in_progress: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600' },
  resolved: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600' },
  escalated: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600' },
};

const PRIORITY_STYLES = {
  critical: { badge: 'bg-red-500/20 text-red-600', icon: Zap },
  high: { badge: 'bg-amber-500/20 text-amber-600', icon: AlertTriangle },
  medium: { badge: 'bg-blue-500/20 text-blue-600', icon: Clock },
  low: { badge: 'bg-slate-500/20 text-slate-600', icon: Clock },
};

const TYPE_STYLES = {
  goulot: { badge: 'bg-orange-500/20 text-orange-600', icon: GitBranch },
  conflit: { badge: 'bg-rose-500/20 text-rose-600', icon: Users },
  arbitrage: { badge: 'bg-indigo-500/20 text-indigo-600', icon: Scale },
  decision: { badge: 'bg-emerald-500/20 text-emerald-600', icon: Gavel },
};

export function ArbitragesWorkspaceContent() {
  const { tabs, activeTabId, openTab, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useArbitragesWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [arbitrages, setArbitrages] = useState<Arbitrage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = activeTab?.data?.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue && queue !== 'all') {
          if (['pending', 'in_progress', 'resolved', 'escalated'].includes(queue)) filter.status = queue as Arbitrage['status'];
          else if (['critical', 'high', 'medium', 'low'].includes(queue)) filter.priority = queue as Arbitrage['priority'];
          else if (['goulot', 'conflit', 'arbitrage', 'decision'].includes(queue)) filter.type = queue as Arbitrage['type'];
        }
        if (searchQuery) filter.search = searchQuery;
        const result = await arbitragesApiService.getAll(filter, 'priority', 1, 50);
        setArbitrages(result.data);
      } catch (error) { logger.error('Arbitrages load failed', error as Error, { context: 'ArbitragesWorkspaceContent' }); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (arb: Arbitrage) => {
    openTab({ type: 'detail', id: `detail:${arb.id}`, title: arb.ref, icon: '⚖️', data: { arbitrageId: arb.id } });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, arbId: string) => {
    e.stopPropagation();
    watchlist.includes(arbId) ? removeFromWatchlist(arbId) : addToWatchlist(arbId);
  };

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><Scale className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  if (activeTab.type === 'goulots') return <PlaceholderView icon={<GitBranch className="w-12 h-12" />} title="Goulots d'étranglement" />;
  if (activeTab.type === 'conflits') return <PlaceholderView icon={<Users className="w-12 h-12" />} title="Conflits inter-bureaux" />;
  if (activeTab.type === 'timeline') return <PlaceholderView icon={<Clock className="w-12 h-12" />} title="Timeline des décisions" />;
  if (activeTab.type === 'analytics') return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Analytics" />;
  if (activeTab.type === 'detail') return <PlaceholderView icon={<FileText className="w-12 h-12" />} title="Détail de l'arbitrage" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'critical' ? 'Critiques' : queue === 'escalated' ? 'Escaladés' : queue === 'pending' ? 'En attente' : queue === 'in_progress' ? 'En cours' : queue === 'resolved' ? 'Résolus' : queue === 'goulot' ? 'Goulots' : queue === 'conflit' ? 'Conflits' : 'Tous les arbitrages'}
          </h2>
          <p className="text-sm text-slate-400">{arbitrages.length} arbitrage(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : arbitrages.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><Scale className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucun arbitrage trouvé</p></div>
      ) : (
        <div className="space-y-2">
          {arbitrages.map(arb => {
            const statusStyle = STATUS_STYLES[arb.status] || STATUS_STYLES.pending;
            const priorityStyle = PRIORITY_STYLES[arb.priority] || PRIORITY_STYLES.medium;
            const typeStyle = TYPE_STYLES[arb.type] || TYPE_STYLES.arbitrage;
            const PriorityIcon = priorityStyle.icon;
            const TypeIcon = typeStyle.icon;
            const isExpanded = expandedId === arb.id;
            const isInWatchlist = watchlist.includes(arb.id);

            return (
              <div key={arb.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", statusStyle.border, arb.priority === 'critical' && "shadow-md ring-1 ring-red-500/20")} onClick={() => setExpandedId(isExpanded ? null : arb.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{arb.ref}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", statusStyle.badge)}>{arbitragesApiService.getStatusLabel(arb.status)}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1", priorityStyle.badge)}><PriorityIcon className="w-3 h-3" />{arb.priority}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1", typeStyle.badge)}><TypeIcon className="w-3 h-3" />{arbitragesApiService.getTypeLabel(arb.type)}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{arb.titre}</p>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-1">{arb.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{arb.initiateur.name}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{arb.bureaux.map(b => b.id).join(' vs ')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{arb.delaiJours}j</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      {arb.montantImpact && arb.montantImpact > 0 && (
                        <p className="font-mono font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1 justify-end">
                          <DollarSign className="w-4 h-4" />{arbitragesApiService.formatMontant(arb.montantImpact)} FCFA
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => handleToggleWatchlist(e, arb.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}</button>
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(arb); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="py-4">
                      <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Bureaux impliqués</h4>
                      <div className="flex flex-wrap gap-2">
                        {arb.bureaux.map(b => (
                          <div key={b.id} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm">
                            <span className="font-medium">{b.id}</span>
                            <span className="text-slate-400 ml-2">({b.position})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {arb.decisions && arb.decisions.length > 0 && (
                      <div className="py-4 border-t border-slate-200/70 dark:border-slate-800">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Décisions</h4>
                        <div className="space-y-2">
                          {arb.decisions.map((d, i) => (
                            <div key={i} className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                              <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
                                <Gavel className="w-3 h-3" />
                                <span>{d.auteur}</span>
                                <span>•</span>
                                <span>{new Date(d.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{d.contenu}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(arb)} className="flex-1 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600">Voir le détail</button>
                      {arb.status !== 'resolved' && (
                        <>
                          <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"><Gavel className="w-4 h-4 inline mr-1" />Décider</button>
                          {arb.status !== 'escalated' && (
                            <button className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"><ArrowUp className="w-4 h-4 inline mr-1" />Escalader</button>
                          )}
                        </>
                      )}
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

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p><p className="text-xs mt-4 text-slate-400">En cours de développement</p></div></div>;
}

