'use client';

import { useState, useEffect } from 'react';
import { useMissionsWorkspaceStore } from '@/lib/stores/missionsWorkspaceStore';
import { missionsApiService, type Mission } from '@/lib/services/missionsApiService';
import { FileText, Calendar, Receipt, CheckSquare, Search, Clock, CheckCircle, PlayCircle, XCircle, Plane, MapPin, User, Building2, ChevronRight, Eye, DollarSign } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

const STATUS_STYLES = {
  pending: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600' },
  approved: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600' },
  in_progress: { border: 'border-l-cyan-500', badge: 'bg-cyan-500/20 text-cyan-600' },
  completed: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600' },
  cancelled: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600' },
};

const STATUS_ICONS = { pending: Clock, approved: CheckCircle, in_progress: PlayCircle, completed: CheckCircle, cancelled: XCircle };

export function MissionsWorkspaceContent() {
  const { tabs, activeTabId, openTab, currentFilter } = useMissionsWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const queue = activeTab?.data?.queue as string | undefined;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filter = { ...currentFilter };
        if (queue && queue !== 'all') filter.status = queue as Mission['status'];
        if (searchQuery) filter.search = searchQuery;
        const result = await missionsApiService.getAll(filter, 'date', 1, 50);
        setMissions(result.data);
      } catch (error) { logger.error('Missions load failed', error as Error, { context: 'MissionsWorkspaceContent' }); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (mission: Mission) => {
    openTab({ type: 'mission', id: `mission:${mission.id}`, title: mission.id, icon: '✈️', data: { missionId: mission.id } });
  };

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  if (activeTab.type === 'calendrier') return <PlaceholderView icon={<Calendar className="w-12 h-12" />} title="Calendrier des missions" />;
  if (activeTab.type === 'frais') return <PlaceholderView icon={<Receipt className="w-12 h-12" />} title="Frais de mission" />;
  if (activeTab.type === 'validation') return <PlaceholderView icon={<CheckSquare className="w-12 h-12" />} title="En attente de validation" />;
  if (activeTab.type === 'mission') return <PlaceholderView icon={<FileText className="w-12 h-12" />} title="Détail de la mission" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'pending' ? 'En attente' : queue === 'approved' ? 'Approuvées' : queue === 'in_progress' ? 'En cours' : queue === 'completed' ? 'Terminées' : queue === 'cancelled' ? 'Annulées' : 'Toutes les missions'}
          </h2>
          <p className="text-sm text-slate-400">{missions.length} mission(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : missions.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><Plane className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucune mission trouvée</p></div>
      ) : (
        <div className="space-y-2">
          {missions.map(mission => {
            const style = STATUS_STYLES[mission.status] || STATUS_STYLES.pending;
            const StatusIcon = STATUS_ICONS[mission.status] || Clock;
            const isExpanded = expandedId === mission.id;

            return (
              <div key={mission.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", style.border)} onClick={() => setExpandedId(isExpanded ? null : mission.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{mission.id}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", style.badge)}><StatusIcon className="w-3 h-3 inline mr-1" />{missionsApiService.getStatusLabel(mission.status)}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{mission.destination}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{mission.objet}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{mission.agent}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{mission.bureau}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(mission.dateDepart).toLocaleDateString('fr-FR')} → {new Date(mission.dateRetour).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{missionsApiService.formatMontant(mission.budgetPrevu)} FCFA</p>
                      <p className="text-xs text-slate-400 mt-1">Budget prévu</p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(mission); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-4 py-4">
                      <div><p className="text-xs text-slate-400 mb-1">Projet</p><p className="font-medium text-slate-900 dark:text-slate-100">{mission.projet || 'N/A'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Frais réels</p><p className="font-medium text-slate-900 dark:text-slate-100">{mission.fraisReels ? `${missionsApiService.formatMontant(mission.fraisReels)} FCFA` : 'Non déclarés'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Durée</p><p className="font-medium text-slate-900 dark:text-slate-100">{Math.ceil((new Date(mission.dateRetour).getTime() - new Date(mission.dateDepart).getTime()) / (1000 * 60 * 60 * 24))} jour(s)</p></div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(mission)} className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600">Voir le détail</button>
                      {mission.status === 'pending' && <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">Approuver</button>}
                      {mission.status === 'completed' && !mission.fraisReels && <button className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600"><DollarSign className="w-4 h-4 inline mr-1" />Déclarer frais</button>}
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

