'use client';

import { useState, useEffect } from 'react';
import { useSubstitutionWorkspaceStore } from '@/lib/stores/substitutionWorkspaceStore';
import { substitutionApiService, type Substitution } from '@/lib/services/substitutionApiService';
import { FileText, Calendar, Users, History, BarChart3, Search, ChevronRight, Eye, Star, StarOff, RefreshCw, Zap, Clock, Building2, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { SubstitutionDetailModal } from '@/components/features/bmo/substitution/modals';

const STATUS_STYLES = {
  active: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600' },
  pending: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600' },
  completed: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600' },
  expired: { border: 'border-l-slate-500', badge: 'bg-slate-500/20 text-slate-600' },
};

const URGENCY_STYLES = {
  critical: { badge: 'bg-red-500/20 text-red-600', icon: Zap },
  high: { badge: 'bg-amber-500/20 text-amber-600', icon: AlertTriangle },
  medium: { badge: 'bg-blue-500/20 text-blue-600', icon: Clock },
  low: { badge: 'bg-slate-500/20 text-slate-600', icon: Clock },
};

export function SubstitutionWorkspaceContent() {
  const { tabs, activeTabId, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useSubstitutionWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSubstitutionId, setSelectedSubstitutionId] = useState<string | null>(null);

  const queue = activeTab?.data?.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue && queue !== 'all' && queue !== 'critical') filter.status = queue as Substitution['status'];
        if (queue === 'critical') filter.urgency = 'critical';
        if (searchQuery) filter.search = searchQuery;
        const result = await substitutionApiService.getAll(filter, 'urgency', 1, 50);
        setSubstitutions(result.data);
      } catch (error) { logger.error('Failed to load substitution data', error instanceof Error ? error : undefined, { component: 'SubstitutionWorkspaceContent' }); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (sub: Substitution) => {
    setSelectedSubstitutionId(sub.id);
    setDetailModalOpen(true);
  };

  const handleToggleWatchlist = (e: React.MouseEvent, subId: string) => {
    e.stopPropagation();
    watchlist.includes(subId) ? removeFromWatchlist(subId) : addToWatchlist(subId);
  };

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  if (activeTab.type === 'absences') return <PlaceholderView icon={<Calendar className="w-12 h-12" />} title="Absences planifiées" />;
  if (activeTab.type === 'delegations') return <PlaceholderView icon={<Users className="w-12 h-12" />} title="Délégations actives" />;
  if (activeTab.type === 'historique') return <PlaceholderView icon={<History className="w-12 h-12" />} title="Historique des substitutions" />;
  if (activeTab.type === 'analytics') return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Analytics" />;

  return (
    <>
      {/* Detail Modal Overlay */}
      {selectedSubstitutionId && (
        <SubstitutionDetailModal
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedSubstitutionId(null);
          }}
          substitutionId={selectedSubstitutionId}
        />
      )}

      <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'critical' ? 'Critiques' : queue === 'active' ? 'Actives' : queue === 'pending' ? 'En attente' : queue === 'completed' ? 'Terminées' : 'Toutes les substitutions'}
          </h2>
          <p className="text-sm text-slate-400">{substitutions.length} substitution(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : substitutions.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucune substitution trouvée</p></div>
      ) : (
        <div className="space-y-2">
          {substitutions.map(sub => {
            const style = STATUS_STYLES[sub.status] || STATUS_STYLES.pending;
            const urgencyStyle = URGENCY_STYLES[sub.urgency] || URGENCY_STYLES.medium;
            const UrgencyIcon = urgencyStyle.icon;
            const isExpanded = expandedId === sub.id;
            const isInWatchlist = watchlist.includes(sub.id);

            return (
              <div key={sub.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", style.border, sub.urgency === 'critical' && "shadow-md ring-1 ring-red-500/20")} onClick={() => setExpandedId(isExpanded ? null : sub.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{sub.ref}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}>{substitutionApiService.getStatusLabel(sub.status)}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1", urgencyStyle.badge)}><UrgencyIcon className="w-3 h-3" />{sub.urgency}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600">{substitutionApiService.getReasonLabel(sub.reason)}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{sub.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{sub.titulaire.name}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{sub.bureau}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sub.delay}j retard</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      {sub.amount > 0 && <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{substitutionApiService.formatMontant(sub.amount)} FCFA</p>}
                      {sub.substitut && <p className="text-xs text-emerald-600 mt-1">→ {sub.substitut.name} ({sub.substitut.score}%)</p>}
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => handleToggleWatchlist(e, sub.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}</button>
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(sub); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div><p className="text-xs text-slate-400 mb-1">Bureau</p><p className="font-medium text-slate-900 dark:text-slate-100">{sub.bureau}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Date début</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(sub.dateDebut).toLocaleDateString('fr-FR')}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Date fin</p><p className="font-medium text-slate-900 dark:text-slate-100">{sub.dateFin ? new Date(sub.dateFin).toLocaleDateString('fr-FR') : 'Non définie'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Projets liés</p><p className="font-medium text-slate-900 dark:text-slate-100">{sub.linkedProjects?.join(', ') || 'Aucun'}</p></div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(sub)} className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600">Voir le détail</button>
                      {!sub.substitut && <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600"><Users className="w-4 h-4 inline mr-1" />Assigner</button>}
                      {sub.status === 'active' && <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Terminer</button>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p><p className="text-xs mt-4 text-slate-400">En cours de développement</p></div></div>;
}

