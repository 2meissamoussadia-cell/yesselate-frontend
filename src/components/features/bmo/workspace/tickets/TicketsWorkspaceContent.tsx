'use client';

import { useState, useEffect } from 'react';
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';
import { ticketsApi, type Ticket } from '@/lib/services/ticketsApiService';
import { FileText, AlertTriangle, User, Clock, BarChart3, Search, ChevronRight, Eye, Star, StarOff, MessageSquare, Paperclip, Zap, Building2, Timer, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_STYLES = {
  open: { border: 'border-l-blue-500', badge: 'bg-blue-500/20 text-blue-600' },
  in_progress: { border: 'border-l-indigo-500', badge: 'bg-indigo-500/20 text-indigo-600' },
  pending: { border: 'border-l-amber-500', badge: 'bg-amber-500/20 text-amber-600' },
  resolved: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/20 text-emerald-600' },
  closed: { border: 'border-l-slate-500', badge: 'bg-slate-500/20 text-slate-600' },
};

const PRIORITY_STYLES = {
  critical: { badge: 'bg-red-500/20 text-red-600', icon: Zap },
  high: { badge: 'bg-amber-500/20 text-amber-600', icon: AlertTriangle },
  medium: { badge: 'bg-blue-500/20 text-blue-600', icon: Clock },
  low: { badge: 'bg-slate-500/20 text-slate-600', icon: Clock },
};

const getStatusLabel = (s: string) => ({ open: 'Ouvert', in_progress: 'En cours', pending: 'En attente', resolved: 'Résolu', closed: 'Fermé' })[s] ?? s;
const getCategoryLabel = (c: string) => ({ technique: 'Technique', commercial: 'Commercial', facturation: 'Facturation', livraison: 'Livraison', qualite: 'Qualité', autre: 'Autre' })[c] ?? c;

export function TicketsWorkspaceContent() {
  const { tabs, activeTabId, openTab, currentFilter, watchlist, addToWatchlist, removeFromWatchlist } = useTicketsWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [tickets, setTickets] = useState<Ticket[]>([]);
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
          if (['open', 'in_progress', 'pending', 'resolved', 'closed'].includes(queue)) filter.status = queue as Ticket['status'];
          else if (['critical', 'high', 'medium', 'low'].includes(queue)) filter.priority = queue as Ticket['priority'];
        }
        if (searchQuery) filter.search = searchQuery;
        const result = await ticketsApi.getAll(filter, { field: 'priority', direction: 'desc' }, 1, 50);
        setTickets(result.data);
      } catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    load();
  }, [currentFilter, queue, searchQuery]);

  const handleOpenDetail = (ticket: Ticket) => {
    openTab({ type: 'detail', id: `detail:${ticket.id}`, title: ticket.title ?? ticket.id, icon: '🎫', data: { ticketId: ticket.id } });
  };

  const handleToggleWatchlist = (e: React.MouseEvent, ticketId: string) => {
    e.stopPropagation();
    watchlist.includes(ticketId) ? removeFromWatchlist(ticketId) : addToWatchlist(ticketId);
  };

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><FileText className="w-12 h-12 opacity-30" /></div>;

  if (activeTab.type === 'urgent') return <PlaceholderView icon={<AlertTriangle className="w-12 h-12" />} title="Tickets urgents" />;
  if (activeTab.type === 'assignes') return <PlaceholderView icon={<User className="w-12 h-12" />} title="Mes tickets assignés" />;
  if (activeTab.type === 'timeline') return <PlaceholderView icon={<Clock className="w-12 h-12" />} title="Timeline" />;
  if (activeTab.type === 'analytics') return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Analytics" />;
  if (activeTab.type === 'detail') return <PlaceholderView icon={<FileText className="w-12 h-12" />} title="Détail du ticket" />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">
            {queue === 'open' ? 'Ouverts' : queue === 'in_progress' ? 'En cours' : queue === 'pending' ? 'En attente' : queue === 'resolved' ? 'Résolus' : queue === 'critical' ? 'Critiques' : 'Tous les tickets'}
          </h2>
          <p className="text-sm text-slate-400">{tickets.length} ticket(s)</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-slate-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">Aucun ticket trouvé</p></div>
      ) : (
        <div className="space-y-2">
          {tickets.map(ticket => {
            const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.open;
            const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;
            const PriorityIcon = priorityStyle.icon;
            const isExpanded = expandedId === ticket.id;
            const isInWatchlist = watchlist.includes(ticket.id);
            const slaBreached = ticket.sla.resolutionBreached || ticket.sla.firstResponseBreached;
            const slaPercent = slaBreached ? 100 : 50;

            return (
              <div key={ticket.id} className={cn("rounded-xl border-l-4 bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 transition-all hover:shadow-md", statusStyle.border, slaBreached && "ring-1 ring-red-500/30")} onClick={() => setExpandedId(isExpanded ? null : ticket.id)}>
                <div className="p-4 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600">{ticket.reference}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", statusStyle.badge)}>{getStatusLabel(ticket.status)}</span>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1", priorityStyle.badge)}><PriorityIcon className="w-3 h-3" />{ticket.priority}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">{getCategoryLabel(ticket.category)}</span>
                        {slaBreached && <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" />SLA</span>}
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{ticket.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{ticket.client.name}</span>
                        {ticket.assignee && <span className="flex items-center gap-1"><User className="w-3 h-3" />{ticket.assignee.name}</span>}
                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{ticket.messages.length}</span>
                        <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{ticket.attachments.length}</span>
                      </div>
                    </div>
                    <div className="text-right flex-none">
                      <div className="mb-2">
                        <div className="text-xs text-slate-400 mb-1">SLA: résolution {ticket.sla.resolutionDeadline}</div>
                        <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div className={cn("h-full rounded-full", slaPercent >= 100 ? "bg-red-500" : slaPercent >= 80 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${slaPercent}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={e => handleToggleWatchlist(e, ticket.id)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">{isInWatchlist ? <Star className="w-4 h-4 text-amber-500 fill-current" /> : <StarOff className="w-4 h-4 text-slate-400" />}</button>
                        <button onClick={e => { e.stopPropagation(); handleOpenDetail(ticket); }} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Eye className="w-4 h-4 text-slate-400" /></button>
                        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                      </div>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-200/70 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 py-4">{ticket.description}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => handleOpenDetail(ticket)} className="flex-1 px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium hover:bg-purple-600">Voir le détail</button>
                      {!ticket.assignee && <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Assigner</button>}
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

