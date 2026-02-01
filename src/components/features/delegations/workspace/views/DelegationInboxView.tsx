'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDelegationWorkspaceStore, DelegationTab } from '@/lib/stores/delegationWorkspaceStore';
import { useDelegationsCommandCenterStore } from '@/lib/stores/delegationsCommandCenterStore';
import { useDelegations } from '@/hooks/useDelegationAPI';
import { useDelegationToast } from '../DelegationToast';
import { 
  Search, RefreshCw, ArrowUpDown, Key, Shield, Clock, 
  AlertTriangle, Building2, ChevronRight, User, Hash,
  XCircle, Calendar, DollarSign, Pause, Filter, X, Plus
} from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';
import { DelegationListSkeleton } from '../DelegationSkeletons';
import { cn } from '@/lib/utils';

type DelegationRow = {
  id: string;
  type: string;
  status: string;
  agentName: string;
  agentRole: string | null;
  bureau: string;
  scope: string;
  maxAmount: number | null;
  startDate: string;
  endDate: string;
  delegatorName: string;
  usageCount: number;
  lastUsedAt: string | null;
  expiringSoon: boolean;
  hash: string | null;
};

const QUEUE_CONFIG: Record<string, { label: string; icon: typeof Key; color: string }> = {
  all: { label: 'Toutes', icon: Key, color: 'text-slate-400' },
  active: { label: 'Actives', icon: Shield, color: 'text-emerald-500' },
  expiring_soon: { label: 'Expirent bientôt', icon: Clock, color: 'text-amber-500' },
  expired: { label: 'Expirées', icon: Calendar, color: 'text-slate-400' },
  revoked: { label: 'Révoquées', icon: XCircle, color: 'text-rose-500' },
  suspended: { label: 'Suspendues', icon: Pause, color: 'text-amber-600' },
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  expired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  revoked: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

type SortKey = 'id' | 'type' | 'agentName' | 'bureau' | 'endDate' | 'usageCount';
type SortDir = 'asc' | 'desc';

// Liste des bureaux pour le filtre
const BUREAUX = ['BAGD', 'BAVM', 'BDI', 'BFEP', 'BRH', 'BSG', 'DBMO', 'Direction'];

export function DelegationInboxView({ tab }: { tab: DelegationTab }) {
  const queue = (tab.data?.queue as string) ?? 'all';
  const queueConfig = QUEUE_CONFIG[queue] ?? QUEUE_CONFIG.all;
  const QueueIcon = queueConfig.icon;
  
  const { openTab, updateTab } = useDelegationWorkspaceStore();
  const { openModal } = useDelegationsCommandCenterStore();
  const toast = useDelegationToast();
  
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('endDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  
  // Filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [bureauFilter, setBureauFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  // Utilisation du nouveau hook API
  const { 
    data: items, 
    total,
    loading, 
    error,
    refresh 
  } = useDelegations({
    queue,
    bureau: bureauFilter || undefined,
    type: typeFilter || undefined,
    search: search || undefined,
    dateFrom: dateFromFilter || undefined,
    dateTo: dateToFilter || undefined,
    sortField: sortKey,
    sortDir,
    limit: 100,
  });

  // Mise à jour du titre de l'onglet
  useEffect(() => {
    if (!loading) {
      updateTab(tab.id, { 
        title: `${queueConfig.label} (${items.length})` 
      });
    }
  }, [items.length, loading, tab.id, queueConfig.label, updateTab]);

  // Afficher erreur via toast
  useEffect(() => {
    if (error) {
      toast.error('Erreur de chargement', error);
    }
  }, [error, toast]);

  // Filtrage et tri
  const filteredItems = useMemo(() => {
    let result = items;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d => 
        d.id.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.agentName.toLowerCase().includes(q) ||
        d.bureau.toLowerCase().includes(q) ||
        (d.scope ?? '').toLowerCase().includes(q) ||
        (d.delegatorName ?? '').toLowerCase().includes(q)
      );
    }
    
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'usageCount') {
        cmp = (a.usageCount ?? 0) - (b.usageCount ?? 0);
      } else if (sortKey === 'endDate') {
        cmp = new Date(a.endDate ?? 0).getTime() - new Date(b.endDate ?? 0).getTime();
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return result;
  }, [items, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    expiringSoon: items.filter(d => d.expiringSoon).length,
    totalUsage: items.reduce((a, d) => a + (d.usageCount ?? 0), 0),
    byBureau: Object.entries(
      items.reduce((acc, d) => {
        acc[d.bureau] = (acc[d.bureau] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 5),
  }), [items]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Afficher skeleton pendant le premier chargement
  if (loading && items.length === 0) {
    return <DelegationListSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4">
      {/* Liste principale */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl bg-purple-500/10", queueConfig.color)}>
                <QueueIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{queueConfig.label}</h2>
                <p className="text-sm text-slate-400">
                  {filteredItems.length} délégation{filteredItems.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <button 
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400" 
              onClick={() => {
                refresh();
                toast.info('Actualisation', 'Rechargement des données...');
              }}
              disabled={loading}
              title="Rafraîchir"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </button>
          </div>
          
          {/* Recherche et filtres */}
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par ID, type, agent, bureau, périmètre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90 
                             dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                             focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-shadow"
                />
                {search && (
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setSearch('')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <button
                className={cn(
                  "px-3 py-2 rounded-xl border flex items-center gap-2 transition-colors",
                  showFilters 
                    ? "border-purple-500 bg-purple-500/10 text-purple-600" 
                    : "border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtres</span>
                {(bureauFilter || typeFilter || dateFromFilter || dateToFilter) && (
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
              
              <FluentButton
                variant="primary"
                size="sm"
                onClick={() => openTab({
                  id: `wizard:create:${Date.now()}`,
                  type: 'wizard',
                  title: 'Nouvelle délégation',
                  icon: '➕',
                  data: { action: 'create' },
                })}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvelle</span>
              </FluentButton>
            </div>
            
            {/* Panneau de filtres avancés */}
            {showFilters && (
              <div className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Bureau</label>
                    <select
                      value={bureauFilter}
                      onChange={(e) => setBureauFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white/90 text-sm
                                 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    >
                      <option value="">Tous</option>
                      {BUREAUX.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Type</label>
                    <input
                      type="text"
                      placeholder="Ex: Signature..."
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white/90 text-sm
                                 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Date fin (de)</label>
                    <input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white/90 text-sm
                                 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Date fin (à)</label>
                    <input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white/90 text-sm
                                 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {(bureauFilter || typeFilter || dateFromFilter || dateToFilter) 
                      ? 'Filtres actifs' 
                      : 'Aucun filtre actif'}
                  </span>
                  <button
                    className="text-xs text-purple-500 hover:underline"
                    onClick={() => {
                      setBureauFilter('');
                      setTypeFilter('');
                      setDateFromFilter('');
                      setDateToFilter('');
                    }}
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Table header */}
        <div className="grid grid-cols-[1fr_100px_80px_100px_80px] gap-2 px-4 py-2 border-b border-slate-200/70 dark:border-slate-800 text-xs font-medium text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-900/30">
          <button onClick={() => handleSort('type')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 text-left">
            Délégation {sortKey === 'type' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button onClick={() => handleSort('bureau')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
            Bureau {sortKey === 'bureau' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <div>Statut</div>
          <button onClick={() => handleSort('endDate')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300">
            Fin {sortKey === 'endDate' && <ArrowUpDown className="w-3 h-3" />}
          </button>
          <button onClick={() => handleSort('usageCount')} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 justify-end">
            Usage {sortKey === 'usageCount' && <ArrowUpDown className="w-3 h-3" />}
          </button>
        </div>
        
        {/* Liste */}
        <div className="max-h-[calc(100vh-380px)] overflow-auto">
          {loading && (
            <div className="p-8 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Chargement...
            </div>
          )}
          
          {!loading && filteredItems.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{search ? 'Aucun résultat.' : 'Aucune délégation dans cette file.'}</p>
              {search && (
                <button 
                  className="mt-2 text-purple-500 hover:underline text-sm"
                  onClick={() => setSearch('')}
                >
                  Effacer la recherche
                </button>
              )}
            </div>
          )}
          
          {!loading && filteredItems.map((d, idx) => (
            <div
              key={d.id}
              className={cn(
                "grid grid-cols-[1fr_100px_80px_100px_80px] gap-2 px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50",
                "hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all",
                d.expiringSoon && "bg-amber-500/5 border-l-2 border-l-amber-500",
                d.status === 'active' && !d.expiringSoon && "border-l-2 border-l-emerald-500",
                d.status === 'revoked' && "border-l-2 border-l-rose-500 opacity-70",
                d.status === 'expired' && "opacity-60",
                idx % 2 === 0 ? '' : 'bg-slate-50/30 dark:bg-slate-900/20'
              )}
              onClick={() => {
                // Pattern modal overlay (comme tickets-clients)
                openModal('delegation-detail', { delegationId: d.id }, { size: 'xl' });
              }}
            >
              <div className="min-w-0 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs text-purple-400">{d.id}</div>
                  <div className="font-semibold truncate">{d.type}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {d.agentName}
                    {d.agentRole && <span className="text-slate-400">({d.agentRole})</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-none" />
              </div>
              
              <div className="flex items-center">
                <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {d.bureau}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className={cn("px-2 py-0.5 rounded text-xs border", STATUS_COLORS[d.status] ?? STATUS_COLORS.expired)}>
                  {d.status}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className={cn(
                  "text-sm",
                  d.expiringSoon ? "text-amber-500 font-semibold" : "text-slate-400"
                )}>
                  {formatDate(d.endDate ?? '')}
                  {d.expiringSoon && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                </span>
              </div>
              
              <div className="flex items-center justify-end">
                <span className="text-sm text-slate-600 dark:text-slate-300 font-mono">
                  {d.usageCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Panneau latéral */}
      <div className="space-y-4">
        {/* Stats */}
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Key className="w-4 h-4" />
            Résumé
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <div className="text-2xl font-bold text-purple-500">{stats.total}</div>
              <div className="text-xs text-purple-400">Total</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10">
              <div className="text-2xl font-bold text-amber-500">{stats.expiringSoon}</div>
              <div className="text-xs text-amber-400">Expirent bientôt</div>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 col-span-2">
              <div className="text-2xl font-bold text-blue-500">{stats.totalUsage}</div>
              <div className="text-xs text-blue-400">Utilisations totales</div>
            </div>
          </div>
        </div>
        
        {/* Par bureau */}
        {stats.byBureau.length > 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Par bureau
            </h3>
            <div className="space-y-2">
              {stats.byBureau.map(([bureau, count]) => (
                <div key={bureau} className="flex items-center justify-between">
                  <span className="text-sm">{bureau}</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 bg-purple-500/30 rounded-full" 
                      style={{ width: `${Math.min(100, (count / stats.total) * 100)}px` }}
                    />
                    <span className="text-sm font-mono text-slate-400 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Hash className="w-4 h-4" />
            Traçabilité
          </h3>
          <p className="text-sm text-slate-400">
            Chaque délégation génère une décision hashée SHA3-256 pour garantir 
            l&apos;intégrité et l&apos;anti-contestation.
          </p>
        </div>
      </div>
    </div>
  );
}

