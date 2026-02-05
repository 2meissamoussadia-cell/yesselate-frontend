'use client';

import { useState, useEffect } from 'react';
import { useProjetsWorkspaceStore } from '@/lib/stores/projetsWorkspaceStore';
import { projetsApiService, type Projet } from '@/lib/services/projetsApiService';
import { Search, ChevronRight, Clock, CheckCircle, AlertTriangle, Pause, Building2, Users, DollarSign, Eye, Star, StarOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props {
  tabId: string;
  data: Record<string, unknown>;
}

const STATUS_STYLES = {
  active: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  completed: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  blocked: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  pending: { border: 'border-l-slate-400', badge: 'bg-slate-500/20 text-slate-600 dark:text-slate-400' },
};

const STATUS_ICONS = { active: Clock, completed: CheckCircle, blocked: AlertTriangle, pending: Pause };

export function ProjetsInboxView({ tabId, data }: Props) {
  const { openTab, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useProjetsWorkspaceStore();
  const [projets, setProjets] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = data.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue && queue !== 'all') filter.status = queue as Projet['status'];
        if (searchQuery) filter.search = searchQuery;
        const result = await projetsApiService.getAll(filter, 'status', 1, 50);
        setProjets(result.data);
      } catch (error) {
        logger.error('Projets inbox load failed', error as Error, { context: 'ProjetsInboxView' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (projet: Projet) => {
    openTab({
      type: 'projet',
      id: `projet:${projet.id}`,
      title: projet.id,
      icon: projet.status === 'blocked' ? '🚨' : '🏗️',
      data: { projetId: projet.id },
    });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, projetId: string) => {
    e.stopPropagation();
    watchlist.includes(projetId) ? removeFromWatchlist(projetId) : addToWatchlist(projetId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'active' ? 'Projets en cours' :
             queue === 'blocked' ? 'Projets bloqués' :
             queue === 'completed' ? 'Projets terminés' :
             queue === 'pending' ? 'Projets en attente' : 'Tous les projets'}
          </h2>
          <p className="text-sm text-slate-400">{projets.length} projet(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : projets.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Aucun projet trouvé</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projets.map(projet => {
            const style = STATUS_STYLES[projet.status];
            const StatusIcon = STATUS_ICONS[projet.status];
            const isInWatchlist = watchlist.includes(projet.id);
            const progressColor = projetsApiService.getProgressColor(projet.progress);

            return (
              <div key={projet.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md cursor-pointer", style.border, projet.status === 'blocked' && "shadow-md")} onClick={() => handleOpenDetail(projet)}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs text-orange-500">{projet.id}</span>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{projet.name}</h3>
                      <p className="text-xs text-slate-400">{projet.client}</p>
                    </div>
                    <span className={cn("px-2 py-1 rounded text-xs font-medium flex items-center gap-1", style.badge)}>
                      <StatusIcon className="w-3 h-3" />
                      {projetsApiService.getStatusLabel(projet.status)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Budget</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{projet.budget} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dépensé</span>
                      <span className="font-semibold text-amber-600">{projet.spent} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Équipe</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{projet.team} agents</span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className={cn("h-full rounded-full", progressColor === 'emerald' ? 'bg-emerald-500' : progressColor === 'amber' ? 'bg-amber-500' : 'bg-orange-500')} style={{ width: `${projet.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{projet.progress}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">{projet.bureau}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={e => handleToggleWatchlist(e, projet.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                        {isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}
                      </button>
                      <Eye className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  {projet.status === 'blocked' && (
                    <button className="w-full mt-3 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 animate-pulse" onClick={e => { e.stopPropagation(); /* déblocage */ }}>
                      🚨 Débloquer ce projet
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

