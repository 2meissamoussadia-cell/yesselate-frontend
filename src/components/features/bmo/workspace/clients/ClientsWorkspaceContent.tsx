'use client';

import { useState, useEffect } from 'react';
import { useClientsWorkspaceStore } from '@/lib/stores/clientsWorkspaceStore';
import { clientsApiService, type Client } from '@/lib/services/clientsApiService';
import { FileText, UserPlus, AlertTriangle, History, BarChart3, Search, ChevronRight, Eye, Star, StarOff, Users, Building2, Crown, Phone, Mail, DollarSign, Briefcase } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

const STATUS_STYLES = {
  active: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600' },
  litige: { border: 'border-l-red-500', badge: 'bg-red-500/20 text-red-600' },
  termine: { border: 'border-l-slate-500', badge: 'bg-slate-500/20 text-slate-600' },
  prospect: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600' },
};

const SEGMENT_STYLES = {
  premium: { badge: 'bg-amber-500/20 text-amber-600' },
  standard: { badge: 'bg-indigo-500/20 text-indigo-600' },
  occasionnel: { badge: 'bg-slate-500/20 text-slate-600' },
};

const TYPE_ICONS = {
  particulier: Users,
  entreprise: Building2,
  institution: Briefcase,
};

export function ClientsWorkspaceContent() {
  const { tabs, activeTabId, openTab, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useClientsWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [clients, setClients] = useState<Client[]>([]);
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
          if (['active', 'litige', 'termine', 'prospect'].includes(queue)) filter.status = queue as Client['status'];
          else if (['premium', 'standard', 'occasionnel'].includes(queue)) filter.segment = queue as Client['segment'];
        }
        if (searchQuery) filter.search = searchQuery;
        const result = await clientsApiService.getAll(filter, 'ca', 1, 50);
        setClients(result.data);
      } catch (error) { logger.error('Clients load failed', error as Error, { context: 'ClientsWorkspaceContent' }); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (client: Client) => {
    openTab({ type: 'detail', id: `detail:${client.id}`, title: client.name, icon: '👤', data: { clientId: client.id } });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    watchlist.includes(clientId) ? removeFromWatchlist(clientId) : addToWatchlist(clientId);
  };

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  if (activeTab.type === 'prospects') return <PlaceholderView icon={<UserPlus className="w-12 h-12" />} title="Gestion des prospects" />;
  if (activeTab.type === 'litiges') return <PlaceholderView icon={<AlertTriangle className="w-12 h-12" />} title="Clients en litige" />;
  if (activeTab.type === 'historique') return <PlaceholderView icon={<History className="w-12 h-12" />} title="Historique relations" />;
  if (activeTab.type === 'analytics') return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Analytics clients" />;
  if (activeTab.type === 'detail') return <PlaceholderView icon={<FileText className="w-12 h-12" />} title="Fiche client" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {queue === 'active' ? 'Clients actifs' : queue === 'litige' ? 'En litige' : queue === 'prospect' ? 'Prospects' : queue === 'premium' ? 'Premium' : 'Tous les clients'}
          </h2>
          <p className="text-sm text-slate-400">{clients.length} client(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : clients.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucun client trouvé</p></div>
      ) : (
        <div className="space-y-2">
          {clients.map(client => {
            const statusStyle = STATUS_STYLES[client.status] || STATUS_STYLES.active;
            const segmentStyle = SEGMENT_STYLES[client.segment] || SEGMENT_STYLES.standard;
            const TypeIcon = TYPE_ICONS[client.type] || Building2;
            const isExpanded = expandedId === client.id;
            const isInWatchlist = watchlist.includes(client.id);

            return (
              <div key={client.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", statusStyle.border)} onClick={() => setExpandedId(isExpanded ? null : client.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800"><TypeIcon className="w-5 h-5 text-slate-400" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">{client.id}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", statusStyle.badge)}>{clientsApiService.getStatusLabel(client.status)}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1", segmentStyle.badge)}>{client.segment === 'premium' && <Crown className="w-3 h-3" />}{clientsApiService.getSegmentLabel(client.segment)}</span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{client.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><TypeIcon className="w-3 h-3" />{clientsApiService.getTypeLabel(client.type)}</span>
                        {client.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</span>}
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{client.projetsEnCours} projet(s) en cours</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <p className="font-mono font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 justify-end"><DollarSign className="w-4 h-4" />{clientsApiService.formatMontant(client.chiffreAffaires)}</p>
                      <p className="text-xs text-slate-400 mt-1">FCFA CA</p>
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button onClick={e => handleToggleWatchlist(e, client.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}</button>
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(client); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                      <div><p className="text-xs text-slate-400 mb-1">Email</p><p className="text-sm font-medium">{client.email || 'N/A'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Téléphone</p><p className="text-sm font-medium">{client.phone || 'N/A'}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Projets total</p><p className="text-sm font-medium">{client.projetsCount}</p></div>
                      <div><p className="text-xs text-slate-400 mb-1">Dernier contact</p><p className="text-sm font-medium">{client.dernierContact ? new Date(client.dernierContact).toLocaleDateString('fr-FR') : 'N/A'}</p></div>
                    </div>
                    {client.notes && <p className="text-sm text-slate-400 italic mb-4">{client.notes}</p>}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(client)} className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600">Voir la fiche</button>
                      <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"><Mail className="w-4 h-4 inline mr-1" />Contacter</button>
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

