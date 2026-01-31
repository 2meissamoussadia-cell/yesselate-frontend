'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAlertWorkspaceStore, AlertTab } from '@/lib/stores/alertWorkspaceStore';
import { 
  Search, RefreshCw, ArrowUpDown, 
  AlertCircle, AlertTriangle, Info, CheckCircle, Shield,
  Clock, DollarSign, FileText, TrendingUp, ChevronRight,
  Filter, X, Building2, User, Calendar, Eye,
  CheckSquare, Square, Trash2
} from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import { filterAlertsByQueue, searchAlerts, type Alert } from '@/lib/data/alerts';
import { useAlertToast } from '@/components/ui/toast';
import { AlertInboxSkeleton } from '@/components/ui/alert-skeletons';
import { useAlertQueue } from '@/lib/api/hooks';

const QUEUE_CONFIG: Record<string, { label: string; icon: typeof AlertCircle; color: string }> = {
  all: { label: 'Toutes', icon: AlertCircle, color: 'text-slate-400' },
  critical: { label: 'Critiques', icon: AlertCircle, color: 'text-rose-500' },
  warning: { label: 'Avertissements', icon: AlertTriangle, color: 'text-amber-500' },
  info: { label: 'Informations', icon: Info, color: 'text-blue-500' },
  success: { label: 'Succès', icon: CheckCircle, color: 'text-emerald-500' },
  acknowledged: { label: 'Acquittées', icon: CheckCircle, color: 'text-purple-500' },
  resolved: { label: 'Résolues', icon: CheckCircle, color: 'text-emerald-500' },
  escalated: { label: 'Escaladées', icon: TrendingUp, color: 'text-orange-500' },
  blocked: { label: 'Dossiers bloqués', icon: Shield, color: 'text-orange-500' },
  payment: { label: 'Paiements', icon: DollarSign, color: 'text-blue-500' },
  contract: { label: 'Contrats', icon: FileText, color: 'text-purple-500' },
  sla: { label: 'SLA dépassés', icon: Clock, color: 'text-rose-500' },
  budget: { label: 'Budgets', icon: TrendingUp, color: 'text-amber-500' },
  system: { label: 'Système', icon: Info, color: 'text-slate-400' },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  acknowledged: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  escalated: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ignored: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const IMPACT_COLORS: Record<string, string> = {
  critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

type SortKey = 'createdAt' | 'severity' | 'type' | 'bureau' | 'impact' | 'status';
type SortDir = 'asc' | 'desc';

// Liste des bureaux pour le filtre
const BUREAUX = ['BF', 'BM', 'BJ', 'BCT', 'BRH', 'DBMO'];

export function AlertInboxView({ tab }: { tab: AlertTab }) {
  const queue = (tab.data?.queue as string) ?? 'all';
  const queueConfig = QUEUE_CONFIG[queue] ?? QUEUE_CONFIG.all;
  const QueueIcon = queueConfig.icon;
  
  const { openTab, updateTab } = useAlertWorkspaceStore();
  const toast = useAlertToast();
  
  // Utiliser React Query pour charger les alertes
  const {
    data: alertsData,
    isLoading: loading,
    refetch,
  } = useAlertQueue(queue as any, { page: 1, limit: 100 });

  const items = (alertsData as any)?.alerts || [];
  
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  
  // Filtres avancés
  const [showFilters, setShowFilters] = useState(false);
  const [bureauFilter, setBureauFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mettre à jour le titre de l'onglet avec le nombre d'alertes
  useEffect(() => {
    if (items.length > 0) {
      updateTab(tab.id, { 
        title: `${queueConfig.label} (${items.length})` 
      });
    }
  }, [items.length, tab.id, queueConfig.label, updateTab]);

  // Filtrage et tri
  const filteredItems = useMemo(() => {
    let result = items;
    
    // Recherche textuelle
    if (search.trim()) {
      result = searchAlerts(search);
    }
    
    // Filtres avancés
    if (bureauFilter) {
      result = result.filter((a: any) => a.bureau === bureauFilter);
    }
    if (typeFilter) {
      result = result.filter((a: any) => a.type === typeFilter);
    }
    if (severityFilter) {
      result = result.filter((a: any) => a.severity === severityFilter);
    }
    if (statusFilter) {
      result = result.filter((a: any) => a.status === statusFilter);
    }
    
    // Tri
    result = [...result].sort((a: any, b: any) => {
      let cmp = 0;
      
      if (sortKey === 'createdAt') {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === 'severity') {
        const severityOrder: Record<string, number> = { critical: 4, warning: 3, info: 2, success: 1 };
        cmp = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
      } else if (sortKey === 'impact') {
        const impactOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        cmp = (impactOrder[a.impact] || 0) - (impactOrder[b.impact] || 0);
      } else {
        cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''));
      }
      
      return sortDir === 'asc' ? cmp : -cmp;
    });
    
    return result;
  }, [items, search, bureauFilter, typeFilter, severityFilter, statusFilter, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc'); // Par défaut décroissant pour les dates/sévérité
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    critical: items.filter((a: any) => a.severity === 'critical').length,
    avgResponseTime: items.filter((a: any) => a.acknowledgedAt && a.createdAt).length,
    byBureau: Object.entries(
      items.reduce((acc: any, a: any) => {
        if (a.bureau) {
          acc[a.bureau] = (acc[a.bureau] ?? 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5),
    byType: Object.entries(
      items.reduce((acc: any, a: any) => {
        acc[a.type] = (acc[a.type] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => (b[1] as number) - (a[1] as number)),
  }), [items]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateStr);
  };

  const clearFilters = () => {
    setBureauFilter('');
    setTypeFilter('');
    setSeverityFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = bureauFilter || typeFilter || severityFilter || statusFilter;
  
  // Gestion sélection multiple
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map((item: any) => item.id)));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  // Actions bulk
  const handleBulkAction = async (action: 'acknowledge' | 'resolve' | 'escalate' | 'export') => {
    const selectedAlerts = filteredItems.filter((item: any) => selectedIds.has(item.id));
    const count = selectedAlerts.length;
    
    if (count === 0) return;
    
    try {
      // Simuler l'action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Notifications selon l'action
      switch (action) {
        case 'acknowledge':
          toast.alertAcknowledged(count);
          break;
        case 'resolve':
          toast.alertResolved(count);
          break;
        case 'escalate':
          toast.alertEscalated(count);
          break;
        case 'export':
          toast.exportSuccess('selection');
          break;
      }
      
      clearSelection();
      refetch(); // Utiliser refetch de React Query au lieu de load()
    } catch (error) {
      console.error('Erreur action bulk:', error);
      toast.actionError(action);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
      {/* Liste principale */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/70 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl bg-slate-500/10", queueConfig.color)}>
                <QueueIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{queueConfig.label}</h2>
                <p className="text-sm text-slate-400">
                  {filteredItems.length} alerte{filteredItems.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <button 
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-400" 
              onClick={() => refetch()}
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
                  placeholder="Rechercher par ID, titre, description, bureau, responsable..."
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
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
              
              {/* Sélection multiple toggle */}
              <button
                className={cn(
                  "px-3 py-2 rounded-xl border flex items-center gap-2 transition-colors",
                  selectedIds.size > 0
                    ? "border-purple-500 bg-purple-500/10 text-purple-600" 
                    : "border-slate-200/70 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
                onClick={() => {
                  if (selectedIds.size > 0) {
                    clearSelection();
                  } else {
                    setShowBulkActions(!showBulkActions);
                  }
                }}
              >
                {selectedIds.size > 0 ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>{selectedIds.size}</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span className="hidden sm:inline">Sélectionner</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Panneau de filtres avancés */}
            {showFilters && (
              <div className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Sévérité</label>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white/90 text-sm
                                 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    >
                      <option value="">Toutes</option>
                      <option value="critical">Critique</option>
                      <option value="warning">Avertissement</option>
                      <option value="info">Info</option>
                      <option value="success">Succès</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Statut</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white/90 text-sm
                                 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    >
                      <option value="">Tous</option>
                      <option value="active">Actif</option>
                      <option value="acknowledged">Acquitté</option>
                      <option value="resolved">Résolu</option>
                      <option value="escalated">Escaladé</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200/70 bg-white/90 text-sm
                                 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
                    >
                      <option value="">Tous</option>
                      <option value="system">Système</option>
                      <option value="blocked">Bloqué</option>
                      <option value="payment">Paiement</option>
                      <option value="contract">Contrat</option>
                      <option value="sla">SLA</option>
                      <option value="budget">Budget</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                  
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
                </div>
                
                {hasActiveFilters && (
                  <div className="mt-3 flex items-center justify-end">
                    <button
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                      onClick={clearFilters}
                    >
                      <X className="w-3.5 h-3.5" />
                      Effacer les filtres
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions bulk (si sélection active) */}
        {selectedIds.size > 0 && (
          <div className="px-4 py-3 border-b border-slate-200/70 dark:border-slate-800 bg-purple-500/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSelectAll}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={selectedIds.size === filteredItems.length ? "Tout désélectionner" : "Tout sélectionner"}
                >
                  {selectedIds.size === filteredItems.length ? (
                    <CheckSquare className="w-5 h-5 text-purple-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {selectedIds.size} alerte{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <FluentButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkAction('acknowledge')}
                >
                  <CheckCircle className="w-4 h-4" />
                  Acquitter
                </FluentButton>
                
                <FluentButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkAction('resolve')}
                >
                  <CheckCircle className="w-4 h-4" />
                  Résoudre
                </FluentButton>
                
                <FluentButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkAction('escalate')}
                >
                  <TrendingUp className="w-4 h-4" />
                  Escalader
                </FluentButton>
                
                <FluentButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  <FileText className="w-4 h-4" />
                  Exporter
                </FluentButton>
                
                <button
                  onClick={clearSelection}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  title="Annuler la sélection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Liste des alertes */}
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {loading ? (
            <AlertInboxSkeleton count={5} />
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune alerte trouvée</p>
            </div>
          ) : (
            filteredItems.map((alert: any) => {
              const SeverityIcon = SEVERITY_COLORS[alert.severity] ? AlertCircle : Info;
              const isSelected = selectedIds.has(alert.id);
              
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "group relative",
                    isSelected && "bg-purple-500/5"
                  )}
                >
                  <div className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Checkbox (si mode sélection actif ou item sélectionné) */}
                    {(showBulkActions || selectedIds.size > 0) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(alert.id);
                        }}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (showBulkActions || selectedIds.size > 0) {
                          toggleSelection(alert.id);
                        } else {
                          openTab({
                            id: `alert:${alert.id}`,
                            type: 'alert',
                            title: alert.title,
                            icon: alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '⚠️' : 'ℹ️',
                            data: { alertId: alert.id },
                          });
                        }
                      }}
                      className="flex-1 flex items-start gap-3 text-left"
                    >
                      {/* Icon */}
                      <div className={cn("p-2 rounded-lg shrink-0", SEVERITY_COLORS[alert.severity])}>
                        <SeverityIcon className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                            {alert.title}
                          </h3>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-purple-500" />
                        </div>
                        
                        <p className="text-sm text-slate-400 dark:text-slate-400 line-clamp-2 mb-2">
                          {alert.description}
                        </p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono text-slate-400">{alert.id}</span>
                          
                          <span className={cn("px-2 py-0.5 rounded-full border", STATUS_COLORS[alert.status])}>
                            {alert.status}
                          </span>
                          
                          <span className={cn("px-2 py-0.5 rounded-full border", IMPACT_COLORS[alert.impact])}>
                            Impact: {alert.impact}
                          </span>
                          
                          {alert.bureau && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {alert.bureau}
                            </span>
                          )}
                          
                          {alert.responsible && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {alert.responsible}
                            </span>
                          )}
                          
                          {alert.daysBlocked && alert.daysBlocked > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {`${alert.daysBlocked}j bloqué`}
                            </span>
                          )}
                          
                          <span className="text-slate-400 ml-auto">
                            {formatRelativeTime(alert.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
